# ImagAIne - Gestao de Projeto

> Planejamento completo de sprints, tasks, entregaveis e criterios de aceitacao.
> Este documento e o backlog vivo do projeto. Cada task tem definicao de pronto,
> dependencias e validacoes.

---

## 0. Convencoes

### Prioridade
- **P0** — Bloqueante. Sem isso, nada funciona.
- **P1** — Essencial. Feature core do produto.
- **P2** — Importante. Melhora significativa.
- **P3** — Desejavel. Nice-to-have.

### Status
- `backlog` — Planejado, nao iniciado
- `doing` — Em desenvolvimento
- `review` — Em code review / QA
- `done` — Entregue, validado, mergeado

### Definicao de Pronto (DoD) Global
Toda task so e `done` quando:
- [ ] Codigo commitado na branch da sprint
- [ ] Sem erros de lint (`npm run lint` + `python manage.py check`)
- [ ] Spec OpenAPI atualizada (`./scripts/sync-api-types.sh`)
- [ ] Tipos TypeScript regenerados (`schema.d.ts` atualizado)
- [ ] Funciona em docker compose (build + up sem erros)
- [ ] Testado manualmente no navegador (happy path + edge case)
- [ ] Estilo segue "Quiet Glow" (ver docs/UI-UX.md secao 0)

---

## 1. FASE 1 — Fundacao (COMPLETA)

> Status: **DONE**
> Tudo abaixo ja esta implementado e funcionando.

| #    | Task                                       | Status |
|------|--------------------------------------------|--------|
| F1.1 | Backend Django + DRF                       | done   |
| F1.2 | Frontend React + TypeScript + Vite         | done   |
| F1.3 | Autenticacao JWT (register, login, verify) | done   |
| F1.4 | Geracao de imagem com FLUX.1-dev           | done   |
| F1.5 | Celery + Redis (tarefas assincronas)       | done   |
| F1.6 | Galeria publica com ranking de relevancia  | done   |
| F1.7 | Colecao pessoal (My Images)                | done   |
| F1.8 | Interacoes sociais (like, comment, reply)  | done   |
| F1.9 | Sistema de planos e quotas                 | done   |
| F1.10| Memoria Criativa (embeddings + pgvector)   | done   |
| F1.11| Assistente de Prompts (DeepSeek LLM)       | done   |
| F1.12| Tema light/dark com tokens semanticos      | done   |
| F1.13| Docker Compose (5 servicos)                | done   |
| F1.14| SDD - OpenAPI + drf-spectacular            | done   |
| F1.15| Tipos TypeScript gerados (openapi-typescript)| done |
| F1.16| Documentacao (SPEC, SDD, VISION, UI-UX)   | done   |

---

## 2. FASE 2 — Sprint 1: Estabilizacao e Gaps

> Objetivo: Fechar os buracos entre frontend e backend antes de adicionar features novas.
> Duracao estimada: 1 sprint
> Pre-requisito: Fase 1 completa

---

### S1-T01: Pagina de Verificacao de Email
**Prioridade**: P1
**Tipo**: Frontend
**Rota**: `/verify-email/:token`

**Descricao**: Criar pagina que recebe o token da URL, chama o backend e mostra
resultado (sucesso ou token invalido/expirado).

**Entregaveis**:
- [ ] Componente `VerifyEmailPage` em `pages/auth/`
- [ ] Rota registrada no router como rota publica
- [ ] Estado de loading enquanto valida
- [ ] Mensagem de sucesso com link para login
- [ ] Mensagem de erro para token invalido/expirado
- [ ] Estilo Quiet Glow (mesmo container da AuthLayout)

**Backend**: Ja existe (`GET /api/auth/verify-email/{token}/`)
**Validacao**:
- [ ] Token valido: mostra "Email verificado! Faca login."
- [ ] Token expirado: mostra "Token invalido ou expirado."
- [ ] Token inexistente: mostra erro generico

---

### S1-T02: Pagina de Reset de Senha
**Prioridade**: P1
**Tipo**: Frontend
**Rota**: `/reset-password/:token`

**Descricao**: Formulario para definir nova senha usando o token recebido por email.

**Entregaveis**:
- [ ] Componente `ResetPasswordPage` em `pages/auth/`
- [ ] Rota registrada como rota publica
- [ ] Formulario: nova senha + confirmacao (Zod validation, min 8 chars)
- [ ] Botao "Redefinir Senha"
- [ ] Mensagem de sucesso + link para login
- [ ] Mensagem de erro para token invalido

**Backend**: Ja existe (`POST /api/auth/password/reset/confirm/`)
**Validacao**:
- [ ] Senhas diferentes: erro inline
- [ ] Senha curta: erro inline
- [ ] Token expirado: erro do backend exibido
- [ ] Sucesso: redirect para login apos 3 segundos

---

### S1-T03: Pagina de Solicitar Reset de Senha
**Prioridade**: P1
**Tipo**: Frontend
**Rota**: `/forgot-password`

