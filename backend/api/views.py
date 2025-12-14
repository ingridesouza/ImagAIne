from django.conf import settings
from django.db.models import (
    BooleanField,
    Count,
    Exists,
    F,
    OuterRef,
    Value,
)
from django.db.models.functions import Coalesce
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import filters, generics, status
from rest_framework.exceptions import PermissionDenied, Throttled
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle

from .models import Image, ImageComment, ImageLike
from .relevance import update_image_relevance
from .serializers import (
    GenerateImageSerializer,
    ImageCommentCreateSerializer,
    ImageCommentSerializer,
    ImageSerializer,
    ImageShareUpdateSerializer,
)
from .throttles import PlanQuotaThrottle
from .tasks import generate_image_task


class GenerateImageView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [PlanQuotaThrottle]

    def throttled(self, request, wait=None):
        message = "Monthly quota reached. Faça upgrade para o plano Pro."
        raise Throttled(detail=message, wait=wait)

    def post(self, request, *args, **kwargs):
        serializer = GenerateImageSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            prompt = serializer.validated_data["prompt"]
            negative_prompt = serializer.validated_data.get("negative_prompt")
            aspect_ratio = serializer.validated_data.get(
                "aspect_ratio", Image.AspectRatio.SQUARE
            )
            seed = serializer.validated_data.get("seed")

            quotas = getattr(settings, "PLAN_QUOTAS", {})
            quota = quotas.get(getattr(user, "plan", "free"))

            today = timezone.now().date()
            period_start = today.replace(day=1)
            if user.last_reset_date != period_start:
                user.image_generation_count = 0
                user.last_reset_date = period_start

            if quota is not None and user.image_generation_count >= quota:
                return Response(
                    {"detail": "Monthly quota reached. Faça upgrade para o plano Pro."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

            # Create a new image placeholder while async generation runs
            image = Image.objects.create(
                user=user,
                prompt=prompt,
                negative_prompt=negative_prompt,
                aspect_ratio=aspect_ratio,
                seed=seed,
            )
            update_image_relevance(image)

            user.image_generation_count += 1
            user.save(update_fields=["image_generation_count", "last_reset_date"])

            generate_image_task.delay(image.id)

            return Response(
                ImageSerializer(image, context={"request": request}).data,
                status=status.HTTP_202_ACCEPTED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PublicImageListView(generics.ListAPIView):
    serializer_class = ImageSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["prompt"]

    def get_queryset(self):
        base_queryset = Image.objects.filter(is_public=True).select_related(
            "user"
        ).prefetch_related("tags")
        annotated_queryset = base_queryset.annotate(
            like_count=Count("likes", distinct=True),
            comment_count=Count("comments", distinct=True),
            effective_score=Coalesce(F("relevance_score"), Value(0.0)),
        )

        request = self.request
        if request.user.is_authenticated:
            annotated_queryset = annotated_queryset.annotate(
                is_liked=Exists(
                    ImageLike.objects.filter(
                        image=OuterRef("pk"), user=request.user
                    )
                )
            )
        else:
            annotated_queryset = annotated_queryset.annotate(
                is_liked=Value(False, output_field=BooleanField())
            )
        return annotated_queryset.order_by(
            "-featured",
            "-effective_score",
            "-created_at",
        )


class UserImageListView(generics.ListAPIView):
    serializer_class = ImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Image.objects.filter(user=self.request.user)
            .select_related("user")
            .prefetch_related("tags")
            .annotate(
                like_count=Count("likes", distinct=True),
                comment_count=Count("comments", distinct=True),
                effective_score=Coalesce(F("relevance_score"), Value(0.0)),
            )
            .order_by("-featured", "-effective_score", "-created_at")
        )
        return queryset.annotate(
            is_liked=Exists(
                ImageLike.objects.filter(
                    image=OuterRef("pk"), user=self.request.user
                )
            )
        )


class ShareImageView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_user_image(self, pk, user):
        return Image.objects.filter(pk=pk, user=user).first()

    def post(self, request, pk, *args, **kwargs):
        image = self._get_user_image(pk, request.user)
        if image is None:
            return Response(
                {"error": "Image not found."}, status=status.HTTP_404_NOT_FOUND
            )

        image.is_public = True
        image.save(update_fields=["is_public"])
        update_image_relevance(image)
        return Response(
            ImageSerializer(image, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk, *args, **kwargs):
        serializer = ImageShareUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        image = self._get_user_image(pk, request.user)
        if image is None:
            return Response(
                {"error": "Image not found."}, status=status.HTTP_404_NOT_FOUND
            )

        image.is_public = serializer.validated_data["is_public"]
        image.save(update_fields=["is_public"])
        update_image_relevance(image)
        return Response(
            ImageSerializer(image, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class ImageLikeView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "social_like"

    def _get_image(self, pk):
        image = get_object_or_404(Image, pk=pk)
        if image.is_public or image.user == self.request.user:
            return image
        raise PermissionDenied("This image is not available for interaction.")

    def post(self, request, pk, *args, **kwargs):
        image = self._get_image(pk)
        like, created = ImageLike.objects.get_or_create(
            image=image, user=request.user
        )
        update_image_relevance(image)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        serializer = ImageSerializer(
            image, context={"request": request}
        )
        return Response(serializer.data, status=status_code)

    def delete(self, request, pk, *args, **kwargs):
        image = self._get_image(pk)
        deleted, _ = ImageLike.objects.filter(
            image=image, user=request.user
        ).delete()
        if deleted:
            update_image_relevance(image)
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {"detail": "Like not found."}, status=status.HTTP_404_NOT_FOUND
        )


class ImageCommentListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ImageCommentSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "social_comment"

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ImageCommentCreateSerializer
        return ImageCommentSerializer

    def get_throttles(self):
        if self.request.method != "POST":
            return []
        return [throttle() for throttle in self.throttle_classes]

    def _get_image(self):
        image = get_object_or_404(Image, pk=self.kwargs["pk"])
        user = self.request.user
        if image.is_public:
            return image
        if user.is_authenticated and image.user == user:
            return image
        raise Http404

    def get_queryset(self):
        image = self._get_image()
        return (
            ImageComment.objects.filter(image=image)
            .select_related("user")
            .order_by("created_at")
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        image = self._get_image()
        comment = serializer.save(user=request.user, image=image)
        update_image_relevance(image)
        output_serializer = ImageCommentSerializer(
            comment, context={"request": request}
        )
        headers = self.get_success_headers(output_serializer.data)
        return Response(
            output_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class ImageCommentDetailView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ImageCommentSerializer
    lookup_url_kwarg = "comment_id"
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "social_comment"

    def get_queryset(self):
        return ImageComment.objects.select_related("user", "image")

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(
            queryset,
            pk=self.kwargs["comment_id"],
            image__pk=self.kwargs["pk"],
        )
        user = self.request.user
        if (
            obj.user == user
            or obj.image.user == user
            or user.is_staff
        ):
            return obj
        raise PermissionDenied("You cannot delete this comment.")

    def perform_destroy(self, instance):
        image = instance.image
        super().perform_destroy(instance)
        update_image_relevance(image)


class ImageDownloadView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "social_download"

    def post(self, request, pk, *args, **kwargs):
        image = get_object_or_404(Image.objects.select_related("user"), pk=pk)
        user = request.user
        if not image.is_public:
            if not (user.is_authenticated and user == image.user):
                raise Http404

        if image.status != Image.Status.READY or not image.image:
            return Response(
                {"detail": "Image is not available for download."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        Image.objects.filter(pk=image.pk).update(
            download_count=F("download_count") + 1
        )
        image.refresh_from_db(fields=["download_count"])
        update_image_relevance(image)

        url = image.image.url
        if request:
            url = request.build_absolute_uri(url)

        return Response(
            {
                "download_url": url,
                "download_count": image.download_count,
            },
            status=status.HTTP_200_OK,
        )
