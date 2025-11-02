from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid


def current_date():
    """Return current date in UTC for usage counters."""
    return timezone.now().date()


class User(AbstractUser):
    """Custom user model that extends the default User model."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=255, blank=True, null=True)
    verification_token_expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image_generation_count = models.PositiveIntegerField(default=0)
    last_reset_date = models.DateField(default=current_date)
    plan = models.CharField(max_length=10, default="free")
    profile_picture = models.CharField(max_length=100, blank=True, null=True)
    social_media_links = models.JSONField(default=dict, blank=True)
    bio = models.TextField(blank=True, default="")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if self.bio is None:
            self.bio = ""
        if self.last_reset_date is None:
            self.last_reset_date = current_date()
        if not self.plan:
            self.plan = "free"
        if self.social_media_links is None:
            self.social_media_links = {}
        super().save(*args, **kwargs)


class PasswordResetToken(models.Model):
    """Model to store password reset tokens."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        """Check if the token is valid and not expired."""
        return not self.is_used and self.expires_at > timezone.now()

    def mark_as_used(self):
        """Mark the token as used."""
        self.is_used = True
        self.save()

    def __str__(self):
        return f"Password reset token for {self.user.email}"