**Descricao**: Formulario simples com campo de email para solicitar reset.

**Entregaveis**:
- [ ] Componente `ForgotPasswordPage` em `pages/auth/`
- [ ] Rota registrada como rota publica
- [ ] Campo de email + botao "Enviar link"
- [ ] Mensagem generica de sucesso (nao revela se email existe)
- [ ] Link para voltar ao login

**Backend**: Ja existe (`POST /api/auth/password/reset/request/`)
**Validacao**:
- [ ] Email invalido: erro inline
- [ ] Qualquer email: mostra mesma mensagem de sucesso (seguranca)

---

### S1-T04: Endpoint de Trocar Senha (logado)
**Prioridade**: P2
**Tipo**: Backend + Frontend

**Descricao**: Permitir que usuario autenticado troque a senha sem token de reset.

**Entregaveis Backend**:
- [ ] `ChangePasswordSerializer` (current_password, new_password, new_password_confirm)
- [ ] `ChangePasswordView` em `POST /api/auth/password/change/`
- [ ] Valida senha atual antes de trocar
- [ ] Anotado com `@extend_schema` (tag: Auth)
- [ ] Teste unitario

**Entregaveis Frontend**:
- [ ] Modal ou secao na SettingsPage
- [ ] Formulario: senha atual + nova senha + confirmacao
- [ ] Feedback de sucesso/erro

**Validacao**:
- [ ] Senha atual errada: erro 400
- [ ] Senhas novas diferentes: erro inline
- [ ] Sucesso: toast + limpa formulario

---

### S1-T05: Endpoint de Deletar Conta
**Prioridade**: P2
**Tipo**: Backend + Frontend

**Descricao**: Permitir que usuario delete sua propria conta.

**Entregaveis Backend**:
- [ ] `DeleteAccountView` em `DELETE /api/auth/account/`
- [ ] Requer confirmacao com senha no body
- [ ] Deleta usuario e todas as imagens (CASCADE)
- [ ] Anotado com `@extend_schema` (tag: Auth)
- [ ] Teste unitario

**Entregaveis Frontend**:
- [ ] Dialog de confirmacao na SettingsPage (zona de perigo)
- [ ] Input de senha para confirmar
- [ ] Texto: "Esta acao e irreversivel. Todas as suas imagens serao deletadas."
- [ ] Botao vermelho "Deletar minha conta"
- [ ] Apos sucesso: logout + redirect para login

**Validacao**:
- [ ] Senha errada: erro, conta intacta
- [ ] Senha certa: conta deletada, imagens deletadas, logout
- [ ] Tentativa de login apos deletar: "credenciais invalidas"

---

### S1-T06: Secao de Imagens Relacionadas no ImageDetailsDialog
**Prioridade**: P2
**Tipo**: Frontend

**Descricao**: Mostrar imagens similares dentro do dialog de detalhes.

**Entregaveis**:
- [ ] Secao "Imagens relacionadas" no rodape do ImageDetailsDialog
- [ ] Grid horizontal scrollavel com ate 6 thumbnails
- [ ] Cada thumbnail clicavel (abre o dialog daquela imagem)
- [ ] Loading state (skeleton)
- [ ] Empty state: nao mostrar secao se nao houver relacionadas

**Backend**: Ja existe (`GET /api/images/{id}/related/`)
**Validacao**:
- [ ] Imagem com embeddings: mostra relacionadas
- [ ] Imagem sem embeddings: secao oculta
- [ ] Click em relacionada: abre dialog dela

---

### S1-T07: Widget de Sugestoes de Estilo no Dashboard
**Prioridade**: P3
**Tipo**: Frontend

**Descricao**: Mostrar sugestoes de estilo no dashboard baseadas no historico.

**Entregaveis**:
- [ ] Componente `StyleSuggestions` no DashboardPage
- [ ] Cards com label + example_prompt + confidence
- [ ] Click em sugestao: navega para `/generate` com prompt preenchido
- [ ] Loading state
- [ ] Empty state: "Gere mais imagens para receber sugestoes"

**Backend**: Ja existe (`GET /api/users/me/style-suggestions/`)
**Validacao**:
- [ ] Usuario com 5+ imagens: mostra sugestoes
- [ ] Usuario novo: mostra empty state

---

### S1-T08: Filtro por Tag nos Endpoints de Listagem
**Prioridade**: P2
**Tipo**: Backend

**Descricao**: Adicionar filtro `?tag=` nos endpoints de listagem de imagens.

**Entregaveis**:
- [ ] Query param `tag` em `PublicImageListView`
- [ ] Query param `tag` em `UserImageListView`
- [ ] Filtra por `tags__name` (case insensitive)
- [ ] Anotado com `@extend_schema` (OpenApiParameter)
- [ ] Testes unitarios

