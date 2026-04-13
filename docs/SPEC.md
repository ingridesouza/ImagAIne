# ImagAIne - Especificacao Completa do Projeto

> Documento normativo que define o escopo, funcionalidades, restricoes e criterios de
> aceitacao do projeto ImagAIne. Todas as decisoes de implementacao devem ser validadas
> contra esta especificacao.

---

## 1. Visao Geral

**ImagAIne** e uma plataforma web de geracao, gerenciamento e compartilhamento de imagens
criadas por inteligencia artificial. O sistema permite que usuarios descrevam imagens em
linguagem natural (prompts) e recebam imagens geradas por modelos de difusao (FLUX.1-dev).

### 1.1 Proposito

Democratizar a criacao de arte digital com IA, oferecendo uma interface acessivel,
recursos sociais para compartilhamento e ferramentas inteligentes de assistencia criativa.

### 1.2 Publico-Alvo

- Criadores de conteudo e artistas digitais
- Entusiastas de IA generativa
- Profissionais de marketing e design que precisam de prototipagem rapida

---

## 2. Arquitetura

### 2.1 Stack Tecnologico

| Camada       | Tecnologia                                    |
|--------------|-----------------------------------------------|
| Backend      | Django 5.0 + Django REST Framework             |
| Frontend     | React 19 + TypeScript 5.9 + Vite 7             |
| Banco        | PostgreSQL 16 (com pgvector para embeddings)    |
| Fila         | Celery 5 + Redis 7                              |
| IA Geracao   | Hugging Face Diffusers (FLUX.1-dev)              |
| IA Embeddings| sentence-transformers + BLIP                     |
| IA Prompts   | DeepSeek LLM API                                 |
| Auth         | JWT (simplejwt) com rotacao de tokens            |
| Deploy       | Docker + Docker Compose (5 servicos)             |

### 2.2 Servicos Docker

| Servico   | Descricao                        | Porta  |
|-----------|----------------------------------|--------|
| web       | Django API (Gunicorn/runserver)  | 8000   |
| worker    | Celery consumer (tarefas async)  | -      |
| db        | PostgreSQL 16                    | 5432   |
| redis     | Message broker                   | 6379   |
| frontend  | React build (Nginx)              | 5173   |

### 2.3 Diagrama de Fluxo

```
[Frontend React] --HTTP/REST--> [Django API] --Celery--> [Worker]
                                     |                       |
                                     v                       v
                                [PostgreSQL]         [Hugging Face API]
                                     |
                                [Redis (broker)]
```

---

## 3. Modelo de Dados

### 3.1 User (authentication.User)

Modelo customizado baseado em `AbstractUser`.

| Campo                        | Tipo          | Restricoes                          |
|------------------------------|---------------|-------------------------------------|
| id                           | UUID          | PK, auto-gerado                     |
| email                        | EmailField    | Unico, indexado, campo de login      |
| username                     | CharField     | Unico                               |
| first_name                   | CharField     | Obrigatorio no registro              |
| last_name                    | CharField     | Obrigatorio no registro              |
| bio                          | TextField     | Opcional, default ""                 |
| is_verified                  | BooleanField  | Default False                        |
| verification_token           | CharField     | Token de verificacao de email        |
| verification_token_expires_at| DateTimeField | Expiracao do token (24h)             |
| plan                         | CharField     | "free" ou "pro", default "free"      |
| image_generation_count       | PositiveInt   | Contador mensal de geracoes          |
| last_reset_date              | DateField     | Data do ultimo reset do contador     |
| profile_picture              | CharField     | URL do avatar                        |
| cover_picture                | CharField     | URL da capa                          |
| preferences                  | JSONField     | Preferencias do usuario              |
| social_media_links           | JSONField     | Links de redes sociais               |
| created_at                   | DateTimeField | Auto                                 |
| updated_at                   | DateTimeField | Auto                                 |

**Autenticacao**: USERNAME_FIELD = 'email', login por email + senha.

### 3.2 Image (api.Image)

