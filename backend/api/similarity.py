"""
Similarity Search Service for Creative Memory feature.

Provides functions to find similar images based on embeddings.
Supports both pgvector (PostgreSQL) and JSON fallback.
"""
import logging
from collections import Counter
from typing import List, Optional, Tuple

from django.db import connection
from django.db.models import Q

from .models import Image, ImageEmbedding

logger = logging.getLogger(__name__)

# Default number of related images to return
DEFAULT_LIMIT = 12


def find_related_images(
    image_id: int,
    user_id: Optional[str] = None,
    limit: int = DEFAULT_LIMIT,
    use_image_embedding: bool = True,
) -> List[dict]:
    """
    Find images similar to a given image based on embeddings.

    Priority:
    1. Use image_embedding (visual similarity) if available
    2. Fall back to prompt_embedding (text similarity) if image_embedding unavailable

    Permission rules:
    - Always include public images
    - If user_id provided, also include that user's private images

    Args:
        image_id: ID of the source image
        user_id: Optional user ID for permission filtering
        limit: Maximum number of results
        use_image_embedding: If True, prefer image embedding; if False, use prompt

    Returns:
        List of dicts with image_id and similarity_score
    """
    try:
        source_embedding = ImageEmbedding.objects.select_related('image').get(
            image_id=image_id
        )
    except ImageEmbedding.DoesNotExist:
        logger.warning(f"[Similarity] No embedding found for Image ID: {image_id}")
        return []

    # Determine which embedding to use
    if use_image_embedding and source_embedding.image_embedding_json:
        embedding = source_embedding.image_embedding_json
        embedding_field = 'image_embedding'
    elif source_embedding.prompt_embedding_json:
        embedding = source_embedding.prompt_embedding_json
        embedding_field = 'prompt_embedding'
    else:
        logger.warning(f"[Similarity] No usable embedding for Image ID: {image_id}")
        return []

    # Try pgvector first, fall back to JSON
    if connection.vendor == 'postgresql' and _has_vector_column(embedding_field):
        results = _find_similar_pgvector(
            image_id, embedding, embedding_field, user_id, limit
        )
    else:
        results = _find_similar_json(
            image_id, embedding, embedding_field, user_id, limit
        )

    return results


def _has_vector_column(column_name: str) -> bool:
    """Check if the vector column exists in the database."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'api_imageembedding'
                AND column_name = %s
            """, [column_name])
            return cursor.fetchone() is not None
    except Exception:
        return False


def _find_similar_pgvector(
    source_image_id: int,
    embedding: List[float],
    embedding_field: str,
    user_id: Optional[str],
    limit: int,
) -> List[dict]:
    """
    Find similar images using pgvector cosine distance.

    Uses <=> operator for cosine distance (1 - cosine_similarity).
    """
    try:
        # Build permission filter
        if user_id:
            permission_filter = "(i.is_public = TRUE OR i.user_id = %s)"
            params = [embedding, source_image_id, user_id, limit]
        else:
            permission_filter = "i.is_public = TRUE"
            params = [embedding, source_image_id, limit]

        query = f"""
            SELECT
                e.image_id,
                1 - (e.{embedding_field} <=> %s::vector) as similarity_score
            FROM api_imageembedding e
            JOIN api_image i ON e.image_id = i.id
            WHERE e.image_id != %s
            AND e.{embedding_field} IS NOT NULL
            AND i.status = 'READY'
            AND {permission_filter}
            ORDER BY e.{embedding_field} <=> %s::vector
            LIMIT %s
        """

        # Add embedding again for ORDER BY
        if user_id:
            params = [embedding, source_image_id, user_id, embedding, limit]
        else:
            params = [embedding, source_image_id, embedding, limit]

        with connection.cursor() as cursor:
            cursor.execute(query, params)
            results = [
                {'image_id': row[0], 'similarity_score': float(row[1])}
                for row in cursor.fetchall()
            ]

        return results

    except Exception as e:
        logger.error(f"[Similarity] pgvector search failed: {e}")
        # Fall back to JSON method
        return _find_similar_json(
            source_image_id, embedding, embedding_field, user_id, limit
        )


def _find_similar_json(
    source_image_id: int,
    embedding: List[float],
    embedding_field: str,
    user_id: Optional[str],
    limit: int,
) -> List[dict]:
    """
    Find similar images using JSON embeddings and Python-based similarity.

    Less efficient but works without pgvector.
    """
    from .embeddings import batch_compute_similarities

    # Build queryset with permissions
    qs = ImageEmbedding.objects.exclude(image_id=source_image_id)

    json_field = f'{embedding_field}_json'
    qs = qs.exclude(**{f'{json_field}__isnull': True})

    # Join with Image for permissions and status
    qs = qs.select_related('image').filter(
        image__status=Image.Status.READY
    )

    if user_id:
        qs = qs.filter(Q(image__is_public=True) | Q(image__user_id=user_id))
    else:
        qs = qs.filter(image__is_public=True)

    # Load all embeddings (not ideal for large datasets)
    # TODO: For scale, consider chunking or using approximate methods
    candidates = list(qs.values_list('image_id', json_field))

    if not candidates:
        return []

    image_ids = [c[0] for c in candidates]
    embeddings_list = [c[1] for c in candidates]

    # Compute similarities
    similarities = batch_compute_similarities(embedding, embeddings_list)

    # Sort by similarity and take top N
    results = sorted(
        zip(image_ids, similarities),
        key=lambda x: x[1],
        reverse=True,
    )[:limit]

    return [
        {'image_id': img_id, 'similarity_score': score}
        for img_id, score in results
    ]


