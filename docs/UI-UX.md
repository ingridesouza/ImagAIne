# ImagAIne - Documentacao de UI/UX

> Especificacao visual e interativa completa do frontend.
> Define cada tela, componente, cor, efeito e fluxo de usuario.
> Serve como referencia para implementacao presente e futura.

---

## 0. Identidade Visual — "Quiet Glow"

### 0.1 Conceito

O estilo visual do ImagAIne se chama **Quiet Glow** — silencio com brilho.

A ideia central: a interface e uma **galeria escura** onde as imagens sao a unica
fonte de luz. A UI nao compete com o conteudo. Ela emoldura, recua, e deixa a arte
brilhar. Mas nos momentos certos — um hover, uma geracao, uma transicao — a
interface *pulsa*, como se estivesse viva.

### 0.2 Pilares do Estilo

```
1. CONTENCAO     — pouco e muito. Nada grita. Cada pixel tem proposito.
2. PROFUNDIDADE   — camadas sutis (surface > elevated > overlay). Nao e flat.
3. BRILHO SELETIVO — glow, blur e luz aparecem com intencao, nao decoracao.
4. RESPEITO       — a imagem gerada e a estrela. A UI e moldura.
5. FLUIDEZ        — tudo transiciona. Nada pula. A interface respira.
```

### 0.3 Manifesto Visual

> A tela e um teatro escuro.
> As imagens sao os atores sob o holofote.
> A interface e a arquitetura do teatro — presente, solida, mas invisivel.
> Quando o usuario age, a interface responde com luz suave, nunca com barulho.

### 0.4 Personalidade

| Atributo     | ImagAIne e...                  | ImagAIne NAO e...               |
|--------------|--------------------------------|---------------------------------|
| Tom          | Sofisticado, calmo             | Infantil, barulhento            |
| Cor          | Indigo profundo, zinc, branco  | Arco-iris, neon, saturado       |
| Movimento    | Suave, organico                | Brusco, exagerado               |
| Espacamento  | Generoso, respirado            | Apertado, claustrofobico        |
| Decoracao    | Minima, funcional              | Ornamental, gratuita            |
| Efeitos      | Glow controlado, glassmorphism | Sombras pesadas, drop-shadows   |
| Tipografia   | Limpa, hierarquica             | Decorativa, multiplas fontes    |

### 0.5 Moodboard (referencias visuais)

O ImagAIne se inspira em:

- **Linear** — limpeza, hierarquia, dark mode como padrao
- **Vercel** — espacamento generoso, tipografia Inter, sobriedade
- **Midjourney** — galeria escura onde imagens brilham, masonry
- **Notion** — calma, clareza, nada de mais
- **Apple TV+** — fundo escuro, conteudo luminoso, transicoes suaves

O ImagAIne NAO se inspira em:
- Dribbble gradients excessivos
- Dashboards corporativos com 50 metricas
- Apps de jogos com particulas e explosoes
- Interfaces cluttered de ferramentas de IA

### 0.6 Principios de Decisao Visual

Quando em duvida sobre qualquer escolha visual, use esses filtros:

1. **Isso compete com a imagem gerada?** → Se sim, remova.
2. **Isso serve a funcao ou decoracao?** → Se decoracao, remova.
3. **Isso funcionaria sem animacao?** → Se nao, a animacao e muleta.
4. **Isso precisa de cor ou cinza resolve?** → Se cinza resolve, use cinza.
5. **Isso e mais calmo ou mais barulhento que o atual?** → Escolha o mais calmo.

### 0.7 Onde o "Glow" Aparece (momentos de luz)

O brilho e raro e intencional. Ele so aparece quando a interface quer comunicar
algo especial:

| Momento                        | Efeito                                            |
|--------------------------------|---------------------------------------------------|
| Tela de login/registro         | Orbs de glow (azul + verde) no fundo              |
| Imagem sendo gerada            | Pulse suave no skeleton (a imagem "respira")      |
| Imagem pronta                  | Flash sutil de luz ao aparecer                    |
| Hover em imagem na galeria     | Gradiente escuro revelando info + blur de fundo   |
| Botao primario hover           | Accent intensifica suavemente                     |
| Toggle de tema                 | Transicao suave (0.2s) — nao pisca, flui          |
| Agente criativo responde (futuro)| Glow sutil na borda do chat                     |
| Preview rapido aparece (futuro)| Fade-in com escala sutil (0.95 -> 1.0)            |

### 0.8 Onde o "Quiet" Domina (silencio)