**Validacao**:
- [ ] `?tag=cyberpunk`: retorna so imagens com essa tag
- [ ] `?tag=inexistente`: retorna lista vazia
- [ ] Combinavel com `?search=`: ambos filtros aplicados

---

### S1-T09: Busca Global
**Prioridade**: P3
**Tipo**: Backend + Frontend

**Descricao**: O header tem busca global (⌘K) que hoje nao funciona. Implementar.

**Entregaveis Backend**:
- [ ] `GET /api/search/?q=` — busca em prompts de imagens publicas
- [ ] Retorna imagens paginadas
- [ ] Anotado com `@extend_schema`

**Entregaveis Frontend**:
- [ ] Conectar campo de busca do header ao endpoint
- [ ] Dropdown de resultados ao digitar (debounce 400ms)
- [ ] Click em resultado: abre ImageDetailsDialog ou navega
- [ ] Atalho ⌘K foca o input

**Validacao**:
- [ ] Digitar "cat": resultados aparecem em <500ms
- [ ] Nenhum resultado: "Nenhuma imagem encontrada"
- [ ] ⌘K: foca o input de qualquer pagina

---

### Entregaveis da Sprint 1

| Artefato | Validacao |
|----------|-----------|
| 3 paginas de auth novas (verify, reset, forgot) | Fluxo completo: register -> email -> verify -> login |
| 2 endpoints novos (change password, delete account) | Spec OpenAPI atualizada, tipos regenerados |
| Imagens relacionadas no dialog | Visible quando ha dados |
| Sugestoes de estilo no dashboard | Visible quando ha historico |
| Filtro por tag | Funciona em public + my-images |
| Busca global | ⌘K funciona de qualquer pagina |

---

## 3. FASE 2 — Sprint 2: Upgrade de Modelos de IA

> Objetivo: Trocar FLUX.1-dev por FLUX.2 e DeepSeek por LLM melhor.
> Duracao estimada: 1 sprint
> Pre-requisito: Sprint 1 completa

---

### S2-T01: Upgrade FLUX.1-dev para FLUX.2-dev
**Prioridade**: P0
**Tipo**: Backend

**Descricao**: Substituir o modelo de geracao por FLUX.2-dev.

**Entregaveis**:
- [ ] Atualizar `diffusers` no requirements.txt
- [ ] Alterar pipeline em `tasks.py` para usar `black-forest-labs/FLUX.2-dev`
- [ ] Ajustar parametros de geracao (resolucao ate 4MP, tipografia)
- [ ] Manter backward compatibility com imagens ja geradas
- [ ] Atualizar `HF_TOKEN` se necessario
- [ ] Testar geracao end-to-end no Docker

**Validacao**:
- [ ] `POST /api/generate/` gera imagem com FLUX.2-dev
- [ ] Resolucao visivelmente superior ao FLUX.1-dev
- [ ] Imagens antigas continuam acessiveis
- [ ] Tempo de geracao aceitavel (< 30s com GPU, < 120s CPU)

---

### S2-T02: Adicionar FLUX.2-klein para Drafts Rapidos
**Prioridade**: P1
**Tipo**: Backend

**Descricao**: Integrar FLUX.2-klein-4B como modelo de preview rapido.

**Entregaveis**:
- [ ] Nova task Celery `generate_draft_task` usando FLUX.2-klein
- [ ] Endpoint `POST /api/generate/draft/` — gera preview rapido
- [ ] Retorna imagem em resolucao menor (512px)
- [ ] Campo `is_draft: bool` no modelo Image (nao aparece em galerias)
- [ ] Serializer e schema atualizados
- [ ] Migration para novo campo

**Validacao**:
- [ ] Draft gera em < 5s (GPU) / < 30s (CPU)
- [ ] Draft nao aparece na galeria publica
- [ ] Draft pode ser promovido a imagem final via geracao completa

---

### S2-T03: Trocar DeepSeek por LLM Superior
**Prioridade**: P1
**Tipo**: Backend

**Descricao**: Substituir DeepSeek Chat pelo Gemini 2.5 Flash (ou Llama 4).

**Entregaveis**:
- [ ] Abstrai integracao LLM em `backend/api/llm.py` (provider pattern)
- [ ] Implementar provider Gemini (google-generativeai SDK)
- [ ] Manter provider DeepSeek como fallback
- [ ] Config via `.env`: `LLM_PROVIDER=gemini|deepseek`
- [ ] Atualizar `RefinePromptView` para usar abstração
- [ ] Testar qualidade de prompt refinado

**Validacao**:
- [ ] `POST /api/refine-prompt/` funciona com Gemini
- [ ] Fallback para DeepSeek se Gemini falhar
- [ ] Qualidade do prompt: mais descritivo, melhor ingles
- [ ] Tempo de resposta < 5s

---

### S2-T04: Configuracao Multi-Modelo no Frontend
**Prioridade**: P2
**Tipo**: Frontend

