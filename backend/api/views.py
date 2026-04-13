from django.conf import settings
from django.db import transaction
from django.db.models import (
    BooleanField,
    Count,
    Exists,
    F,
    OuterRef,
    Value,
)
from django.db.models.functions import Coalesce
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone

from authentication.models import User
from rest_framework import filters, generics, serializers as drf_serializers, status
from rest_framework.exceptions import PermissionDenied, Throttled
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, inline_serializer

from .models import Image, ImageComment, ImageLike, CommentLike
from .relevance import update_image_relevance
from .serializers import (
    GenerateImageSerializer,
    ImageCommentCreateSerializer,
    ImageCommentSerializer,
    ImageSerializer,
    ImageShareUpdateSerializer,
    RelatedImageSerializer,
    RefinePromptRequestSerializer,
    RefinePromptResponseSerializer,
    StyleSuggestionSerializer,
)
from .throttles import PlanQuotaThrottle
from .tasks import generate_image_task
from .similarity import find_related_images, get_user_style_suggestions


class GenerateImageView(APIView):
    """Inicia a geração assíncrona de uma imagem via IA."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [PlanQuotaThrottle]

    def throttled(self, request, wait=None):
        message = "Monthly quota reached. Faça upgrade para o plano Pro."
        raise Throttled(detail=message, wait=wait)

    @extend_schema(
        tags=['Generation'],
        summary='Gerar imagem',
        description=(
            'Envia um prompt para geração assíncrona de imagem via FLUX.1-dev. '
            'A imagem é criada com status GENERATING e transiciona para READY ou FAILED. '
            'Respeita a quota mensal do plano do usuário.'
        ),
        request=GenerateImageSerializer,
        responses={
            202: ImageSerializer,
            400: inline_serializer('GenerateError', fields={
                'prompt': drf_serializers.ListField(child=drf_serializers.CharField(), required=False),
            }),
            429: inline_serializer('QuotaExceeded', fields={
                'detail': drf_serializers.CharField(),
            }),
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = GenerateImageSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            prompt = serializer.validated_data["prompt"]
            negative_prompt = serializer.validated_data.get("negative_prompt")
            aspect_ratio = serializer.validated_data.get(
                "aspect_ratio", Image.AspectRatio.SQUARE
            )
            seed = serializer.validated_data.get("seed")

            quotas = getattr(settings, "PLAN_QUOTAS", {})
            quota = quotas.get(getattr(user, "plan", "free"))

            today = timezone.now().date()
            period_start = today.replace(day=1)
            if user.last_reset_date != period_start:
                user.image_generation_count = 0
                user.last_reset_date = period_start

            if quota is not None and user.image_generation_count >= quota:
                return Response(
                    {"detail": "Monthly quota reached. Faça upgrade para o plano Pro."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

            # Atomically increment the counter to prevent race conditions
            # Uses SELECT FOR UPDATE to lock the row during the transaction
            with transaction.atomic():
                # Lock the user row and verify quota again
                locked_user = User.objects.select_for_update().get(pk=user.pk)

                # Handle monthly reset if needed
                today = timezone.now().date()
                period_start = today.replace(day=1)
                if locked_user.last_reset_date != period_start:
                    locked_user.image_generation_count = 0
                    locked_user.last_reset_date = period_start

                # Re-check quota with locked row to prevent race condition
                if quota is not None and locked_user.image_generation_count >= quota:
                    return Response(
                        {"detail": "Monthly quota reached. Faça upgrade para o plano Pro."},
                        status=status.HTTP_429_TOO_MANY_REQUESTS,
                    )

                # Increment counter (safe because we hold the row lock)
                locked_user.image_generation_count += 1
                locked_user.save(update_fields=["image_generation_count", "last_reset_date"])

            # Refresh user object to reflect the changes made to locked_user
            user.refresh_from_db(fields=["image_generation_count", "last_reset_date"])

            # Create image placeholder after quota is secured
            image = Image.objects.create(
                user=user,
                prompt=prompt,
                negative_prompt=negative_prompt,
                aspect_ratio=aspect_ratio,
                seed=seed,
            )
            update_image_relevance(image)

            generate_image_task.delay(image.id)

            return Response(
                ImageSerializer(image, context={"request": request}).data,
                status=status.HTTP_202_ACCEPTED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    list=extend_schema(
        tags=['Gallery'],
        summary='Galeria pública',
        description=(
            'Lista paginada de imagens públicas, ordenadas por destaque, '
            'relevância e data de criação. Suporta busca por prompt via ?search=.'
        ),
        parameters=[
            OpenApiParameter('search', str, description='Busca no texto do prompt'),
        ],
    ),
)
class PublicImageListView(generics.ListAPIView):
    serializer_class = ImageSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["prompt"]

    def get_queryset(self):
        base_queryset = Image.objects.filter(is_public=True).select_related(
            "user"
        ).prefetch_related("tags")
        annotated_queryset = base_queryset.annotate(
            like_count=Count("likes", distinct=True),
            comment_count=Count("comments", distinct=True),
            effective_score=Coalesce(F("relevance_score"), Value(0.0)),
        )

        request = self.request
        if request.user.is_authenticated:
            annotated_queryset = annotated_queryset.annotate(
                is_liked=Exists(
                    ImageLike.objects.filter(
                        image=OuterRef("pk"), user=request.user
                    )
                )
            )
        else:
            annotated_queryset = annotated_queryset.annotate(
                is_liked=Value(False, output_field=BooleanField())
            )
        return annotated_queryset.order_by(
            "-featured",
            "-effective_score",
            "-created_at",
        )


@extend_schema_view(
    list=extend_schema(
        tags=['Gallery'],
        summary='Minhas imagens',
        description='Lista paginada de todas as imagens do usuário autenticado.',
    ),
)
class UserImageListView(generics.ListAPIView):
    serializer_class = ImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Image.objects.filter(user=self.request.user)
            .select_related("user")
            .prefetch_related("tags")
            .annotate(
                like_count=Count("likes", distinct=True),
                comment_count=Count("comments", distinct=True),
                effective_score=Coalesce(F("relevance_score"), Value(0.0)),
            )
            .order_by("-featured", "-effective_score", "-created_at")
        )
        return queryset.annotate(
            is_liked=Exists(
                ImageLike.objects.filter(
                    image=OuterRef("pk"), user=self.request.user
                )
            )
        )


@extend_schema_view(
    list=extend_schema(
        tags=['Gallery'],
        summary='Imagens curtidas',
        description='Lista paginada de imagens curtidas pelo usuário autenticado.',
    ),
)
class UserLikedImagesView(generics.ListAPIView):
    serializer_class = ImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        liked_image_ids = ImageLike.objects.filter(
            user=self.request.user
        ).values_list("image_id", flat=True)

        return (
            Image.objects.filter(id__in=liked_image_ids, status="READY")
            .select_related("user")
            .prefetch_related("tags")
            .annotate(
                like_count=Count("likes", distinct=True),
                comment_count=Count("comments", distinct=True),
                effective_score=Coalesce(F("relevance_score"), Value(0.0)),
                is_liked=Value(True, output_field=BooleanField()),
            )
            .order_by("-likes__created_at")
        )


class ShareImageView(APIView):
    """Publica ou despublica uma imagem do usuário."""
    permission_classes = [IsAuthenticated]

    def _get_user_image(self, pk, user):
        return Image.objects.filter(pk=pk, user=user).first()

    @extend_schema(
        tags=['Social'],
        summary='Publicar imagem',
        description='Torna a imagem pública na galeria.',
        request=None,
        responses={200: ImageSerializer, 404: inline_serializer('NotFound', fields={'error': drf_serializers.CharField()})},
    )
    def post(self, request, pk, *args, **kwargs):
        image = self._get_user_image(pk, request.user)
        if image is None:
            return Response(
                {"error": "Image not found."}, status=status.HTTP_404_NOT_FOUND
            )

        image.is_public = True
        image.save(update_fields=["is_public"])
        update_image_relevance(image)
        return Response(
            ImageSerializer(image, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        tags=['Social'],
        summary='Alterar visibilidade',
        description='Altera o status público/privado da imagem.',
        request=ImageShareUpdateSerializer,
        responses={200: ImageSerializer, 400: None, 404: None},
    )
    def patch(self, request, pk, *args, **kwargs):
        serializer = ImageShareUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        image = self._get_user_image(pk, request.user)
        if image is None:
            return Response(
                {"error": "Image not found."}, status=status.HTTP_404_NOT_FOUND
            )

        image.is_public = serializer.validated_data["is_public"]
        image.save(update_fields=["is_public"])
        update_image_relevance(image)
        return Response(
            ImageSerializer(image, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class ImageLikeView(APIView):
    """Curtir ou descurtir uma imagem."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "social_like"

    def _get_image(self, pk):
        image = get_object_or_404(Image, pk=pk)
        if image.is_public or image.user == self.request.user:
            return image
        raise PermissionDenied("This image is not available for interaction.")

    @extend_schema(
        tags=['Social'],
        summary='Curtir imagem',
        description='Adiciona um like à imagem. Idempotente: se já curtiu, retorna 200.',
        request=None,
        responses={201: ImageSerializer, 200: ImageSerializer},
    )
    def post(self, request, pk, *args, **kwargs):
        image = self._get_image(pk)
        like, created = ImageLike.objects.get_or_create(
            image=image, user=request.user
        )
        update_image_relevance(image)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        # Refresh to get updated like_count and annotate is_liked
        image = (
            Image.objects.filter(pk=pk)
            .select_related("user")
            .prefetch_related("tags")
            .annotate(
                like_count=Count("likes", distinct=True),
                comment_count=Count("comments", distinct=True),
                is_liked=Exists(
                    ImageLike.objects.filter(image=OuterRef("pk"), user=request.user)
                ),
            )
            .first()
        )
        serializer = ImageSerializer(
            image, context={"request": request}
        )
        return Response(serializer.data, status=status_code)

    @extend_schema(
        tags=['Social'],
        summary='Descurtir imagem',
        description='Remove o like da imagem.',
        request=None,
        responses={204: None, 404: inline_serializer('LikeNotFound', fields={'detail': drf_serializers.CharField()})},
    )
    def delete(self, request, pk, *args, **kwargs):
        image = self._get_image(pk)
        deleted, _ = ImageLike.objects.filter(
            image=image, user=request.user
        ).delete()
        if deleted:
            update_image_relevance(image)
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {"detail": "Like not found."}, status=status.HTTP_404_NOT_FOUND
        )


