from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Image, ImageComment

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')

class ImageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    download_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = (
            'id',
            'user',
            'prompt',
            'negative_prompt',
            'aspect_ratio',
            'seed',
            'image_url',
            'status',
            'is_public',
            'like_count',
            'comment_count',
            'download_count',
            'is_liked',
            'created_at',
        )
        read_only_fields = (
            'id',
            'user',
            'image_url',
            'status',
            'like_count',
            'comment_count',
            'download_count',
            'is_liked',
            'created_at',
        )

    def get_image_url(self, obj):
        if not obj.image:
            return None

        request = self.context.get('request') if hasattr(self, 'context') else None
        url = obj.image.url
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_like_count(self, obj):
        if hasattr(obj, 'like_count'):
            return obj.like_count or 0
        return obj.likes.count()

    def get_comment_count(self, obj):
        if hasattr(obj, 'comment_count'):
            return obj.comment_count or 0
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request') if hasattr(self, 'context') else None
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        if hasattr(obj, 'is_liked'):
            return bool(obj.is_liked)
        return obj.likes.filter(user=user).exists()

class GenerateImageSerializer(serializers.Serializer):
    prompt = serializers.CharField()
    negative_prompt = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    aspect_ratio = serializers.ChoiceField(
        choices=Image.AspectRatio.choices,
        default=Image.AspectRatio.SQUARE,
        required=False,
    )
    seed = serializers.IntegerField(required=False, min_value=0, allow_null=True)


class ImageShareUpdateSerializer(serializers.Serializer):
    is_public = serializers.BooleanField()


class ImageCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ImageComment
        fields = ('id', 'user', 'text', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')


class ImageCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageComment
        fields = ('text',)



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