**Descricao**: A SettingsPage tem seletor de modelo que nao funciona. Conectar.

**Entregaveis**:
- [ ] Endpoint `GET /api/models/` lista modelos disponiveis
- [ ] SettingsPage carrega modelos do backend
- [ ] Preferencia de modelo salva nas preferences do usuario
- [ ] GenerateImagePage usa modelo preferido
- [ ] Badge no formulario mostrando modelo ativo

**Validacao**:
- [ ] Usuario seleciona modelo nas settings
- [ ] Proxima geracao usa o modelo selecionado
- [ ] Se modelo indisponivel: fallback para padrao

---

### Entregaveis da Sprint 2

| Artefato | Validacao |
|----------|-----------|
| FLUX.2-dev como modelo principal | Geracao funciona end-to-end |
| FLUX.2-klein para drafts | Preview rapido < 5s |
| LLM provider abstraction | Gemini funciona, DeepSeek como fallback |
| Seletor de modelo funcional | Preferencia persistida e respeitada |
| Spec OpenAPI atualizada | Novos endpoints documentados |

---

## 4. FASE 2 — Sprint 3: Image-to-Image e Variacoes

> Objetivo: Sair do txt2img puro. Permitir variacoes e edicao.
> Duracao estimada: 1 sprint
> Pre-requisito: Sprint 2 completa (FLUX.2 funcionando)

---

### S3-T01: Modelo de Dados para Image-to-Image
**Prioridade**: P0
**Tipo**: Backend

**Descricao**: Estender o modelo Image para suportar imagens derivadas.

**Entregaveis**:
- [ ] Campo `source_image = FK(Image, null=True)` — imagem de origem
- [ ] Campo `generation_type = CharField` — choices: txt2img, img2img, variation, upscale
- [ ] Campo `strength = FloatField(null=True)` — forca da transformacao (0.0-1.0)
- [ ] Migration
- [ ] Serializer atualizado com novos campos (read-only)
- [ ] Schema OpenAPI regenerado

**Validacao**:
- [ ] Imagens antigas: generation_type=txt2img, source_image=null
- [ ] Novos campos aparecem na API
- [ ] Migration roda sem erro

---

### S3-T02: Endpoint de Variacoes
**Prioridade**: P1
**Tipo**: Backend

**Descricao**: Gerar variacoes de uma imagem existente.

**Entregaveis**:
- [ ] `POST /api/images/{id}/variations/`
- [ ] Body: `{ count: 1-4, strength: 0.3-0.9 }`
- [ ] Usa img2img pipeline do diffusers com imagem original como base
- [ ] Cria N imagens derivadas (source_image = original)
- [ ] Respeita quota do usuario
- [ ] Task Celery para geracao async
- [ ] Serializer, schema, anotacoes OpenAPI

**Validacao**:
- [ ] 4 variacoes geradas com sucesso
- [ ] Variacoes sao visivelmente similares mas diferentes
- [ ] strength=0.3: muito similar ao original
- [ ] strength=0.9: muito diferente do original
- [ ] Quota decrementada corretamente

---

### S3-T03: Endpoint de Mudanca de Estilo
**Prioridade**: P2
**Tipo**: Backend

**Descricao**: Aplicar um estilo diferente a uma imagem existente.

**Entregaveis**:
- [ ] `POST /api/images/{id}/restyle/`
- [ ] Body: `{ style: "anime" | "oil_painting" | "watercolor" | ..., strength: 0.5-0.8 }`
- [ ] Usa img2img com prompt modificado para o estilo alvo
- [ ] Task Celery
- [ ] Serializer, schema

**Validacao**:
- [ ] Imagem fotorrealista -> anime: estilo visivelmente diferente
- [ ] Composicao geral mantida (mesmos elementos)
- [ ] Quota respeitada

---

### S3-T04: Tela de Edicao no Frontend
**Prioridade**: P1
**Tipo**: Frontend
**Rota**: `/images/{id}/edit` ou modal

**Descricao**: Interface para gerar variacoes e mudar estilo de uma imagem.

**Entregaveis**:
- [ ] Acesso via botao "Editar" no ImageDetailsDialog
- [ ] Imagem original visivel no lado esquerdo
- [ ] Painel de opcoes no lado direito:
  - Slider de strength (0.3-0.9)
  - Botoes de estilo (reutilizar chips existentes)
  - Botao "Gerar variacoes" (1-4)
  - Botao "Mudar estilo"
- [ ] Grid de resultados abaixo
- [ ] Cada resultado: salvar como nova imagem ou descartar
- [ ] Loading states com skeleton

**Validacao**:
- [ ] Slider funciona e afeta resultado
- [ ] Variacoes aparecem em grid
- [ ] "Salvar" cria imagem na colecao do usuario
- [ ] Estilo Quiet Glow: UI nao compete com as imagens

---

### Entregaveis da Sprint 3