| Contexto                    | Tratamento                                          |
|-----------------------------|-----------------------------------------------------|
| Sidebar                     | Cor solida, sem gradientes, sem sombra lateral       |
| Header                      | Backdrop blur sutil, quase invisivel                 |
| Cards de imagem (repouso)   | Borda fina, sem sombra, imagem fala por si           |
| Texto secundario            | Zinc muted — presente mas nao compete                |
| Botoes secundarios          | Ghost ou outline — transparentes                     |
| Inputs                      | Inset sutil, sem borda destacada ate o focus         |
| Divisores                   | Linha fina (#e4e4e7 light / #27272a dark) ou nenhum  |

### 0.9 Dark Mode como Padrao

O ImagAIne e **dark-first**. O dark mode nao e alternativa — e a experiencia
principal. Razoes:

1. Imagens geradas por IA brilham mais em fundo escuro (contraste)
2. Esteticamente alinhado com estudios criativos (Blender, After Effects, Figma)
3. O "Quiet Glow" funciona melhor no escuro — luz em fundo claro nao brilha
4. Reducao de fadiga visual em sessoes longas de criacao
5. O light mode existe e e completo, mas dark e a experiencia primaria

### 0.10 Linguagem de Microinteracoes

| Acao do usuario         | Feedback visual                                     | Duracao |
|-------------------------|-----------------------------------------------------|---------|
| Hover em botao          | Cor accent intensifica                              | 0.15s   |
| Click em botao          | Scale 0.95 (comprime levemente)                     | 0.1s    |
| Hover em card de imagem | Overlay gradiente + info + blur                     | 0.2s    |
| Like                    | Coracao preenche + cor vermelha (otimista)           | 0.15s   |
| Selecao de chip         | Background accent-soft + texto accent               | 0.15s   |
| Abrir modal             | Fade-in + scale (0.95 -> 1.0) + overlay escurece   | 0.2s    |
| Fechar modal            | Fade-out + scale (1.0 -> 0.95)                     | 0.15s   |
| Troca de tema           | Background e text transitam suavemente               | 0.2s    |
| Scroll infinito carrega | Spinner discreto no fundo da lista                  | -       |
| Imagem gerando          | Skeleton pulsa (opacity 0.4 -> 0.8 -> 0.4)         | 1.8s    |
| Imagem pronta           | Fade-in suave substituindo skeleton                  | 0.3s    |
| Erro                    | Toast vermelho discreto no canto                    | 4s      |
| Sucesso                 | Toast verde discreto no canto                       | 3s      |
| Sidebar abre (mobile)   | Slide da esquerda + overlay escurece                | 0.3s    |
| Wizard avanca step      | Fade para proximo conteudo                          | 0.4s    |

### 0.11 Efeitos Visuais Permitidos

| Efeito               | Onde usar                                | Onde NAO usar              |
|----------------------|------------------------------------------|----------------------------|
| `backdrop-blur`      | Header, overlays, botoes sobre imagem    | Cards, sidebar, paineis    |
| `glow` (box-shadow)  | Auth, geracao ativa, agente futuro       | Botoes comuns, inputs      |
| Gradiente            | Overlay de imagem (de preto/transparente)| Fundos de secao, headers   |
| `opacity` transition | Hover, focus, loading states             | Tudo — nao usar para layout|
| `scale` transition   | Botoes (click), modais (abrir/fechar)    | Cards, imagens, nav items  |
| `blur`               | Backdrop de modais, header sticky        | Imagens, texto, icones     |
| `shimmer`            | Skeletons de carregamento                | Decoracao, idle states     |

### 0.12 Efeitos Visuais PROIBIDOS

Nunca usar no ImagAIne:

- **Parallax scroll** — distrai, nao serve a funcao
- **Particulas / confetti** — infantil, barulhento
- **Text shadow / text glow** — sujo, desnecessario
- **Gradientes de fundo coloridos** — compete com imagens
- **Bordas coloridas / rainbow** — fora da paleta
- **Bounce / elastic animations** — exagerado
- **3D transforms / perspective** — fora do estilo flat-depth
- **Cursor customizado** — frustra o usuario
- **Auto-play video backgrounds** — pesado, distrativo
- **Neon / cyberpunk UI** — mesmo que o conteudo seja cyberpunk, a UI nao e

---

## 1. Design System

### 1.1 Paleta de Cores

O ImagAIne usa um sistema de **tokens semanticos** via CSS custom properties.
As cores mudam entre light/dark mode automaticamente.

#### Light Mode

| Token                | Valor            | Uso                              |
|----------------------|------------------|----------------------------------|
| `--color-bg`         | `#ffffff`        | Fundo principal                   |
| `--color-surface`    | `#f4f4f5`        | Paineis, sidebar, cards           |
| `--color-elevated`   | `#ffffff`        | Elementos elevados (modais)       |
| `--color-inset`      | `#ebebed`        | Campos de input, areas rebaixadas |
| `--color-overlay`    | `rgba(0,0,0,0.45)`| Backdrop de modais              |
| `--color-backdrop`   | `rgba(255,255,255,0.85)` | Header com blur         |
| `--color-text`       | `#18181b`        | Texto principal (zinc-900)        |
| `--color-text-sec`   | `#52525b`        | Texto secundario (zinc-600)       |
| `--color-text-muted` | `#a1a1aa`        | Texto desabilitado (zinc-400)     |
| `--color-text-inv`   | `#ffffff`        | Texto sobre accent                |
| `--color-border`     | `#e4e4e7`        | Bordas leves (zinc-200)           |
| `--color-border-strong`| `#d4d4d8`      | Bordas fortes (zinc-300)          |
| `--color-accent`     | `#4f46e5`        | Cor principal — indigo-600        |
| `--color-accent-hover`| `#4338ca`       | Accent hover — indigo-700         |
| `--color-accent-soft`| `rgba(79,70,229,0.08)` | Accent translucido         |
| `--color-accent-text`| `#4f46e5`        | Texto accent                      |
| `--color-success`    | `#16a34a`        | Sucesso — green-600               |
| `--color-warning`    | `#ca8a04`        | Aviso — yellow-600                |
| `--color-danger`     | `#dc2626`        | Erro/perigo — red-600             |
| `--color-like`       | `#ef4444`        | Coracao/like — red-500            |
| `--color-like-soft`  | `rgba(239,68,68,0.1)` | Like hover                  |

#### Dark Mode (classe `.dark`)

| Token                | Valor            | Mudanca vs light                  |
|----------------------|------------------|----------------------------------|
| `--color-bg`         | `#111113`        | Preto profundo                    |
| `--color-surface`    | `#1a1a1e`        | Cinza escuro                      |
| `--color-elevated`   | `#222226`        | Cinza medio                       |
| `--color-inset`      | `#151517`        | Mais escuro que bg                 |
| `--color-text`       | `#e4e4e7`        | Branco suave (zinc-200)           |
| `--color-text-sec`   | `#a1a1aa`        | Cinza medio                       |
| `--color-text-muted` | `#71717a`        | Cinza escuro                      |
| `--color-accent`     | `#818cf8`        | Indigo mais claro (indigo-400)    |
| `--color-accent-hover`| `#6366f1`       | Indigo-500                        |
| `--color-accent-text`| `#a5b4fc`        | Indigo muito claro                |
| `--color-success`    | `#4ade80`        | Verde claro                       |
| `--color-warning`    | `#facc15`        | Amarelo claro                     |
| `--color-danger`     | `#f87171`        | Vermelho claro                    |

#### Paleta Flow (indigo escalado)

```
flow-50:  #eef2ff    flow-500: #4f46e5
flow-100: #e0e7ff    flow-600: #4338ca
flow-200: #c7d2fe    flow-700: #3730a3
flow-300: #818cf8    flow-800: #312e81
flow-400: #6366f1    flow-900: #1e1b4b
```

#### Sombras

| Token         | Light                            | Dark                             |
|---------------|----------------------------------|----------------------------------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)`    | `0 1px 2px rgba(0,0,0,0.2)`    |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)`   | `0 4px 12px rgba(0,0,0,0.3)`   |
| `--shadow-lg` | `0 12px 40px rgba(0,0,0,0.12)`  | `0 12px 40px rgba(0,0,0,0.5)`  |

