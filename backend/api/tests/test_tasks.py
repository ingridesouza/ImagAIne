from unittest.mock import patch

from django.test import TestCase
from PIL import Image as PILImage

from api.models import Image
from api.tasks import generate_image_task
from tests.mixins import TemporaryMediaMixin
from tests.utils import capture_logger, create_user


class GenerateImageTaskTests(TemporaryMediaMixin, TestCase):
    @patch("api.tasks.InferenceClient")
    def test_generate_image_success(self, mock_client):
        """Worker salva imagem gerada e zera contador de tentativas."""
        user = create_user(email="task@example.com", username="taskuser")
        image = Image.objects.create(user=user, prompt="A simple prompt")

        mock_instance = mock_client.return_value
        mock_instance.text_to_image.return_value = PILImage.new(
            "RGB", (10, 10), color="white"
        )

        generate_image_task(image.id)

        image.refresh_from_db()
        self.assertEqual(image.status, Image.Status.READY)
        self.assertEqual(image.retry_count, 0)
        self.assertTrue(image.image.name.startswith(f"users/{user.id}/images/"))
        self.assertTrue(image.image.storage.exists(image.image.name))

    @patch("api.tasks.InferenceClient")
    def test_generate_image_failure_increments_retry(self, mock_client):
        """Worker registra falha, incrementa retry e não mantém arquivo."""
        user = create_user(email="fail@example.com", username="failuser")
        image = Image.objects.create(user=user, prompt="A failing prompt")

        mock_instance = mock_client.return_value
        mock_instance.text_to_image.side_effect = RuntimeError("HuggingFace error")

        with capture_logger("api.tasks") as logs:
            generate_image_task(image.id)

        image.refresh_from_db()
        self.assertEqual(image.status, Image.Status.FAILED)
        self.assertEqual(image.retry_count, 1)
        self.assertFalse(bool(image.image))
        self.assertIn("HF API error", logs.getvalue())
