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
1. `POST /api/generate/` (autenticado) grava o prompt e cria um registro `Image` marcado como `GENERATING`.
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
FRONTEND_URL=http://localhost:3000

HF_TOKEN=seu-token-hf
```

### Subir os servicos
```bash
docker-compose up -d --build
```

Servicos publicados:
- API REST: `http://localhost:8000`
- Django Admin: `http://localhost:8000/admin`

Para acompanhar logs:
```bash
docker-compose logs -f web
docker-compose logs -f worker
```

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

### Geracao de imagens (`backend/api`)
- `POST /api/generate/` - Cria tarefa de geracao a partir de um prompt.
- `GET /api/images/my-images/` - Retorna imagens do usuario autenticado.
- `GET /api/images/public/` - Lista galeria publica com filtro por `?search=<texto>`.
- `POST /api/images/<id>/share/` - Torna a imagem publica.
- `PATCH /api/images/<id>/share/` - Atualiza a visibilidade (`{"is_public": false}` para remover da galeria publica).

> Observacao: endpoints antigos `/api/token/` e `/api/register/` sao mantidos para compatibilidade, mas recomenda-se utilizar os caminhos sob `/api/auth/`.

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

## Testes recomendados
- Endpoints de autenticacao e verificacao de e-mail usando ferramentas como Insomnia ou Postman.
- Fluxo completo: registro -> verificacao -> login -> `POST /api/generate/`.
- Validar que o worker Celery cria arquivos em `backend/media/` e atualiza o campo `image_url`.

## Licenca
Distribuido sob licenca MIT. Consulte `LICENSE` para detalhes.
