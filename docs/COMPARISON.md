# ImagAIne — Comparativo: Atual vs Futuro

> O que o projeto ja tem, o que vai ganhar, e o que muda em cada transicao.

---

## Resumo Visual

```
HOJE: Gerador de imagens com rede social
         prompt -> imagem -> like/comment

FUTURO: Estudio criativo com IA
         conversa -> itera -> personagem -> projeto -> serie -> exporta
```

---

## 1. Geracao de Imagem

| Aspecto              | Atual (Fase 1)                     | Futuro (Fase 2+)                              |
|----------------------|------------------------------------|------------------------------------------------|
| **Modelo**           | FLUX.1-dev                         | FLUX.2-dev (final) + FLUX.2-klein (drafts)    |
| **Resolucao**        | Ate ~1MP                           | Ate 4MP nativo                                 |
| **Velocidade**       | ~10-30s por imagem                 | ~1s drafts (klein) + ~10s final (dev)          |
| **Input**            | Texto apenas (txt2img)             | Texto + imagem de ref + pose + mascara         |
| **Interacao**        | Formulario: preenche e espera      | Chat: conversa, ve preview, itera              |
| **Tipos de geracao** | txt2img apenas                     | txt2img, img2img, inpaint, variacoes, upscale  |
| **Personagens**      | Nao existe                         | Criar personagem e reusar em multiplas cenas   |
| **Aspect ratios**    | 5 opcoes fixas                     | 5 fixas + custom via FLUX.2                    |
| **Tipografia**       | Nao suportada                      | Texto dentro da imagem (FLUX.2 nativo)         |

---

## 2. Assistente de IA

| Aspecto              | Atual (Fase 1)                     | Futuro (Fase 2+)                              |
|----------------------|------------------------------------|------------------------------------------------|
| **LLM**             | DeepSeek Chat                      | Gemini 2.5 Flash ou Llama 4 Maverick          |
| **Funcao**           | Refina prompt (1 request/response) | Agente conversacional iterativo                |
| **Fluxo**            | Usuario escreve -> LLM reescreve   | Dialogo: LLM pergunta, sugere, refina em loop  |
| **Contexto**         | Sem memoria entre requisicoes      | Sessao com historico de conversa e imagens     |
| **Multimodal**       | Texto apenas                       | Texto + analise de imagem gerada               |
| **Streaming**        | Nao (request/response)             | Sim (SSE ou WebSocket)                         |
| **Autonomia**        | Reescreve mecanicamente            | "Diretor criativo" que guia o processo         |

---

## 3. Organizacao de Conteudo

| Aspecto              | Atual (Fase 1)                     | Futuro (Fase 2+)                              |
|----------------------|------------------------------------|------------------------------------------------|
| **Estrutura**        | Imagens soltas em lista             | Projetos com imagens ordenadas e legendadas    |
| **Contexto**         | Prompt como unica info              | Caption, statement do artista, narrativa       |
| **Agrupamento**      | "Minhas imagens" (lista flat)       | Projetos, series, personagens                  |
| **Apresentacao**     | Grid de cards                       | Grid + modo storyboard + modo apresentacao     |
| **Exportacao**       | Download individual de imagem       | Download + exportacao de projeto como PDF      |
| **Curadoria**        | Galeria publica automatica          | Galeria + exposicoes curadas com tema          |

---

## 4. Interacao Social

| Aspecto              | Atual (Fase 1)                     | Futuro (Fase 2+)                              |
|----------------------|------------------------------------|------------------------------------------------|
| **Likes**            | Sim (em imagens e comentarios)     | Sim + likes em projetos                        |
| **Comentarios**      | Sim (com replies de 1 nivel)       | Sem mudanca                                    |
| **Downloads**        | Sim (com contador)                 | Sim + download de projeto inteiro              |
| **Busca**            | Por prompt (texto)                 | Por prompt + por similaridade visual           |
| **Compartilhar**     | Toggle publico/privado             | Toggle + compartilhar projeto                  |
| **Colaboracao**      | Nao existe                         | (Fase 3) Projetos compartilhados entre usuarios|