| Artefato | Validacao |
|----------|-----------|
| Modelo Image estendido | Migration rodou, campos na API |
| Endpoint de variacoes | 1-4 variacoes geradas corretamente |
| Endpoint de restyle | Estilo muda mantendo composicao |
| Tela de edicao | Fluxo completo: original -> edit -> save |
| Spec atualizada | Todos os novos endpoints documentados |

---

## 5. FASE 2 — Sprint 4: Sistema de Projetos

> Objetivo: Sair de imagens soltas. Permitir organizacao com narrativa.
> Duracao estimada: 1 sprint
> Pre-requisito: Sprint 1 completa (nao depende de Sprint 2-3)

---

### S4-T01: Modelo de Dados de Projetos
**Prioridade**: P0
**Tipo**: Backend

**Entregaveis**:
- [ ] Modelo `Project` (id UUID, user FK, title, description, cover_image FK, is_public, created_at, updated_at)
- [ ] Modelo `ProjectImage` (id, project FK, image FK, order PositiveInt, caption TextField, created_at)
- [ ] Modelo `ProjectTag` (name CharField unique)
- [ ] M2M: Project <-> ProjectTag
- [ ] Migrations
- [ ] Admin registrado

**Validacao**:
- [ ] Migrations rodam sem erro
- [ ] Admin permite CRUD de projetos

---

### S4-T02: API CRUD de Projetos
**Prioridade**: P0
**Tipo**: Backend

**Entregaveis**:
- [ ] `POST /api/projects/` — criar projeto
- [ ] `GET /api/projects/` — listar projetos do usuario
- [ ] `GET /api/projects/{id}/` — detalhe
- [ ] `PUT /api/projects/{id}/` — atualizar titulo, descricao, cover
- [ ] `DELETE /api/projects/{id}/` — deletar projeto (so imagens desassociadas, nao deletadas)
- [ ] `POST /api/projects/{id}/images/` — adicionar imagem ao projeto (com order e caption)
- [ ] `DELETE /api/projects/{id}/images/{image_id}/` — remover imagem do projeto
- [ ] `PATCH /api/projects/{id}/images/reorder/` — reordenar imagens
- [ ] `GET /api/projects/public/` — projetos publicos (paginado)
- [ ] Todos anotados com `@extend_schema` (tag: Projects)
- [ ] Serializers completos
- [ ] Testes unitarios

**Validacao**:
- [ ] CRUD completo funciona via Swagger UI
- [ ] So o dono pode editar/deletar
- [ ] Imagens sao desassociadas (nao deletadas) ao remover do projeto
- [ ] Reorder funciona (drag-and-drop no frontend depois)
- [ ] Projetos publicos aparecem para todos

---

### S4-T03: Pagina de Projetos (lista)
**Prioridade**: P1
**Tipo**: Frontend
**Rota**: `/projects`

**Entregaveis**:
- [ ] Grid de cards de projetos do usuario
- [ ] Cada card: cover image + titulo + contagem de imagens + badge pub/priv
- [ ] Botao "Novo projeto" (abre modal de criacao)
- [ ] Modal: titulo + descricao + botao "Criar"
- [ ] Link na sidebar (secao BIBLIOTECA)
- [ ] Loading/empty states

**Validacao**:
- [ ] Lista carrega corretamente
- [ ] Criar projeto: aparece na lista
- [ ] Click em card: navega para detalhe

---

### S4-T04: Pagina de Detalhe do Projeto
**Prioridade**: P1
**Tipo**: Frontend
**Rota**: `/projects/{id}`

**Entregaveis**:
- [ ] Header: cover image + titulo + descricao + stats
- [ ] Toggle de modo: Grid | Storyboard
- [ ] Modo Grid: masonry de imagens do projeto
- [ ] Modo Storyboard: imagens em sequencia vertical com captions
- [ ] Botao "+ Adicionar imagem" (abre picker de "Minhas Imagens")
- [ ] Reordenar via drag-and-drop (ou botoes up/down)
- [ ] Editar caption inline
- [ ] Toggle publico/privado
- [ ] Botao "Compartilhar" (copia link)

**Validacao**:
- [ ] Ambos os modos funcionam
- [ ] Reorder persiste no backend
- [ ] Caption editavel inline
- [ ] Projeto publico: acessivel por link

---

### S4-T05: Galeria de Projetos Publicos
**Prioridade**: P2
**Tipo**: Frontend
**Rota**: Secao dentro de `/explore` ou rota `/projects/explore`

**Entregaveis**:
- [ ] Grid de projetos publicos (cover + titulo + autor)
- [ ] Paginacao / infinite scroll
- [ ] Click: abre pagina do projeto em modo leitura
- [ ] Link na navegacao do Explore

**Validacao**:
- [ ] Projetos publicos de outros usuarios visiveis
- [ ] Projetos privados nao aparecem

---

### Entregaveis da Sprint 4

