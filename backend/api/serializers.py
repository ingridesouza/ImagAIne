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
    relevance_score = serializers.FloatField(read_only=True)
    featured = serializers.BooleanField(read_only=True)
    tags = serializers.SerializerMethodField()

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
            'relevance_score',
            'featured',
            'tags',
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
            'relevance_score',
            'featured',
            'tags',
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

    def get_tags(self, obj):
        if hasattr(obj, "_prefetched_objects_cache") and "tags" in obj._prefetched_objects_cache:
            tags = obj._prefetched_objects_cache["tags"]
        else:
            tags = obj.tags.all()
        return [tag.name for tag in tags]

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


class ImageCommentReplySerializer(serializers.ModelSerializer):
    """Simplified serializer for replies (no nested replies)."""
    user = UserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = ImageComment
        fields = ('id', 'user', 'text', 'created_at', 'updated_at', 'like_count', 'is_liked')
        read_only_fields = fields

    def get_like_count(self, obj):
        if hasattr(obj, 'like_count'):
            return obj.like_count or 0
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request') if hasattr(self, 'context') else None
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        if hasattr(obj, 'is_liked'):
            return bool(obj.is_liked)
        return obj.likes.filter(user=user).exists()


class ImageCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    parent_id = serializers.IntegerField(source='parent.id', read_only=True, allow_null=True)

    class Meta:
        model = ImageComment
        fields = (
            'id', 'user', 'text', 'created_at', 'updated_at',
            'like_count', 'is_liked', 'parent_id', 'reply_count', 'replies'
        )
        read_only_fields = (
            'id', 'user', 'created_at', 'updated_at',
            'like_count', 'is_liked', 'parent_id', 'reply_count', 'replies'
        )

    def get_like_count(self, obj):
        if hasattr(obj, 'like_count'):
            return obj.like_count or 0
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request') if hasattr(self, 'context') else None
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        if hasattr(obj, 'is_liked'):
            return bool(obj.is_liked)
        return obj.likes.filter(user=user).exists()

    def get_reply_count(self, obj):
        if hasattr(obj, 'reply_count'):
            return obj.reply_count or 0
        return obj.replies.count()

    def get_replies(self, obj):
        # Only return replies for top-level comments (parent=None)
        if obj.parent is not None:
            return []
        if hasattr(obj, '_prefetched_objects_cache') and 'replies' in obj._prefetched_objects_cache:
            replies = obj._prefetched_objects_cache['replies']
        else:
            replies = obj.replies.select_related('user').order_by('created_at')
        return ImageCommentReplySerializer(replies, many=True, context=self.context).data


class ImageCommentCreateSerializer(serializers.ModelSerializer):
    parent_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = ImageComment
        fields = ('text', 'parent_id')

    def validate_parent_id(self, value):
        if value is not None:
            try:
                parent = ImageComment.objects.get(pk=value)
                # Ensure parent is a top-level comment (no nested replies)
                if parent.parent is not None:
                    raise serializers.ValidationError(
                        "Cannot reply to a reply. Only top-level comments can be replied to."
                    )
            except ImageComment.DoesNotExist:
                raise serializers.ValidationError("Parent comment does not exist.")
        return value



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


# Creative Memory - Related Images Serializers

class RelatedImageSerializer(serializers.Serializer):
    """Serializer for a related image with similarity score."""
    image = ImageSerializer(read_only=True)
    similarity_score = serializers.FloatField(read_only=True)


class StyleSuggestionSerializer(serializers.Serializer):
    """Serializer for a style suggestion."""
    label = serializers.CharField(read_only=True)
    example_prompt = serializers.CharField(read_only=True)
    example_image_id = serializers.IntegerField(read_only=True)
    frequency = serializers.IntegerField(read_only=True)
    confidence = serializers.FloatField(read_only=True)


# Prompt Assistant - DeepSeek LLM Serializers

class RefinePromptRequestSerializer(serializers.Serializer):
    """Serializer for prompt refinement request."""
    description = serializers.CharField(
        help_text="User's casual description of what they want to generate"
    )
    style = serializers.ChoiceField(
        choices=[
            ('photorealistic', 'Fotorrealista'),
            ('anime', 'Anime/Mangá'),
            ('digital_art', 'Arte Digital'),
            ('oil_painting', 'Pintura a Óleo'),
            ('watercolor', 'Aquarela'),
            ('3d_render', 'Render 3D'),
            ('pixel_art', 'Pixel Art'),
            ('sketch', 'Esboço/Desenho'),
        ],
        required=False,
        default='photorealistic',
    )


class RefinePromptResponseSerializer(serializers.Serializer):
    """Serializer for prompt refinement response."""
    refined_prompt = serializers.CharField(read_only=True)
    negative_prompt = serializers.CharField(read_only=True, allow_blank=True)
