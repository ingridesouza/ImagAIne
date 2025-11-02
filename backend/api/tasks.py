import logging
import uuid
from io import BytesIO

from celery import shared_task
from decouple import config
from django.core.files.base import ContentFile
from huggingface_hub import InferenceClient

from .models import Image

logger = logging.getLogger(__name__)

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
        logger.info(f"[TASK_SUCCESS] Imagem pronta para Image ID: {image_id}")

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
