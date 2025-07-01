from rest_framework import serializers
from .models import GeneratedImage

class GeneratedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedImage
        fields = ['id', 'prompt', 'image', 'created_at']
        read_only_fields = ['id', 'image', 'created_at']