| Artefato | Validacao |
|----------|-----------|
| 3 modelos novos (Project, ProjectImage, ProjectTag) | Migrations ok |
| 9 endpoints de API | CRUD completo via Swagger |
| Pagina de lista de projetos | CRUD funcional |
| Pagina de detalhe com Grid + Storyboard | Ambos modos funcionam |
| Galeria de projetos publicos | Visivel para todos |

---

## 6. FASE 2 — Sprint 5: Agente Conversacional

> Objetivo: O maior diferencial do projeto. Chat iterativo com IA para geracao.
> Duracao estimada: 1-2 sprints (pode ser dividida)
> Pre-requisito: Sprint 2 (FLUX.2 + LLM melhor) + Sprint 3 (variacoes)

---

### S5-T01: Modelo de Dados de Sessao Criativa
**Prioridade**: P0
**Tipo**: Backend

**Entregaveis**:
- [ ] Modelo `CreativeSession` (id UUID, user FK, title, status: active|archived, created_at, updated_at)
- [ ] Modelo `SessionMessage` (id, session FK, role: user|assistant, text, image FK nullable, prompt_used nullable, created_at)
- [ ] Migrations

**Validacao**:
- [ ] Migration roda sem erro
- [ ] Admin permite visualizar sessoes e mensagens

---

### S5-T02: API de Sessoes Criativas
**Prioridade**: P0
**Tipo**: Backend

**Entregaveis**:
- [ ] `POST /api/sessions/` — criar sessao
- [ ] `GET /api/sessions/` — listar sessoes do usuario
- [ ] `GET /api/sessions/{id}/` — detalhe com mensagens
- [ ] `DELETE /api/sessions/{id}/` — arquivar sessao
- [ ] `POST /api/sessions/{id}/messages/` — enviar mensagem
  - Recebe: `{ text: string }`
  - Processo:
    1. Salva mensagem do usuario
    2. Envia historico para LLM
    3. LLM responde com texto + prompt de geracao (se aplicavel)
    4. Se LLM decidir gerar: cria draft via FLUX.2-klein
    5. Retorna resposta do assistente + imagem (se gerada)
  - Response via SSE (streaming) ou JSON (sincrono)
- [ ] Todos anotados com `@extend_schema` (tag: Creative Agent)
- [ ] Testes

**Validacao**:
- [ ] Criar sessao: retorna ID
- [ ] Enviar mensagem: recebe resposta do LLM
- [ ] LLM gera imagem quando faz sentido (nao em toda mensagem)
- [ ] Historico de conversa mantido (LLM sabe o que ja foi dito)

---

### S5-T03: System Prompt do Agente Criativo
**Prioridade**: P1
**Tipo**: Backend

**Descricao**: Definir o comportamento do agente via system prompt.

**Entregaveis**:
- [ ] System prompt em `backend/api/agent_prompt.py`
- [ ] Comportamento definido:
  - Faz perguntas de clarificacao (estilo, humor, composicao)
  - Sugere alternativas quando o usuario e vago
  - Gera prompt otimizado quando tem info suficiente
  - Nunca gera sem confirmar com o usuario
  - Responde em portugues
  - Gera prompts em ingles
- [ ] Testavel isoladamente (prompt in -> response out)

**Validacao**:
- [ ] "quero uma imagem bonita" -> agente pergunta mais detalhes
- [ ] "gato preto em fundo branco, fotorrealista" -> agente gera direto
- [ ] Agente nunca responde em ingles na conversa
- [ ] Agente sempre gera prompt em ingles para o modelo

---

### S5-T04: Tela de Chat Criativo
**Prioridade**: P0
**Tipo**: Frontend
**Rota**: `/create` ou `/chat`

**Entregaveis**:
- [ ] Layout de chat (mensagens scrollaveis + input fixo no bottom)
- [ ] Mensagens do usuario: alinhadas a direita, bg accent-soft
- [ ] Mensagens do assistente: alinhadas a esquerda, bg surface
- [ ] Imagem inline: quando agente gera, preview aparece na mensagem
- [ ] Input: textarea + botao enviar + indicador de "agente digitando"
- [ ] Lista de sessoes anteriores (sidebar ou dropdown)
- [ ] Botao "Nova sessao"
- [ ] Acoes na imagem gerada: "Salvar", "Variacoes", "Adicionar ao projeto"
- [ ] Link na sidebar (secao DESCOBRIR, posicao de destaque)

**Validacao**:
- [ ] Conversa fluida: mensagem -> resposta -> imagem -> refinamento
- [ ] Preview aparece inline (nao em modal separado)
- [ ] Historico persistido (recarregar pagina mantem conversa)
- [ ] "Salvar" adiciona imagem a colecao do usuario
- [ ] Estilo Quiet Glow: chat limpo, imagem e destaque

---

### S5-T05: Geracao com Confirmacao
**Prioridade**: P1
**Tipo**: Backend + Frontend

**Descricao**: Fluxo draft -> confirmacao -> versao final.

