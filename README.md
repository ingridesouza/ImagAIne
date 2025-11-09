# ImagAIne

Plataforma backend para geracao, gerenciamento e compartilhamento de imagens criadas por IA. O sistema oferece APIs REST para cadastro de usuarios, autenticacao via JWT, fila de geracao com Celery e armazenamento local dos resultados.

## Visao geral
- API escrita em Django 5 e Django REST Framework.
- Modelo de usuario proprio com login por e-mail, verificacao e redefinicao de senha.
- Gatilho de geracao assincrona com Celery + Redis e modelo `black-forest-labs/FLUX.1-dev` via Hugging Face.
- Banco de dados PostgreSQL 16 e armazenamento em disco para as imagens geradas.
- Execucao orquestrada com Docker Compose (servicos `web`, `worker`, `db`, `redis`).

## Arquitetura
```
docker-compose.yml
|- web      # Django + DRF servindo a API em 0.0.0.0:8000
|- worker   # Celery consumidor da fila de geracao
|- db       # PostgreSQL com dados persistidos no volume pgdata
|- redis    # Broker de mensagens para Celery
```

Componentes principais:
- `backend/imagAine`: configuracoes do projeto Django (settings, urls, celery).
- `backend/authentication`: endpoints de cadastro, login, verificacao de email, reset de senha e perfil.
- `backend/api`: endpoints de geracao de imagens, galeria publica, acervo do usuario e compartilhamento.
- `backend/media`: armazenamento fisico das imagens processadas (montado como volume quando executado via Docker).
- `scripts/`: utilitarios como criacao de superusuario e testes rapidos da API.

## Fluxo de geracao de imagem
1. `POST /api/generate/` (autenticado) grava o prompt e parametros opcionais (`negative_prompt`, `aspect_ratio`, `seed`) e cria um registro `Image` marcado como `GENERATING`.
2. A view dispara `generate_image_task.delay(image.id)` para a fila Celery.
3. O worker Celery busca o prompt, chama a API `text_to_image` da Hugging Face utilizando o token `HF_TOKEN`.
4. A imagem gerada e salva em `MEDIA_ROOT` e o campo `image_url` do modelo e atualizado com `/media/<arquivo>.png`.
5. Clientes podem consultar andamento com `GET /api/images/my-images/` ou `GET /api/images/public/` caso a imagem tenha sido compartilhada.

## Stack
- Python 3.12
- Django 5.0 / Django REST Framework
- djangorestframework-simplejwt
- Celery 5 + Redis
- PostgreSQL 16
- Hugging Face Diffusers / transformers / accelerate / torch
- Frontend React 19 + Vite + TypeScript para o painel do usuário

## Como executar

### Requisitos
- Docker e Docker Compose
- Token Hugging Face com permissao de inferencia no modelo utilizado
- Pelo menos 8GB de RAM recomendados

### Configurar variaveis
Crie um arquivo `.env` na raiz (o projeto ja inclui um exemplo em uso). Principais variaveis:
```
SECRET_KEY=chave-secreta
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,web

DB_NAME=imagine
DB_USER=imagine
DB_PASSWORD=imagine
DB_HOST=db
DB_PORT=5432

CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@example.com
EMAIL_HOST_PASSWORD=senha-ou-app-password
DEFAULT_FROM_EMAIL=seu-email@example.com
FRONTEND_URL=http://localhost:5173

HF_TOKEN=seu-token-hf
```

### Subir os servicos
```bash
docker-compose up -d --build
```

Servicos publicados:
- API REST: `http://localhost:8000`
- Django Admin: `http://localhost:8000/admin`
- Frontend React (build de producao): `http://localhost:5173`

Para acompanhar logs:
```bash
docker-compose logs -f web
docker-compose logs -f worker
```

### Frontend React (desenvolvimento)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
O Vite roda em `http://localhost:5173` e precisa que `VITE_API_BASE_URL` aponte para `http://localhost:8000/api`.

### Criar superusuario (opcional)
```bash
docker-compose exec web python manage.py createsuperuser
# ou use scripts/create_superuser.py com variaveis DJANGO_SUPERUSER_*
```

## Endpoints principais

### Autenticacao (`backend/authentication`)
- `POST /api/auth/register/` - Cadastro com validacao de senha e envio de e-mail de verificacao.
- `POST /api/auth/login/` - Login por e-mail, retorna par de tokens JWT.
- `POST /api/auth/token/refresh/` - Atualiza token de acesso.
- `GET /api/auth/verify-email/<token>/` - Verifica e-mail enviado apos registro.
- `POST /api/auth/password/reset/request/` - Solicita redefinicao de senha.
- `POST /api/auth/password/reset/confirm/` - Define nova senha com token enviado por e-mail.
- `GET|PUT /api/auth/profile/` - Consulta ou atualiza dados basicos do usuario autenticado.

