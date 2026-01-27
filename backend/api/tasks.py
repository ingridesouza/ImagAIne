import logging
import os
import uuid
from io import BytesIO

from celery import shared_task
from decouple import config
from django.conf import settings
from django.core.files.base import ContentFile
from django.db import connection
from huggingface_hub import InferenceClient

from .models import Image, ImageEmbedding
from .relevance import update_image_relevance

logger = logging.getLogger(__name__)

# Check if embeddings are enabled
EMBEDDINGS_ENABLED = getattr(settings, 'EMBEDDINGS_ENABLED', True)

ASPECT_RATIO_DIMENSIONS = {
    Image.AspectRatio.SQUARE: (1024, 1024),
    Image.AspectRatio.LANDSCAPE: (1024, 576),
    Image.AspectRatio.LANDSCAPE_CLASSIC: (1024, 768),
    Image.AspectRatio.PORTRAIT: (576, 1024),
    Image.AspectRatio.GOLDEN: (960, 640),
}


@shared_task
def generate_image_task(image_id):
    image_instance = None
    try:
        image_instance = Image.objects.get(id=image_id)
        prompt = image_instance.prompt

        logger.info(
            f'[TASK_START] Gerando imagem via Hugging Face Nebius - Prompt: "{prompt}"'
        )

        client = InferenceClient(token=config("HF_TOKEN"))

        try:
            width, height = ASPECT_RATIO_DIMENSIONS.get(
                image_instance.aspect_ratio, (1024, 1024)
            )
            generation_kwargs = {
                "model": "black-forest-labs/FLUX.1-dev",
                "width": width,
                "height": height,
            }
            if image_instance.negative_prompt:
                generation_kwargs["negative_prompt"] = image_instance.negative_prompt
            if image_instance.seed is not None:
                generation_kwargs["seed"] = int(image_instance.seed)

            image_data = client.text_to_image(
                prompt,
                **generation_kwargs,
            )
        except Exception as exc:
            logger.error("HF API error: %s", repr(exc), exc_info=True)
            image_instance.status = Image.Status.FAILED
            image_instance.image = None
            image_instance.retry_count += 1
            image_instance.save(update_fields=["status", "image", "retry_count"])
            return

        logger.info("Imagem recebida com sucesso da API Nebius.")

        image_name = f"{uuid.uuid4()}.png"
        buffer = BytesIO()
        image_data.save(buffer, format="PNG")
        buffer.seek(0)

        image_instance.image.save(
            image_name,
            ContentFile(buffer.read()),
            save=False,
        )
        image_instance.status = Image.Status.READY
        image_instance.retry_count = 0
        image_instance.save(update_fields=["image", "status", "retry_count"])
        update_image_relevance(image_instance)
        logger.info(f"[TASK_SUCCESS] Imagem pronta para Image ID: {image_id}")

        # Trigger embedding generation (non-blocking, graceful degradation)
        if EMBEDDINGS_ENABLED:
            try:
                create_embeddings_task.delay(image_id)
                logger.info(f"[TASK] Embedding task queued for Image ID: {image_id}")
            except Exception as emb_exc:
                # Don't fail the main task if embedding queueing fails
                logger.warning(
                    f"[TASK] Failed to queue embedding task for Image ID {image_id}: {emb_exc}"
                )

    except Image.DoesNotExist:
        logger.error(f"[ERROR] Image com ID {image_id} nao encontrada.")

    except Exception as exc:
        logger.error(
            f"[FATAL_ERROR] Erro ao gerar imagem para Image ID: {image_id}",
            exc_info=True,
        )
        if image_instance:
            image_instance.status = Image.Status.FAILED
            image_instance.image = None
            image_instance.retry_count += 1
            image_instance.save(update_fields=["status", "image", "retry_count"])


