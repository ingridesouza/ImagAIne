from datetime import timedelta
import uuid

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import ScopedRateThrottle
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from drf_spectacular.utils import extend_schema, extend_schema_view, inline_serializer
from rest_framework import serializers as drf_serializers

from .models import PasswordResetToken, User
from .serializers import (
    ChangePasswordSerializer,
    DeleteAccountSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)
from .tasks import send_verification_email_task, send_welcome_email_task

# Inline serializers reutilizáveis para responses
_detail_response = inline_serializer('DetailResponse', fields={
    'detail': drf_serializers.CharField(),
})

@extend_schema_view(
    create=extend_schema(
        tags=['Auth'],
        summary='Registrar usuário',
        description=(
            'Cria uma nova conta. Um email de verificação é enviado automaticamente. '
            'O login só é liberado após verificação do email.'
        ),
        responses={201: _detail_response},
    ),
)
class UserRegistrationView(generics.CreateAPIView):
    """View for user registration."""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_register"

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
        user.verification_token_expires_at = timezone.now() + timedelta(hours=24)
        user.save(update_fields=["verification_token", "verification_token_expires_at"])
        
        send_verification_email_task.delay(user.id, token)


class UserLoginView(APIView):
    """View for user login."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_login"

    @extend_schema(
        tags=['Auth'],
        summary='Login',
        description='Autentica o usuário e retorna par de tokens JWT (access + refresh).',
        request=UserLoginSerializer,
        responses={200: inline_serializer('LoginResponse', fields={
            'refresh': drf_serializers.CharField(),
            'access': drf_serializers.CharField(),
            'user': UserSerializer(),
        })},
    )
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
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_password_reset"

    @extend_schema(
        tags=['Auth'],
        summary='Solicitar reset de senha',
        description='Envia email com link de reset. Não revela se o email existe.',
        request=PasswordResetRequestSerializer,
        responses={200: _detail_response},
    )
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
        expires_at = timezone.now() + timedelta(hours=24)  # Token valid for 24 hours
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
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_password_reset"

    @extend_schema(
        tags=['Auth'],
        summary='Confirmar reset de senha',
        description='Valida o token e define nova senha.',
        request=PasswordResetConfirmSerializer,
        responses={200: _detail_response, 400: _detail_response},
    )
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

    @extend_schema(
        tags=['Auth'],
        summary='Verificar email',
        description='Valida o token de verificação enviado por email. Token expira em 24h.',
        responses={200: _detail_response, 400: _detail_response},
    )
    def get(self, request, token):
        try:
            user = User.objects.get(
                verification_token=token,
                is_verified=False,
                verification_token_expires_at__gt=timezone.now(),
            )
            user.is_verified = True
            user.verification_token = ''  # Clear the token after verification
            user.verification_token_expires_at = None
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
        send_welcome_email_task.delay(user.id)


@extend_schema_view(
    retrieve=extend_schema(
        tags=['Profile'],
        summary='Obter perfil',
        description='Retorna os dados do perfil do usuário autenticado.',
    ),
    update=extend_schema(
        tags=['Profile'],
        summary='Atualizar perfil',
        description='Atualiza os dados do perfil (username, first_name, last_name, bio).',
    ),
    partial_update=extend_schema(
        tags=['Profile'],
        summary='Atualizar perfil (parcial)',
        description='Atualiza campos específicos do perfil.',
    ),
)
class UserProfileView(generics.RetrieveUpdateAPIView):
    """View to retrieve and update user profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class AvatarUploadView(APIView):
    """Upload or replace user avatar (profile_picture)."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Profile'],
        summary='Upload de avatar',
        description='Envia ou substitui a foto de perfil do usuário.',
        request={'multipart/form-data': {'type': 'object', 'properties': {
            'file': {'type': 'string', 'format': 'binary'},
        }, 'required': ['file']}},
        responses={200: UserSerializer, 400: _detail_response},
    )
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"detail": "Nenhum arquivo enviado."}, status=status.HTTP_400_BAD_REQUEST)

        filename = f"avatars/{request.user.id}-{file.name}"
        saved_path = default_storage.save(filename, ContentFile(file.read()))
        request.user.profile_picture = default_storage.url(saved_path)
        request.user.save(update_fields=["profile_picture"])
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CoverUploadView(APIView):
    """Upload or replace user cover image (cover_picture)."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Profile'],
        summary='Upload de capa',
        description='Envia ou substitui a imagem de capa do usuário.',
        request={'multipart/form-data': {'type': 'object', 'properties': {
            'file': {'type': 'string', 'format': 'binary'},
        }, 'required': ['file']}},
        responses={200: UserSerializer, 400: _detail_response},
    )
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"detail": "Nenhum arquivo enviado."}, status=status.HTTP_400_BAD_REQUEST)

        filename = f"covers/{request.user.id}-{file.name}"
        saved_path = default_storage.save(filename, ContentFile(file.read()))
        request.user.cover_picture = default_storage.url(saved_path)
        request.user.save(update_fields=["cover_picture"])
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class PreferencesView(APIView):
    """Retrieve or update user preferences (models, ratios, toggles)."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Profile'],
        summary='Obter preferências',
        description='Retorna as preferências salvas do usuário (JSON livre).',
        responses={200: inline_serializer('PreferencesResponse', fields={})},
    )
    def get(self, request):
        return Response(request.user.preferences or {})

    @extend_schema(
        tags=['Profile'],
        summary='Atualizar preferências',
        description='Substitui as preferências do usuário por um objeto JSON.',
        request=inline_serializer('PreferencesRequest', fields={}),
        responses={200: inline_serializer('PreferencesUpdated', fields={})},
    )
    def put(self, request):
        prefs = request.data if isinstance(request.data, dict) else {}
        request.user.preferences = prefs
        request.user.save(update_fields=["preferences"])
        return Response(prefs, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """Change password for authenticated user."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Auth'],
        summary='Trocar senha',
        description='Altera a senha do usuário autenticado. Requer a senha atual.',
        request=ChangePasswordSerializer,
        responses={200: _detail_response, 400: _detail_response},
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not request.user.check_password(serializer.validated_data['current_password']):
            return Response(
                {"detail": "Senha atual incorreta."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        return Response(
            {"detail": "Senha alterada com sucesso."},
            status=status.HTTP_200_OK,
        )


class DeleteAccountView(APIView):
    """Delete user account permanently."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Auth'],
        summary='Deletar conta',
        description=(
            'Deleta permanentemente a conta do usuário e todas as suas imagens. '
            'Requer confirmação com a senha atual. Ação irreversível.'
        ),
        request=DeleteAccountSerializer,
        responses={
            200: _detail_response,
            400: _detail_response,
        },
    )
    def delete(self, request):
        serializer = DeleteAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not request.user.check_password(serializer.validated_data['password']):
            return Response(
                {"detail": "Senha incorreta."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.delete()

        return Response(
            {"detail": "Conta deletada com sucesso."},
            status=status.HTTP_200_OK,
        )
