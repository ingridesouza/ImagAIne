import os
import logging
import uuid

from celery import shared_task
from django.conf import settings
from diffusers import DiffusionPipeline
import torch

from .models import Image

# Configura o logger para este módulo
logger = logging.getLogger(__name__)

@shared_task
def generate_image_task(image_id):
    """
    Tarefa Celery para gerar uma imagem a partir de um prompt de texto.
    """
    image_instance = None
    try:
        image_instance = Image.objects.get(id=image_id)
        prompt = image_instance.prompt

        logger.info(f'[TASK_START] Iniciando geração para Image ID: {image_id}, Prompt: "{prompt}"')

        # Carrega o pipeline de difusão. 
        # low_cpu_mem_usage=True é recomendado para evitar picos de memória.
        logger.info('Carregando o modelo de difusão...')
        pipe = DiffusionPipeline.from_pretrained(
            "CompVis/ldm-text2im-large-256", 
            low_cpu_mem_usage=True
        )
        logger.info('Modelo carregado. Aplicando otimizações de memória...')

        # Otimização para baixo consumo de memória (CPU only)
        pipe.enable_attention_slicing()
        logger.info('Otimização de memória (attention slicing) aplicada.')

        # Gera a imagem
        logger.info('Gerando a imagem a partir do prompt...')
        image_data = pipe(prompt).images[0]
        logger.info('Imagem gerada com sucesso.')

        # Prepara o caminho para salvar o arquivo
        image_name = f"{uuid.uuid4()}.png"
        # Garante que o diretório de mídia exista
        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
        image_path = os.path.join(settings.MEDIA_ROOT, image_name)
        
        # Salva a imagem no sistema de arquivos
        logger.info(f'Salvando a imagem em: {image_path}')
        image_data.save(image_path)
        logger.info('Imagem salva com sucesso.')

        # Atualiza o registro no banco de dados com o caminho relativo
        image_instance.image_url = f'/media/{image_name}'  # Caminho relativo para servir via web
        image_instance.save()
        logger.info(f'[TASK_SUCCESS] Geração concluída para Image ID: {image_id}')

    except Image.DoesNotExist:
        logger.error(f'[ERROR] Image com ID {image_id} não encontrada no banco de dados.')

    except Exception as e:
        # Loga a exceção completa, incluindo o traceback
        logger.error(f'[FATAL_ERROR] Falha na geração para Image ID: {image_id}', exc_info=True)
        if image_instance:
            # Marca a imagem como falha para feedback do usuário
            image_instance.image_url = 'FAILED'
            image_instance.save()
            logger.info(f'Image ID: {image_id} marcada como FAILED no banco de dados.')