### 1.2 Tipografia

| Tipo     | Fonte                                | Uso                     |
|----------|--------------------------------------|-------------------------|
| Display  | Inter (300-700)                      | Titulos, headings       |
| Body     | Inter (300-700)                      | Texto corrido           |
| Code     | JetBrains Mono (400-500)             | Codigo, monospace       |
| Icons    | Material Symbols Outlined            | Icones da interface     |

**Icones**: Material Symbols com `FILL: 0`, `wght: 400`, `GRAD: 0`, `opsz: 24`.
Estilo outline com preenchimento ativado via CSS (FILL: 1) em estados ativos.

### 1.3 Espacamento e Radius

| Token          | Valor    | Uso                          |
|----------------|----------|------------------------------|
| `--radius-md`  | `10px`   | Cards, inputs, botoes        |
| `--radius-lg`  | `14px`   | Cards maiores, paineis       |
| `--radius-xl`  | `20px`   | Modais, dialogs              |
| `--radius-pill`| `999px`  | Badges, chips, avatares      |
| `--sidebar-width` | `18rem` | Largura da sidebar         |

### 1.4 Animacoes

| Animacao        | Duracao | Uso                              |
|-----------------|---------|----------------------------------|
| Shimmer         | 1.8s    | Loading skeleton (gradiente deslizante) |
| Spin            | Continuo| Spinner de carregamento           |
| Theme transition| 0.2s    | Troca light/dark (background + color) |
| Link hover      | 0.15s   | Cor de links                      |
| Sidebar slide   | 0.3s    | Abertura/fechamento no mobile     |
| Overlay fade    | 0.3s    | Backdrop do mobile sidebar        |
| Wizard advance  | 0.4s    | Delay antes de avancar step       |

### 1.5 Breakpoints (Masonry Grid)

| Breakpoint | Colunas (galeria) | Colunas (perfil) |
|------------|-------------------|-------------------|
| < 480px    | 1                 | 1                 |
| >= 480px   | 2                 | -                 |
| >= 640px   | -                 | 2                 |
| >= 768px   | 3                 | -                 |
| >= 1024px  | -                 | 3                 |
| >= 1280px  | 4                 | 4                 |

### 1.6 Scrollbar

- Largura: 6px
- Thumb: `var(--color-border)`, radius 6px
- Track: transparente
- Hover thumb: `var(--color-border-strong)`
- Classe `.no-scrollbar`: esconde completamente

---

## 2. Mapa de Telas

### 2.0 Rotas

| Rota                | Pagina              | Acesso           |
|---------------------|---------------------|------------------|
| `/`                 | ExplorePage         | Autenticado      |
| `/explore`          | ExplorePage         | Autenticado      |
| `/dashboard`        | DashboardPage       | Autenticado      |
| `/generate`         | GenerateImagePage   | Autenticado      |
| `/prompt-assistant` | PromptAssistantPage | Autenticado      |
| `/wizard`           | GuidedWizardPage    | Autenticado      |
| `/public`           | ExplorePage         | Autenticado      |
| `/settings`         | SettingsPage        | Autenticado      |
| `/profile`          | ProfilePage         | Autenticado      |
| `/login`            | LoginPage           | Apenas deslogado |
| `/register`         | RegisterPage        | Apenas deslogado |
| `*`                 | NotFoundPage        | Todos            |

