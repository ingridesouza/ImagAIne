from datetime import timedelta
from unittest.mock import patch

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from authentication.models import PasswordResetToken, User
from tests.utils import create_user


class RegistrationTests(APITestCase):
    @patch("authentication.views.send_verification_email_task.delay")
    def test_register_enqueues_verification_email(self, mock_delay):
        """Cadastro cria usuário pendente de verificação e agenda e-mail."""
        payload = {
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "ComplexPass123!",
            "password2": "ComplexPass123!",
            "first_name": "New",
            "last_name": "User",
        }

        response = self.client.post(
            reverse("authentication:register"), payload, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email=payload["email"])
        self.assertFalse(user.is_verified)
        self.assertIsNotNone(user.verification_token)
        mock_delay.assert_called_once_with(user.id, user.verification_token)


class LoginTests(APITestCase):
    def test_login_requires_verified_email(self):
        """Login retorna erro enquanto o e-mail não estiver verificado."""
        user = create_user(
            email="needsverify@example.com",
            username="needsverify",
            is_verified=False,
        )

        response = self.client.post(
            reverse("authentication:login"),
            {"email": user.email, "password": "Str0ngPass!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        message = response.data.get("detail")
        if message is None:
            message = response.data["non_field_errors"][0]
        self.assertIn("Please verify your email", message)

    def test_login_returns_tokens_for_verified_user(self):
        """Login de usuário verificado devolve par de tokens JWT."""
        user = create_user(email="verified@example.com", username="verifieduser")

        response = self.client.post(
            reverse("authentication:login"),
            {"email": user.email, "password": "Str0ngPass!"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], user.email)


class PasswordResetTests(APITestCase):
    @patch("authentication.views.send_mail")
    def test_password_reset_request_creates_token(self, mock_send_mail):
        """Solicitação de reset invalida tokens antigos e envia e-mail."""
        user = create_user(email="reset@example.com", username="resetuser")
        PasswordResetToken.objects.create(
            user=user,
            expires_at=timezone.now() + timedelta(hours=1),
            is_used=False,
        )

        response = self.client.post(
            reverse("authentication:password_reset_request"),
            {"email": user.email},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        tokens = PasswordResetToken.objects.filter(user=user).order_by("-created_at")
        self.assertEqual(tokens.count(), 2)
        self.assertTrue(tokens.last().is_used)
        self.assertFalse(tokens.first().is_used)
        mock_send_mail.assert_called_once()

    def test_password_reset_confirm_updates_password(self):
        """Confirmação com token válido troca a senha e inutiliza o token."""
        user = create_user(email="confirm@example.com", username="confirmuser")
        token = PasswordResetToken.objects.create(
            user=user,
            expires_at=timezone.now() + timedelta(hours=1),
        )

        response = self.client.post(
            reverse("authentication:password_reset_confirm"),
            {
                "token": str(token.token),
                "new_password": "NewPass123!",
                "new_password_confirm": "NewPass123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewPass123!"))
        token.refresh_from_db()
        self.assertTrue(token.is_used)

    def test_password_reset_confirm_invalid_token(self):
        """Token inválido retorna 400 sem alterar a senha."""
        response = self.client.post(
            reverse("authentication:password_reset_confirm"),
            {
                "token": "00000000-0000-0000-0000-000000000000",
                "new_password": "AnotherPass123!",
                "new_password_confirm": "AnotherPass123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["detail"], "Invalid or expired token.")


class VerificationTests(APITestCase):
    @patch("authentication.views.send_welcome_email_task.delay")
    def test_verify_email_marks_user_verified(self, mock_delay):
        """Verificação ativa o usuário e agenda e-mail de boas-vindas."""
        user = create_user(
            email="verify@example.com",
            username="verifyuser",
            is_verified=False,
        )
        user.verification_token = "sometoken"
        user.save(update_fields=["verification_token"])

        response = self.client.get(
            reverse("authentication:verify_email", kwargs={"token": "sometoken"})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.is_verified)
        self.assertEqual(user.verification_token, "")
        mock_delay.assert_called_once_with(user.id)

    def test_verify_email_with_invalid_token_returns_400(self):
        """Token inválido na verificação responde 400 informando problema."""
        response = self.client.get(
            reverse("authentication:verify_email", kwargs={"token": "invalid"})
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
