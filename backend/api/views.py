from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.files.base import ContentFile
from io import BytesIO
from PIL import Image

from .models import GeneratedImage
from .serializers import GeneratedImageSerializer

class GenerateImageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        prompt = request.data.get('prompt', '')
        if not prompt:
            return Response({'error': 'prompt is required'}, status=status.HTTP_400_BAD_REQUEST)

        img = Image.new('RGB', (512, 512), color='blue')
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)

        generated = GeneratedImage(prompt=prompt)
        generated.image.save('generated.png', ContentFile(buffer.read()), save=True)

        serializer = GeneratedImageSerializer(generated)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