---

### 2.1 LoginPage (`/login`)

**Layout**: Centralizado, sem sidebar. Container com efeitos de glow e pattern.

**Elementos**:
- Logo ImagAIne no topo
- Titulo: "Bem-vindo de volta"
- Campo email (validacao de formato)
- Campo senha (toggle de visibilidade)
- Link "Esqueceu a senha?"
- Botao "Entrar" (accent, full-width)
- Link para registro: "Nao tem conta? Cadastre-se"

**Dados do backend**: `POST /api/auth/login/`
**Feedback**: Toast de erro em caso de falha. Redirect para `/` em sucesso.

---

### 2.2 RegisterPage (`/register`)

**Layout**: Mesmo container do login com glow effects.

**Elementos**:
- Titulo: "Criar conta"
- Campo email
- Campo username (min 3 chars)
- Campos first_name e last_name (min 2 chars, lado a lado)
- Campo bio (opcional, max 180 chars, com contador)
- Campo senha (min 8 chars)
- Campo confirmacao de senha
- Botao "Criar conta" (accent, full-width)
- Link para login

**Dados do backend**: `POST /api/auth/register/`
**Feedback**: Mensagem de sucesso pedindo verificacao de email.

---

### 2.3 DashboardPage (`/dashboard`)

**Layout**: Dentro do AppLayout (sidebar + header).

**Hero Section**:
- Grid de 4 StatCards:
  1. Imagens prontas (count de status=READY)
  2. Em processamento (count de status=GENERATING)
  3. Na galeria publica (count de is_public=true)
  4. Total de imagens
- Cada card: icone + label + valor grande + texto auxiliar

**Secao "Ultimas Criacoes"**:
- Grid com as 3 imagens mais recentes
- Cards com imagem + prompt + status badge
- Botao "Nova geracao" linkando para `/generate`

**Estados**:
- Loading: `DashboardSkeleton` (shimmer em todos os cards)
- Vazio: mensagem de incentivo + CTA

**Dados do backend**: `GET /api/images/my-images/`

---

### 2.4 ExplorePage (`/` ou `/explore`)

**Layout**: AppLayout. Tela principal da aplicacao.

**Header**:
- Campo de busca (filtra por prompt, debounce 400ms)
- Botao "Limpar busca"
- Botoes de ordenacao: Tendencias | Recentes | Downloads | Curtidas

**Grid de Imagens (Masonry)**:
- Cards com aspect ratio variavel
- Hover overlay: prompt (truncado), username, botoes de download e like
- Click: abre `ImageDetailsDialog`

**Painel de Geracao (sticky bottom)**:
- Campo de prompt com contador de caracteres
- Botoes de aspect ratio (1:1, 9:16, 16:9) com indicador deslizante
- Chips de estilo (Photorealistic, Illustration, Oil, Anime, 3D, Minimalist)
- Chips de iluminacao (Natural, Golden Hour, Neon, Dramatic, Soft, Night)
- Chips de enquadramento (Close-up, Portrait, Full Body, Panoramic, Bird Eye, Low Angle)
- Opcoes avancadas expansiveis (negative prompt)
- Botao "Gerar" com estado de loading

**Infinite Scroll**:
- IntersectionObserver com margem de 200px
- Carrega proxima pagina automaticamente
- Skeleton enquanto carrega

**Dados do backend**: `GET /api/images/public/?search=&page=`

---

### 2.5 GenerateImagePage (`/generate`)

**Layout**: AppLayout. Estudio de geracao dedicado.

**Modos de Criacao** (5 pills selecionaveis):
| Modo          | Keywords adicionados automaticamente                    |
|---------------|---------------------------------------------------------|
| Cinematic     | dramatic lighting, film grain, anamorphic              |
| Concept Art   | detailed illustration, digital painting                |
| Character     | full body, expressive pose, character design           |
| Product       | professional photography, commercial, clean background |
| Environment   | landscape, atmospheric, wide angle                     |

**Formulario**:
- Textarea de prompt (min 20 chars, com contador)
- Seletor de aspect ratio com background indicator animado:
  - 1:1 (Quadrado)
  - 9:16 (Retrato)
  - 16:9 (Paisagem)
  - 4:3 (Classico)
  - 3:2 (Foto)
- 3 grupos de chips (mesmo do Explore):
  - Estilo (6 opcoes)
  - Iluminacao (6 opcoes)
  - Enquadramento (6 opcoes)
- Opcoes avancadas (colapsavel):
  - Negative prompt
  - Seed (reprodutibilidade)
- Botao "Gerar Imagem" (accent, grande)

**Auto-generate**: Se vem do PromptAssistant com flag `autoGenerate`, gera automaticamente.

**Estados**:
- Gerando: Pulse skeleton animation
- Erro: Mensagem com AlertCircle
- Sucesso: Notificacao toast

**Dados do backend**: `POST /api/generate/`

---

### 2.6 PromptAssistantPage (`/prompt-assistant`)

**Layout**: AppLayout. Assistente de IA para criacao de prompts.

**Formulario**:
- Textarea: descricao casual em qualquer idioma
- Grid de 8 botoes de estilo (com icones):
  - Fotorrealista, Anime/Manga, Arte Digital, Pintura a Oleo
  - Aquarela, Render 3D, Pixel Art, Esboco/Desenho