@shared_task
def recalculate_relevance_scores(batch_size=200):
    """
    Atualiza relevância das imagens públicas em lotes para evitar cargas longas.
    Pode ser agendado via Celery Beat ou cron.
    """
    queryset = (
        Image.objects.filter(is_public=True)
        .only("id", "created_at", "download_count", "featured", "relevance_score")
        .prefetch_related(None)
    )
    updated = 0
    for image in queryset.iterator(chunk_size=batch_size):
        update_image_relevance(image, commit=True)
        updated += 1
    logger.info("[TASK] Relevance scores recalculated for %s images.", updated)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    max_retries=3,
    soft_time_limit=120,
    time_limit=180,
)
def create_embeddings_task(self, image_id):
    """
    Generate and store embeddings for an image.

    This task is designed for graceful degradation:
    - If embeddings fail, the main image generation is not affected
    - Idempotent: can be re-run safely (creates or updates)
    - Handles partial failures (text OK, image fails, etc.)

    Embeddings generated:
    - prompt_embedding: 384-dim from sentence-transformers/all-MiniLM-L6-v2
    - image_embedding: 768-dim from BLIP visual encoder
    """
    if not EMBEDDINGS_ENABLED:
        logger.info(f"[EMBEDDINGS] Skipped - embeddings disabled for Image ID: {image_id}")
        return

    try:
        image_instance = Image.objects.get(id=image_id)
    except Image.DoesNotExist:
        logger.error(f"[EMBEDDINGS] Image ID {image_id} not found")
        return

    # Only process READY images with actual files
    if image_instance.status != Image.Status.READY:
        logger.warning(
            f"[EMBEDDINGS] Skipped - Image ID {image_id} not ready (status={image_instance.status})"
        )
        return

    if not image_instance.image:
        logger.warning(f"[EMBEDDINGS] Skipped - Image ID {image_id} has no image file")
        return

    prompt = image_instance.prompt or ""
    image_path = image_instance.image.path

    if not os.path.exists(image_path):
        logger.error(f"[EMBEDDINGS] Image file not found: {image_path}")
        return

    logger.info(f"[EMBEDDINGS] Generating embeddings for Image ID: {image_id}")

    # Import here to avoid circular imports and allow lazy loading
    from .embeddings import generate_text_embedding, generate_image_embedding

    prompt_embedding = None
    image_embedding = None

    # Generate text embedding
    if prompt:
        try:
            prompt_embedding = generate_text_embedding(prompt)
            if prompt_embedding:
                logger.info(f"[EMBEDDINGS] Text embedding generated for Image ID: {image_id}")
            else:
                logger.warning(f"[EMBEDDINGS] Text embedding returned None for Image ID: {image_id}")
        except Exception as e:
            logger.error(f"[EMBEDDINGS] Text embedding failed for Image ID {image_id}: {e}")

    # Generate image embedding
    try:
        image_embedding = generate_image_embedding(image_path)
        if image_embedding:
            logger.info(f"[EMBEDDINGS] Image embedding generated for Image ID: {image_id}")
        else:
            logger.warning(f"[EMBEDDINGS] Image embedding returned None for Image ID: {image_id}")
    except Exception as e:
        logger.error(f"[EMBEDDINGS] Image embedding failed for Image ID {image_id}: {e}")

    # Skip if both embeddings failed
    if not prompt_embedding and not image_embedding:
        logger.error(f"[EMBEDDINGS] Both embeddings failed for Image ID: {image_id}")
        return

    # Save embeddings (idempotent: update_or_create)
    try:
        embedding_obj, created = ImageEmbedding.objects.update_or_create(
            image=image_instance,
            defaults={
                'prompt_text': prompt,
                'prompt_embedding_json': prompt_embedding,
                'image_embedding_json': image_embedding,
            }
        )

        # If pgvector is available, also save to vector columns
        _save_vector_embeddings(image_id, prompt_embedding, image_embedding)

        action = "created" if created else "updated"
        logger.info(f"[EMBEDDINGS] Successfully {action} embeddings for Image ID: {image_id}")

    except Exception as e:
        logger.error(f"[EMBEDDINGS] Failed to save embeddings for Image ID {image_id}: {e}")
        raise  # Let Celery retry


def _save_vector_embeddings(image_id, prompt_embedding, image_embedding):
    """
    Save embeddings to pgvector columns if available.

    Uses raw SQL because Django ORM may not support VectorField depending on setup.
    """
    if connection.vendor != 'postgresql':
        return

    # Check if vector columns exist
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'api_imageembedding'
                AND column_name IN ('prompt_embedding', 'image_embedding')
            """)
            existing_columns = {row[0] for row in cursor.fetchall()}

            if not existing_columns:
                return  # No vector columns, skip

            # Update vector columns
            if 'prompt_embedding' in existing_columns and prompt_embedding:
                cursor.execute(
                    "UPDATE api_imageembedding SET prompt_embedding = %s WHERE image_id = %s",
                    [prompt_embedding, image_id]
                )

            if 'image_embedding' in existing_columns and image_embedding:
                cursor.execute(
                    "UPDATE api_imageembedding SET image_embedding = %s WHERE image_id = %s",
                    [image_embedding, image_id]
                )

    except Exception as e:
        logger.warning(f"[EMBEDDINGS] Failed to save vector columns for Image ID {image_id}: {e}")
        # Don't raise - JSON fallback is already saved


@shared_task
def backfill_embeddings_task(batch_size=50, skip_existing=True):
    """
    Backfill embeddings for existing images that don't have them.

    Can be run manually or scheduled to process images created before
    the Creative Memory feature was enabled.

    Args:
        batch_size: Number of images to process in one run
        skip_existing: If True, skip images that already have embeddings
    """
    if not EMBEDDINGS_ENABLED:
        logger.info("[EMBEDDINGS] Backfill skipped - embeddings disabled")
        return

    queryset = Image.objects.filter(status=Image.Status.READY).exclude(image='')

    if skip_existing:
        queryset = queryset.exclude(embedding__isnull=False)

    queryset = queryset.order_by('-created_at')[:batch_size]

    processed = 0
    for image in queryset:
        try:
            create_embeddings_task.delay(image.id)
            processed += 1
        except Exception as e:
            logger.error(f"[EMBEDDINGS] Failed to queue backfill for Image ID {image.id}: {e}")

    logger.info(f"[EMBEDDINGS] Backfill queued {processed} images for embedding generation")
