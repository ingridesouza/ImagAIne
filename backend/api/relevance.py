from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

from django.db import transaction


@dataclass(frozen=True)
class RelevanceWeights:
    like_weight: float = 3.0
    comment_weight: float = 2.0
    download_weight: float = 1.0
    tag_bonus: float = 0.1  # bonus por tag até o limite
    max_tag_bonus: int = 5
    boost_min_score: float = 2.5
    boost_duration: timedelta = timedelta(hours=6)
    decay_half_life: timedelta = timedelta(hours=24)  # após este período o score cai pela metade


def _now(now: Optional[datetime] = None) -> datetime:
    if now is None:
        return datetime.now(timezone.utc)
    return now


def calculate_engagement_score(
    *,
    likes: int,
    comments: int,
    downloads: int,
    weights: RelevanceWeights,
) -> float:
    return (
        likes * weights.like_weight
        + comments * weights.comment_weight
        + downloads * weights.download_weight
    )


def calculate_decay_factor(
    *,
    created_at: datetime,
    now: Optional[datetime],
    weights: RelevanceWeights,
) -> float:
    current = _now(now)
    if created_at is None:
        return 1.0
    elapsed = max(current - created_at, timedelta())
    if elapsed <= weights.boost_duration:
        return 1.0
    half_life_seconds = weights.decay_half_life.total_seconds()
    if half_life_seconds <= 0:
        return 1.0
    decay_factor = 2 ** (elapsed.total_seconds() / half_life_seconds)
    return max(decay_factor, 1.0)


def calculate_tag_bonus(tag_count: int, weights: RelevanceWeights) -> float:
    if tag_count <= 0:
        return 0.0
    capped = min(tag_count, weights.max_tag_bonus)
    return capped * weights.tag_bonus


def calculate_relevance_score(
    *,
    likes: int,
    comments: int,
    downloads: int,
    tag_count: int,
    created_at: Optional[datetime],
    featured: bool,
    current_score: Optional[float] = None,
    now: Optional[datetime] = None,
    weights: Optional[RelevanceWeights] = None,
) -> float:
    weights = weights or RelevanceWeights()
    base_score = calculate_engagement_score(
        likes=likes,
        comments=comments,
        downloads=downloads,
        weights=weights,
    )
    base_score += calculate_tag_bonus(tag_count, weights)
    decay = calculate_decay_factor(
        created_at=created_at,
        now=now,
        weights=weights,
    )
    score = base_score / decay if decay else base_score

    if featured:
        score += weights.boost_min_score * 2

    current = current_score or 0.0
    boost_floor = weights.boost_min_score
    if created_at and (_now(now) - created_at) <= weights.boost_duration:
        score = max(score, boost_floor)
    else:
        score = max(score, current * 0.9)  # suaviza quedas bruscas

    return round(score, 4)


def update_image_relevance(image, commit: bool = True, now: Optional[datetime] = None):
    from api.models import ImageLike, ImageComment

    weights = RelevanceWeights()
    likes = getattr(image, "like_count", None)
    if likes is None:
        likes = ImageLike.objects.filter(image=image).count()
    comments = getattr(image, "comment_count", None)
    if comments is None:
        comments = ImageComment.objects.filter(image=image).count()
    downloads = image.download_count
    tag_count = image.tags.count() if hasattr(image, "tags") else 0

    new_score = calculate_relevance_score(
        likes=likes,
        comments=comments,
        downloads=downloads,
        tag_count=tag_count,
        created_at=image.created_at,
        featured=image.featured,
        current_score=image.relevance_score,
        now=now,
    )
    if commit:
        with transaction.atomic():
            type(image).objects.filter(pk=image.pk).update(relevance_score=new_score)
            image.relevance_score = new_score
    else:
        image.relevance_score = new_score
    return new_score
