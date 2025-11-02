from datetime import timedelta
from unittest.mock import patch

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Image, ImageComment, ImageLike
from tests.utils import create_user


class GenerateImageViewTests(APITestCase):
    @patch("api.views.generate_image_task.delay")
    def test_generate_image_creates_placeholder_and_updates_counter(self, mock_delay):
        """Endpoint cria placeholder, reseta contador diario e enfileira worker."""
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

    def test_generate_image_respects_plan_quota(self):
        """Usuario acima do limite diario recebe 429."""
        today = timezone.now().date()
        user = create_user(
            email="limited@example.com",
            username="limited",
            plan="free",
            image_generation_count=5,
            last_reset_date=today,
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(
            reverse("generate-image"),
            {"prompt": "Exceed quota test"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn("quota", response.data["detail"].lower())


class PublicImageViewTests(APITestCase):
    def test_public_images_accessible_without_authentication(self):
        """Listagem publica fica acessivel sem autenticacao."""
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

    def test_public_feed_includes_engagement_metadata(self):
        """Feed publico traz totais de likes, comentarios e downloads."""
        owner = create_user(
            email="owner@example.com",
            username="ownerfeed",
        )
        fan = create_user(
            email="fan@example.com",
            username="fanfeed",
        )
        image = Image.objects.create(
            user=owner,
            prompt="engaging prompt",
            is_public=True,
            status=Image.Status.READY,
            download_count=3,
        )
        ImageLike.objects.create(image=image, user=fan)
        ImageComment.objects.create(image=image, user=fan, text="Incrivel!")

        self.client.force_authenticate(user=fan)
        response = self.client.get(reverse("public-images"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = next(
            item for item in response.data["results"] if item["id"] == image.id
        )
        self.assertEqual(result["like_count"], 1)
        self.assertEqual(result["comment_count"], 1)
        self.assertEqual(result["download_count"], 3)
        self.assertTrue(result["is_liked"])
        self.assertEqual(result["prompt"], image.prompt)

        self.client.force_authenticate(user=None)
        anon_response = self.client.get(reverse("public-images"))
        anon_result = next(
            item for item in anon_response.data["results"] if item["id"] == image.id
        )
        self.assertFalse(anon_result["is_liked"])


class UserImageViewTests(APITestCase):
    def test_user_feed_contains_engagement_fields(self):
        """Listagem do usuario retorna contadores e estado da curtida."""
        owner = create_user(
            email="owner-private@example.com",
            username="ownerprivate",
        )
        other = create_user(
            email="other-private@example.com",
            username="otherprivate",
        )
        image = Image.objects.create(
            user=owner,
            prompt="owner prompt",
            is_public=False,
            status=Image.Status.READY,
        )
        ImageLike.objects.create(image=image, user=owner)
        ImageComment.objects.create(image=image, user=other, text="Comentario")
        image.download_count = 5
        image.save(update_fields=["download_count"])

        self.client.force_authenticate(user=owner)
        response = self.client.get(reverse("user-images"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = next(
            item for item in response.data["results"] if item["id"] == image.id
        )
        self.assertEqual(result["like_count"], 1)
        self.assertEqual(result["comment_count"], 1)
        self.assertEqual(result["download_count"], 5)
        self.assertTrue(result["is_liked"])

    def test_user_feed_requires_authentication(self):
        """Usuario anonimo recebe 401 ao consultar imagens privadas."""
        response = self.client.get(reverse("user-images"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ShareImageViewTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.user = create_user(
            email="owner@example.com",
            username="owner",
        )
        self.client.force_authenticate(user=self.user)

    def test_share_image_sets_public_flag(self):
        """POST /share publica a imagem do usuario autenticado."""
        image = Image.objects.create(user=self.user, prompt="to share")

        response = self.client.post(f"/api/images/{image.id}/share/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        image.refresh_from_db()
        self.assertTrue(image.is_public)

    def test_patch_share_toggles_visibility(self):
        """PATCH /share altera visibilidade de uma imagem propria."""
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


class ImageLikeViewTests(APITestCase):
    def test_user_can_like_public_image(self):
        """Usuario autenticado consegue curtir imagem publica."""
        owner = create_user(email="owner-like@example.com", username="ownerlike")
        liker = create_user(email="liker@example.com", username="liker")
        image = Image.objects.create(
            user=owner,
            prompt="like prompt",
            is_public=True,
            status=Image.Status.READY,
        )

        self.client.force_authenticate(user=liker)
        response = self.client.post(
            reverse("image-like", kwargs={"pk": image.id})
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            ImageLike.objects.filter(image=image, user=liker).exists()
        )
        self.assertEqual(response.data["like_count"], 1)

        response_repeat = self.client.post(
            reverse("image-like", kwargs={"pk": image.id})
        )
        self.assertEqual(response_repeat.status_code, status.HTTP_200_OK)
        self.assertEqual(ImageLike.objects.filter(image=image).count(), 1)

    def test_user_can_unlike_image(self):
        """Usuario consegue remover propria curtida."""
        owner = create_user(email="owner-unlike@example.com", username="ownerunlike")
        liker = create_user(email="liker-unlike@example.com", username="likerunlike")
        image = Image.objects.create(
            user=owner,
            prompt="unlike prompt",
            is_public=True,
            status=Image.Status.READY,
        )
        ImageLike.objects.create(image=image, user=liker)

        self.client.force_authenticate(user=liker)
        response = self.client.delete(
            reverse("image-like", kwargs={"pk": image.id})
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            ImageLike.objects.filter(image=image, user=liker).exists()
        )

    def test_cannot_like_private_image_without_access(self):
        """Usuarios sem acesso recebem 403 ao curtir imagem privada."""
        owner = create_user(
            email="owner-private-like@example.com",
            username="ownerprivlike",
        )
        outsider = create_user(email="outsider@example.com", username="outsider")
        image = Image.objects.create(
            user=owner,
            prompt="private like",
            is_public=False,
            status=Image.Status.READY,
        )

        self.client.force_authenticate(user=outsider)
        response = self.client.post(
            reverse("image-like", kwargs={"pk": image.id})
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(
            ImageLike.objects.filter(image=image, user=outsider).exists()
        )


class ImageCommentViewTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.owner = create_user(
            email="comment-owner@example.com", username="commentowner"
        )
        self.public_image = Image.objects.create(
            user=self.owner,
            prompt="public comment",
            is_public=True,
            status=Image.Status.READY,
        )
        self.private_image = Image.objects.create(
            user=self.owner,
            prompt="private comment",
            is_public=False,
            status=Image.Status.READY,
        )

    def test_list_public_comments_available_without_auth(self):
        """Comentarios de imagem publica podem ser listados por anonimos."""
        commenter = create_user(email="commenter@example.com", username="commenter")
        ImageComment.objects.create(
            image=self.public_image, user=commenter, text="Comentario publico"
        )

        response = self.client.get(
            reverse("image-comments", kwargs={"pk": self.public_image.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["text"], "Comentario publico")

    def test_private_comments_not_accessible_by_anonymous(self):
        """Imagem privada nao expõe comentarios ao visitante."""
        response = self.client.get(
            reverse("image-comments", kwargs={"pk": self.private_image.id})
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_authenticated_user_can_comment_public_image(self):
        """Usuario autenticado consegue comentar imagem publica."""
        commenter = create_user(email="add-comment@example.com", username="addcomment")

        self.client.force_authenticate(user=commenter)
        response = self.client.post(
            reverse("image-comments", kwargs={"pk": self.public_image.id}),
            {"text": "Muito boa!"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            ImageComment.objects.filter(
                image=self.public_image, user=commenter, text="Muito boa!"
            ).exists()
        )

    def test_comment_creation_requires_auth(self):
        """Anonimo recebe 401 ao tentar comentar."""
        response = self.client.post(
            reverse("image-comments", kwargs={"pk": self.public_image.id}),
            {"text": "Tentativa falha"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_comment_owner_can_delete(self):
        """Autor do comentario consegue remove-lo."""
        commenter = create_user(
            email="owner-delete@example.com", username="ownerdelete"
        )
        comment = ImageComment.objects.create(
            image=self.public_image, user=commenter, text="Remover"
        )
        self.client.force_authenticate(user=commenter)
        response = self.client.delete(
            reverse(
                "image-comment-detail",
                kwargs={"pk": self.public_image.id, "comment_id": comment.id},
            )
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ImageComment.objects.filter(pk=comment.id).exists())

    def test_image_owner_can_delete_comment(self):
        """Proprietario da imagem pode remover comentario de terceiros."""
        commenter = create_user(
            email="image-owner-delete@example.com", username="imgownerdelete"
        )
        comment = ImageComment.objects.create(
            image=self.public_image, user=commenter, text="Removido pelo dono"
        )
        self.client.force_authenticate(user=self.owner)
        response = self.client.delete(
            reverse(
                "image-comment-detail",
                kwargs={"pk": self.public_image.id, "comment_id": comment.id},
            )
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_user_can_delete_comment(self):
        """Usuario staff tem permissao para remover qualquer comentario."""
        commenter = create_user(email="staff-delete@example.com", username="staffdelete")
        comment = ImageComment.objects.create(
            image=self.public_image, user=commenter, text="Removido pelo staff"
        )
        staff = create_user(
            email="moderator@example.com", username="moderator", is_staff=True
        )
        self.client.force_authenticate(user=staff)
        response = self.client.delete(
            reverse(
                "image-comment-detail",
                kwargs={"pk": self.public_image.id, "comment_id": comment.id},
            )
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_non_owner_cannot_delete_comment(self):
        """Terceiros nao podem remover comentario alheio."""
        commenter = create_user(
            email="cannot-delete@example.com", username="cannotdelete"
        )
        spectator = create_user(email="spectator@example.com", username="spectator")
        comment = ImageComment.objects.create(
            image=self.public_image, user=commenter, text="Persistente"
        )
        self.client.force_authenticate(user=spectator)
        response = self.client.delete(
            reverse(
                "image-comment-detail",
                kwargs={"pk": self.public_image.id, "comment_id": comment.id},
            )
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(ImageComment.objects.filter(pk=comment.id).exists())


class ImageDownloadViewTests(APITestCase):
    def test_public_download_increments_counter(self):
        """Download de imagem publica incrementa contador e retorna URL."""
        owner = create_user(
            email="download-owner@example.com", username="downloadowner"
        )
        image = Image.objects.create(
            user=owner,
            prompt="download prompt",
            is_public=True,
            status=Image.Status.READY,
        )
        image.image.name = f"users/{owner.id}/images/test.png"
        image.save(update_fields=["image"])

        response = self.client.post(
            reverse("image-download", kwargs={"pk": image.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        image.refresh_from_db()
        self.assertEqual(image.download_count, 1)
        self.assertIn(image.image.name, response.data["download_url"])

    def test_private_download_restricted_to_owner(self):
        """Imagem privada so pode ser baixada pelo proprietario."""
        owner = create_user(
            email="private-download@example.com", username="privatedownload"
        )
        other = create_user(email="other-download@example.com", username="otherdownload")
        image = Image.objects.create(
            user=owner,
            prompt="private download prompt",
            is_public=False,
            status=Image.Status.READY,
        )
        image.image.name = f"users/{owner.id}/images/private.png"
        image.save(update_fields=["image"])

        self.client.force_authenticate(user=other)
        forbidden_response = self.client.post(
            reverse("image-download", kwargs={"pk": image.id})
        )
        self.assertEqual(forbidden_response.status_code, status.HTTP_404_NOT_FOUND)

        self.client.force_authenticate(user=owner)
        allowed_response = self.client.post(
            reverse("image-download", kwargs={"pk": image.id})
        )
        self.assertEqual(allowed_response.status_code, status.HTTP_200_OK)

    def test_download_requires_ready_image_with_file(self):
        """Imagem precisa estar pronta e com arquivo para download."""
        owner = create_user(
            email="invalid-download@example.com", username="invaliddownload"
        )
        generating_image = Image.objects.create(
            user=owner,
            prompt="generating prompt",
            is_public=True,
            status=Image.Status.GENERATING,
        )
        response_status = self.client.post(
            reverse("image-download", kwargs={"pk": generating_image.id})
        )
        self.assertEqual(response_status.status_code, status.HTTP_400_BAD_REQUEST)

        ready_without_file = Image.objects.create(
            user=owner,
            prompt="ready no file",
            is_public=True,
            status=Image.Status.READY,
        )
        response_file = self.client.post(
            reverse("image-download", kwargs={"pk": ready_without_file.id})
        )
        self.assertEqual(response_file.status_code, status.HTTP_400_BAD_REQUEST)