def get_user_style_suggestions(
    user_id: str,
    limit: int = 5,
) -> List[dict]:
    """
    Get style suggestions based on user's prompt history.

    MVP approach:
    1. Analyze most frequent keywords in user's prompts
    2. Group by common patterns/styles
    3. Return suggestions with example prompts

    Args:
        user_id: The user's ID
        limit: Maximum number of suggestions

    Returns:
        List of style suggestions with labels and examples
    """
    import re

    # Get user's prompts
    prompts = list(
        ImageEmbedding.objects.filter(image__user_id=user_id)
        .exclude(prompt_text='')
        .values_list('prompt_text', 'image_id')
    )

    if not prompts:
        # Fall back to direct Image model if no embeddings yet
        prompts = list(
            Image.objects.filter(user_id=user_id, status=Image.Status.READY)
            .exclude(prompt='')
            .exclude(prompt__isnull=True)
            .values_list('prompt', 'id')
        )

    if not prompts:
        return []

    # Common stopwords to ignore
    stopwords = {
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
        'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
        'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your',
        'his', 'her', 'our', 'their', 'very', 'just', 'also', 'only', 'like',
        'um', 'uma', 'uns', 'umas', 'o', 'os', 'as', 'de', 'da', 'do', 'das',
        'dos', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem',
        'sobre', 'entre', 'e', 'ou', 'mas', 'porque', 'que', 'se', 'quando',
    }

    # Style-related keywords to look for
    style_keywords = {
        # Art styles
        'realistic', 'photorealistic', 'hyperrealistic', 'cinematic',
        'anime', 'manga', 'cartoon', 'illustration', 'digital art',
        'oil painting', 'watercolor', 'sketch', 'pencil', 'charcoal',
        '3d', '3d render', 'cgi', 'unreal engine', 'octane render',
        'pixel art', 'retro', 'vintage', 'minimalist', 'abstract',
        'surreal', 'surrealistic', 'fantasy', 'sci-fi', 'cyberpunk',
        'steampunk', 'gothic', 'dark', 'bright', 'colorful', 'vibrant',
        'pastel', 'neon', 'moody', 'dramatic',
        # Quality modifiers
        '4k', '8k', 'hd', 'high quality', 'detailed', 'intricate',
        'masterpiece', 'professional', 'studio',
        # Lighting
        'dramatic lighting', 'soft lighting', 'natural lighting',
        'golden hour', 'blue hour', 'backlit', 'rim light',
    }

    # Extract and count keywords
    keyword_counter = Counter()
    keyword_examples = {}  # keyword -> (prompt, image_id)

    for prompt_text, image_id in prompts:
        # Lowercase and extract words
        words = re.findall(r'\b[a-z]{3,}\b', prompt_text.lower())

        for word in words:
            if word not in stopwords:
                keyword_counter[word] += 1
                if word not in keyword_examples:
                    keyword_examples[word] = (prompt_text, image_id)

        # Also check for multi-word style keywords
        prompt_lower = prompt_text.lower()
        for style in style_keywords:
            if style in prompt_lower:
                keyword_counter[style] += 1
                if style not in keyword_examples:
                    keyword_examples[style] = (prompt_text, image_id)

    if not keyword_counter:
        return []

    # Get most common keywords, prioritizing style keywords
    suggestions = []
    seen_labels = set()

    # First pass: style keywords
    for keyword in style_keywords:
        if keyword in keyword_counter and keyword not in seen_labels:
            count = keyword_counter[keyword]
            if count >= 2:  # At least 2 uses
                example_prompt, example_id = keyword_examples[keyword]
                suggestions.append({
                    'label': keyword.title(),
                    'example_prompt': example_prompt,
                    'example_image_id': example_id,
                    'frequency': count,
                    'confidence': min(count / len(prompts), 1.0),
                })
                seen_labels.add(keyword)

            if len(suggestions) >= limit:
                break

    # Second pass: other frequent keywords
    if len(suggestions) < limit:
        for keyword, count in keyword_counter.most_common(limit * 2):
            if keyword not in seen_labels and count >= 2:
                example_prompt, example_id = keyword_examples[keyword]
                suggestions.append({
                    'label': keyword.title(),
                    'example_prompt': example_prompt,
                    'example_image_id': example_id,
                    'frequency': count,
                    'confidence': min(count / len(prompts), 1.0),
                })
                seen_labels.add(keyword)

            if len(suggestions) >= limit:
                break

    # Sort by frequency/confidence
    suggestions.sort(key=lambda x: x['confidence'], reverse=True)

    return suggestions[:limit]
