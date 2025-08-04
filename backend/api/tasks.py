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

        # Carrega o pipeline do Stable Diffusion XL com otimizações para baixa memória
        logger.info('Carregando o modelo Stable Diffusion XL com otimizações para 12GB RAM...')
        
        # Forçando uso de CPU e float32 para maior estabilidade
        device = 'cpu'
        torch_dtype = torch.float32
        
        # Carrega o pipeline com configurações otimizadas para baixa memória
        pipe = DiffusionPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0",
            torch_dtype=torch_dtype,
            use_safetensors=True,
            variant=None,  # Usando fp32 para maior estabilidade
            low_cpu_mem_usage=True
        )
        
        # Configurações avançadas para economia de memória
        pipe.enable_attention_slicing(slice_size="auto")
        pipe.enable_sequential_cpu_offload()  # Mais eficiente que enable_model_cpu_offload para CPU
        
        logger.info(f'Modelo carregado em {device.upper()} com sucesso.')

        # Gera a imagem com configurações otimizadas para qualidade
        logger.info('Gerando a imagem (isso pode levar de 5-10 minutos em CPU)...')
        
        # Configurações para melhor qualidade
        generator = torch.Generator(device='cpu')
        
        # Geração com parâmetros otimizados para qualidade
        try:
            image_data = pipe(
                prompt=prompt,
                negative_prompt="blurry, low quality, distorted, deformed, disfigured, text, watermark",
                num_inference_steps=40,       # Aumentado para melhor qualidade
                guidance_scale=8.0,           # Ajuste fino para melhor aderência ao prompt
                generator=generator,
                output_type='pil',
                width=768,                   # Largura maior para mais detalhes
                height=512,                  # Proporção 3:2 comum para paisagens
                num_images_per_prompt=1
            ).images[0]
        except Exception as e:
            logger.error(f'Erro ao gerar imagem: {str(e)}')
            # Tenta novamente com configurações mais leves
            image_data = pipe(
                prompt=prompt,
                num_inference_steps=25,
                guidance_scale=7.5,
                generator=generator,
                output_type='pil'
            ).images[0]
        
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