---

## 5. Memoria Criativa (Embeddings)

| Aspecto              | Atual (Fase 1)                     | Futuro (Fase 2+)                              |
|----------------------|------------------------------------|------------------------------------------------|
| **Text embeddings**  | MiniLM-L6-v2 (384-dim)            | Sem mudanca (funciona bem)                     |
| **Image embeddings** | BLIP ViT-B/16 (768-dim)           | Sem mudanca ou upgrade para BLIP-2             |
| **Imagens similares**| Sim (ate 12)                       | Sim + considerar personagem e projeto          |
| **Sugestoes de estilo** | Sim (baseado em historico)      | Sim + sugestoes contextuais no agente          |
| **Busca semantica**  | Basica (prompt)                    | Avancada (visual + textual + por projeto)      |

---

## 6. Arquitetura e Infra

| Aspecto              | Atual (Fase 1)                     | Futuro (Fase 2+)                              |
|----------------------|------------------------------------|------------------------------------------------|
| **Backend**          | Django 5 + DRF                     | Sem mudanca                                    |
| **Frontend**         | React 19 + TS 5.9 + Vite 7        | Sem mudanca                                    |
| **Banco**            | PostgreSQL 16 + pgvector           | Sem mudanca                                    |
| **Fila**             | Celery + Redis                     | Sem mudanca (mais task types)                  |
| **AI - Geracao**     | diffusers (FLUX.1-dev)             | diffusers (FLUX.2-dev + klein)                 |
| **AI - LLM**         | DeepSeek API                       | Gemini API ou Llama 4 local                    |
| **AI - Embeddings**  | sentence-transformers + BLIP       | Sem mudanca                                    |
| **Contrato API**     | OpenAPI via drf-spectacular        | Sem mudanca (mais endpoints)                   |
| **Tipos Frontend**   | Gerados via openapi-typescript     | Sem mudanca (auto-atualizam)                   |
| **Docker**           | 5 servicos                         | 5 servicos (possivelmente +1 para LLM local)  |
| **Comunicacao**      | REST apenas                        | REST + SSE/WebSocket (para agente)             |
| **CI/CD**            | Nao existe                         | GitHub Actions (Fase 3)                        |
| **Testes**           | Django TestCase                    | Django TestCase + E2E com Playwright (Fase 3)  |

---

## 7. Modelo de Dados — Diferencas

### Tabelas que JA existem (Fase 1)

```
User                   -- usuario com plano, quota, verificacao
Image                  -- imagem gerada (prompt, status, social counts)
ImageLike              -- like em imagem
ImageComment           -- comentario com replies
CommentLike            -- like em comentario
ImageTag               -- tags de imagem
ImageEmbedding         -- embeddings vetoriais
PasswordResetToken     -- reset de senha
```

### Tabelas NOVAS planejadas (Fase 2+)

```
CreativeSession        -- sessao de conversa com o agente
SessionMessage         -- mensagem individual (user/assistant + imagem)
Character              -- personagem reutilizavel
CharacterGeneration    -- imagem gerada com um personagem
Project                -- projeto que agrupa imagens com narrativa
ProjectImage           -- imagem dentro de um projeto (ordenada)
ProjectTag             -- tags de projeto
```

### Campos NOVOS em tabelas existentes (Fase 2+)

```
Image (novos campos):
  - source_image       -- FK para imagem de origem (img2img)
  - generation_type    -- "txt2img" | "img2img" | "inpaint" | "variation" | "upscale"
  - strength           -- forca da transformacao (0.0-1.0)
  - character          -- FK para Character (opcional)
```

---

## 8. Endpoints API — O que muda

### Endpoints ATUAIS (26 endpoints)

