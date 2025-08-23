from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.files.base import ContentFile
from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from datetime import date
from dateutil.relativedelta import relativedelta
from authentication.models import User
from .models import Image
from .serializers import ImageSerializer, GenerateImageSerializer, UserRegistrationSerializer
from .tasks import generate_image_task

class UserRegistrationView(generics.CreateAPIView):
    permission_classes = []  # Remove a necessidade de autenticação
    serializer_class = UserRegistrationSerializer

class GenerateImageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        # Check if the counter needs to be reset
        if user.last_reset_date <= date.today() - relativedelta(months=1):
            user.image_generation_count = 0
            user.last_reset_date = date.today()
            user.save(update_fields=['image_generation_count', 'last_reset_date'])

        # Define limits based on plan
        limits = {
            User.Plan.FREE: 3,
            User.Plan.PREMIUM: 50
        }
        limit = limits.get(user.plan, 0)

        # Check if user has reached the limit
        if user.image_generation_count >= limit:
            return Response(
                {"detail": f"You have reached your monthly limit of {limit} images for the {user.get_plan_display()} plan."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        serializer = GenerateImageSerializer(data=request.data)
        if serializer.is_valid():
            prompt = serializer.validated_data['prompt']
            
            image = Image.objects.create(
                user=user,
                prompt=prompt,
                image_url='GENERATING'
            )
            
            # Increment user's generation count
            user.image_generation_count += 1
            user.save(update_fields=['image_generation_count'])
            
            generate_image_task.delay(image.id)
            
            return Response(
                ImageSerializer(image).data, 
                status=status.HTTP_202_ACCEPTED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PublicImageListView(generics.ListAPIView):
    queryset = Image.objects.filter(is_public=True).order_by('-created_at')
    serializer_class = ImageSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['prompt']

class UserImageListView(generics.ListAPIView):
    serializer_class = ImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Image.objects.filter(user=self.request.user).order_by('-created_at')

class ShareImageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        try:
            image = Image.objects.get(pk=pk, user=request.user)
        except Image.DoesNotExist:
            return Response({"error": "Image not found."}, status=status.HTTP_404_NOT_FOUND)
        
        image.is_public = True
        image.save()
        return Response(ImageSerializer(image).data, status=status.HTTP_200_OK)
