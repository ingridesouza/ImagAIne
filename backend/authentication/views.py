from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import uuid

from .models import User, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    UserSerializer
)

class UserRegistrationView(generics.CreateAPIView):
    """View for user registration."""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send verification email (implementation needed)
        self._send_verification_email(user)
        
        return Response(
            {"detail": "User registered successfully. Please check your email for verification."},
            status=status.HTTP_201_CREATED
        )
    
    def _send_verification_email(self, user):
        """Send verification email to the user."""
        # Create a verification token
        token = str(uuid.uuid4())
        user.verification_token = token
        user.save()
        
        # Build verification URL
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}/"
        
        # Prepare email content
        subject = 'Verify your email address'
        html_message = render_to_string('emails/verification.html', {
            'user': user,
            'verification_url': verification_url
        })
        plain_message = strip_tags(html_message)
        
        # Send email
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )


class UserLoginView(APIView):
    """View for user login."""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """View to request a password reset."""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            self._create_and_send_reset_token(user)
        except User.DoesNotExist:
            # Don't reveal that the user doesn't exist for security reasons
            pass
            
        return Response(
            {"detail": "If an account with this email exists, a password reset link has been sent."},
            status=status.HTTP_200_OK
        )
    
    def _create_and_send_reset_token(self, user):
        """Create a password reset token and send it via email."""
        # Invalidate any existing tokens
        PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Create new token
        expires_at = timezone.now() + timezone.timedelta(hours=24)  # Token valid for 24 hours
        token = PasswordResetToken.objects.create(
            user=user,
            expires_at=expires_at
        )
        
        # Send email with reset link
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{token.token}/"
        
        subject = 'Password Reset Request'
        html_message = render_to_string('emails/password_reset.html', {
            'user': user,
            'reset_url': reset_url,
            'expiry_hours': 24
        })
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )


class PasswordResetConfirmView(APIView):
    """View to confirm password reset with token."""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            reset_token = PasswordResetToken.objects.get(
                token=token,
                is_used=False,
                expires_at__gt=timezone.now()
            )
            
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            # Invalidate the token
            reset_token.is_used = True
            reset_token.save()
            
            return Response(
                {"detail": "Password has been reset successfully."},
                status=status.HTTP_200_OK
            )
            
        except PasswordResetToken.DoesNotExist:
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST
            )


class VerifyEmailView(APIView):
    """View to verify user's email address."""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, token):
        try:
            user = User.objects.get(verification_token=token, is_verified=False)
            user.is_verified = True
            user.verification_token = ''  # Clear the token after verification
            user.save()
            
            # Send welcome email
            self._send_welcome_email(user)
            
            return Response(
                {"detail": "Email verified successfully. You can now log in."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid or expired verification token."},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _send_welcome_email(self, user):
        """Send welcome email after successful verification."""
        subject = 'Welcome to Our Platform!'
        html_message = render_to_string('emails/welcome.html', {
            'user': user,
            'login_url': f"{settings.FRONTEND_URL}/login"
        })
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """View to retrieve and update user profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