```
Auth (7):        register, login, token/refresh, verify-email, password reset (2), token/verify
Profile (5):     profile (GET/PUT/PATCH), avatar, cover, preferences (GET/PUT)
Generation (1):  generate (POST)
Gallery (3):     public, my-images, liked
Social (8):      share (POST/PATCH), like (POST/DELETE), comments (GET/POST),
                 comment delete, comment like (POST/DELETE), download
Creative (2):    related, style-suggestions
Prompt (1):      refine-prompt
```

### Endpoints NOVOS planejados (Fase 2+)

```
Agent (3+):
  POST   /api/sessions/               -- criar sessao criativa
  POST   /api/sessions/{id}/messages/  -- enviar mensagem (SSE response)
  GET    /api/sessions/                -- listar sessoes do usuario

Characters (4+):
  POST   /api/characters/              -- criar personagem
  GET    /api/characters/              -- listar personagens do usuario
  GET    /api/characters/{id}/         -- detalhe do personagem
  POST   /api/characters/{id}/generate/ -- gerar cena com personagem

Projects (5+):
  POST   /api/projects/               -- criar projeto
  GET    /api/projects/               -- listar projetos do usuario
  GET    /api/projects/{id}/          -- detalhe do projeto
  GET    /api/projects/public/        -- projetos publicos
  POST   /api/projects/{id}/images/   -- adicionar imagem ao projeto

Image-to-Image (2+):
  POST   /api/images/{id}/variations/ -- gerar variacoes
  POST   /api/images/{id}/edit/       -- editar regiao (inpaint)
```

---

## 9. UX — A Transformacao

### Fluxo ATUAL

```
1. Usuario abre a pagina
2. Clica em "Gerar"
3. Preenche formulario (prompt, negative, ratio, seed)
4. Opcionalmente usa "Refinar prompt"
5. Clica "Gerar"
6. Espera 10-30 segundos
7. Ve resultado
8. Se nao gostou, volta ao passo 3 e tenta de novo
```

**Problemas**: mecanico, frustrante quando nao gosta do resultado,
nenhuma orientacao criativa, zero iteracao.

### Fluxo FUTURO

```
1. Usuario abre a pagina
2. Escolhe: "Nova conversa" ou "Abrir projeto" ou "Usar personagem"
3. Conversa com o agente criativo:
   - Descreve o que quer em linguagem natural
   - Agente faz perguntas de clarificacao
   - Preview rapido aparece em ~1 segundo
   - Usuario refina: "mais escuro", "muda o angulo", "adiciona chuva"
   - Cada iteracao gera novo preview instantaneo
4. Quando satisfeito, gera versao final em alta qualidade
5. Adiciona a um projeto, associa a um personagem, exporta
```

**Diferenciais**: conversacional, iterativo, rapido (previews sub-segundo),
orientado por IA, organizado em projetos.

---

## 10. Resumo: O que Muda em cada Fase

### Fase 1 -> Fase 2 (maior salto)

| De                          | Para                                   |
|-----------------------------|----------------------------------------|
| Formulario de prompt         | Chat conversacional com IA             |
| 1 modelo (FLUX.1-dev)       | 2 modelos (FLUX.2 dev + klein)         |
| 1 tipo de geracao (txt2img) | 4+ tipos (txt2img, img2img, variacoes) |
| Imagens soltas               | Projetos com narrativa                 |
| Sem personagens              | Personagens consistentes e reutilizaveis|
| DeepSeek (basico)            | Gemini/Llama4 (multimodal, melhor)     |
| Assistente passivo           | Agente criativo ativo                  |

### Fase 2 -> Fase 3 (polimento)

| De                          | Para                                   |
|-----------------------------|----------------------------------------|
| Controle basico              | ControlNet (pose, depth)               |
| Edicao nula                  | Inpainting/outpainting                 |
| Download individual          | Exportacao de projeto (PDF)            |
| Galeria unica                | Galeria + exposicoes curadas           |
| Sem CI/CD                    | GitHub Actions + testes E2E            |
| Sem modos criativos          | Modos com restricao artistica          |

---

*Documento de referencia para planejamento do ImagAIne.*
*Criado em: 2026-04-12*