| Campo            | Tipo           | Restricoes                                   |
|------------------|----------------|----------------------------------------------|
| id               | BigAutoField   | PK                                            |
| user             | FK(User)       | CASCADE, related_name='images'                |
| prompt           | TextField      | Texto do prompt                               |
| negative_prompt  | TextField      | Opcional                                      |
| aspect_ratio     | CharField      | Choices: 1:1, 16:9, 4:3, 9:16, 3:2           |
| seed             | BigIntegerField| Opcional                                      |
| image            | ImageField     | Upload para users/{user_id}/images/{uuid}.png |
| status           | CharField      | GENERATING, READY, FAILED                     |
| is_public        | BooleanField   | Default False                                 |
| download_count   | PositiveInt    | Default 0                                     |
| relevance_score  | FloatField     | Default 0.0, calculado automaticamente        |
| featured         | BooleanField   | Default False (curadoria manual)               |
| retry_count      | PositiveInt    | Tentativas de geracao                          |
| tags             | M2M(ImageTag)  | Tags atribuidas                                |
| created_at       | DateTimeField  | Auto                                           |

**Status Flow**: GENERATING -> READY | FAILED

### 3.3 ImageLike

| Campo      | Tipo          | Restricoes                        |
|------------|---------------|-----------------------------------|
| id         | BigAutoField  | PK                                 |
| image      | FK(Image)     | CASCADE                            |
| user       | FK(User)      | CASCADE                            |
| created_at | DateTimeField | Auto                               |

**Constraint**: UniqueConstraint(image, user) - um like por usuario por imagem.

### 3.4 ImageComment

| Campo      | Tipo           | Restricoes                        |
|------------|----------------|-----------------------------------|
| id         | BigAutoField   | PK                                 |
| image      | FK(Image)      | CASCADE                            |
| user       | FK(User)       | CASCADE                            |
| parent     | FK(self)       | CASCADE, null=True (para replies)  |
| text       | TextField      | Obrigatorio                        |
| created_at | DateTimeField  | Auto                               |
| updated_at | DateTimeField  | Auto                               |

**Regra**: Replies so em comentarios top-level (parent.parent deve ser null).

### 3.5 CommentLike

| Campo      | Tipo           | Restricoes                        |
|------------|----------------|-----------------------------------|
| id         | BigAutoField   | PK                                 |
| comment    | FK(Comment)    | CASCADE                            |
| user       | FK(User)       | CASCADE                            |
| created_at | DateTimeField  | Auto                               |

**Constraint**: UniqueConstraint(comment, user).

### 3.6 ImageTag

| Campo      | Tipo          | Restricoes              |
|------------|---------------|-------------------------|
| name       | CharField(64) | Unico                   |
| created_at | DateTimeField | Auto                    |

### 3.7 ImageEmbedding

| Campo                  | Tipo          | Restricoes                                |
|------------------------|---------------|-------------------------------------------|
| image                  | OneToOne(Image)| PK, CASCADE                              |
| prompt_text            | TextField     | Texto original do prompt                   |
| prompt_embedding_json  | JSONField     | Vetor 384-dim (MiniLM-L6-v2)              |
| image_embedding_json   | JSONField     | Vetor 768-dim (BLIP ViT-B/16)             |
| created_at             | DateTimeField | Auto                                       |
| updated_at             | DateTimeField | Auto                                       |

### 3.8 PasswordResetToken

| Campo      | Tipo          | Restricoes                        |
|------------|---------------|-----------------------------------|
| id         | BigAutoField  | PK                                 |
| user       | FK(User)      | CASCADE                            |
| token      | UUIDField     | Unico, auto-gerado                 |
| created_at | DateTimeField | Auto                               |
| expires_at | DateTimeField | 24h apos criacao                   |
| is_used    | BooleanField  | Default False                      |

---

## 4. API REST - Endpoints

### 4.1 Autenticacao (`/api/auth/`)

| Metodo | Endpoint                         | Permissao  | Descricao                     | Throttle            |
|--------|----------------------------------|------------|-------------------------------|---------------------|
| POST   | /api/auth/register/              | AllowAny   | Registro de usuario           | 5/hora              |
| POST   | /api/auth/login/                 | AllowAny   | Login (retorna JWT)           | 10/minuto           |
| POST   | /api/auth/token/refresh/         | AllowAny   | Refresh do access token       | -                   |
| GET    | /api/auth/verify-email/{token}/  | AllowAny   | Verificacao de email          | -                   |
| POST   | /api/auth/password/reset/request/| AllowAny   | Solicita reset de senha       | 5/hora              |
| POST   | /api/auth/password/reset/confirm/| AllowAny   | Confirma reset de senha       | 5/hora              |
| GET    | /api/auth/profile/               | Authenticated | Dados do perfil            | -                   |
| PUT    | /api/auth/profile/               | Authenticated | Atualiza perfil            | -                   |
| PATCH  | /api/auth/profile/               | Authenticated | Atualiza perfil parcial    | -                   |
| POST   | /api/auth/profile/avatar/        | Authenticated | Upload de avatar           | -                   |
| POST   | /api/auth/profile/cover/         | Authenticated | Upload de capa             | -                   |
| GET    | /api/auth/preferences/           | Authenticated | Obter preferencias         | -                   |
| PUT    | /api/auth/preferences/           | Authenticated | Atualizar preferencias     | -                   |

