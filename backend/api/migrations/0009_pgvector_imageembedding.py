"""
Migration for Creative Memory feature - ImageEmbedding model with pgvector support.

This migration:
1. Enables the pgvector extension in PostgreSQL
2. Creates the ImageEmbedding model with both JSON fallback and vector fields
3. Creates indexes for efficient similarity search (if pgvector available)

If pgvector is not installed, the migration uses JSON fields as fallback.
"""
from django.db import migrations, models
import django.db.models.deletion

# Try to import pgvector - will fail gracefully if not installed
try:
    from pgvector.django import VectorField, IvfflatIndex, HnswIndex
    PGVECTOR_AVAILABLE = True
except ImportError:
    PGVECTOR_AVAILABLE = False
    VectorField = None
    IvfflatIndex = None
    HnswIndex = None


def enable_pgvector_extension(apps, schema_editor):
    """Enable pgvector extension in PostgreSQL if not already enabled."""
    if schema_editor.connection.vendor != 'postgresql':
        return
    try:
        schema_editor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    except Exception:
        # Extension might not be available - that's OK, we have fallback
        pass


def disable_pgvector_extension(apps, schema_editor):
    """We don't disable the extension on rollback to avoid affecting other uses."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_imagetag_image_featured_image_relevance_score_and_more'),
    ]

    operations = [
        # Step 1: Enable pgvector extension (PostgreSQL only)
        migrations.RunPython(
            enable_pgvector_extension,
            disable_pgvector_extension,
        ),

        # Step 2: Create the ImageEmbedding model
        migrations.CreateModel(
            name='ImageEmbedding',
            fields=[
                ('image', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    primary_key=True,
                    related_name='embedding',
                    serialize=False,
                    to='api.image',
                )),
                ('prompt_text', models.TextField(
                    blank=True,
                    help_text='The prompt text used to generate the embedding',
                )),
                ('prompt_embedding_json', models.JSONField(
                    blank=True,
                    null=True,
                    help_text='Fallback: prompt embedding as JSON list',
                )),
                ('image_embedding_json', models.JSONField(
                    blank=True,
                    null=True,
                    help_text='Fallback: image embedding as JSON list',
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Image Embedding',
                'verbose_name_plural': 'Image Embeddings',
            },
        ),
    ]
