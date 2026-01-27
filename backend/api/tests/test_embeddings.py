"""
Tests for Creative Memory - Embeddings feature.

Tests cover:
- ImageEmbedding model creation/update
- create_embeddings_task behavior
- Related images endpoint
- Style suggestions endpoint
- Permission checks
"""
from unittest.mock import patch, MagicMock
import os
import tempfile

from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status
from PIL import Image as PILImage

from api.models import Image, ImageEmbedding
from api.tasks import create_embeddings_task
from tests.mixins import TemporaryMediaMixin
from tests.utils import create_user


# Mock embeddings for testing (avoid downloading actual models)
MOCK_TEXT_EMBEDDING = [0.1] * 384  # MiniLM dimension
MOCK_IMAGE_EMBEDDING = [0.2] * 768  # BLIP dimension


class ImageEmbeddingModelTests(TemporaryMediaMixin, TestCase):
    """Tests for ImageEmbedding model."""

    def setUp(self):
        super().setUp()
        self.user = create_user(email="embed@example.com", username="embeduser")
        self.image = Image.objects.create(
            user=self.user,
            prompt="A beautiful sunset over the ocean",
            status=Image.Status.READY,
        )

    def test_create_embedding(self):
        """ImageEmbedding can be created with JSON embeddings."""
        embedding = ImageEmbedding.objects.create(
            image=self.image,
            prompt_text="A beautiful sunset over the ocean",
            prompt_embedding_json=MOCK_TEXT_EMBEDDING,
            image_embedding_json=MOCK_IMAGE_EMBEDDING,
        )

        self.assertEqual(embedding.image_id, self.image.id)
        self.assertEqual(embedding.prompt_text, "A beautiful sunset over the ocean")
        self.assertEqual(len(embedding.prompt_embedding_json), 384)
        self.assertEqual(len(embedding.image_embedding_json), 768)
        self.assertTrue(embedding.has_embeddings)

    def test_update_embedding(self):
        """ImageEmbedding can be updated via update_or_create."""
        # Create initial
        ImageEmbedding.objects.create(
            image=self.image,
            prompt_text="Initial prompt",
            prompt_embedding_json=[0.5] * 384,
        )

        # Update
        new_embedding = [0.9] * 384
        obj, created = ImageEmbedding.objects.update_or_create(
            image=self.image,
            defaults={
                'prompt_text': "Updated prompt",
                'prompt_embedding_json': new_embedding,
            }
        )

        self.assertFalse(created)
        self.assertEqual(obj.prompt_text, "Updated prompt")
        self.assertEqual(obj.prompt_embedding_json[0], 0.9)

    def test_has_embeddings_property(self):
        """has_embeddings returns True only when embeddings exist."""
        # No embeddings
        embedding = ImageEmbedding.objects.create(
            image=self.image,
            prompt_text="Test",
        )
        self.assertFalse(embedding.has_embeddings)

        # Add prompt embedding
        embedding.prompt_embedding_json = MOCK_TEXT_EMBEDDING
        embedding.save()
        self.assertTrue(embedding.has_embeddings)


class CreateEmbeddingsTaskTests(TemporaryMediaMixin, TestCase):
    """Tests for create_embeddings_task Celery task."""

    def setUp(self):
        super().setUp()
        self.user = create_user(email="task@example.com", username="taskuser")

    def _create_test_image_file(self):
        """Create a temporary test image file."""
        img = PILImage.new('RGB', (100, 100), color='red')
        tmp = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
        img.save(tmp, format='PNG')
        tmp.close()
        return tmp.name

    @patch('api.tasks.EMBEDDINGS_ENABLED', True)
    @patch('api.tasks.generate_image_embedding')
    @patch('api.tasks.generate_text_embedding')
    def test_task_creates_embeddings(self, mock_text, mock_image):
        """Task creates embeddings for a ready image."""
        mock_text.return_value = MOCK_TEXT_EMBEDDING
        mock_image.return_value = MOCK_IMAGE_EMBEDDING

        # Create image with file
        test_file = self._create_test_image_file()
        try:
            image = Image.objects.create(
                user=self.user,
                prompt="Test prompt for embedding",
                status=Image.Status.READY,
            )
            image.image.name = test_file
            image.save()

            # Mock os.path.exists to return True for our test file
            with patch('os.path.exists', return_value=True):
                with patch.object(image.image, 'path', test_file):
                    create_embeddings_task(image.id)

            # Check embedding was created
            embedding = ImageEmbedding.objects.get(image=image)
            self.assertEqual(embedding.prompt_text, "Test prompt for embedding")
            self.assertEqual(embedding.prompt_embedding_json, MOCK_TEXT_EMBEDDING)
            self.assertEqual(embedding.image_embedding_json, MOCK_IMAGE_EMBEDDING)
        finally:
            if os.path.exists(test_file):
                os.unlink(test_file)

    @patch('api.tasks.EMBEDDINGS_ENABLED', False)
    def test_task_skips_when_disabled(self):
        """Task skips when EMBEDDINGS_ENABLED is False."""
        image = Image.objects.create(
            user=self.user,
            prompt="Test prompt",
            status=Image.Status.READY,
        )

        create_embeddings_task(image.id)

        self.assertFalse(ImageEmbedding.objects.filter(image=image).exists())

    @patch('api.tasks.EMBEDDINGS_ENABLED', True)
    def test_task_skips_non_ready_images(self):
        """Task skips images that are not READY."""
        image = Image.objects.create(
            user=self.user,
            prompt="Test prompt",
            status=Image.Status.GENERATING,
        )

        create_embeddings_task(image.id)

        self.assertFalse(ImageEmbedding.objects.filter(image=image).exists())

    @patch('api.tasks.EMBEDDINGS_ENABLED', True)
    def test_task_handles_missing_image(self):
        """Task handles non-existent image gracefully."""
        # Should not raise
        create_embeddings_task(999999)


