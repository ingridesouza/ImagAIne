from celery import shared_task
from django.utils import timezone
from .models import User

@shared_task
def reset_monthly_image_counts():
    """Resets the image generation count for all users at the beginning of the month."""
    today = timezone.now().date()
    # This task should be scheduled to run on the 1st of every month.
    # We reset the count for all users.
    users_to_reset = User.objects.all()
    for user in users_to_reset:
        user.image_generation_count = 0
        user.last_reset_date = today
    User.objects.bulk_update(users_to_reset, ['image_generation_count', 'last_reset_date'])
    return f"Reset image generation count for {users_to_reset.count()} users."
