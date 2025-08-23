from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from .models import User, PasswordResetToken

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        # Remove password2 as it's not a User model field
        validated_data.pop('password2', None)
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    token = serializers.CharField(read_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'),
                             email=email, password=password)
            
            if not user:
                msg = _('Unable to log in with provided credentials.')
                raise serializers.ValidationError(msg, code='authorization')
            
            if not user.is_active:
                msg = _('User account is disabled.')
                raise serializers.ValidationError(msg, code='authorization')
            
            if not user.is_verified:
                msg = _('Please verify your email before logging in.')
                raise serializers.ValidationError(msg, code='authorization')
                
        else:
            msg = _('Must include "email" and "password".')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    token = serializers.UUIDField(required=True)
    new_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(required=True, style={'input_type': 'password'})

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details."""
    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name', 'is_verified',
            'profile_picture', 'social_media_links', 'bio', 'plan'
        )


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'profile_picture', 'social_media_links', 'bio')