class RelatedImagesViewTests(TemporaryMediaMixin, APITestCase):
    """Tests for GET /api/images/<id>/related/ endpoint."""

    def setUp(self):
        super().setUp()
        self.user = create_user(email="related@example.com", username="relateduser")
        self.other_user = create_user(email="other@example.com", username="otheruser")

        # Create test images
        self.public_image = Image.objects.create(
            user=self.user,
            prompt="Public sunset image",
            status=Image.Status.READY,
            is_public=True,
        )
        self.private_image = Image.objects.create(
            user=self.user,
            prompt="Private night image",
            status=Image.Status.READY,
            is_public=False,
        )
        self.other_public = Image.objects.create(
            user=self.other_user,
            prompt="Another public image",
            status=Image.Status.READY,
            is_public=True,
        )
        self.other_private = Image.objects.create(
            user=self.other_user,
            prompt="Another private image",
            status=Image.Status.READY,
            is_public=False,
        )

        # Create embeddings
        for img in [self.public_image, self.private_image, self.other_public, self.other_private]:
            ImageEmbedding.objects.create(
                image=img,
                prompt_text=img.prompt,
                image_embedding_json=[0.1 * img.id] * 768,
            )

    def test_related_returns_200_for_public_image(self):
        """Anonymous user can get related images for public image."""
        url = f'/api/images/{self.public_image.id}/related/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('results', response.data)

    def test_related_returns_404_for_private_image_anonymous(self):
        """Anonymous user cannot access related for private image."""
        url = f'/api/images/{self.private_image.id}/related/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_related_works_for_owner_private_image(self):
        """Owner can get related images for their private image."""
        self.client.force_authenticate(user=self.user)
        url = f'/api/images/{self.private_image.id}/related/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_related_respects_limit_param(self):
        """Limit parameter is respected."""
        self.client.force_authenticate(user=self.user)
        url = f'/api/images/{self.public_image.id}/related/?limit=1'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(response.data['results']), 1)

    def test_related_excludes_other_private_images(self):
        """Results should not include other users' private images."""
        self.client.force_authenticate(user=self.user)
        url = f'/api/images/{self.public_image.id}/related/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result_ids = [r['image']['id'] for r in response.data['results']]
        self.assertNotIn(self.other_private.id, result_ids)


class StyleSuggestionsViewTests(TemporaryMediaMixin, APITestCase):
    """Tests for GET /api/users/me/style-suggestions/ endpoint."""

    def setUp(self):
        super().setUp()
        self.user = create_user(email="style@example.com", username="styleuser")

    def test_requires_authentication(self):
        """Endpoint requires authentication."""
        url = '/api/users/me/style-suggestions/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_returns_empty_for_new_user(self):
        """Returns empty results for user with no images."""
        self.client.force_authenticate(user=self.user)
        url = '/api/users/me/style-suggestions/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
        self.assertEqual(response.data['results'], [])

    def test_returns_suggestions_based_on_history(self):
        """Returns suggestions based on prompt history."""
        # Create images with recurring style keywords
        for i in range(3):
            img = Image.objects.create(
                user=self.user,
                prompt=f"A realistic portrait in cinematic style {i}",
                status=Image.Status.READY,
            )
            ImageEmbedding.objects.create(
                image=img,
                prompt_text=img.prompt,
            )

        self.client.force_authenticate(user=self.user)
        url = '/api/users/me/style-suggestions/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should find "realistic" and "cinematic" as recurring styles
        labels = [r['label'].lower() for r in response.data['results']]
        self.assertTrue(
            'realistic' in labels or 'cinematic' in labels,
            f"Expected style keywords in {labels}"
        )

    def test_respects_limit_param(self):
        """Limit parameter is respected."""
        # Create multiple images
        for i in range(5):
            img = Image.objects.create(
                user=self.user,
                prompt=f"Realistic cinematic dramatic portrait {i}",
                status=Image.Status.READY,
            )
            ImageEmbedding.objects.create(image=img, prompt_text=img.prompt)

        self.client.force_authenticate(user=self.user)
        url = '/api/users/me/style-suggestions/?limit=2'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLessEqual(response.data['count'], 2)