- Botao "Criar Prompt Otimizado"

**Resultado (apos resposta da IA)**:
- Card com prompt refinado (em ingles)
  - Botao de copiar ao lado
- Card com negative prompt sugerido
- 2 botoes de acao:
  - "Usar no Explore" (navega com prompt preenchido)
  - "Gerar Imagem Agora" (navega para `/generate` com autoGenerate)

**Dados do backend**: `POST /api/refine-prompt/`

---

### 2.7 GuidedWizardPage (`/wizard`)

**Layout**: AppLayout. Wizard de 7 passos para criacao guiada.

**Barra de progresso**: Passos clicaveis, estado ativo/completo/pendente.

**Passos**:

| # | Step     | Obrigatorio | Opcoes                                                        |
|---|----------|-------------|---------------------------------------------------------------|
| 1 | Tema     | Sim         | Pessoa, Animal, Objeto, Paisagem, Personagem, Abstrato       |
| 2 | Cena     | Nao         | Praia, Floresta, Cidade, Estudio, Espaco, Interior, Fantasia |
| 3 | Estilo   | Sim         | Photorealistic, Anime, Digital, Oil, Watercolor, 3D, Pixel, Sketch |
| 4 | Iluminacao| Nao        | Natural, Golden Hour, Neon, Dramatica, Suave, Estudio, Luar  |
| 5 | Humor    | Nao         | Tranquilo, Dramatico, Misterioso, Alegre, Epico, Romantico, Melancolico, Assustador |
| 6 | Enquadramento | Nao    | Close-up, Retrato, Corpo Inteiro, Plano Geral, Aerea, Contra-plongee |
| 7 | Revisao  | -           | Preview do prompt composto + refinamento por IA               |

**Comportamento de cada step**:
- Cards com icone + titulo + descricao
- Selecao avanca automaticamente (400ms delay)
- Campo de texto customizado em cada step
- Steps opcionais tem botao "Pular"
- Navegacao back/forward entre steps
- Step 7 monta descricao natural e envia para refinamento LLM

**Dados do backend**: `POST /api/refine-prompt/` (no step 7)

---

### 2.8 MyImagesPage (`/my-images`)

**Layout**: AppLayout. Biblioteca pessoal de imagens.

**Hero**:
- Campo de busca (prompt + tags)
- Botao "Criar nova imagem"
- 3 stats: Total na biblioteca | Visiveis no feed | Total de downloads

**Filtros de visibilidade** (tabs):
- Todas
- Publicas (visiveis no feed)
- Privadas (so eu vejo)

**Toolbar**:
- Filtros ativos
- Dropdown de ordenacao

**Grid de Imagens**:
- Cards com status badge (READY/GENERATING/FAILED)
- Botao de toggle visibilidade (olho)
- Botao de like
- Botao de download
- Click: abre detalhes

**Polling**: A cada 5 segundos verifica mudancas de status (GENERATING -> READY).

**Dados do backend**: `GET /api/images/my-images/?page=`

---

### 2.9 ProfilePage (`/profile`)

**Layout**: AppLayout. Perfil publico do usuario.

**Cover**:
- Imagem de capa (200px altura)
- Botao de editar capa (camera icon)

**Avatar**:
- 128x128px, circular
- Fallback: iniciais do nome
- Botao de editar (camera icon)
- Badge de verificado (se is_verified)

**Info**:
- Nome completo + @username
- Bio (editavel)
- Stats: Total criacoes | Likes recebidos | Downloads gerados
- Botoes: Editar perfil | Compartilhar | Mais acoes

**Tabs**:
| Tab       | Conteudo                              | Dados                           |
|-----------|---------------------------------------|---------------------------------|
| Criacoes  | Grid masonry de imagens do usuario    | `GET /api/images/my-images/`    |
| Curtidas  | Grid de imagens curtidas              | `GET /api/images/liked/`        |

**Chips de filtro**: Tudo, Retratos, Paisagens, Cyberpunk, 3D
**Ordenacao**: Mais recentes, Mais baixadas, Mais curtidas

**Dados do backend**: Profile + MyImages + LikedImages + Avatar/Cover upload

---

### 2.10 SettingsPage (`/settings`)

**Layout**: AppLayout. Configuracoes da conta.

**Secoes**:

1. **Conta**
   - Avatar com iniciais
   - Nome, email (read-only)
   - Badge de plano (Free/Pro)
   - Botao trocar senha
   - Campos username, email (read-only)

2. **Preferencias de Geracao**
   - Seletor de modelo (dropdown)
   - Aspect ratio padrao (radio: 1:1, 16:9, 9:16, 21:9)
   - Toggle auto-upscaling

3. **Notificacoes**
   - Toggle: email ao concluir geracao
   - Toggle: novidades e funcionalidades

4. **Privacidade**
   - Toggle: modo publico (imagens no feed por padrao)
   - Botao deletar conta (zona de perigo, vermelho)

**Botoes**: Salvar alteracoes | Cancelar

**Dados do backend**: `GET/PUT /api/auth/preferences/`, `GET/PUT /api/auth/profile/`

---

### 2.11 NotFoundPage (`/*`)

**Layout**: Sem sidebar. Centralizado.

**Elementos**:
- Titulo "404"
- Mensagem "Pagina nao encontrada"
- Link para dashboard

---

## 3. Componentes de Layout

### 3.1 AppLayout

```
+-------+------------------------------------------+
|       |  [AppHeader]                              |
|       |-------------------------------------------|
| Side  |                                           |
| bar   |  [Page Content]                           |
|       |                                           |
|       |                                           |
+-------+------------------------------------------+
```

- Sidebar fixa na esquerda (desktop) ou overlay (mobile)
- Header sticky no topo com backdrop blur
- Area de conteudo com scroll independente
- Keyboard: Escape fecha sidebar mobile

### 3.2 AppHeader

```
[Menu] [Collapse] [Search ⌘K...            ] [Theme] [Notif] [+] [Avatar]
```

- Menu toggle: so aparece no mobile
- Collapse toggle: so no desktop (recolhe sidebar)
- Search: input com atalho ⌘K
- Theme: toggle light/dark (sol/lua)
- Notificacoes: sino (futuro)
- "+": criar nova imagem
- Avatar: iniciais do usuario, linka para settings

### 3.3 AppSidebar

```
[Logo ImagAIne]          [Collapse]

DESCOBRIR
  Explorar
  Visao Geral
  Criar Prompt
  Gerar Imagem

BIBLIOTECA
  Perfil
  Configuracoes

[Credits: 5/20 ██░░░░░░]
[Fazer Upgrade]
```

- Logo: icone + texto (texto some quando colapsado)
- Navegacao por secoes com labels
- Link ativo: highlight com accent
- Icones: Material Symbols com FILL ativado no ativo
- Credits: barra de progresso azul (accent)
- Largura: 15rem expandido, 4.5rem colapsado
- CSS variable `--sidebar-width` para transicao

---

## 4. Componentes Reutilizaveis (UI Kit)

### 4.1 Estruturais

| Componente | Variantes                                    | Descricao                  |
|------------|----------------------------------------------|----------------------------|
| Button     | primary, secondary, ghost, danger            | Botao com estados          |
| Input      | padrao                                       | Campo de texto             |
| Textarea   | padrao                                       | Area de texto multi-linha  |
| Card       | padrao                                       | Container com borda        |
| Badge      | check (verde), loader (azul), alert (vermelho)| Status indicator          |
| Select     | padrao                                       | Dropdown                   |

### 4.2 Display de Dados

| Componente   | Props                        | Descricao                        |
|--------------|------------------------------|----------------------------------|
| StatCard     | label, value, helper, icon   | Card de estatistica (dashboard)  |
| Skeleton     | -                            | Shimmer loading placeholder      |
| Spinner      | label?                       | Loader circular centralizado     |
| EmptyState   | icon, title, desc, action?   | Estado vazio com CTA             |

### 4.3 Display de Imagens

| Componente        | Descricao                                              |
|-------------------|--------------------------------------------------------|
| ImageCard         | Card com status, metadata, botoes (like/download/vis)  |
| GalleryCard       | Card masonry com hover overlay (prompt + acoes)        |
| ImageGrid         | Wrapper grid para ImageCards com empty/loading states   |
| ImageDetailsDialog| Modal fullscreen com imagem + info + comentarios       |

### 4.4 Paginacao

| Componente            | Descricao                                       |
|-----------------------|-------------------------------------------------|
| InfiniteScrollTrigger | IntersectionObserver auto (200px margem)         |
| LoadMoreButton        | Botao manual com texto de progresso              |

---

## 5. ImageDetailsDialog (Componente Complexo)

O modal mais complexo da aplicacao. Aberto ao clicar em qualquer imagem.

```
+------------------------------------------------------+
|  [X]                                                 |
|  +----------------------+  +-----------------------+ |
|  |                      |  | @username             | |
|  |   [IMAGEM GRANDE]    |  | Prompt: "..."         | |
|  |                      |  | Aspect: 1:1  Seed: 42 | |
|  |                      |  |                       | |
|  +----------------------+  | [Like] [Download]     | |
|                            | [Share] [Visibility]  | |
|                            |                       | |
|                            | --- Comentarios ---   | |
|                            | @user1: "Incrivel!"   | |
|                            |   @user2: "Concordo"  | |
|                            |   [Like] [Reply]      | |
|                            |                       | |
|                            | [Novo comentario...]  | |
|                            +-----------------------+ |
+------------------------------------------------------+
```

**Funcionalidades**:
- Imagem em tamanho grande (lado esquerdo)
- Painel de info (lado direito)
- Like com atualizacao otimista (nao espera API)
- Download com incremento de contador
- Toggle de visibilidade (se dono)
- Sistema de comentarios com replies (1 nivel)
- Like em comentarios individuais
- Time-ago formatting (agora, Xmin, Xh, Xd)
- Fecha com Escape ou click no X
- Portal renderizado no body root

---

## 6. Fluxos de Usuario (UX Flows)

### 6.1 Primeiro Acesso

```
RegisterPage -> [email de verificacao] -> LoginPage -> ExplorePage
```

### 6.2 Gerar Imagem (3 caminhos)

**Caminho rapido (Explore)**:
```
ExplorePage -> [preenche prompt no painel bottom] -> [gera] -> [polling] -> [pronta]
```

**Caminho assistido (Wizard)**:
```
GuidedWizardPage -> [7 steps] -> [review + IA refina] -> GenerateImagePage -> [gera]
```