### Geracao e feed social (`backend/api`)
- `POST /api/generate/` - Cria tarefa de geracao a partir de um prompt e aceita parametros opcionais para reproducibilidade.
- `GET /api/images/my-images/` - Retorna imagens do usuario autenticado, com contadores (`like_count`, `comment_count`, `download_count`), flag `is_liked`, `relevance_score` e tags.
- `GET /api/images/public/` - Lista galeria publica ordenada por destaque/relevancia, permitindo filtro por `?search=<texto>`.
- `POST /api/images/<id>/share/` / `PATCH /api/images/<id>/share/` - Torna a imagem publica ou altera visibilidade, aplicando boost inicial no score ao publicar.
- `POST /api/images/<id>/like/` e `DELETE /api/images/<id>/like/` - Gerencia curtidas (autenticado, com throttling `social_like`).
- `GET /api/images/<id>/comments/` - Lista comentarios (anonimos podem consultar imagens publicas).
- `POST /api/images/<id>/comments/` - Cria comentario (autenticado, sujeito ao throttle `social_comment`).
- `DELETE /api/images/<id>/comments/<comment_id>/` - Remove comentario (autor, dono da imagem ou staff).
- `POST /api/images/<id>/download/` - Registra download, incrementa `download_count` e retorna URL absoluta (respeitando permissões e throttle `social_download`).

> Observacao: endpoints antigos `/api/token/` e `/api/register/` sao mantidos para compatibilidade, mas recomenda-se utilizar os caminhos sob `/api/auth/`.

#### Parametros de `POST /api/generate/`
| Campo             | Obrigatorio | Descricao                                                                                           |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `prompt`          | Sim         | Texto principal que descreve a cena desejada.                                                        |
| `negative_prompt` | Nao         | Termos a evitar (ex.: 'blurry, text').                                                              |
| `aspect_ratio`    | Nao         | Proporcao da imagem. Valores aceitos: `1:1`, `16:9`, `4:3`, `9:16`, `3:2`. Padrão: `1:1`.           |
| `seed`            | Nao         | Numero inteiro para reproducibilidade. Quando vazio, usa seed aleatoria.                            |

As respostas incluem os mesmos campos, alem de `status`, `is_public` e `image_url`. As dimensoes geradas variam conforme o `aspect_ratio`.

## Scripts utilitarios
- `scripts/create_superuser.py`: usa variaveis `DJANGO_SUPERUSER_*` do `.env` para criar um admin sem prompt.
- `scripts/test_api.py`: fluxo basico de autenticacao + chamada de geracao; ajuste o endpoint `BASE_URL` antes de executar.

## Desenvolvimento local sem Docker
```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
export DJANGO_SETTINGS_MODULE=imagAine.settings
python backend/manage.py migrate
python backend/manage.py runserver
celery -A imagAine.celery worker -l info  # em terminal separado
```
Certifique-se de ter Redis e PostgreSQL acessiveis localmente ou ajuste as variaveis para usar SQLite (apenas para desenvolvimento rapido).

## Estrategia de logs e monitoramento
- Logs de geracao sao registrados via `logging` no modulo `backend/api/tasks.py`.
- Configure a variavel `DJANGO_LOG_LEVEL` (opcional) ou adapte o dicionario `LOGGING` em `settings.py`.
- Pastas `logs/nginx` e `logs/postgres` permanecem reservadas para configuracoes futuras de observabilidade.

## Planos, relevancia e limites
- Usuarios possuem um campo `plan` (`free`, `pro`, etc.) e um contador diario (`image_generation_count`).
- Limites padrao: plano `free` pode gerar ate 5 imagens por dia; plano `pro`, 10. Valores podem ser ajustados em `backend/imagAine/settings.py` (`PLAN_QUOTAS`).
- O contador e resetado automaticamente na primeira geracao de cada dia.
- A galeria publica utiliza `relevance_score` (likes, comentarios, downloads, tags, decaimento temporal e boost de `featured`). Scores podem ser recalculados em lote via task `recalculate_relevance_scores`.
- Ao atingir cota ou limites de throttling a API retorna HTTP `429 Too Many Requests` com sugestao de espera.
- Throttles configurados em `REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]`:
  - `auth_register`, `auth_login`, `auth_password_reset` para endpoints sensiveis de autenticacao.
  - `social_like`, `social_comment`, `social_download` para interacoes no feed social.
- Para promover um usuario ao plano `pro`, altere o campo `plan` pelo Django Admin (`/admin/authentication/user/`) ou via script de manutencao.

## Testes recomendados
- Endpoints de autenticacao e verificacao de e-mail (incluindo tentativas repetidas para observar respostas 429/400).
- Fluxo completo: registro -> verificacao -> login -> `POST /api/generate/` -> validar limites diarios e resposta 429.
- Interacoes sociais: curtir, comentar e baixar imagens publicas para conferir contadores, ordenacao por relevancia e limites `social_*`.
- Validar que o worker Celery cria arquivos em `backend/media/`, atualiza `image_url`, reseta `retry_count` e que `POST /api/images/<id>/download/` incrementa `download_count`.

## Licenca
Distribuido sob licenca MIT. Consulte `LICENSE` para detalhes.
