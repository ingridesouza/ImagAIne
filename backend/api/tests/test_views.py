from datetime import timedelta
from unittest.mock import patch

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Image
from tests.utils import create_user


class GenerateImageViewTests(APITestCase):
    @patch("api.views.generate_image_task.delay")
    def test_generate_image_creates_placeholder_and_updates_counter(self, mock_delay):
        """Endpoint cria placeholder, reseta contador diário e enfileira worker."""
        user = create_user(
            email="generator@example.com",
            username="generator",
            image_generation_count=5,
            last_reset_date=timezone.now().date() - timedelta(days=1),
        )
        self.client.force_authenticate(user=user)

        payload = {
            "prompt": "A sunset over the ocean",
            "negative_prompt": "blurry",
            "aspect_ratio": Image.AspectRatio.LANDSCAPE,
            "seed": 42,
        }
        response = self.client.post(
            reverse("generate-image"),
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        image = Image.objects.get(user=user)
        self.assertEqual(image.status, Image.Status.GENERATING)
        self.assertEqual(image.negative_prompt, payload["negative_prompt"])
        self.assertEqual(image.aspect_ratio, payload["aspect_ratio"])
        self.assertEqual(image.seed, payload["seed"])
        mock_delay.assert_called_once_with(image.id)

        user.refresh_from_db()
        self.assertEqual(user.image_generation_count, 1)
        self.assertEqual(user.last_reset_date, timezone.now().date())

        self.assertEqual(response.data["negative_prompt"], payload["negative_prompt"])
        self.assertEqual(response.data["aspect_ratio"], payload["aspect_ratio"])
        self.assertEqual(response.data["seed"], payload["seed"])


class PublicImageViewTests(APITestCase):
    def test_public_images_accessible_without_authentication(self):
        """Listagem pública fica acessível sem autenticação."""
        user = create_user(
            email="public@example.com",
            username="publicuser",
        )
        Image.objects.create(
            user=user,
            prompt="public prompt",
            is_public=True,
            status=Image.Status.READY,
        )

        response = self.client.get(reverse("public-images"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["results"]), 1)


class ShareImageViewTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.user = create_user(
            email="owner@example.com",
            username="owner",
        )
        self.client.force_authenticate(user=self.user)

    def test_share_image_sets_public_flag(self):
        """POST /share publica a imagem do usuário autenticado."""
        image = Image.objects.create(user=self.user, prompt="to share")

        response = self.client.post(f"/api/images/{image.id}/share/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        image.refresh_from_db()
        self.assertTrue(image.is_public)

    def test_patch_share_toggles_visibility(self):
        """PATCH /share altera visibilidade de uma imagem própria."""
        image = Image.objects.create(
            user=self.user, prompt="toggle", is_public=True
        )

        response = self.client.patch(
            f"/api/images/{image.id}/share/",
            {"is_public": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        image.refresh_from_db()
        self.assertFalse(image.is_public)
