"""
Embedding Service for Creative Memory feature.

This module provides text and image embedding generation using:
- Text: sentence-transformers/all-MiniLM-L6-v2 (384 dimensions)
- Image: Salesforce/blip-image-captioning-base visual encoder (768 dimensions)

Models are loaded lazily and cached for reuse.
All embeddings are L2-normalized for cosine similarity.

Environment variables:
- EMBEDDINGS_ENABLED: Set to 'false' to disable embedding generation
- EMBEDDINGS_DEVICE: 'cuda', 'cpu', or 'auto' (default: 'auto')
- EMBEDDINGS_CACHE_DIR: Custom cache directory for models
"""
import logging
import os
from functools import lru_cache
from typing import List, Optional, Tuple, Union

import numpy as np
from decouple import config
from PIL import Image as PILImage

logger = logging.getLogger(__name__)

# Configuration
EMBEDDINGS_ENABLED = config('EMBEDDINGS_ENABLED', default=True, cast=bool)
EMBEDDINGS_DEVICE = config('EMBEDDINGS_DEVICE', default='auto')
EMBEDDINGS_CACHE_DIR = config('EMBEDDINGS_CACHE_DIR', default=None)

# Model identifiers
TEXT_MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"
IMAGE_MODEL_ID = "Salesforce/blip-image-captioning-base"

# Embedding dimensions
TEXT_EMBEDDING_DIM = 384
IMAGE_EMBEDDING_DIM = 768

# Global model cache
_text_model = None
_image_model = None
_image_processor = None
_device = None


def get_device() -> str:
    """Determine the best available device for inference."""
    global _device
    if _device is not None:
        return _device

    if EMBEDDINGS_DEVICE != 'auto':
        _device = EMBEDDINGS_DEVICE
        return _device

    try:
        import torch
        if torch.cuda.is_available():
            _device = 'cuda'
        elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            _device = 'mps'
        else:
            _device = 'cpu'
    except ImportError:
        _device = 'cpu'

    logger.info(f"[Embeddings] Using device: {_device}")
    return _device


def get_text_model():
    """
    Load and cache the text embedding model.

    Uses sentence-transformers for efficient text embeddings.
    """
    global _text_model
    if _text_model is not None:
        return _text_model

    if not EMBEDDINGS_ENABLED:
        logger.warning("[Embeddings] Text embeddings disabled via EMBEDDINGS_ENABLED=false")
        return None

    try:
        from sentence_transformers import SentenceTransformer

        logger.info(f"[Embeddings] Loading text model: {TEXT_MODEL_ID}")
        _text_model = SentenceTransformer(
            TEXT_MODEL_ID,
            device=get_device(),
            cache_folder=EMBEDDINGS_CACHE_DIR,
        )
        logger.info("[Embeddings] Text model loaded successfully")
        return _text_model

    except Exception as e:
        logger.error(f"[Embeddings] Failed to load text model: {e}")
        return None


def get_image_model():
    """
    Load and cache the BLIP image model and processor.

    Uses BLIP (Bootstrapped Language-Image Pre-training) visual encoder.
    Returns tuple of (model, processor) or (None, None) on failure.

    Note: We use the vision encoder part of BLIP to extract image features.
    TODO: Consider swapping to ALBEF when stable HF implementation available.
    """
    global _image_model, _image_processor
    if _image_model is not None:
        return _image_model, _image_processor

    if not EMBEDDINGS_ENABLED:
        logger.warning("[Embeddings] Image embeddings disabled via EMBEDDINGS_ENABLED=false")
        return None, None

    try:
        import torch
        from transformers import BlipModel, BlipProcessor

        logger.info(f"[Embeddings] Loading image model: {IMAGE_MODEL_ID}")

        device = get_device()

        # Load processor for image preprocessing
        _image_processor = BlipProcessor.from_pretrained(
            IMAGE_MODEL_ID,
            cache_dir=EMBEDDINGS_CACHE_DIR,
        )

        # Load the full BLIP model and use the vision encoder
        _image_model = BlipModel.from_pretrained(
            IMAGE_MODEL_ID,
            cache_dir=EMBEDDINGS_CACHE_DIR,
            torch_dtype=torch.float16 if device == 'cuda' else torch.float32,
        )
        _image_model = _image_model.to(device)
        _image_model.eval()

        logger.info("[Embeddings] Image model loaded successfully")
        return _image_model, _image_processor

    except Exception as e:
        logger.error(f"[Embeddings] Failed to load image model: {e}")
        return None, None


def normalize_embedding(embedding: np.ndarray) -> np.ndarray:
    """L2 normalize an embedding vector for cosine similarity via dot product."""
    norm = np.linalg.norm(embedding)
    if norm > 0:
        return embedding / norm
    return embedding


