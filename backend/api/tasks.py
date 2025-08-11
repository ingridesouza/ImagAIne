import os
import logging
import uuid

from celery import shared_task
from django.conf import settings
from huggingface_hub import InferenceClient, hf_hub_download
from decouple import config
from .models import Image

logger = logging.getLogger(__name__)

@shared_task
def generate_image_task(image_id):
    image_instance = None
    try:
        image_instance = Image.objects.get(id=image_id)
        prompt = image_instance.prompt

        logger.info(f'[TASK_START] Gerando imagem via Hugging Face Nebius - Prompt: "{prompt}"')

        # Inicializa o client com token
        client = InferenceClient(token=config('HF_TOKEN'))

        # Gera a imagem remotamente
        try:
            image_data = client.text_to_image(prompt, model="black-forest-labs/FLUX.1-dev")
        except Exception as e:
            logger.error('HF API error: %s', repr(e), exc_info=True)
            image_instance.image_url = 'FAILED'
            image_instance.save()
            return

        logger.info('Imagem recebida com sucesso da API Nebius.')

        # Salva localmente
        image_name = f"{uuid.uuid4()}.png"
        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
        image_path = os.path.join(settings.MEDIA_ROOT, image_name)
        image_data.save(image_path)

        logger.info(f'Imagem salva localmente em: {image_path}')

        # Atualiza a URL no banco
        image_instance.image_url = f'/media/{image_name}'
        image_instance.save()
        logger.info(f'[TASK_SUCCESS] Imagem pronta para Image ID: {image_id}')

    except Image.DoesNotExist:
        logger.error(f'[ERROR] Image com ID {image_id} não encontrada.')

    except Exception as e:
        logger.error(f'[FATAL_ERROR] Erro ao gerar imagem para Image ID: {image_id}', exc_info=True)
        if image_instance:
            image_instance.image_url = 'FAILED'
            image_instance.save()
