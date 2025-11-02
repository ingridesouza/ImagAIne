from django.conf import settings
from django.utils import timezone
from rest_framework import filters, generics, status
from rest_framework.exceptions import Throttled
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Image
from .serializers import (
    GenerateImageSerializer,
    ImageSerializer,
    ImageShareUpdateSerializer,
)
from .throttles import PlanQuotaThrottle
from .tasks import generate_image_task


class GenerateImageView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [PlanQuotaThrottle]

    def throttled(self, request, wait=None):
        message = "Daily quota reached. Upgrade to Pro or wait until tomorrow."
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
            if user.last_reset_date != today:
                user.image_generation_count = 0
                user.last_reset_date = today

            if quota is not None and user.image_generation_count >= quota:
                return Response(
                    {"detail": "Daily quota reached. Upgrade to Pro or wait until tomorrow."},
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

            user.image_generation_count += 1
            user.save(update_fields=["image_generation_count", "last_reset_date"])

            generate_image_task.delay(image.id)

            return Response(
                ImageSerializer(image, context={"request": request}).data,
                status=status.HTTP_202_ACCEPTED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PublicImageListView(generics.ListAPIView):
    queryset = Image.objects.filter(is_public=True).order_by("-created_at")
    serializer_class = ImageSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["prompt"]


class UserImageListView(generics.ListAPIView):
    serializer_class = ImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Image.objects.filter(user=self.request.user).order_by("-created_at")


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
        return Response(
            ImageSerializer(image, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )
