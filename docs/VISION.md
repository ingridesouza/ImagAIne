# ImagAIne - Visao de Futuro

> Este documento captura a visao completa do que o ImagAIne pode se tornar.
> Nenhuma ideia aqui deve se perder. Mesmo que a implementacao demore meses,
> este e o norte do projeto.

---

## 1. A Tese Central

O mercado de geracao de imagem com IA esta saturado. DALL-E, Midjourney,
Leonardo, Ideogram — todos fazem a mesma coisa: campo de texto, botao de gerar,
imagem pronta. Virou commodity.

O ImagAIne nao deve competir nessa corrida. O diferencial e:

> **ImagAIne nao e um gerador de imagens. E um estudio criativo com IA onde o
> usuario conversa, itera e cria projetos visuais completos com personagens
> consistentes.**

O nome ja diz: *ImagAIne* = Imagine + AI. A plataforma deve honrar isso.

---

## 2. Filosofia: Arte, nao Producao

### O problema dos geradores atuais

- Reduzem criacao a um formulario de 3 campos
- Otimizam para perfeicao, nao para expressao
- Tratam likes como metrica de valor artistico
- O usuario e consumidor passivo, nao criador ativo

### O que o ImagAIne deve valorizar

- **Processo, nao produto** — a jornada criativa importa tanto quanto o resultado
- **Restricao como ferramenta** — limitacoes forcam criatividade
- **Imperfeicao como estetica** — o erro da IA pode ser belo
- **Narrativa e intencao** — imagens com contexto, nao soltas
- **Colaboracao humano-maquina** — a IA e pincel, nao pintor

---

## 3. Identidade de Portfolio

### O pitch de 30 segundos

> "O ImagAIne e um estudio criativo com IA. Ele orquestra modelos de geracao
> de imagem via Celery, usa embeddings vetoriais com pgvector para busca por
> similaridade, e tem um agente conversacional que guia o usuario no processo
> criativo. O contrato frontend-backend e definido por uma spec OpenAPI que
> gera tipos TypeScript automaticamente. Tudo roda em Docker com 5 servicos."

### Skills demonstrados

| Feature                              | Skill para Portfolio                         |
|--------------------------------------|----------------------------------------------|
| Django + DRF                         | Backend solido                               |
| React + TypeScript + Zustand         | Frontend moderno                             |
| Celery + Redis                       | Arquitetura assincrona                       |
| pgvector + embeddings                | Busca vetorial / ML aplicado                 |
| JWT + rate limiting                  | Seguranca                                    |
| Docker Compose (5 servicos)          | DevOps                                       |
| SDD + OpenAPI + tipos gerados        | Maturidade de engenharia                     |
| Agente conversacional (futuro)       | LLM orchestration, streaming, estado         |
| Consistencia de personagem (futuro)  | Pipeline de ML complexo, UX nao-trivial      |
| Image-to-image (futuro)             | ControlNet, pipelines de difusao              |
| Projetos com narrativa (futuro)      | Modelagem complexa, pensamento de produto    |

---

## 4. Estado da Tecnologia (Abril 2026)

### 4.1 Modelos de Geracao de Imagem

**O FLUX.1-dev que usamos esta defasado.** O cenario atual:

#### Modelos Proprietarios (referencia, nao usaremos diretamente)

| Modelo              | Destaque                                          |
|---------------------|---------------------------------------------------|
| GPT Image 1.5       | Top em arena scores, substituiu DALL-E 3           |
| Midjourney v7        | Rei da qualidade artistica/estetica               |
| Google Imagen 4      | Melhor text rendering do Google, GA via Gemini API |
| Ideogram 3.0         | ~90-95% acuracia em texto dentro da imagem        |
| FLUX.1.1 Pro Ultra   | Maior qualidade tecnica da familia FLUX            |

#### Modelos Open-Source (candidatos para o ImagAIne)

| Modelo                | Params     | Licenca        | Destaque                                         |
|-----------------------|------------|----------------|--------------------------------------------------|
| **FLUX.2 [dev]**      | Grande     | Non-commercial | 4MP, 10 refs, tipografia, cores hex. Nosso alvo. |
| **FLUX.2 [klein-4B]** | 4B         | Apache 2.0     | Sub-segundo em GPU consumer. Ideal para drafts.  |
| HunyuanImage 3.0      | 80B MoE    | Open-source    | Maior modelo open. Autoregressivo, nao difusao.  |
| SD 3.5 Large           | ~8B        | Open           | Grande ecossistema de LoRAs e ControlNets.       |
| Z-Image-Turbo          | -          | Apache 2.0     | Iguala FLUX.2 dev com menos steps.                |

**Decisao recomendada**: FLUX.2 dev para geracao final + FLUX.2 klein para previews
rapidos no agente conversacional. Migracao quase drop-in via diffusers.

### 4.2 LLMs para Assistencia Criativa

**O DeepSeek Chat que usamos esta atras dos competidores.**

| LLM                    | Forca                                            | Custo     |
|------------------------|--------------------------------------------------|-----------|
| **Gemini 2.5 Flash**   | Melhor custo-beneficio, multimodal, rapido       | Baixo     |
| **Llama 4 Maverick**   | Open-source, self-hosted, zero custo             | Gratis    |
| **Claude Sonnet 4.6**  | Melhor qualidade absoluta para escrita criativa   | Alto      |
| DeepSeek Chat (atual)  | Decente, mas nao e fronteira para tarefas visuais | Baixo    |

**Decisao recomendada**: Gemini 2.5 Flash como padrao (custo baixo, multimodal).
Llama 4 Maverick como alternativa self-hosted.

### 4.3 Bibliotecas e Frameworks

| Ferramenta      | Status                                                      |
|-----------------|-------------------------------------------------------------|
| **diffusers**   | Continua sendo o padrao. Suporta FLUX.2, SD 3.5, Hunyuan.  |
| ComfyUI         | Maduro como backend headless, bom para pipelines complexos. |
| InvokeAI        | GUI polida com API, bom para self-hosted.                   |

**Decisao**: Manter `diffusers` para Django+Celery. ComfyUI so faz sentido se
precisarmos de pipelines multi-step complexos (ControlNet + IP-Adapter + inpainting).

### 4.4 Tecnicas Novas

| Tecnica                       | O que e                                            | Relevancia     |
|-------------------------------|---------------------------------------------------|----------------|
| **Consistencia de personagem** | IP-Adapter FaceID + LoRA + ControlNet OpenPose    | ALTA — diferencial |
| **Multi-referencia FLUX.2**    | Ate 10 imagens de ref nativamente                 | ALTA — habilita personagens |
| **ControlNet stacking**        | Pose + Depth + IP-Adapter simultaneos             | MEDIA          |
| **Image-to-image**             | Variacoes, mudanca de estilo, remix               | ALTA           |
| **Inpainting/Outpainting**     | Editar regiao especifica da imagem                | MEDIA          |

### 4.5 Geracao de Video (horizonte longo)

O Sora morreu em marco 2026 ($15M/dia de custo de inferencia). O mercado esta aberto:

| Modelo         | Destaque                                                |
|----------------|---------------------------------------------------------|
| Runway Gen-4.5 | Top Elo, melhor fidelidade visual                      |
| Kling 3.0       | 4K nativo a 60fps, 40% mais barato que Runway          |
| Google Veo 3    | Audio sincronizado nativo (dialogo, SFX, ambiente)     |
| Seedance 2.0    | Multimodal: texto + imagem + audio + video de uma vez  |

**Decisao**: Video e Fase 3 (longo prazo). Foco agora em imagem.

---

## 5. Features Futuras — Detalhamento

### 5.1 Agente Conversacional de Geracao

**Status**: Nao implementado
**Prioridade**: ALTA (maior diferencial de portfolio)
**Complexidade**: Alta

#### Conceito

Substituir o wizard de geracao por um chat iterativo:

```
Usuario: "quero uma guerreira medieval na chuva"
IA: [gera preview rapido com FLUX.2 klein ~1s]
    "Pensei nisso. Quer armadura pesada ou leve? Noite ou dia?"
Usuario: "armadura pesada, noite, raios ao fundo"
IA: [gera versao refinada com FLUX.2 dev ~10s]
    "Ficou assim. Quer ajustar algo?"
Usuario: "perfeito, salva"
IA: [salva em alta qualidade]
```

#### Arquitetura tecnica

- **Frontend**: Componente de chat com streaming (SSE ou WebSocket)
- **Backend**: Endpoint de conversacao que mantém estado da sessao
- **LLM**: Gemini Flash ou Llama 4 como "diretor criativo"
  - Recebe descricao do usuario
  - Gera prompt otimizado para o modelo de imagem
  - Sugere variacoes e refinamentos
  - Faz perguntas de clarificacao
- **Geracao**:
  - Draft rapido: FLUX.2 klein (sub-segundo) para previews
  - Versao final: FLUX.2 dev (alta qualidade) quando usuario aprova
- **Estado**: Sessao de conversa com historico de prompts e imagens geradas
- **Celery**: Tasks para geracao async, igual ao fluxo atual

#### Modelo de dados (novo)

```
CreativeSession
  - id: UUID
  - user: FK(User)
  - title: CharField (auto-gerado ou definido pelo usuario)
  - messages: JSON ou FK para SessionMessage
  - final_images: M2M(Image)
  - created_at, updated_at

SessionMessage
  - id: BigAutoField
  - session: FK(CreativeSession)
  - role: "user" | "assistant"
  - text: TextField
  - image: FK(Image, nullable) — imagem gerada nesta mensagem
  - prompt_used: TextField — prompt real enviado ao modelo
  - created_at
```

#### Skills demonstrados

- LLM orchestration e prompt engineering
- Streaming (SSE/WebSocket)
- Gerenciamento de estado de conversacao
- Pipeline multi-modelo (LLM + geracao)

---

### 5.2 Consistencia de Personagem

**Status**: Nao implementado
**Prioridade**: ALTA (ninguem tem em projeto de portfolio)
**Complexidade**: Alta

#### Conceito

O usuario cria um "personagem" e gera multiplas cenas com ele:

- Cria personagem: rosto base + descricao (cabelo, estilo, personalidade)
- Gera cenas: "meu personagem em uma cafeteria", "meu personagem correndo na chuva"
- O personagem e **reconhecivelmente o mesmo** em todas as cenas

#### Tecnica

Abordagem tripla (estado da arte em 2026):

1. **IP-Adapter FaceID** (peso 0.7-0.85): consistencia facial
2. **LoRA de personagem**: consistencia de estilo e corpo
3. **ControlNet OpenPose**: controle de pose

Alternativa mais simples com FLUX.2:
- FLUX.2 dev suporta ate 10 imagens de referencia nativamente
- Enviar 3-5 imagens do personagem como referencia
- Sem necessidade de IP-Adapter externo

#### Modelo de dados (novo)

```
Character
  - id: BigAutoField
  - user: FK(User)
  - name: CharField
  - description: TextField (descricao textual)
  - reference_images: M2M(Image) — imagens de referencia
  - style_notes: TextField — notas sobre estilo
  - created_at, updated_at

CharacterGeneration
  - id: BigAutoField
  - character: FK(Character)
  - image: FK(Image)
  - scene_description: TextField
  - created_at
```

#### Skills demonstrados

- Pipeline de ML multi-step
- IP-Adapter / ControlNet (se usado)
- UX de criacao complexa
- Problema real sem solucao open-source

---

### 5.3 Image-to-Image e Edicao

**Status**: Nao implementado
**Prioridade**: ALTA (esperado em qualquer estudio de IA)
**Complexidade**: Media

#### Funcionalidades

| Feature           | Descricao                                      | Tecnica                |
|-------------------|-------------------------------------------------|------------------------|
| Variacoes          | "Gere 4 variacoes desta imagem"                | img2img com seed diff  |
| Mudanca de estilo  | "Torne esta imagem mais anime"                 | img2img + style prompt |
| Mudanca de fundo   | "Troque o fundo para uma floresta"             | Inpainting com mascara |
| Upscale            | Aumentar resolucao mantendo qualidade           | Real-ESRGAN ou similar |
| Remix              | Combinar elementos de 2+ imagens               | IP-Adapter blend       |

#### Modelo de dados (extensao)

```
Image (campos novos)
  - source_image: FK(Image, nullable) — imagem de origem
  - generation_type: "txt2img" | "img2img" | "inpaint" | "variation" | "upscale"
  - strength: FloatField — forca da transformacao (0.0-1.0)
```

---

### 5.4 Sistema de Projetos

**Status**: Nao implementado
**Prioridade**: MEDIA (diferencial de produto e portfolio)
**Complexidade**: Media

#### Conceito

Em vez de imagens soltas, o usuario cria **projetos com proposito**:

- "Campanha de marketing para cafe artesanal" — logo, banner, posts, mockups
- "Storyboard do meu curta" — cenas com personagens consistentes
- "Meu portfolio cyberpunk" — serie com estilo coerente
- "Caderno de sketchs" — exploracoes visuais de uma ideia

#### Modelo de dados (novo)

```
Project
  - id: UUID
  - user: FK(User)
  - title: CharField
  - description: TextField
  - cover_image: FK(Image, nullable)
  - is_public: BooleanField
  - tags: M2M(ProjectTag)
  - created_at, updated_at

ProjectImage
  - id: BigAutoField
  - project: FK(Project)
  - image: FK(Image)
  - order: PositiveIntegerField — posicao na sequencia
  - caption: TextField — legenda / contexto
  - created_at

ProjectTag
  - name: CharField(64), unique
```

#### Funcionalidades

