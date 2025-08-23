from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from authentication.views import UserProfileView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/auth/', include('authentication.urls')),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/users/me/', UserProfileView.as_view(), name='user-me'),
    path('api/subscription/', include('subscription.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