### 4.2 Geracao de Imagens (`/api/`)

| Metodo | Endpoint                         | Permissao     | Descricao                          | Throttle      |
|--------|----------------------------------|---------------|------------------------------------|---------------|
| POST   | /api/generate/                   | Authenticated | Gera imagem (async via Celery)     | Quota do plano|

**Request Body** (GenerateImagePayload):
```json
{
  "prompt": "string (obrigatorio)",
  "negative_prompt": "string (opcional)",
  "aspect_ratio": "1:1 | 16:9 | 4:3 | 9:16 | 3:2 (default: 1:1)",
  "seed": "integer >= 0 (opcional)"
}
```

**Response** (202 Accepted): ImageSerializer completo com status=GENERATING.

**Regras de negocio**:
- Verificacao atomica de quota (SELECT FOR UPDATE)
- Reset automatico do contador no primeiro dia de cada mes
- Quotas: free=20/mes, pro=50/mes
- Retorna 429 se quota excedida

### 4.3 Galeria e Colecao (`/api/`)

| Metodo | Endpoint                  | Permissao     | Descricao                   |
|--------|---------------------------|---------------|-----------------------------|
| GET    | /api/images/public/       | AllowAny      | Galeria publica (paginada)  |
| GET    | /api/images/my-images/    | Authenticated | Imagens do usuario          |
| GET    | /api/images/liked/        | Authenticated | Imagens curtidas            |

**Galeria publica**: ordenada por featured (desc), relevance_score (desc), created_at (desc).
Suporta busca por prompt via query param `?search=`.

### 4.4 Interacoes Sociais (`/api/`)

| Metodo | Endpoint                                    | Permissao     | Descricao            | Throttle   |
|--------|---------------------------------------------|---------------|----------------------|------------|
| POST   | /api/images/{id}/share/                     | Authenticated | Publica imagem       | -          |
| PATCH  | /api/images/{id}/share/                     | Authenticated | Toggle publico       | -          |
| POST   | /api/images/{id}/like/                      | Authenticated | Curtir imagem        | 60/hora    |
| DELETE | /api/images/{id}/like/                      | Authenticated | Descurtir imagem     | 60/hora    |
| GET    | /api/images/{id}/comments/                  | AllowAny      | Listar comentarios   | -          |
| POST   | /api/images/{id}/comments/                  | Authenticated | Criar comentario     | 30/hora    |
| DELETE | /api/images/{id}/comments/{comment_id}/     | Authenticated | Deletar comentario   | -          |
| POST   | /api/images/{id}/comments/{comment_id}/like/| Authenticated | Curtir comentario    | 60/hora    |
| DELETE | /api/images/{id}/comments/{comment_id}/like/| Authenticated | Descurtir comentario | 60/hora    |
| POST   | /api/images/{id}/download/                  | AllowAny      | Registra download    | 120/hora   |

**Regras de permissao**:
- Imagem deve ser publica OU pertencer ao usuario autenticado
- Comentarios podem ser deletados pelo autor, dono da imagem ou staff
- Replies so em comentarios top-level

### 4.5 Memoria Criativa (`/api/`)

| Metodo | Endpoint                          | Permissao     | Descricao                    |
|--------|-----------------------------------|---------------|------------------------------|
| GET    | /api/images/{id}/related/         | AllowAny      | Imagens similares (embeddings)|
| GET    | /api/users/me/style-suggestions/  | Authenticated | Sugestoes de estilo do usuario|

**Related Images**: retorna ate 12 imagens (max 20 via `?limit=`), ordenadas por similaridade
(image embedding > prompt embedding como fallback).

**Style Suggestions**: retorna ate 5 sugestoes (max 10 via `?limit=`) baseadas no historico
de prompts do usuario.

### 4.6 Assistente de Prompts (`/api/`)

