# =============================================================================
# ImagAIne — Makefile
# Comandos centrais do projeto. Rode `make help` para ver todos.
# =============================================================================

.PHONY: help up down build logs spec types sync validate lint test fresh

# Cores
CYAN  := \033[36m
RESET := \033[0m

help: ## Mostra todos os comandos disponiveis
	@echo ""
	@echo "  ImagAIne — Comandos do projeto"
	@echo "  ================================"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-16s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ---------------------------------------------------------------------------
# Docker
# ---------------------------------------------------------------------------

up: ## Sobe todos os containers
	docker compose up -d

down: ## Para todos os containers
	docker compose down

build: ## Reconstroi as imagens Docker
	docker compose build

logs: ## Mostra logs do backend (web)
	docker compose logs -f web

# ---------------------------------------------------------------------------
# SDD — Spec-Driven Development
# ---------------------------------------------------------------------------

spec: ## Exporta a spec OpenAPI do backend (YAML)
	docker compose exec web python manage.py spectacular --file openapi-schema.yaml
	docker compose exec web cat openapi-schema.yaml > frontend/openapi-schema.yaml
	@echo "[SDD] Spec exportada para frontend/openapi-schema.yaml"

types: ## Gera tipos TypeScript a partir da spec local
	cd frontend && npx openapi-typescript ./openapi-schema.yaml -o src/api/schema.d.ts
	@echo "[SDD] Tipos gerados em frontend/src/api/schema.d.ts"

sync: spec types ## Exporta spec + gera tipos (comando principal)
	@echo "[SDD] Sync completo. Spec e tipos atualizados."

validate: ## Valida a spec OpenAPI (zero warnings = ok)
	docker compose exec web python manage.py spectacular --validate --fail-on-warn
	@echo "[SDD] Spec valida, zero warnings."

check-sync: ## Verifica se tipos estao sincronizados com a spec
	@echo "[SDD] Exportando spec atual..."
	@docker compose exec web python manage.py spectacular --file /tmp/current-schema.yaml 2>/dev/null
	@docker compose exec web cat /tmp/current-schema.yaml > /tmp/imagaine-current-spec.yaml
	@if diff -q frontend/openapi-schema.yaml /tmp/imagaine-current-spec.yaml > /dev/null 2>&1; then \
		echo "[SDD] OK — Spec esta sincronizada."; \
	else \
		echo "[SDD] ERRO — Spec desatualizada! Rode: make sync"; \
		exit 1; \
	fi

# ---------------------------------------------------------------------------
# Desenvolvimento
# ---------------------------------------------------------------------------

migrate: ## Roda migrations do Django
	docker compose exec web python manage.py migrate

migrations: ## Cria novas migrations
	docker compose exec web python manage.py makemigrations

shell: ## Abre shell Django
	docker compose exec web python manage.py shell

test: ## Roda testes do backend
	docker compose exec web python manage.py test

lint-back: ## Verifica erros no backend
	docker compose exec web python manage.py check

lint-front: ## Roda lint do frontend
	cd frontend && npm run lint

lint: lint-back lint-front ## Roda lint no backend e frontend

fresh: build up migrate sync ## Setup completo: build + up + migrate + sync
	@echo ""
	@echo "  ImagAIne rodando!"
	@echo "  App:     http://localhost:5173"
	@echo "  API:     http://localhost:8000"
	@echo "  Swagger: http://localhost:8000/api/docs/"
	@echo "  Redoc:   http://localhost:8000/api/redoc/"
	@echo ""
