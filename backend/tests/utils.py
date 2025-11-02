import io
import logging
from contextlib import contextmanager

from django.contrib.auth import get_user_model


def create_user(
    email="user@example.com",
    password="Str0ngPass!",
    username="user",
    is_verified=True,
    **extra,
):
    """Helper to create test users with sensible defaults."""
    User = get_user_model()
    user = User.objects.create_user(
        email=email,
        password=password,
        username=username,
        **extra,
    )
    if is_verified and not user.is_verified:
        user.is_verified = True
        user.verification_token = ""
        user.save(update_fields=["is_verified", "verification_token"])
    return user


@contextmanager
def capture_logger(name, level=logging.ERROR):
    """Capture logs for `name` without propagating to the console."""
    logger = logging.getLogger(name)
    stream = io.StringIO()
    handler = logging.StreamHandler(stream)

    original_handlers = logger.handlers[:]
    original_level = logger.level
    original_propagate = logger.propagate

    logger.handlers = [handler]
    logger.setLevel(level)
    logger.propagate = False

    try:
        yield stream
    finally:
        handler.flush()
        logger.handlers = original_handlers
        logger.setLevel(original_level)
        logger.propagate = original_propagate