| Metodo | Endpoint             | Permissao     | Descricao                      | Throttle   |
|--------|----------------------|---------------|--------------------------------|------------|
| POST   | /api/refine-prompt/  | Authenticated | Refina prompt via DeepSeek LLM | 100/hora   |

**Request Body**:
```json
{
  "description": "string (descricao casual em qualquer idioma)",
  "style": "photorealistic | anime | digital_art | oil_painting | watercolor | 3d_render | pixel_art | sketch"
}
```

**Response**:
```json
{
  "refined_prompt": "prompt otimizado em ingles",
  "negative_prompt": "elementos a evitar"
}
```

### 4.7 Token Verification (`/api/`)

| Metodo | Endpoint              | Permissao | Descricao          |
|--------|-----------------------|-----------|--------------------|
| POST   | /api/token/verify/    | AllowAny  | Verifica JWT valido|

---

## 5. Sistema de Planos e Quotas

| Plano | Geracoes/Mes | Preco    |
|-------|-------------|----------|
| free  | 20          | Gratuito |
| pro   | 50          | -        |

- Contador resetado no dia 1 de cada mes
- Verificacao atomica com lock de linha (race condition protegida)
- Retorna HTTP 429 com mensagem quando quota excedida

---

## 6. Sistema de Relevancia

Imagens publicas sao ranqueadas por `relevance_score`, calculado automaticamente
apos cada interacao (like, comment, download). O score considera:

- Quantidade de likes
- Quantidade de comentarios
- Quantidade de downloads
- Decaimento temporal
- Flag `featured` (curadoria manual tem prioridade no sort)

---

## 7. Autenticacao e Seguranca

### 7.1 JWT
- Access token: 60 minutos
- Refresh token: 1 dia
- Rotacao ativada (novo refresh a cada uso)
- Blacklist de tokens rotacionados

### 7.2 Email
- Verificacao obrigatoria antes do login
- Token de verificacao com expiracao de 24h
- Reset de senha com token UUID e expiracao de 24h
- Emails enviados via Celery (async)

### 7.3 Rate Limiting
- Anonimo: 200/dia
- Autenticado: 2000/dia
- Escopos especificos por acao (ver tabelas acima)

### 7.4 CORS
- Origins configuradas via variavel de ambiente
- Credentials permitidos

---

## 8. Frontend

### 8.1 Estrutura

```
frontend/src/
  app/          -> router.tsx, providers.tsx
  features/
    auth/       -> Login, Register, session management
    images/     -> Gallery, generation, image details
    wizard/     -> Multi-step generate form
  components/
    layout/     -> AppHeader, AppSidebar, AppLayout
    ui/         -> Button, Card, Input (reutilizaveis)
  hooks/        -> Custom React hooks
  lib/          -> API client (Axios), formatters, constants
  styles/       -> Global CSS, theme tokens
  pages/        -> Page-level components
```

### 8.2 Estado e Data Fetching
- **Zustand** para estado global (auth session)
- **TanStack React Query** para cache de dados do servidor
- **React Hook Form + Zod** para formularios com validacao
- **Axios** com interceptor automatico de refresh de token

### 8.3 Tema
- Sistema light/dark com tokens semanticos CSS
- Paleta sobria configurada via Tailwind CSS

---

## 9. O que DEVE estar no projeto (requisitos obrigatorios)

- [x] Geracao de imagens via IA com prompts de texto
- [x] Sistema de autenticacao completo (registro, login, verificacao de email, reset de senha)
- [x] Galeria publica com ranking de relevancia
- [x] Colecao pessoal de imagens
- [x] Interacoes sociais (like, comment, replies, download)
- [x] Sistema de planos com quotas mensais
- [x] Memoria Criativa (imagens relacionadas e sugestoes de estilo via embeddings)
- [x] Assistente de prompts (refinamento via LLM)
- [x] Tema light/dark
- [x] Containerizacao com Docker
- [x] Rate limiting por escopo
- [x] Paginacao em todas as listas
- [x] Busca por prompt na galeria publica
- [ ] **Spec-Driven Development (SDD)** - OpenAPI como contrato entre frontend e backend
- [ ] Tipos TypeScript gerados automaticamente a partir da spec OpenAPI
- [ ] Documentacao interativa da API (Swagger UI + Redoc)

---

## 10. O que NAO deve estar no projeto (fora de escopo)

