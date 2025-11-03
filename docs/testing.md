# Testes Automatizados do ImagAIne

Este documento descreve a estrutura da suíte de testes do **ImagAIne**, as ferramentas utilizadas, o escopo atual e oportunidades de evolução.

## Tecnologias e Ferramentas
- **Django TestCase / APITestCase** – base de testes integrada ao Django; permite cenários de modelo e API com banco isolado.
- **DRF APIClient** – facilidades para enviar requisições HTTP (JSON, multipart) e validar respostas paginadas/autenticadas.
- **unittest.mock** – isolamento de integrações externas (Celery, Hugging Face, throttles) sem precisar de serviços reais.
- **Pillow (PIL)** – geração de arquivos de imagem em memória para validar upload/download.
- **Mixins utilitários** – `TemporaryMediaMixin` cria `MEDIA_ROOT` temporário garantindo que arquivos de teste sejam limpos ao final.

## Estrutura da Suíte

| Arquivo | Responsabilidade |
|---------|------------------|
| `backend/api/tests/test_views.py` | Exercita endpoints REST principais (feed público/privado, compartilhamento, curtidas, comentários, downloads, throttles sociais e geração). |
| `backend/api/tests/test_tasks.py` | Valida a tarefa assíncrona de geração (persistência de arquivos, retries, logs). |
| `backend/authentication/tests/test_views.py` | Cobertura de cadastro/login/reset, verificação de e-mail e throttles de autenticação. |
| `backend/tests/mixins.py` | Suporte para testes que manipulam mídia (criação/limpeza de diretórios temporários). |
| `backend/tests/utils.py` | Helpers de criação de usuários e captura de logs. |

## Cobertura Atual
- **Feed público/privado**: metadados sociais (`like_count`, `comment_count`, `download_count`, `is_liked`, `relevance_score`) e filtros de permissão para anônimos e autenticados.
- **Ranking e relevância**: ordenação por `featured`/`relevance_score`, boosts temporários, resets após interações.
- **Compartilhamento**: publicar/remover visibilidade e garantir boost inicial.
- **Curtidas**: criação idempotente, remoção, bloqueio para imagens privadas e throttling `social_like`.
- **Comentários**: listagem paginada (pública), criação/autorização, exclusão (autor/dono/staff), throttling `social_comment`.
- **Downloads**: contagem, restrições por status/arquivo, proteção a imagens privadas e throttling `social_download`.
- **Geração de imagens**: quotas por plano (`PLAN_QUOTAS`), reset diário, placeholder, chamada Celery e respostas 429.
- **Tarefas assíncronas**: salvamento de arquivos, limpeza em caso de falha, reset de `retry_count`.
- **Autenticação**: cadastro, login, reset de senha, verificação de e-mail, tokens expirados e throttling (`auth_register`, `auth_login`, `auth_password_reset`).

## Objetivos dos Testes
1. **Segurança e permissões** – impedir acesso indevido a recursos privados.
2. **Confiabilidade da API** – detectar regressões em endpoints críticos (feed social, geração, downloads).
3. **Qualidade da experiência** – garantir consistência dos contadores sociais e respostas amigáveis (incluindo throttling).
4. **Resiliência de integrações** – validar comportamentos com dependências externas simuladas (Celery, Hugging Face).

## Pontos Fortes
- Cobertura end-to-end com cenários positivos e negativos (incluindo limites de taxa).
- Isolamento de serviços externos via mocks, permitindo execução local rápida.
- Testes determinísticos para mídia usando diretórios temporários.
- Docstrings detalham o comportamento esperado, facilitando manutenção.

## Como Executar
Na raiz do backend:

```bash
python manage.py test
# apenas API:
python manage.py test api.tests.test_views
# apenas autenticação:
python manage.py test authentication.tests.test_views
```

Requisitos: virtualenv ativo e dependências instaladas (`pip install -r requirements.txt`).

## Próximos Passos Sugeridos
- Cobrir cenários de regeneração/reenvio de token de verificação de e-mail.
- Medir cobertura com `coverage.py` e integrar relatórios ao pipeline CI.
- Explorar testes de concorrência (ex.: downloads simultâneos) usando transações ou locks.

Manter a suíte atualizada e em execução contínua é essencial para evoluir o feed social do ImagAIne com segurança.
