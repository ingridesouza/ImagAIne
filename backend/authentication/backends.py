from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()


class EmailBackend(ModelBackend):
    """
    Custom authentication backend that allows users to authenticate using their email address.
    """
    
    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        """
        Authenticate a user using email and password.
        
        Args:
            request: The request object
            username: Username (can be None for email-based auth)
            password: User's password
            email: User's email address
            **kwargs: Additional keyword arguments
            
        Returns:
            User instance if authentication successful, None otherwise
        """
        # Use email parameter if provided, otherwise fall back to username
        email_or_username = email or username
        
        if email_or_username is None or password is None:
            return None
            
        try:
            # Try to get user by email first, then by username as fallback
            user = User.objects.get(
                Q(email__iexact=email_or_username) | Q(username__iexact=email_or_username)
            )
        except User.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            # Handle case where multiple users have the same email (shouldn't happen with unique constraint)
            return None
            
        # Check if the password is correct and the user is active
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None
    
    def get_user(self, user_id):
        """
        Get user by ID.
        
        Args:
            user_id: The user's ID
            
        Returns:
            User instance if found, None otherwise
        """
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
            
        return user if self.user_can_authenticate(user) else None
