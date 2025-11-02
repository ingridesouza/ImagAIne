# Testes Automatizados do ImagAIne

Este documento resume como a suíte de testes do **ImagAIne** está estruturada, quais tecnologias utiliza, o que já está coberto e os principais benefícios que ela oferece.

## Tecnologias e Ferramentas
- **Django TestCase / APITestCase** – Base do framework de testes integrada ao Django para cenários de modelo e API.
- **Django REST Framework (DRF) test client** – Facilidade para exercitar endpoints REST com autenticação JWT, payloads JSON e checagem de respostas paginadas.
- **unittest.mock** – Isolamento de dependências externas (ex.: fila de geração assíncrona e clientes de inferência) sem tocar serviços reais.
- **Pillow (PIL)** – Utilizada em testes de tarefas para gerar imagens sintéticas em memória.
- **Mixins utilitários** – `TemporaryMediaMixin` cria um `MEDIA_ROOT` temporário, garantindo limpeza de arquivos criados durante os testes.

## Estrutura da Suíte

| Arquivo | Responsabilidade |
|---------|------------------|
| `backend/api/tests/test_views.py` | Exercita endpoints REST principais (feed público/privado, compartilhamento, curtidas, comentários, downloads e geração via API). |
| `backend/api/tests/test_tasks.py` | Valida a tarefa assíncrona de geração de imagens, cobrindo persistência de arquivos, tratamento de erros e contagem de tentativas. |
| `backend/tests/mixins.py` | Infra de suporte para testes que interagem com o sistema de arquivos. |
| `backend/tests/utils.py` | Helpers para criação de usuários e captura de logs durante os testes. |

## Cobertura Atual
- **Feed público e privado**: assegura que endpoints retornem metadados de engajamento (`like_count`, `comment_count`, `download_count`, `is_liked`) e que filtros de permissão funcionem para usuários autenticados e anônimos.
- **Ranking e relevância**: valida que o feed ordena itens considerando `featured`, pontuação de relevância e boosts temporários sem quebrar o fallback cronológico.
- **Compartilhamento de imagens**: confirma que donos podem publicar e alterar visibilidade de suas imagens.
- **Curtidas**: cobre criação idempotente, remoção, limites de permissão (imagens privadas) e respostas retornadas.
- **Comentários**: inclui listagem pública paginada, criação autenticada, políticas de remoção (autor, dono da imagem, staff) e bloqueios para terceiros ou anônimos em recursos privados.
- **Downloads**: verifica incremento de contador, checagem de disponibilidade (status `READY`, arquivo existente) e restrições para imagens privadas.
- **Geração de imagens (API)**: garante quotas diárias, reinicialização de contadores e enfileiramento de tarefas.
- **Tarefas assíncronas**: confirma que o worker salva imagens corretas, reseta `retry_count`, limpa arquivos em caso de falha e registra logs de erro.

## Objetivos dos Testes
1. **Segurança e permissões** – Garantir que apenas usuários autorizados consigam interagir com recursos privados.
2. **Confiabilidade da API** – Detectar regressões ao expandir o feed social, evitando que campos obrigatórios faltem ou mudem de forma inesperada.
3. **Qualidade da experiência do usuário** – Manter métricas de engajamento (likes, comentários, downloads) coerentes com as ações realizadas.
4. **Estabilidade de integrações** – Assegurar que a geração de imagens lide corretamente com falhas externas sem deixar resíduos.

## Pontos Fortes
- **Cobertura end-to-end da API**: exercita desde autenticação até respostas paginadas, incluindo caminhos felizes e cenários de erro.
- **Isolamento das dependências externas**: uso extensivo de mocks permite rodar a suíte sem serviços de terceiros nem workers de background reais.
- **Testes determinísticos para mídia**: `TemporaryMediaMixin` impede que artefatos de arquivos se acumulem entre execuções ou vazem para o ambiente real.
- **Documentação em código**: cada teste descreve claramente o comportamento esperado por meio de docstrings em português.

## Como Executar
Na raiz do backend:

```bash
python manage.py test
# ou para rodar apenas uma parte:
python manage.py test api.tests.test_views
```

Antes de rodar, é recomendável garantir que o virtualenv esteja ativo e que dependências de desenvolvimento estejam instaladas (`pip install -r requirements.txt`).

## Próximos Passos Sugeridos
- Adicionar cobertura para limites de *throttling* nas interações sociais, garantindo proteção contra abuso.
- Medir cobertura com `coverage.py` e integrar relatórios a uma pipeline CI.
- Considerar cenários de concorrência (ex.: múltiplos downloads simultâneos) usando transações ou locks.

Manter a suíte atualizada e em execução contínua é essencial para evoluir o feed social do ImagAIne com segurança.