- **Pagamento/billing**: nao ha integracao com gateways de pagamento (planos sao atribuidos manualmente)
- **Upload de imagens pelo usuario**: apenas imagens geradas pela IA sao suportadas (exceto avatar/capa)
- **Chat em tempo real**: nao ha WebSockets ou SSE; todas as interacoes sao REST
- **Moderacao automatica de conteudo**: nao ha filtro automatico de NSFW/toxicidade
- **Multiplos modelos de IA**: apenas FLUX.1-dev e suportado para geracao
- **API publica para terceiros**: a API e de uso interno do frontend apenas
- **Internacionalizacao (i18n)**: interface em portugues brasileiro, prompts em ingles
- **Notificacoes push**: nao ha sistema de notificacoes em tempo real
- **Edicao de imagens pos-geracao**: nao ha ferramentas de edicao (crop, filter, etc.)
- **Sistema de seguidores**: nao ha follow/unfollow entre usuarios
- **Feed personalizado**: galeria publica e igual para todos (sem algoritmo personalizado)
- **Admin dashboard customizado**: usa Django Admin padrao

---

## 11. Configuracao de Ambiente

### Variaveis de ambiente obrigatorias (.env)

| Variavel               | Descricao                                | Exemplo                     |
|------------------------|------------------------------------------|-----------------------------|
| SECRET_KEY             | Django secret key                        | (gerar aleatoriamente)      |
| DEBUG                  | Modo debug                               | True/False                  |
| DB_NAME                | Nome do banco PostgreSQL                 | imagine                     |
| DB_USER                | Usuario do banco                         | imagine                     |
| DB_PASSWORD            | Senha do banco                           | imagine                     |
| DB_HOST                | Host do banco                            | db                          |
| HF_TOKEN               | Token da Hugging Face                    | hf_...                      |
| DEEPSEEK_API_KEY       | Chave da API DeepSeek                    | sk-...                      |
| EMAIL_HOST_USER        | Email SMTP                               | user@gmail.com              |
| EMAIL_HOST_PASSWORD    | Senha/App password SMTP                  | (app password)              |
| FRONTEND_URL           | URL do frontend                          | http://localhost:5173        |
| CORS_ALLOWED_ORIGINS   | Origins permitidas                       | http://localhost:5173        |
| VITE_API_BASE_URL      | Base URL da API no frontend              | http://localhost:8000/api    |

---

## 12. Criterios de Aceitacao

### 12.1 Geracao de Imagem
- Usuario autenticado e verificado pode gerar imagem
- Imagem e criada com status GENERATING e transiciona para READY ou FAILED
- Quota e verificada atomicamente antes da geracao
- Seed reproduzivel: mesma seed + mesmo prompt = mesma imagem

### 12.2 Interacoes Sociais
- Like e idempotente (POST duplicado retorna 200, nao 201)
- Comentarios suportam replies em um nivel (sem aninhamento profundo)
- Download incrementa contador e recalcula relevancia
- Deletar comentario: autor, dono da imagem ou staff

### 12.3 Autenticacao
- Login so apos verificacao de email
- Reset de senha invalida tokens anteriores
- Tokens JWT rotacionados automaticamente

### 12.4 Performance
- Paginacao padrao: 20 itens por pagina
- Embeddings calculados de forma assincrona (Celery)
- Galeria publica usa annotations em vez de N+1 queries

### 12.5 Seguranca
- Rate limiting em todos os endpoints sensiveis
- Lock atomico na quota de geracao (previne race condition)
- Tokens de verificacao/reset expiram em 24h
- CORS restrito a origins configuradas

---

## 13. Spec-Driven Development (SDD)

### 13.1 Principio

A especificacao OpenAPI 3.0 e o **contrato unico** entre backend e frontend.
O backend gera a spec automaticamente a partir dos serializers Django REST Framework,
e o frontend gera tipos TypeScript automaticamente a partir dessa spec.

### 13.2 Fluxo

```
[Django Serializers] --> [drf-spectacular] --> [schema.yaml]
                                                    |
                                                    v
                                           [openapi-typescript]
                                                    |
                                                    v
                                          [tipos TypeScript gerados]
```

### 13.3 Regras
- Nenhum tipo de API deve ser definido manualmente no frontend
- Toda mudanca de contrato comeca no serializer Django
- A spec OpenAPI deve ser versionada no repositorio
- Swagger UI e Redoc devem estar disponiveis em desenvolvimento

---

*Documento mantido como parte do sistema SDD do ImagAIne.*
*Ultima atualizacao: 2026-04-12*
