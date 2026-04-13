# Spec-Driven Development (SDD) - ImagAIne

> Guia completo da metodologia SDD implementada no projeto ImagAIne.

---

## 1. O que e SDD?

**Spec-Driven Development** e uma metodologia onde a **especificacao da API** (OpenAPI 3.0)
e o contrato unico e autoritativo entre backend e frontend. Em vez de manter tipos e
contratos manualmente em ambos os lados, a spec e gerada automaticamente a partir dos
serializers Django e os tipos TypeScript sao gerados automaticamente a partir dessa spec.

### Beneficios

- **Single Source of Truth**: serializers Django sao a unica fonte de verdade
- **Zero drift**: frontend e backend nunca ficam dessincronizados
- **Documentacao gratis**: Swagger UI e Redoc gerados automaticamente
- **Type safety**: tipos TypeScript gerados garantem consistencia em compile-time
- **Onboarding rapido**: novos devs entendem a API inteira via documentacao interativa

---

## 2. Arquitetura SDD

```
┌─────────────────┐     gera      ┌──────────────────┐     gera      ┌───────────────────┐
│ Django           │ ───────────>  │  OpenAPI Schema   │ ───────────>  │  TypeScript Types  │
│ Serializers +    │  drf-         │  (schema.yaml)    │  openapi-     │  (schema.d.ts)     │
│ @extend_schema   │  spectacular  │                   │  typescript   │                    │
└─────────────────┘               └──────────────────┘               └───────────────────┘
       │                                  │                                   │
       │                                  │                                   │
       v                                  v                                   v
  Implementacao                   Swagger UI / Redoc                  Frontend React
  no backend                      (documentacao)                      (type-safe)
```

---

## 3. Stack SDD

| Ferramenta          | Papel                                    | Localizacao              |
|---------------------|------------------------------------------|--------------------------|
| drf-spectacular     | Gera OpenAPI 3.0 a partir do DRF         | Backend (requirements.txt)|
| @extend_schema      | Anotacoes de metadados nas views         | Backend (views.py)        |
| openapi-typescript  | Gera tipos TS a partir da spec           | Frontend (devDependencies)|
| sync-api-types.sh   | Script de sincronizacao automatica       | scripts/                  |

---

## 4. Como Usar

### 4.1 Acessar a Documentacao (backend rodando)

| URL                          | Descricao                    |
|------------------------------|------------------------------|
| http://localhost:8000/api/docs/   | Swagger UI (interativo)  |
| http://localhost:8000/api/redoc/  | Redoc (leitura)          |
| http://localhost:8000/api/schema/ | OpenAPI YAML/JSON bruto  |

### 4.2 Gerar Tipos TypeScript

**Opcao A - Backend rodando** (recomendado em desenvolvimento):

```bash
# Via npm script
cd frontend
npm run generate-api

# Via script completo (exporta schema + gera tipos)
./scripts/sync-api-types.sh
```

**Opcao B - Backend parado** (CI/CD ou offline):

```bash
# Exporta schema via manage.py e gera tipos
./scripts/sync-api-types.sh --file

# Ou gera a partir de um schema local existente
cd frontend
npm run generate-api:file
```

### 4.3 Usar os Tipos no Frontend

```typescript
import type { paths, components } from '@/api/schema';

// Tipo de uma imagem (response body)
type ImageRecord = components['schemas']['Image'];

// Tipo do payload de geracao (request body)
type GeneratePayload = components['schemas']['GenerateImageRequest'];

// Tipo da resposta paginada de imagens publicas
type PublicImagesResponse = paths['/api/images/public/']['get']['responses']['200']['content']['application/json'];
```

---

## 5. Fluxo de Trabalho

### 5.1 Adicionar/Modificar um Endpoint

```
1. Criar/editar o Serializer Django
        |
2. Criar/editar a View com @extend_schema
        |
3. Rodar: ./scripts/sync-api-types.sh
        |
4. Verificar Swagger UI: http://localhost:8000/api/docs/
        |
5. Usar tipos gerados no frontend
        |
6. Commitar: schema.yaml + schema.d.ts junto com o codigo
```