@extend_schema_view(
    list=extend_schema(
        tags=['Social'],
        summary='Listar comentários',
        description='Lista comentários paginados de uma imagem (top-level com replies aninhadas).',
    ),
    create=extend_schema(
        tags=['Social'],
        summary='Criar comentário',
        description='Adiciona um comentário à imagem. Suporta replies via parent_id.',
        request=ImageCommentCreateSerializer,
        responses={201: ImageCommentSerializer},
    ),
)
class ImageCommentListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ImageCommentSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "social_comment"

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ImageCommentCreateSerializer
        return ImageCommentSerializer

    def get_throttles(self):
        if self.request.method != "POST":
            return []
        return [throttle() for throttle in self.throttle_classes]

    def _get_image(self):
        image = get_object_or_404(Image, pk=self.kwargs["pk"])
        user = self.request.user
        if image.is_public:
            return image
        if user.is_authenticated and image.user == user:
            return image
        raise Http404

    def get_queryset(self):
        image = self._get_image()
        queryset = (
            ImageComment.objects.filter(image=image, parent__isnull=True)
            .select_related("user")
            .prefetch_related("replies", "replies__user")
            .annotate(
                like_count=Count("likes", distinct=True),
                reply_count=Count("replies", distinct=True),
            )
            .order_by("created_at")
        )

        # Annotate is_liked for authenticated users
        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.annotate(
                is_liked=Exists(
                    CommentLike.objects.filter(
                        comment=OuterRef("pk"), user=user
                    )
                )
            )
        else:
            queryset = queryset.annotate(
                is_liked=Value(False, output_field=BooleanField())
            )

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        image = self._get_image()

        # Handle parent_id for replies
        parent_id = serializer.validated_data.pop("parent_id", None)
        parent = None
        if parent_id:
            parent = get_object_or_404(ImageComment, pk=parent_id, image=image)
            if parent.parent is not None:
                return Response(
                    {"detail": "Cannot reply to a reply."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        comment = ImageComment.objects.create(
            user=request.user,
            image=image,
            parent=parent,
            text=serializer.validated_data["text"],
        )
        update_image_relevance(image)
        output_serializer = ImageCommentSerializer(
            comment, context={"request": request}
        )
        headers = self.get_success_headers(output_serializer.data)
        return Response(
            output_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


@extend_schema_view(
    destroy=extend_schema(
        tags=['Social'],
        summary='Deletar comentário',
        description='Remove um comentário. Permitido para o autor, dono da imagem ou staff.',
    ),
)
class ImageCommentDetailView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ImageCommentSerializer
    lookup_url_kwarg = "comment_id"
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "social_comment"

    def get_queryset(self):
        return ImageComment.objects.select_related("user", "image")

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(
            queryset,
            pk=self.kwargs["comment_id"],
            image__pk=self.kwargs["pk"],
        )
        user = self.request.user
        if (
            obj.user == user
            or obj.image.user == user
            or user.is_staff
        ):
            return obj
        raise PermissionDenied("You cannot delete this comment.")

    def perform_destroy(self, instance):
        image = instance.image
        super().perform_destroy(instance)
        update_image_relevance(image)


class CommentLikeView(APIView):
    """Like/unlike a comment."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "social_like"

    def _get_comment(self, comment_id, image_pk):
        comment = get_object_or_404(
            ImageComment.objects.select_related("image"),
            pk=comment_id,
            image__pk=image_pk,
        )
        image = comment.image
        if image.is_public or image.user == self.request.user:
            return comment
        raise PermissionDenied("This comment is not available for interaction.")

    @extend_schema(
        tags=['Social'],
        summary='Curtir comentário',
        description='Adiciona um like ao comentário.',
        request=None,
        responses={201: inline_serializer('CommentLikeResponse', fields={
            'comment_id': drf_serializers.IntegerField(),
            'is_liked': drf_serializers.BooleanField(),
            'like_count': drf_serializers.IntegerField(),
        })},
    )
    def post(self, request, pk, comment_id, *args, **kwargs):
        comment = self._get_comment(comment_id, pk)
        like, created = CommentLike.objects.get_or_create(
            comment=comment, user=request.user
        )
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(
            {
                "comment_id": comment.id,
                "is_liked": True,
                "like_count": comment.likes.count(),
            },
            status=status_code,
        )

    @extend_schema(
        tags=['Social'],
        summary='Descurtir comentário',
        description='Remove o like do comentário.',
        request=None,
        responses={200: inline_serializer('CommentUnlikeResponse', fields={
            'comment_id': drf_serializers.IntegerField(),
            'is_liked': drf_serializers.BooleanField(),
            'like_count': drf_serializers.IntegerField(),
        }), 404: None},
    )
    def delete(self, request, pk, comment_id, *args, **kwargs):
        comment = self._get_comment(comment_id, pk)
        deleted, _ = CommentLike.objects.filter(
            comment=comment, user=request.user
        ).delete()
        if deleted:
            return Response(
                {
                    "comment_id": comment.id,
                    "is_liked": False,
                    "like_count": comment.likes.count(),
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {"detail": "Like not found."}, status=status.HTTP_404_NOT_FOUND
        )


class ImageDownloadView(APIView):
    """Registra um download e retorna a URL da imagem."""
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "social_download"

    @extend_schema(
        tags=['Social'],
        summary='Download de imagem',
        description='Incrementa o contador de downloads e retorna a URL para download.',
        request=None,
        responses={200: inline_serializer('DownloadResponse', fields={
            'download_url': drf_serializers.URLField(),
            'download_count': drf_serializers.IntegerField(),
        }), 400: None},
    )
    def post(self, request, pk, *args, **kwargs):
        image = get_object_or_404(Image.objects.select_related("user"), pk=pk)
        user = request.user
        if not image.is_public:
            if not (user.is_authenticated and user == image.user):
                raise Http404

        if image.status != Image.Status.READY or not image.image:
            return Response(
                {"detail": "Image is not available for download."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        Image.objects.filter(pk=image.pk).update(
            download_count=F("download_count") + 1
        )
        image.refresh_from_db(fields=["download_count"])
        update_image_relevance(image)

        url = image.image.url
        if request:
            url = request.build_absolute_uri(url)

        return Response(
            {
                "download_url": url,
                "download_count": image.download_count,
            },
            status=status.HTTP_200_OK,
        )


# =============================================================================
# Creative Memory - Related Images and Style Suggestions
# =============================================================================

class RelatedImagesView(APIView):
    """Retorna imagens similares baseadas em embeddings."""
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Creative Memory'],
        summary='Imagens relacionadas',
        description=(
            'Retorna até 12 imagens similares baseadas em embeddings vetoriais. '
            'Usa image embedding (visual) com fallback para prompt embedding (texto). '
            'A imagem-fonte deve ser pública ou pertencer ao usuário.'
        ),
        parameters=[
            OpenApiParameter('limit', int, description='Máximo de resultados (default 12, max 20)'),
        ],
        responses={200: inline_serializer('RelatedImagesResponse', fields={
            'count': drf_serializers.IntegerField(),
            'results': RelatedImageSerializer(many=True),
        })},
    )
    def get(self, request, pk, *args, **kwargs):
        # Get the source image
        image = get_object_or_404(Image, pk=pk)

        # Check permission to view this image
        user = request.user
        if not image.is_public:
            if not (user.is_authenticated and image.user == user):
                raise Http404

        # Get user_id for permission filtering in similarity search
        user_id = str(user.id) if user.is_authenticated else None

        # Limit from query params (max 20, default 12)
        try:
            limit = min(int(request.query_params.get('limit', 12)), 20)
        except (ValueError, TypeError):
            limit = 12

        # Find related images
        related = find_related_images(
            image_id=pk,
            user_id=user_id,
            limit=limit,
        )

        if not related:
            return Response({
                'count': 0,
                'results': [],
            })

        # Fetch the actual Image objects
        image_ids = [r['image_id'] for r in related]
        similarity_map = {r['image_id']: r['similarity_score'] for r in related}

        images = (
            Image.objects.filter(id__in=image_ids)
            .select_related('user')
            .prefetch_related('tags')
            .annotate(
                like_count=Count('likes', distinct=True),
                comment_count=Count('comments', distinct=True),
            )
        )

        # Annotate is_liked for authenticated users
        if user.is_authenticated:
            images = images.annotate(
                is_liked=Exists(
                    ImageLike.objects.filter(
                        image=OuterRef('pk'), user=user
                    )
                )
            )

        # Build response maintaining similarity order
        images_by_id = {img.id: img for img in images}
        results = []
        for r in related:
            img = images_by_id.get(r['image_id'])
            if img:
                results.append({
                    'image': ImageSerializer(img, context={'request': request}).data,
                    'similarity_score': r['similarity_score'],
                })

        return Response({
            'count': len(results),
            'results': results,
        })


class StyleSuggestionsView(APIView):
    """Sugestões de estilo baseadas no histórico de prompts do usuário."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Creative Memory'],
        summary='Sugestões de estilo',
        description=(
            'Analisa o histórico de prompts do usuário para identificar padrões '
            'recorrentes de estilo, modificadores e temas. Retorna até 5 sugestões.'
        ),
        parameters=[
            OpenApiParameter('limit', int, description='Máximo de sugestões (default 5, max 10)'),
        ],
        responses={200: inline_serializer('StyleSuggestionsResponse', fields={
            'count': drf_serializers.IntegerField(),
            'results': StyleSuggestionSerializer(many=True),
        })},
    )
    def get(self, request, *args, **kwargs):
        user_id = str(request.user.id)

        # Limit from query params (max 10, default 5)
        try:
            limit = min(int(request.query_params.get('limit', 5)), 10)
        except (ValueError, TypeError):
            limit = 5

        suggestions = get_user_style_suggestions(
            user_id=user_id,
            limit=limit,
        )

        return Response({
            'count': len(suggestions),
            'results': StyleSuggestionSerializer(suggestions, many=True).data,
        })


# =============================================================================
# Prompt Assistant - DeepSeek LLM Integration
# =============================================================================

class RefinePromptView(APIView):
    """Refina um prompt casual em prompt otimizado para geração de imagem via LLM."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "llm_refine"

    @extend_schema(
        tags=['Prompt Assistant'],
        summary='Refinar prompt',
        description=(
            'Transforma uma descrição casual em um prompt otimizado para geração de imagem. '
            'Usa o DeepSeek LLM para gerar prompt em inglês com modificadores técnicos.'
        ),
        request=RefinePromptRequestSerializer,
        responses={
            200: RefinePromptResponseSerializer,
            400: None,
            503: inline_serializer('ServiceUnavailable', fields={'detail': drf_serializers.CharField()}),
        },
    )
    def post(self, request, *args, **kwargs):
        import requests
        import logging

        logger = logging.getLogger(__name__)

        serializer = RefinePromptRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        description = serializer.validated_data['description']
        style = serializer.validated_data.get('style', 'photorealistic')

        # Get API configuration from settings
        api_key = getattr(settings, 'DEEPSEEK_API_KEY', '')
        base_url = getattr(settings, 'DEEPSEEK_BASE_URL', 'https://api.deepseek.com')
        model = getattr(settings, 'DEEPSEEK_MODEL', 'deepseek-chat')

        if not api_key:
            logger.error("DEEPSEEK_API_KEY not configured")
            return Response(
                {"detail": "Prompt assistant is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Build system prompt for the LLM
        style_descriptions = {
            'photorealistic': 'fotorrealista, como uma fotografia profissional',
            'anime': 'estilo anime/mangá japonês',
            'digital_art': 'arte digital moderna e detalhada',
            'oil_painting': 'pintura a óleo clássica',
            'watercolor': 'aquarela suave e artística',
            '3d_render': 'renderização 3D de alta qualidade',
            'pixel_art': 'pixel art estilo retro/jogos',
            'sketch': 'esboço ou desenho a lápis',
        }
        style_desc = style_descriptions.get(style, style_descriptions['photorealistic'])

        system_prompt = f"""Você é um especialista em criar prompts otimizados para geração de imagens com IA (como Stable Diffusion, DALL-E, Midjourney).

Sua tarefa é transformar a descrição casual do usuário em um prompt estruturado e detalhado em INGLÊS.

Estilo solicitado: {style_desc}

Regras:
1. O prompt DEVE estar em inglês
2. Inclua detalhes sobre: composição, iluminação, atmosfera, cores, texturas
3. Use termos técnicos de fotografia/arte quando apropriado
4. Adicione modificadores de qualidade (highly detailed, 8k, professional, etc.)
5. Mantenha o prompt com 50-150 palavras
6. Retorne APENAS o prompt, sem explicações

Também sugira um negative_prompt curto com elementos a evitar (blur, low quality, watermark, etc.)

Formato de resposta (JSON):
{{"refined_prompt": "seu prompt aqui", "negative_prompt": "elementos a evitar"}}"""

        try:
            response = requests.post(
                f"{base_url}/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": description},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 500,
                },
                timeout=30,
            )
            response.raise_for_status()

        except requests.exceptions.Timeout:
            logger.error("DeepSeek API timeout")
            return Response(
                {"detail": "Request timeout. Please try again."},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except requests.exceptions.RequestException as e:
            logger.error(f"DeepSeek API error: {e}")
            return Response(
                {"detail": "Failed to connect to prompt assistant."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        try:
            result = response.json()
            content = result['choices'][0]['message']['content']

            # Parse JSON response from LLM
            import json
            # Try to extract JSON from the response
            if '{' in content and '}' in content:
                json_start = content.index('{')
                json_end = content.rindex('}') + 1
                json_str = content[json_start:json_end]
                parsed = json.loads(json_str)
                refined_prompt = parsed.get('refined_prompt', content)
                negative_prompt = parsed.get('negative_prompt', 'blur, low quality, watermark, text, logo')
            else:
                refined_prompt = content.strip()
                negative_prompt = 'blur, low quality, watermark, text, logo, distorted, ugly'

        except (KeyError, IndexError, json.JSONDecodeError) as e:
            logger.error(f"Failed to parse DeepSeek response: {e}")
            return Response(
                {"detail": "Failed to process response from assistant."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        response_data = {
            'refined_prompt': refined_prompt,
            'negative_prompt': negative_prompt,
        }

        return Response(response_data, status=status.HTTP_200_OK)
