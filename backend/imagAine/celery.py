import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imagAine.settings')

app = Celery('imagAine')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'reset-monthly-image-counts': {
        'task': 'authentication.tasks.reset_monthly_image_counts',
        'schedule': crontab(day_of_month=1, hour=0, minute=0),  # Every 1st of the month at midnight
    },
}