**Caminho expert (Generate)**:
```
GenerateImagePage -> [modo + prompt + chips + advanced] -> [gera]
```

**Caminho IA (Prompt Assistant)**:
```
PromptAssistantPage -> [descreve + estilo] -> [IA refina] -> GenerateImagePage (auto)
```

### 6.3 Interacao Social

```
ExplorePage -> [click imagem] -> ImageDetailsDialog -> [like/comment/download]
```

### 6.4 Gerenciar Colecao

```
MyImagesPage -> [filtro pub/priv] -> [toggle visibilidade] -> [ordenar]
```

### 6.5 Editar Perfil

```
ProfilePage -> [editar avatar/capa] -> [upload] -> [salvo automaticamente]
SettingsPage -> [editar preferencias] -> [salvar]
```

---

## 7. Estados de Carregamento

| Contexto              | Componente usado              | Comportamento                 |
|-----------------------|-------------------------------|-------------------------------|
| Dashboard             | DashboardSkeleton             | Cards + grid shimmer          |
| Galeria (inicial)     | GalleryGridSkeleton (12 items)| Masonry com alturas variadas  |
| Galeria (load more)   | Spinner no fim da lista       | Aparece antes do threshold    |
| Geracao de imagem     | Pulse skeleton animation      | Pulsa enquanto gera           |
| Perfil (imagens)      | ImageGridSkeleton (6 items)   | Grid quadrado                 |
| Login/Register        | Botao disabled + spinner      | Texto muda para "Entrando..." |
| Qualquer pagina       | Spinner centralizado          | Fallback generico             |

---

## 8. Feedback ao Usuario

| Evento                       | Tipo   | Mensagem                                     |
|------------------------------|--------|----------------------------------------------|
| Imagem na fila               | Info   | "Imagem na fila de geracao"                  |
| Imagem pronta                | Success| "Sua imagem esta pronta!"                    |
| Imagem falhou                | Error  | "Erro ao gerar imagem"                       |
| Like adicionado              | -      | Atualizacao otimista (sem toast)             |
| Comentario enviado           | -      | Aparece instantaneamente na lista            |
| Download                     | -      | Inicia download + incrementa contador        |
| Visibilidade alterada        | Success| Toast confirmando                            |
| Quota excedida               | Error  | "Quota mensal atingida. Faca upgrade."       |
| Erro de rede                 | Error  | Toast generico                               |
| Registro completo            | Success| "Verifique seu email"                        |
| Email verificado             | Success| "Email verificado. Faca login."              |
| Senha resetada               | Success| "Senha alterada com sucesso."                |

**Biblioteca de notificacoes**: `sonner` (toasts)

---

## 9. Acessibilidade

| Feature                    | Implementacao                      |
|----------------------------|------------------------------------|
| ARIA labels                | Todos os botoes interativos        |
| Keyboard navigation        | Enter/Space em botoes, Escape fecha|
| HTML semantico             | `<main>`, `<nav>`, `<header>`      |
| Focus management           | Focus trap em dialogs              |
| Alt text                   | Prompt como alt em imagens         |
| Form labels                | Associados via htmlFor             |
| Color contrast             | Tokens semanticos respeitam WCAG   |
| Reduced motion             | (futuro) prefers-reduced-motion    |

---

## 10. O que FALTA no Frontend (gaps atuais)

### 10.1 Features do backend SEM tela no frontend

| Feature backend                 | Endpoint                    | Status no frontend        |
|---------------------------------|-----------------------------|---------------------------|
| Imagens relacionadas            | `GET /images/{id}/related/` | **Nao implementado**      |
| Sugestoes de estilo             | `GET /users/me/style-suggestions/` | **Nao implementado** |
| Verificacao de email (redirect) | `GET /auth/verify-email/`   | Sem pagina dedicada       |
| Reset de senha (formulario)     | `POST /auth/password/reset/*` | Sem pagina dedicada     |

### 10.2 Telas que o frontend tem mas o backend NAO suporta totalmente

| Feature no frontend             | O que falta no backend               |
|---------------------------------|--------------------------------------|
| Filtro por tags no MyImages     | Endpoint nao filtra por tag          |
| Chips de filtro no Profile      | Backend nao tem filtro por categoria |
| Seletor de modelo (Settings)    | Backend so suporta FLUX.1-dev        |
| Auto-upscaling toggle           | Backend nao tem upscale              |
| Notificacoes por email          | Backend nao tem preferencia de notif |
| Deletar conta                   | Backend nao tem endpoint             |
| Trocar senha                    | Backend nao tem endpoint (so reset)  |
| Busca global (header ⌘K)       | Backend so busca em public images    |

### 10.3 Telas/componentes que DEVEM ser criados (Fase 2+)

| Tela                          | Descricao                                    | Prioridade |
|-------------------------------|----------------------------------------------|------------|
| **Chat de Geracao**           | Interface conversacional com agente criativo | ALTA       |
| **Pagina de Projeto**         | Criar/editar projeto com imagens ordenadas   | ALTA       |
| **Galeria de Projetos**       | Feed publico de projetos                     | MEDIA      |
| **Pagina de Personagem**      | Criar/gerenciar personagem com refs          | ALTA       |
| **Pagina de Edicao**          | Image-to-image, inpaint, variacoes           | MEDIA      |
| **Pagina de Verificacao**     | "Email verificado! Faca login."              | BAIXA      |
| **Pagina de Reset de Senha**  | Formulario token + nova senha                | BAIXA      |
| **Pagina de Imagens Relacionadas** | Secao dentro do ImageDetailsDialog      | BAIXA      |
| **Pagina de Sugestoes de Estilo**  | Widget no dashboard ou sidebar          | BAIXA      |
| **Modos Criativos**           | Selecao de modo de restricao                 | BAIXA      |
| **Exposicoes Curadas**        | Colecoes tematicas com narrativa             | BAIXA      |

