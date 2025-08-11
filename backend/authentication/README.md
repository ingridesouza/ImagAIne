# Authentication System

This module provides a complete authentication system for the ImagAIne platform, including user registration, login, and password reset functionality.

## Features

- User registration with email verification
- JWT-based authentication
- Password reset functionality with email notifications
- Custom user model with additional fields
- Secure password hashing and validation

## API Endpoints

### Authentication

- **POST** `/api/auth/register/` - Register a new user
- **POST** `/api/auth/login/` - User login (returns JWT tokens)
- **POST** `/api/auth/token/refresh/` - Refresh JWT token
- **POST** `/api/auth/token/verify/` - Verify JWT token

### Password Reset

- **POST** `/api/auth/password/reset/request/` - Request password reset email
- **POST** `/api/auth/password/reset/confirm/` - Confirm password reset with token

### User Profile

- **GET** `/api/auth/profile/` - Get current user profile
- **PUT** `/api/auth/profile/` - Update current user profile

## Environment Variables

Add these to your `.env` file:

```
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=noreply@example.com




# JWT Secret Key
SECRET_KEY=your-secret-key-here
```

## Setup

1. Make sure you have the required Python packages installed:
   ```bash
   pip install djangorestframework djangorestframework-simplejwt python-decouple
   ```

2. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. Start the development server:
   ```bash
   python manage.py runserver
   ```

## Testing

You can test the authentication endpoints using tools like Postman or cURL. Here are some example requests:

### Register a new user
```http
POST /api/auth/register/
Content-Type: application/json

{
    "email": "user@example.com",
    "username": "user123",
    "first_name": "John",
    "last_name": "Doe",
    "password": "securepassword123",
    "password2": "securepassword123"
}
```

### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword123"
}
```

### Request password reset
```http
POST /api/auth/password/reset/request/
Content-Type: application/json

{
    "email": "user@example.com"
}
```

### Reset password with token
```http
POST /api/auth/password/reset/confirm/
Content-Type: application/json

{
    "token": "your-reset-token",
    "new_password": "newsecurepassword123",
    "new_password_confirm": "newsecurepassword123"
}
```

## Security Considerations

- Always use HTTPS in production
- Keep your `SECRET_KEY` secure and never commit it to version control
- Use strong password validation rules
- Implement rate limiting for authentication endpoints
- Keep your dependencies up to date

## License

This project is licensed under the MIT License - see the LICENSE file for details.
