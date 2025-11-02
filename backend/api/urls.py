from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    GenerateImageView,
    PublicImageListView,
    UserImageListView,
    ShareImageView
)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('generate/', GenerateImageView.as_view(), name='generate-image'),
    path('images/public/', PublicImageListView.as_view(), name='public-images'),
    path('images/my-images/', UserImageListView.as_view(), name='user-images'),
    path('images/<int:pk>/share/', ShareImageView.as_view(), name='share-image'),
]

