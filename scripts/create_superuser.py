import os
import sys
django_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.append(django_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imagAine.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from decouple import config

User = get_user_model()
username = config('DJANGO_SUPERUSER_USERNAME', default='admin')
email = config('DJANGO_SUPERUSER_EMAIL', default='admin@example.com')
password = config('DJANGO_SUPERUSER_PASSWORD', default='admin')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print('Superuser created')
else:
    print('Superuser already exists')
