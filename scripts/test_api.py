import os
import requests

BASE_URL = os.environ.get('BASE_URL', 'http://localhost:8000')
USERNAME = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
PASSWORD = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin')

# obtain token
resp = requests.post(f'{BASE_URL}/api/token/', data={'username': USERNAME, 'password': PASSWORD})
resp.raise_for_status()
token = resp.json()['access']

headers = {'Authorization': f'Bearer {token}'}
resp = requests.post(f'{BASE_URL}/api/generate-image/', json={'prompt': 'hello world'}, headers=headers)
print(resp.status_code)
print(resp.json())
