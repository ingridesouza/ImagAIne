from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    CommentLikeView,
    GenerateImageView,
    ImageCommentDetailView,
    ImageCommentListCreateView,
    ImageDownloadView,
    ImageLikeView,
    ImageRestyleView,
    ImageVariationsView,
    ProjectDetailView,
    ProjectImageManageView,
    ProjectListCreateView,
    ProjectReorderView,
    PublicImageListView,
    PublicProjectListView,
    RefinePromptView,
    RelatedImagesView,
    SessionDetailView,
    SessionListCreateView,
    SessionMessageView,
    ShareImageView,
    StyleSuggestionsView,
    UserImageListView,
    UserLikedImagesView,
)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('generate/', GenerateImageView.as_view(), name='generate-image'),
    path('images/public/', PublicImageListView.as_view(), name='public-images'),
    path('images/my-images/', UserImageListView.as_view(), name='user-images'),
    path('images/liked/', UserLikedImagesView.as_view(), name='user-liked-images'),
    path('images/<int:pk>/share/', ShareImageView.as_view(), name='share-image'),
    path('images/<int:pk>/like/', ImageLikeView.as_view(), name='image-like'),
    path('images/<int:pk>/comments/', ImageCommentListCreateView.as_view(), name='image-comments'),
    path('images/<int:pk>/comments/<int:comment_id>/', ImageCommentDetailView.as_view(), name='image-comment-detail'),
    path('images/<int:pk>/comments/<int:comment_id>/like/', CommentLikeView.as_view(), name='comment-like'),
    path('images/<int:pk>/download/', ImageDownloadView.as_view(), name='image-download'),
    # Image-to-Image: Variations & Restyle
    path('images/<int:pk>/variations/', ImageVariationsView.as_view(), name='image-variations'),
    path('images/<int:pk>/restyle/', ImageRestyleView.as_view(), name='image-restyle'),
    # Creative Memory - Related Images and Style Suggestions
    path('images/<int:pk>/related/', RelatedImagesView.as_view(), name='image-related'),
    path('users/me/style-suggestions/', StyleSuggestionsView.as_view(), name='style-suggestions'),
    # Prompt Assistant - DeepSeek LLM
    path('refine-prompt/', RefinePromptView.as_view(), name='refine-prompt'),
    # Creative Agent
    path('sessions/', SessionListCreateView.as_view(), name='session-list-create'),
    path('sessions/<uuid:pk>/', SessionDetailView.as_view(), name='session-detail'),
    path('sessions/<uuid:pk>/messages/', SessionMessageView.as_view(), name='session-messages'),
    # Projects
    path('projects/', ProjectListCreateView.as_view(), name='project-list-create'),
    path('projects/public/', PublicProjectListView.as_view(), name='public-projects'),
    path('projects/<uuid:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<uuid:pk>/images/', ProjectImageManageView.as_view(), name='project-image-add'),
    path('projects/<uuid:pk>/images/<int:image_id>/remove/', ProjectImageManageView.as_view(), name='project-image-remove'),
    path('projects/<uuid:pk>/images/reorder/', ProjectReorderView.as_view(), name='project-reorder'),
]