def generate_text_embedding(text: str) -> Optional[List[float]]:
    """
    Generate an L2-normalized embedding for text.

    Args:
        text: The text to embed (prompt, etc.)

    Returns:
        List of floats (384 dimensions) or None on failure
    """
    if not EMBEDDINGS_ENABLED:
        return None

    if not text or not text.strip():
        logger.warning("[Embeddings] Empty text provided for embedding")
        return None

    try:
        model = get_text_model()
        if model is None:
            return None

        # Generate embedding
        embedding = model.encode(
            text,
            convert_to_numpy=True,
            normalize_embeddings=True,  # L2 normalization
        )

        # Ensure it's a 1D array and convert to list
        if len(embedding.shape) > 1:
            embedding = embedding.flatten()

        return embedding.tolist()

    except Exception as e:
        logger.error(f"[Embeddings] Failed to generate text embedding: {e}")
        return None


def generate_image_embedding(
    image_source: Union[str, PILImage.Image]
) -> Optional[List[float]]:
    """
    Generate an L2-normalized embedding for an image using BLIP visual encoder.

    Args:
        image_source: Either a file path (str) or PIL Image

    Returns:
        List of floats (768 dimensions) or None on failure
    """
    if not EMBEDDINGS_ENABLED:
        return None

    try:
        import torch

        model, processor = get_image_model()
        if model is None or processor is None:
            return None

        # Load image if path provided
        if isinstance(image_source, str):
            if not os.path.exists(image_source):
                logger.error(f"[Embeddings] Image file not found: {image_source}")
                return None
            image = PILImage.open(image_source).convert('RGB')
        else:
            image = image_source.convert('RGB')

        device = get_device()

        # Process image
        inputs = processor(images=image, return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}

        # Generate embedding using vision encoder
        with torch.no_grad():
            # Get vision features from BLIP
            vision_outputs = model.vision_model(
                pixel_values=inputs['pixel_values'],
                return_dict=True,
            )
            # Use the [CLS] token embedding (pooler output)
            # Shape: (1, hidden_size) -> (hidden_size,)
            embedding = vision_outputs.pooler_output.squeeze(0)

            # Move to CPU and convert to numpy
            embedding = embedding.cpu().float().numpy()

        # L2 normalize
        embedding = normalize_embedding(embedding)

        return embedding.tolist()

    except Exception as e:
        logger.error(f"[Embeddings] Failed to generate image embedding: {e}")
        return None


def generate_embeddings_for_image(
    prompt: str,
    image_path: str,
) -> Tuple[Optional[List[float]], Optional[List[float]]]:
    """
    Generate both text and image embeddings for a generated image.

    Args:
        prompt: The prompt used to generate the image
        image_path: Path to the generated image file

    Returns:
        Tuple of (prompt_embedding, image_embedding), either can be None on failure
    """
    prompt_embedding = generate_text_embedding(prompt)
    image_embedding = generate_image_embedding(image_path)

    return prompt_embedding, image_embedding


def compute_cosine_similarity(
    embedding1: List[float],
    embedding2: List[float]
) -> float:
    """
    Compute cosine similarity between two L2-normalized embeddings.

    Since embeddings are L2-normalized, this is just the dot product.

    Args:
        embedding1: First embedding vector
        embedding2: Second embedding vector

    Returns:
        Similarity score between -1 and 1 (higher is more similar)
    """
    a = np.array(embedding1)
    b = np.array(embedding2)
    return float(np.dot(a, b))


def batch_compute_similarities(
    query_embedding: List[float],
    embeddings: List[List[float]],
) -> List[float]:
    """
    Compute cosine similarities between a query and multiple embeddings.

    Args:
        query_embedding: The query embedding vector
        embeddings: List of embedding vectors to compare against

    Returns:
        List of similarity scores
    """
    if not embeddings:
        return []

    query = np.array(query_embedding)
    matrix = np.array(embeddings)

    # Dot product for L2-normalized vectors = cosine similarity
    similarities = np.dot(matrix, query)
    return similarities.tolist()


# Preload check - call at startup to verify models can load
def check_models_available() -> dict:
    """
    Check if embedding models are available and can be loaded.

    Returns:
        Dict with status of each model component
    """
    status = {
        'enabled': EMBEDDINGS_ENABLED,
        'device': None,
        'text_model': False,
        'image_model': False,
        'errors': [],
    }

    if not EMBEDDINGS_ENABLED:
        return status

    try:
        status['device'] = get_device()
    except Exception as e:
        status['errors'].append(f"Device detection failed: {e}")

    try:
        if get_text_model() is not None:
            status['text_model'] = True
    except Exception as e:
        status['errors'].append(f"Text model failed: {e}")

    try:
        model, processor = get_image_model()
        if model is not None and processor is not None:
            status['image_model'] = True
    except Exception as e:
        status['errors'].append(f"Image model failed: {e}")

    return status