### 5.2 Checklist de Review de PR

- [ ] Serializer atualizado com campos corretos?
- [ ] View anotada com `@extend_schema` (tags, summary, description)?
- [ ] Schema YAML atualizado (`./scripts/sync-api-types.sh`)?
- [ ] Tipos TypeScript regenerados (`schema.d.ts`)?
- [ ] Swagger UI reflete a mudanca?
- [ ] Frontend usando tipos gerados (nao manuais)?

---

## 6. Referencia: Anotacoes @extend_schema

### 6.1 View simples (APIView)

```python
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers

class MyView(APIView):
    @extend_schema(
        tags=['MinhaTag'],
        summary='Breve descricao',
        description='Descricao detalhada do endpoint.',
        request=MeuRequestSerializer,
        responses={
            200: MeuResponseSerializer,
            400: inline_serializer('ErroResponse', fields={
                'detail': serializers.CharField(),
            }),
        },
    )
    def post(self, request):
        ...
```

### 6.2 View generica (ListAPIView, CreateAPIView, etc.)

```python
from drf_spectacular.utils import extend_schema, extend_schema_view

@extend_schema_view(
    list=extend_schema(
        tags=['MinhaTag'],
        summary='Listar recursos',
        description='Retorna lista paginada.',
    ),
    create=extend_schema(
        tags=['MinhaTag'],
        summary='Criar recurso',
    ),
)
class MyListCreateView(generics.ListCreateAPIView):
    serializer_class = MeuSerializer
    ...
```

### 6.3 Parametros de query

```python
from drf_spectacular.utils import OpenApiParameter

@extend_schema(
    parameters=[
        OpenApiParameter('search', str, description='Termo de busca'),
        OpenApiParameter('limit', int, description='Maximo de resultados'),
    ],
)
def get(self, request):
    ...
```

### 6.4 Upload de arquivo

```python
@extend_schema(
    request={'multipart/form-data': {
        'type': 'object',
        'properties': {
            'file': {'type': 'string', 'format': 'binary'},
        },
        'required': ['file'],
    }},
)
def post(self, request):
    ...
```

---

## 7. Configuracao no Projeto

### 7.1 Backend (settings.py)

```python
INSTALLED_APPS = [
    ...
    'drf_spectacular',
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    ...
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'ImagAIne API',
    'VERSION': '1.0.0',
    'COMPONENT_SPLIT_REQUEST': True,
    'TAGS': [...],
}
```

### 7.2 URLs (urls.py)

```python
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
```

### 7.3 Frontend (package.json)

```json
{
  "scripts": {
    "generate-api": "openapi-typescript http://localhost:8000/api/schema/ -o src/api/schema.d.ts",
    "generate-api:file": "openapi-typescript ./openapi-schema.yaml -o src/api/schema.d.ts"
  },
  "devDependencies": {
    "openapi-typescript": "^7.6.1"
  }
}
```

---

## 8. Endpoints Anotados

Todos os endpoints do projeto foram anotados com `@extend_schema`. Abaixo a lista
organizada por tag:

### Auth
| Endpoint                              | Metodo | Summary                   |
|---------------------------------------|--------|---------------------------|
| /api/auth/register/                   | POST   | Registrar usuario         |
| /api/auth/login/                      | POST   | Login                     |
| /api/auth/verify-email/{token}/       | GET    | Verificar email           |
| /api/auth/password/reset/request/     | POST   | Solicitar reset de senha  |
| /api/auth/password/reset/confirm/     | POST   | Confirmar reset de senha  |

