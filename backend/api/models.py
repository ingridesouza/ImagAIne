from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Image(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='images')
    prompt = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=1024)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    retry_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f'Image by {self.user.username} - {self.prompt[:50]}'
