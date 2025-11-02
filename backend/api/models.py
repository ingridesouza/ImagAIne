from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Image(models.Model):
    class Status(models.TextChoices):
        GENERATING = "GENERATING", "Generating"
        READY = "READY", "Ready"
        FAILED = "FAILED", "Failed"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='images')
    prompt = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='', blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.GENERATING,
    )
    is_public = models.BooleanField(default=False)
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