### Profile
| Endpoint                    | Metodo     | Summary                      |
|-----------------------------|------------|------------------------------|
| /api/auth/profile/          | GET        | Obter perfil                 |
| /api/auth/profile/          | PUT/PATCH  | Atualizar perfil             |
| /api/auth/profile/avatar/   | POST       | Upload de avatar             |
| /api/auth/profile/cover/    | POST       | Upload de capa               |
| /api/auth/preferences/      | GET        | Obter preferencias           |
| /api/auth/preferences/      | PUT        | Atualizar preferencias       |

### Generation
| Endpoint         | Metodo | Summary        |
|------------------|--------|----------------|
| /api/generate/   | POST   | Gerar imagem   |

### Gallery
| Endpoint                 | Metodo | Summary           |
|--------------------------|--------|-------------------|
| /api/images/public/      | GET    | Galeria publica   |
| /api/images/my-images/   | GET    | Minhas imagens    |
| /api/images/liked/       | GET    | Imagens curtidas  |

### Social
| Endpoint                                     | Metodo | Summary             |
|----------------------------------------------|--------|---------------------|
| /api/images/{id}/share/                      | POST   | Publicar imagem     |
| /api/images/{id}/share/                      | PATCH  | Alterar visibilidade|
| /api/images/{id}/like/                       | POST   | Curtir imagem       |
| /api/images/{id}/like/                       | DELETE | Descurtir imagem    |
| /api/images/{id}/comments/                   | GET    | Listar comentarios  |
| /api/images/{id}/comments/                   | POST   | Criar comentario    |
| /api/images/{id}/comments/{cid}/             | DELETE | Deletar comentario  |
| /api/images/{id}/comments/{cid}/like/        | POST   | Curtir comentario   |
| /api/images/{id}/comments/{cid}/like/        | DELETE | Descurtir comentario|
| /api/images/{id}/download/                   | POST   | Download de imagem  |

### Creative Memory
| Endpoint                             | Metodo | Summary               |
|--------------------------------------|--------|-----------------------|
| /api/images/{id}/related/            | GET    | Imagens relacionadas  |
| /api/users/me/style-suggestions/     | GET    | Sugestoes de estilo   |

### Prompt Assistant
| Endpoint              | Metodo | Summary          |
|-----------------------|--------|------------------|
| /api/refine-prompt/   | POST   | Refinar prompt   |

---

## 9. Migracao: De Tipos Manuais para Tipos Gerados

O projeto possuia tipos definidos manualmente em:
- `frontend/src/features/auth/types.ts`
- `frontend/src/features/images/types.ts`

Esses arquivos continuam funcionais para compatibilidade, mas devem ser
progressivamente substituidos pelos tipos gerados em `frontend/src/api/schema.d.ts`.

### Exemplo de migracao

**Antes** (tipo manual):
```typescript
// features/images/types.ts
export type ImageRecord = {
  id: number;
  user: { id: string; username: string };
  prompt: string;
  ...
};
```

**Depois** (tipo gerado):
```typescript
// Importar do schema gerado
import type { components } from '@/api/schema';
type ImageRecord = components['schemas']['Image'];
```

---

## 10. Troubleshooting

### "Nao consigo acessar /api/docs/"
- Verifique se `drf_spectacular` esta em `INSTALLED_APPS`
- Verifique se as URLs estao configuradas em `urls.py`
- Confirme que `DEFAULT_SCHEMA_CLASS` esta definido no `REST_FRAMEWORK`

### "openapi-typescript nao gera os tipos"
- Verifique se o backend esta rodando (`http://localhost:8000/api/schema/`)
- Use `--file` se o backend estiver parado
- Instale as dependencias: `cd frontend && npm install`

### "Tipos gerados estao vazios"
- A spec pode estar incompleta. Verifique o Swagger UI para endpoints faltando
- Adicione `@extend_schema` nas views que nao aparecem

### "Erro de importacao no drf_spectacular"
- Instale: `pip install drf-spectacular`
- Verifique se esta no `requirements.txt`

---

*Documento criado como parte da implementacao SDD do ImagAIne.*
*Ultima atualizacao: 2026-04-12*