**Entregaveis**:
- [ ] Agente gera draft (FLUX.2-klein, rapido)
- [ ] Mensagem com draft mostra: "Gostou? [Gerar em alta] [Ajustar]"
- [ ] "Gerar em alta": task com FLUX.2-dev (qualidade final)
- [ ] "Ajustar": usuario escreve o que mudar, agente refina
- [ ] Imagem final substitui draft na mensagem (ou mostra ambos)

**Validacao**:
- [ ] Draft aparece em ~1-5s
- [ ] "Gerar em alta" inicia task e mostra loading
- [ ] Imagem final visivelmente superior ao draft
- [ ] "Ajustar" mantem contexto e gera novo draft

---

### Entregaveis da Sprint 5

| Artefato | Validacao |
|----------|-----------|
| 2 modelos novos (CreativeSession, SessionMessage) | Migrations ok |
| 5 endpoints de API | CRUD + mensagem funcional |
| System prompt do agente | Comportamento consistente e natural |
| Tela de chat completa | Fluxo end-to-end: conversa -> draft -> final |
| Fluxo draft -> confirmacao | Draft rapido + versao final de qualidade |

---

## 7. FASE 2 — Sprint 6: Consistencia de Personagem

> Objetivo: Criar personagens reutilizaveis em multiplas cenas.
> Duracao estimada: 1 sprint
> Pre-requisito: Sprint 2 (FLUX.2 com multi-referencia) + Sprint 5 (agente)

---

### S6-T01: Modelo de Dados de Personagem
**Prioridade**: P0
**Tipo**: Backend

**Entregaveis**:
- [ ] Modelo `Character` (id, user FK, name, description, style_notes, created_at, updated_at)
- [ ] Modelo `CharacterReference` (id, character FK, image ImageField, order, created_at)
- [ ] Modelo `CharacterGeneration` (id, character FK, image FK, scene_description, created_at)
- [ ] Migrations

**Validacao**:
- [ ] Migration ok
- [ ] Admin permite CRUD

---

### S6-T02: API de Personagens
**Prioridade**: P0
**Tipo**: Backend

**Entregaveis**:
- [ ] `POST /api/characters/` — criar personagem (nome + descricao)
- [ ] `GET /api/characters/` — listar personagens do usuario
- [ ] `GET /api/characters/{id}/` — detalhe com referencias e geracoes
- [ ] `PUT /api/characters/{id}/` — atualizar nome, descricao, notas
- [ ] `DELETE /api/characters/{id}/`
- [ ] `POST /api/characters/{id}/references/` — upload de imagem de referencia (multipart)
- [ ] `DELETE /api/characters/{id}/references/{ref_id}/`
- [ ] `POST /api/characters/{id}/generate/` — gerar cena com personagem
  - Body: `{ scene: "no cafe", style: "photorealistic" }`
  - Usa imagens de referencia do personagem + descricao
  - FLUX.2-dev com multi-referencia
- [ ] Todos anotados com `@extend_schema` (tag: Characters)
- [ ] Testes

**Validacao**:
- [ ] Upload de 3-5 imagens de referencia
- [ ] Geracao com referencias: personagem reconhecivel
- [ ] Geracao sem referencias: usa apenas descricao textual
- [ ] Multiplas cenas: mesmo personagem, contextos diferentes

---

### S6-T03: Pagina de Personagens
**Prioridade**: P1
**Tipo**: Frontend
**Rota**: `/characters` e `/characters/{id}`

**Entregaveis**:
- [ ] Lista de personagens do usuario (cards com thumbnail + nome)
- [ ] Botao "Novo personagem"
- [ ] Modal de criacao: nome + descricao
- [ ] Pagina de detalhe:
  - Grid de imagens de referencia (upload drag-and-drop)
  - Campo de descricao editavel
  - Galeria de cenas geradas
  - Formulario: "Gerar nova cena" (scene description + style)
- [ ] Link na sidebar (secao BIBLIOTECA)

**Validacao**:
- [ ] Criar personagem com 3 refs
- [ ] Gerar 3 cenas diferentes: personagem consistente
- [ ] Deletar referencia: nao afeta geracoes ja feitas

---

### S6-T04: Integracao Personagem no Agente
**Prioridade**: P2
**Tipo**: Backend + Frontend

**Descricao**: O agente conversacional pode usar personagens existentes.

**Entregaveis**:
- [ ] No chat: usuario pode dizer "use meu personagem Aelin"
- [ ] Agente busca personagem por nome
- [ ] Usa referencias do personagem na geracao
- [ ] Mensagem mostra qual personagem foi usado

**Validacao**:
- [ ] "Coloque Aelin em uma cafeteria" -> gera com referencias de Aelin
- [ ] Personagem inexistente: agente pergunta qual personagem

---

### Entregaveis da Sprint 6