- Galeria de projetos publicos (alem da galeria de imagens)
- Visualizacao em modo "apresentacao" / storyboard
- Exportacao como PDF
- Colaboracao: convidar outro usuario para o projeto (Fase 3)

---

### 5.5 Modos Criativos com Restricao

**Status**: Nao implementado
**Prioridade**: BAIXA (diferencial filosofico, nao tecnico)
**Complexidade**: Baixa

Modos que forcam criatividade atraves de limitacao:

| Modo               | Regra                                              |
|---------------------|---------------------------------------------------|
| "3 Palavras"        | Prompt limitado a 3 palavras                      |
| "Sem Negativo"      | Proibido usar negative prompt                     |
| "Modo Cego"         | Nao ve o resultado ate gerar 5 variacoes          |
| "Cadavre Exquis"    | Metade do prompt e de outro usuario                |
| "Glitch"            | Ruido intencional introduzido na geracao          |
| "Dream"             | Seeds instaveis que mudam sutilmente cada vez     |
| "Palette"           | Geracao restrita a 3-5 cores escolhidas           |

---

### 5.6 Exposicoes Curadas

**Status**: Nao implementado
**Prioridade**: BAIXA
**Complexidade**: Baixa

- Colecoes tematicas com narrativa ("Maquinas que Sonham", "Retratos Impossiveis")
- Statement do artista: por que essa imagem? o que quis dizer?
- Votacao da comunidade para imagem destaque da semana
- Diferente da galeria publica: aqui tem **intencao e curadoria**

---

## 6. O que NAO fazer (armadilhas)

| Ideia tentadora           | Por que evitar                                          |
|---------------------------|---------------------------------------------------------|
| Geracao de video           | Caro demais, infra complexa, dificil explicar em entrevista |
| Marketplace com pagamento  | Stripe+billing e boilerplate, nao impressiona           |
| Chat entre usuarios        | WebSocket generico, todo mundo tem                      |
| App mobile                 | Dilui o foco, React Native e outro mundo                |
| 10 modelos de IA           | Melhor dominar 2 do que integrar 10 superficialmente    |
| Rede social completa       | Feed, followers, DMs — vira clone de Instagram          |
| Moderacao automatica NSFW  | Complexo, desvio do foco, problema legal                |

---

## 7. Roadmap por Fases

```
FASE 1 — Fundacao (COMPLETA)
  [x] Full-stack Django + React + TypeScript
  [x] Geracao de imagem com IA (FLUX.1-dev)
  [x] Social features (like, comment, download)
  [x] Embeddings + busca vetorial (pgvector)
  [x] Docker Compose (5 servicos)
  [x] Spec-Driven Development (OpenAPI + tipos gerados)
  [x] Memoria Criativa (imagens relacionadas, sugestoes de estilo)
  [x] Assistente de Prompts (DeepSeek LLM)
  [x] Sistema de planos com quotas
  [x] Tema light/dark

FASE 2 — Diferencial
  [ ] Upgrade FLUX.1-dev -> FLUX.2-dev + FLUX.2-klein (drafts)
  [ ] Trocar DeepSeek -> Gemini Flash ou Llama 4
  [ ] Agente conversacional de geracao (chat iterativo)
  [ ] Image-to-image (variacoes, mudanca de estilo)
  [ ] Sistema de projetos/series
  [ ] Consistencia de personagem (multi-referencia FLUX.2)

FASE 3 — Impressionar
  [ ] ControlNet (pose, depth) + IP-Adapter
  [ ] Inpainting/outpainting (edicao regional)
  [ ] Exportacao de projetos (PDF, galeria curada)
  [ ] Modos criativos com restricao
  [ ] Exposicoes curadas pela comunidade
  [ ] Testes E2E + CI/CD no GitHub Actions
  [ ] API publica para desenvolvedores

FASE 4 — Visionario (horizonte longo)
  [ ] Geracao de video a partir de imagens
  [ ] Colaboracao em tempo real em projetos
  [ ] Marketplace de estilos e LoRAs
  [ ] Geracao multimodal unificada (imagem + video + audio)
```

---

## 8. Metricas de Sucesso (Portfolio)

O sucesso do ImagAIne como portfolio nao se mede em usuarios ou revenue.
Se mede em:

- **Recrutador consegue entender o projeto em 30 segundos?**
- **O README mostra arquitetura clara?**
- **Tem features que ninguem mais tem em portfolio?**
- **O codigo demonstra maturidade (SDD, testes, tipos, Docker)?**
- **Voce consegue explicar cada decisao tecnica em entrevista?**

---

*Este documento e vivo. Deve ser atualizado conforme o projeto evolui.*
*Criado em: 2026-04-12*
