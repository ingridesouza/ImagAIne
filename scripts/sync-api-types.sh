#!/usr/bin/env bash
# =============================================================================
# sync-api-types.sh - Sincroniza tipos TypeScript com a spec OpenAPI do backend
#
# Uso:
#   ./scripts/sync-api-types.sh          # Backend rodando (extrai via HTTP)
#   ./scripts/sync-api-types.sh --file   # Backend parado (usa manage.py)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
SCHEMA_FILE="$FRONTEND_DIR/openapi-schema.yaml"
OUTPUT_FILE="$FRONTEND_DIR/src/api/schema.d.ts"

API_URL="${API_URL:-http://localhost:8000/api/schema/}"

echo "=== ImagAIne SDD - Sync API Types ==="

# Step 1: Export OpenAPI schema
if [[ "${1:-}" == "--file" ]]; then
    echo "[1/3] Exportando schema via manage.py spectacular..."
    cd "$BACKEND_DIR"
    python manage.py spectacular --file "$SCHEMA_FILE" --validate
    echo "      Schema salvo em: $SCHEMA_FILE"
else
    echo "[1/3] Baixando schema de $API_URL..."
    curl -sf "$API_URL" -o "$SCHEMA_FILE" \
        -H "Accept: application/vnd.oai.openapi+yaml" || {
        echo "ERRO: Nao foi possivel conectar ao backend."
        echo "      Certifique-se que o backend esta rodando em $API_URL"
        echo "      Ou use: ./scripts/sync-api-types.sh --file"
        exit 1
    }
    echo "      Schema salvo em: $SCHEMA_FILE"
fi

# Step 2: Generate TypeScript types
echo "[2/3] Gerando tipos TypeScript..."
cd "$FRONTEND_DIR"
npx openapi-typescript "$SCHEMA_FILE" -o "$OUTPUT_FILE"
echo "      Tipos gerados em: $OUTPUT_FILE"

# Step 3: Summary
echo "[3/3] Pronto!"
echo ""
echo "Arquivos atualizados:"
echo "  - $SCHEMA_FILE  (OpenAPI spec)"
echo "  - $OUTPUT_FILE   (TypeScript types)"
echo ""
echo "Importe os tipos no frontend com:"
echo "  import type { paths, components, operations } from '@/api/schema';"
