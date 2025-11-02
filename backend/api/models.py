import os
import uuid

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


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
    retry_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

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
