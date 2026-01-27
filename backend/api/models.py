import os
import uuid

from django.contrib.auth import get_user_model
from django.db import models

try:
    from pgvector.django import VectorField
    PGVECTOR_AVAILABLE = True
except ImportError:
    PGVECTOR_AVAILABLE = False
    VectorField = None

User = get_user_model()

# Embedding dimensions (must match model outputs)
TEXT_EMBEDDING_DIM = 384  # sentence-transformers/all-MiniLM-L6-v2
IMAGE_EMBEDDING_DIM = 768  # BLIP visual encoder (ViT-B/16)


def image_upload_to(instance, filename):
    """Store generated images under per-user folders with stable extensions."""
    extension = os.path.splitext(filename)[1] or ".png"
    return f"users/{instance.user_id}/images/{uuid.uuid4()}{extension}"


class Image(models.Model):
    class Status(models.TextChoices):
        GENERATING = "GENERATING", "Generating"
        READY = "READY", "Ready"
        FAILED = "FAILED", "Failed"

    class AspectRatio(models.TextChoices):
        SQUARE = "1:1", "1:1"
        LANDSCAPE = "16:9", "16:9"
        LANDSCAPE_CLASSIC = "4:3", "4:3"
        PORTRAIT = "9:16", "9:16"
        GOLDEN = "3:2", "3:2"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='images')
    prompt = models.TextField(blank=True, null=True)
    negative_prompt = models.TextField(blank=True, null=True)
    aspect_ratio = models.CharField(
        max_length=10,
        choices=AspectRatio.choices,
        default=AspectRatio.SQUARE,
    )
    seed = models.BigIntegerField(blank=True, null=True)
    image = models.ImageField(upload_to=image_upload_to, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.GENERATING,
    )
    is_public = models.BooleanField(default=False)
    download_count = models.PositiveIntegerField(default=0)
    relevance_score = models.FloatField(default=0.0)
    featured = models.BooleanField(default=False)
    retry_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField(
        "ImageTag",
        blank=True,
        related_name="images",
    )

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

    def __str__(self):
        prompt_preview = (self.prompt or '')[:50]
        return f'Image by {self.user.username} - {prompt_preview}'


class ImageLike(models.Model):
    image = models.ForeignKey(
        Image, on_delete=models.CASCADE, related_name='likes'
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='image_likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['image', 'user'], name='unique_like_per_user_image'
            )
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'Like by {self.user.username} on image {self.image_id}'


class ImageComment(models.Model):
    image = models.ForeignKey(
        Image, on_delete=models.CASCADE, related_name='comments'
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='image_comments'
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        preview = (self.text or '')[:30]
        return f'Comment by {self.user.username}: {preview}'


class ImageTag(models.Model):
    name = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ImageEmbedding(models.Model):
    """
    Stores embeddings for the Creative Memory feature.

    - prompt_embedding: vector from sentence-transformers (all-MiniLM-L6-v2)
    - image_embedding: vector from BLIP visual encoder

    Both vectors are L2-normalized for cosine similarity via inner product.
    """
    image = models.OneToOneField(
        Image,
        on_delete=models.CASCADE,
        related_name='embedding',
        primary_key=True,
    )
    prompt_text = models.TextField(
        blank=True,
        help_text="The prompt text used to generate the embedding (for debugging/analysis)"
    )
    # When pgvector is not available, fallback to JSON storage
    # These fields will be created properly by migration based on DB support
    prompt_embedding_json = models.JSONField(
        null=True,
        blank=True,
        help_text="Fallback: prompt embedding as JSON list when pgvector unavailable"
    )
    image_embedding_json = models.JSONField(
        null=True,
        blank=True,
        help_text="Fallback: image embedding as JSON list when pgvector unavailable"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Image Embedding"
        verbose_name_plural = "Image Embeddings"

    def __str__(self):
        return f"Embedding for Image {self.image_id}"

    @property
    def has_embeddings(self):
        """Check if at least one embedding is available."""
        return bool(self.prompt_embedding_json or self.image_embedding_json)
