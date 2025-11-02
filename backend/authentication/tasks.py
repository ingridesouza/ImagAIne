import logging

from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

User = get_user_model()
logger = logging.getLogger(__name__)


@shared_task
def send_verification_email_task(user_id, verification_token):
    """Send verification email asynchronously."""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.warning("Verification email skipped; user %s not found.", user_id)
        return

    verification_url = f"{settings.FRONTEND_URL}/verify-email/{verification_token}/"
    context = {
        "user": user,
        "verification_url": verification_url,
    }
    subject = "Verify your email address"
    html_message = render_to_string("emails/verification.html", context)
    plain_message = strip_tags(html_message)

    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )


@shared_task
def send_welcome_email_task(user_id):
    """Send welcome email asynchronously after verification."""
    try:
        user = User.objects.get(id=user_id, is_verified=True)
    except User.DoesNotExist:
        logger.warning("Welcome email skipped; verified user %s not found.", user_id)
        return

    context = {
        "user": user,
        "login_url": f"{settings.FRONTEND_URL}/login",
    }
    subject = "Welcome to Our Platform!"
    html_message = render_to_string("emails/welcome.html", context)
    plain_message = strip_tags(html_message)

    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )
