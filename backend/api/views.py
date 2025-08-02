from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.files.base import ContentFile
from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Image
from .serializers import ImageSerializer, GenerateImageSerializer, UserRegistrationSerializer
from .tasks import generate_image_task

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer

class GenerateImageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = GenerateImageSerializer(data=request.data)
        if serializer.is_valid():
            prompt = serializer.validated_data['prompt']
            
            # Crie a instância da imagem com uma URL temporária ou status
            image = Image.objects.create(
                user=request.user,
                prompt=prompt,
                image_url='GENERATING' # ou deixe em branco
            )
            
            # Inicie a tarefa em segundo plano
            generate_image_task.delay(image.id)
            
            # Retorne uma resposta imediata para o usuário
            return Response(
                ImageSerializer(image).data, 
                status=status.HTTP_202_ACCEPTED # Accepted, mas não concluído
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
