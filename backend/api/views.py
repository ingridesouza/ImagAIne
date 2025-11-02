from rest_framework import filters, generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Image
from .serializers import (
    GenerateImageSerializer,
    ImageSerializer,
    ImageShareUpdateSerializer,
)
from .tasks import generate_image_task


class GenerateImageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = GenerateImageSerializer(data=request.data)
        if serializer.is_valid():
            prompt = serializer.validated_data["prompt"]

            # Create a new image placeholder while async generation runs
            image = Image.objects.create(
                user=request.user,
                prompt=prompt,
                image_url="GENERATING",
            )

            generate_image_task.delay(image.id)

            return Response(
                ImageSerializer(image).data,
                status=status.HTTP_202_ACCEPTED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PublicImageListView(generics.ListAPIView):
    queryset = Image.objects.filter(is_public=True).order_by("-created_at")
    serializer_class = ImageSerializer
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
        return Response(ImageSerializer(image).data, status=status.HTTP_200_OK)

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
        return Response(ImageSerializer(image).data, status=status.HTTP_200_OK)
