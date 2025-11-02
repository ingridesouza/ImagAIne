from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    GenerateImageView,
    ImageCommentDetailView,
    ImageCommentListCreateView,
    ImageDownloadView,
    ImageLikeView,
    PublicImageListView,
    ShareImageView,
    UserImageListView,
)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('generate/', GenerateImageView.as_view(), name='generate-image'),
    path('images/public/', PublicImageListView.as_view(), name='public-images'),
    path('images/my-images/', UserImageListView.as_view(), name='user-images'),
    path('images/<int:pk>/share/', ShareImageView.as_view(), name='share-image'),
    path('images/<int:pk>/like/', ImageLikeView.as_view(), name='image-like'),
    path('images/<int:pk>/comments/', ImageCommentListCreateView.as_view(), name='image-comments'),
    path('images/<int:pk>/comments/<int:comment_id>/', ImageCommentDetailView.as_view(), name='image-comment-detail'),
    path('images/<int:pk>/download/', ImageDownloadView.as_view(), name='image-download'),
]

