from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Image

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')

class ImageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ('id', 'user', 'prompt', 'image_url', 'status', 'is_public', 'created_at')
        read_only_fields = ('id', 'user', 'image_url', 'status', 'created_at')

    def get_image_url(self, obj):
        if not obj.image:
            return None

        request = self.context.get('request') if hasattr(self, 'context') else None
        url = obj.image.url
        if request:
            return request.build_absolute_uri(url)
        return url

class GenerateImageSerializer(serializers.Serializer):
    prompt = serializers.CharField()


class ImageShareUpdateSerializer(serializers.Serializer):
    is_public = serializers.BooleanField()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user