### 10.4 Endpoints backend que DEVEM ser criados

| Endpoint                             | Motivo                                      |
|--------------------------------------|---------------------------------------------|
| `DELETE /api/auth/account/`          | Deletar conta (exigido pelo frontend)       |
| `POST /api/auth/password/change/`    | Trocar senha (logado, sem token)            |
| `GET /api/images/my-images/?tag=`    | Filtro por tag                              |
| `GET /api/images/public/?tag=`       | Filtro por tag na galeria                   |
| `GET /api/search/?q=`               | Busca global (imagens + projetos + usuarios)|
| `POST /api/auth/preferences/notifications/` | Preferencias de notificacao          |

---

## 11. Futuro: Telas da Fase 2

### 11.1 Chat de Geracao (tela nova)

```
+-------+------------------------------------------+
|       |  Sessao Criativa: "Guerreira Medieval"   |
| Side  |------------------------------------------|
| bar   |  [Agente]: O que voce quer criar hoje?   |
|       |                                          |
|       |  [Voce]: Uma guerreira medieval na chuva |
|       |                                          |
|       |  [Agente]: Pensei nisso:                 |
|       |  +------------------+                    |
|       |  | [PREVIEW 1s]     |                    |
|       |  +------------------+                    |
|       |  Quer armadura pesada ou leve?           |
|       |                                          |
|       |  [Voce]: Pesada, noite, raios ao fundo   |
|       |                                          |
|       |  [Agente]: Versao refinada:              |
|       |  +------------------+                    |
|       |  | [IMAGEM FINAL]   |                    |
|       |  +------------------+                    |
|       |  [Salvar] [Variacoes] [Adicionar projeto]|
|       |                                          |
|       |  [________________________] [Enviar]     |
+-------+------------------------------------------+
```

**Interacao**: SSE streaming para respostas do agente. Preview rapido (FLUX.2 klein ~1s)
aparece inline no chat. Versao final (FLUX.2 dev ~10s) com indicador de progresso.

### 11.2 Pagina de Projeto (tela nova)

```
+-------+------------------------------------------+
|       |  [Capa do Projeto]                       |
| Side  |  Titulo: "Cronicas da Guerreira"         |
| bar   |  Por: @username | 12 imagens | 45 likes  |
|       |------------------------------------------|
|       |  [Modo Grid]  [Modo Storyboard]          |
|       |                                          |
|       |  1. [img] "Guerreira meditando ao amanhecer"
|       |  2. [img] "Primeira batalha na floresta"  |
|       |  3. [img] "Encontro com o dragao"         |
|       |  4. [img] "Victoria ao por do sol"        |
|       |                                          |
|       |  [+ Adicionar imagem] [Reordenar]        |
|       |  [Exportar PDF] [Compartilhar]           |
+-------+------------------------------------------+
```

### 11.3 Pagina de Personagem (tela nova)

```
+-------+------------------------------------------+
|       |  Meus Personagens                        |
| Side  |------------------------------------------|
| bar   |  +--------+  +--------+  +--------+     |
|       |  | Ref 1  |  | Ref 2  |  | Ref 3  |     |
|       |  +--------+  +--------+  +--------+     |
|       |                                          |
|       |  Nome: "Aelin"                           |
|       |  Descricao: "Guerreira medieval, cabelo  |
|       |  ruivo, armadura de prata..."            |
|       |                                          |
|       |  --- Cenas geradas ---                   |
|       |  [img1] [img2] [img3] [img4]             |
|       |                                          |
|       |  [+ Gerar nova cena com este personagem] |
+-------+------------------------------------------+
```

---

## 12. Principios de Design (derivados do Quiet Glow)

1. **A imagem e a estrela** — UI e moldura, nunca protagonista
2. **Silencio com presenca** — paleta sobria (indigo/zinc), efeitos so com proposito
3. **Dark-first** — dark mode e a experiencia primaria, light e complemento
4. **Profundidade sutil** — camadas (surface > elevated > overlay), nao flat puro
5. **Brilho raro** — glow e glassmorphism so em momentos especiais
6. **Fluidez** — tudo transiciona, nada pula, 0.15s-0.3s
7. **Progressive disclosure** — opcoes avancadas escondidas por padrao
8. **Feedback otimista** — atualizacoes imediatas, skeleton enquanto carrega
9. **Consistencia total** — mesmos tokens em toda a app, zero excecoes
10. **Mobile-first** — masonry responsivo, sidebar colapsavel

### Teste rapido de qualquer decisao visual:

> "Isso respeita o Quiet Glow?"
>
> - E calmo? E funcional? Brilha so quando precisa?
> - Se tirar isso, a experiencia piora? Se nao piora, tire.

---

*Documento de referencia para design e implementacao do frontend ImagAIne.*
*Estilo: Quiet Glow — silencio com brilho.*
*Criado em: 2026-04-12*
