"""
Migration to add pgvector VectorField columns to ImageEmbedding.

This migration adds the actual vector columns for efficient similarity search.
If pgvector is not available, this migration is a no-op.

Vector dimensions:
- prompt_embedding: 384 (all-MiniLM-L6-v2)
- image_embedding: 768 (BLIP ViT-B/16)
"""
from django.db import migrations

# Embedding dimensions
TEXT_EMBEDDING_DIM = 384
IMAGE_EMBEDDING_DIM = 768

# Try to import pgvector
try:
    from pgvector.django import VectorField, HnswIndex
    PGVECTOR_AVAILABLE = True
except ImportError:
    PGVECTOR_AVAILABLE = False
    VectorField = None
    HnswIndex = None


def add_vector_columns(apps, schema_editor):
    """Add vector columns using raw SQL if pgvector is available."""
    if schema_editor.connection.vendor != 'postgresql':
        return

    # Check if extension is enabled
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector');"
        )
        has_vector = cursor.fetchone()[0]

    if not has_vector:
        return

    # Add vector columns
    schema_editor.execute(f"""
        ALTER TABLE api_imageembedding
        ADD COLUMN IF NOT EXISTS prompt_embedding vector({TEXT_EMBEDDING_DIM});
    """)
    schema_editor.execute(f"""
        ALTER TABLE api_imageembedding
        ADD COLUMN IF NOT EXISTS image_embedding vector({IMAGE_EMBEDDING_DIM});
    """)

    # Create HNSW indexes for fast approximate nearest neighbor search
    # Using cosine distance (vector_cosine_ops)
    schema_editor.execute("""
        CREATE INDEX IF NOT EXISTS idx_imageembedding_prompt_hnsw
        ON api_imageembedding
        USING hnsw (prompt_embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64);
    """)
    schema_editor.execute("""
        CREATE INDEX IF NOT EXISTS idx_imageembedding_image_hnsw
        ON api_imageembedding
        USING hnsw (image_embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64);
    """)


def remove_vector_columns(apps, schema_editor):
    """Remove vector columns on rollback."""
    if schema_editor.connection.vendor != 'postgresql':
        return

    schema_editor.execute("""
        DROP INDEX IF EXISTS idx_imageembedding_prompt_hnsw;
    """)
    schema_editor.execute("""
        DROP INDEX IF EXISTS idx_imageembedding_image_hnsw;
    """)
    schema_editor.execute("""
        ALTER TABLE api_imageembedding
        DROP COLUMN IF EXISTS prompt_embedding;
    """)
    schema_editor.execute("""
        ALTER TABLE api_imageembedding
        DROP COLUMN IF EXISTS image_embedding;
    """)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_pgvector_imageembedding'),
    ]

    operations = [
        migrations.RunPython(
            add_vector_columns,
            remove_vector_columns,
        ),
    ]
