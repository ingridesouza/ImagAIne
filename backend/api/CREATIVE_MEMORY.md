# Creative Memory (Memória Criativa)

Feature de embeddings para recomendação de imagens similares e sugestões de estilo.

## Overview

A Memória Criativa armazena embeddings (vetores numéricos) dos prompts e imagens geradas para:

1. **Imagens Relacionadas**: Encontrar imagens visualmente similares
2. **Sugestões de Estilo**: Identificar padrões recorrentes nos prompts do usuário

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Image Generation                          │
│                                                              │
│  generate_image_task() ─────► create_embeddings_task()       │
│         │                              │                     │
│         ▼                              ▼                     │
│     Image Model               ImageEmbedding Model           │
│     (status=READY)            (prompt + image vectors)       │
└─────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Similarity Search                         │
│                                                              │
│  GET /api/images/{id}/related/                               │
│  GET /api/users/me/style-suggestions/                        │
│                                                              │
│  pgvector (preferred)  ──or──  JSON fallback (Python)        │
└─────────────────────────────────────────────────────────────┘
```

## Modelos de Embedding

### Texto (Prompt)
- **Modelo**: `sentence-transformers/all-MiniLM-L6-v2`
- **Dimensão**: 384
- **Uso**: Similaridade semântica entre prompts

### Imagem
- **Modelo**: `Salesforce/blip-image-captioning-base` (visual encoder)
- **Dimensão**: 768
- **Uso**: Similaridade visual entre imagens

> **TODO**: Considerar migração para ALBEF quando disponível uma implementação estável no Hugging Face.

## Setup

### 1. Instalar Dependências

```bash
pip install pgvector sentence-transformers
```

As dependências já estão no `requirements.txt`:
```
pgvector>=0.2.0
sentence-transformers>=2.2.0
numpy>=1.24.0
```

### 2. Habilitar pgvector no PostgreSQL

No PostgreSQL 16+, a extensão pgvector geralmente precisa ser instalada:

```sql
-- No psql ou pgAdmin
CREATE EXTENSION IF NOT EXISTS vector;
```

Em Docker, use a imagem `ankane/pgvector`:
```yaml
services:
  db:
    image: ankane/pgvector:latest
    # ... outras configs
```

### 3. Aplicar Migrations

```bash
python manage.py migrate api
```

Isso irá:
1. Habilitar a extensão `vector` no PostgreSQL
2. Criar a tabela `api_imageembedding`
3. Adicionar colunas vetoriais com índices HNSW

### 4. Cache de Modelos

Na primeira execução, os modelos serão baixados (~500MB total). Para customizar:

```bash
# Definir diretório de cache (opcional)
export EMBEDDINGS_CACHE_DIR=/path/to/models
```

## Configuração

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `EMBEDDINGS_ENABLED` | `true` | Habilitar/desabilitar geração de embeddings |
| `EMBEDDINGS_DEVICE` | `auto` | Dispositivo: `cuda`, `cpu`, `mps`, ou `auto` |
| `EMBEDDINGS_CACHE_DIR` | `None` | Diretório para cache dos modelos |

### Desabilitar Embeddings

Para desabilitar completamente (útil em dev/staging):

```bash
export EMBEDDINGS_ENABLED=false
```

Isso fará com que:
- Tasks de embedding retornem imediatamente sem processar
- Endpoints `/related/` e `/style-suggestions/` retornem listas vazias

## API Endpoints

### GET /api/images/{id}/related/

Retorna imagens similares a uma imagem específica.

**Parâmetros**:
- `limit` (opcional): Número máximo de resultados (default: 12, max: 20)

**Permissões**:
- Imagem pública: Acesso público
- Imagem privada: Apenas o dono

**Resposta**:
```json
{
  "count": 5,
  "results": [
    {
      "image": {
        "id": 123,
        "prompt": "...",
        "image_url": "...",
        "user": {"id": "...", "username": "..."},
        "like_count": 10,
        "comment_count": 2
      },
      "similarity_score": 0.89
    }
  ]
}
```

### GET /api/users/me/style-suggestions/

Retorna sugestões de estilo baseadas no histórico de prompts do usuário.

**Autenticação**: Obrigatória

**Parâmetros**:
- `limit` (opcional): Número máximo de sugestões (default: 5, max: 10)

**Resposta**:
```json
{
  "count": 3,
  "results": [
    {
      "label": "Cinematic",
      "example_prompt": "A cinematic shot of a forest at sunset",
      "example_image_id": 456,
      "frequency": 8,
      "confidence": 0.75
    }
  ]
}
```

## Celery Tasks

### create_embeddings_task(image_id)

Gera embeddings para uma imagem após a geração.

- **Trigger**: Automático após `generate_image_task` com sucesso
- **Retry**: 3 tentativas com backoff exponencial
- **Timeout**: 120s soft, 180s hard

### backfill_embeddings_task(batch_size=50, skip_existing=True)

Processa embeddings para imagens antigas que não possuem.

```python
# Via shell
from api.tasks import backfill_embeddings_task
backfill_embeddings_task.delay(batch_size=100)
```

## Fallback (sem pgvector)

Se pgvector não estiver disponível, o sistema usa fallback:

1. **Armazenamento**: Embeddings são salvos como JSON (`prompt_embedding_json`, `image_embedding_json`)
2. **Busca**: Similaridade calculada em Python (menos eficiente)

⚠️ O fallback é adequado para desenvolvimento mas não recomendado para produção com muitas imagens.

## Testes

```bash
# Rodar testes de embeddings
python manage.py test api.tests.test_embeddings -v 2
```

Os testes usam mocks para não baixar modelos durante CI.

## Troubleshooting

### Modelos não carregam

```bash
# Verificar status dos modelos
python manage.py shell
>>> from api.embeddings import check_models_available
>>> check_models_available()
{'enabled': True, 'device': 'cuda', 'text_model': True, 'image_model': True, 'errors': []}
```

### Embeddings não são gerados

1. Verificar se `EMBEDDINGS_ENABLED=true`
2. Verificar logs do Celery worker
3. Verificar se a imagem tem status `READY` e arquivo existente

### pgvector não funciona

```sql
-- Verificar se extensão está instalada
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Verificar se colunas existem
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'api_imageembedding';
```

## Performance

### Índices

A migration cria índices HNSW para busca aproximada:
- `idx_imageembedding_prompt_hnsw` - busca por similaridade de prompt
- `idx_imageembedding_image_hnsw` - busca por similaridade visual

Parâmetros HNSW:
- `m = 16` - conexões por nó
- `ef_construction = 64` - qualidade do índice

### Recomendações

- **< 10k imagens**: Fallback JSON é aceitável
- **10k - 100k imagens**: pgvector com HNSW
- **> 100k imagens**: Considerar índices IVFFlat ou serviço dedicado

## Roadmap

- [ ] Migrar para ALBEF quando disponível no HF
- [ ] Adicionar cache de embeddings populares
- [ ] Suporte a busca semântica por texto
- [ ] Clustering de estilos com k-means
- [ ] Métricas de uso dos embeddings