| Artefato | Validacao |
|----------|-----------|
| 3 modelos novos | Migrations ok |
| 8 endpoints de API | CRUD + geracao funcional |
| Pagina de personagens | Upload refs + geracao de cenas |
| Integracao com agente | Chat usa personagens existentes |

---

## 8. FASE 3 — Sprints Futuras (Backlog)

> Estas sprints nao tem detalhamento completo ainda.
> Serao planejadas quando as sprints da Fase 2 estiverem completas.

### Sprint 7: ControlNet e Edicao Avancada
- [ ] ControlNet OpenPose (controle de pose)
- [ ] ControlNet Depth (controle de profundidade)
- [ ] Inpainting (selecao de regiao + redesenho)
- [ ] Outpainting (expandir bordas da imagem)
- [ ] Tela de edicao com ferramentas visuais (canvas)

### Sprint 8: Exportacao e Polimento
- [ ] Exportar projeto como PDF
- [ ] Exportar projeto como apresentacao (slides)
- [ ] Modos criativos com restricao ("3 palavras", "modo cego", etc.)
- [ ] Exposicoes curadas pela comunidade
- [ ] Pagina de "Trending" com algoritmo melhorado

### Sprint 9: Qualidade e DevOps
- [ ] Testes E2E com Playwright
- [ ] GitHub Actions CI/CD (lint + test + build)
- [ ] Pre-commit hooks (black, isort, eslint)
- [ ] Monitoring basico (Sentry ou similar)
- [ ] Rate limiting melhorado (Redis sliding window)

### Sprint 10: API Publica
- [ ] Documentacao publica da API (read-only para terceiros)
- [ ] API keys para desenvolvedores
- [ ] Plano API com billing
- [ ] SDK Python + SDK JavaScript
- [ ] Rate limiting por API key

---

## 9. Dependencias entre Sprints

```
Sprint 1 (Estabilizacao)
    |
    +---> Sprint 2 (Upgrade Modelos)
    |         |
    |         +---> Sprint 3 (Image-to-Image)
    |         |         |
    |         +---> Sprint 5 (Agente) ----+
    |                   |                  |
    |                   +---> Sprint 6 (Personagens)
    |
    +---> Sprint 4 (Projetos) — independente dos upgrades de modelo

    Sprint 7-10: dependem de Fase 2 completa
```

**Caminhos paralelos possiveis**:
- Sprint 4 (Projetos) pode rodar em paralelo com Sprint 2-3 (Modelos + img2img)
- Sprint 1 e bloqueante para todas as outras

---

## 10. Metricas de Progresso

### Por Sprint

| Metrica                        | Meta        |
|--------------------------------|-------------|
| Tasks concluidas / total       | 100%        |
| Endpoints novos documentados   | Todos       |
| Tipos TS regenerados           | Sim         |
| Zero erros de lint             | Sim         |
| Build Docker funciona          | Sim         |
| Swagger UI reflete mudancas    | Sim         |

### Por Fase

| Fase   | Indicador de sucesso                                              |
|--------|-------------------------------------------------------------------|
| Fase 1 | App funcional com geracao + social + SDD                          |
| Fase 2 | Chat + personagens + projetos + img2img funcionando end-to-end    |
| Fase 3 | Polido, testado, exportavel, com CI/CD                            |

---

## 11. Riscos e Mitigacoes

| Risco                                      | Impacto | Mitigacao                                      |
|--------------------------------------------|---------|------------------------------------------------|
| FLUX.2 nao roda na infra atual             | Alto    | Usar HF Inference API como alternativa         |
| Gemini API muda ou fica cara               | Medio   | Provider pattern + fallback para DeepSeek      |
| Consistencia de personagem fica ruim       | Alto    | Comecar com multi-ref FLUX.2, evoluir para IP-Adapter |
| Sprint 5 (agente) demora mais que previsto | Alto    | Dividir em 5a (backend) e 5b (frontend)        |
| Docker build muito lento com GPU deps      | Baixo   | CPU-only no dev, GPU so em producao            |
| Tipos TS ficam dessincronizados            | Baixo   | Script de sync no pre-commit ou CI             |

---

## 12. Checklist de Entrega por Sprint

Use esta checklist ao finalizar cada sprint:

```
[ ] Todas as tasks marcadas como done
[ ] Spec OpenAPI validada sem warnings (manage.py spectacular --validate)
[ ] Tipos TypeScript regenerados (npm run generate-api:file)
[ ] Docker compose build + up sem erros
[ ] Todas as rotas novas acessiveis no navegador
[ ] Todos os endpoints novos testáveis no Swagger UI
[ ] Documentacao atualizada (SPEC.md, UI-UX.md se necessario)
[ ] Nenhum TODO ou FIXME pendente no codigo novo
[ ] Git: branch mergeada, sem conflitos
```

---

*Documento gerido como backlog do projeto ImagAIne.*
*Atualizar status das tasks conforme o desenvolvimento avanca.*
*Criado em: 2026-04-12*
