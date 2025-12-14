from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Email verification endpoint
    path('verify-email/<str:token>/', views.VerifyEmailView.as_view(), name='verify_email'),
    
    # Password reset endpoints
    path('password/reset/request/', views.PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # User profile endpoint
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('profile/avatar/', views.AvatarUploadView.as_view(), name='user_avatar'),
    path('profile/cover/', views.CoverUploadView.as_view(), name='user_cover'),
    path('preferences/', views.PreferencesView.as_view(), name='user_preferences'),
]
