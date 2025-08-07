# Frontend do Projeto ImagAIne

Este é o frontend do projeto ImagAIne, uma aplicação web para geração de imagens com IA.

## Pré-requisitos

- Node.js 18+ e npm 8+
- Docker e Docker Compose (opcional, para execução em container)

## Configuração do ambiente de desenvolvimento

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/imagaine.git
   cd imagaine/frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

## Executando localmente

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O servidor será iniciado em [http://localhost:3000](http://localhost:3000)

## Construindo para produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

## Executando com Docker

### Construir a imagem

```bash
docker build -t imagaine-frontend .
```

### Executar o contêiner

```bash
docker run -d -p 3000:80 --env API_BASE_URL=http://backend:8000/api --name imagaine-frontend imagaine-frontend
```

### Usando Docker Compose

Crie um arquivo `docker-compose.yml` na raiz do projeto:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:80"
    environment:
      - API_BASE_URL=http://backend:8000/api
    depends_on:
      - backend
    networks:
      - imagaine-network

  # Adicione aqui a configuração do backend se necessário
  # backend:
  #   ...

networks:
  imagaine-network:
    driver: bridge
```

Em seguida, execute:

```bash
docker-compose up -d
```

## Estrutura do Projeto

```
frontend/
├── public/               # Arquivos estáticos
├── src/                  # Código-fonte
│   ├── assets/           # Recursos estáticos (imagens, fontes, etc.)
│   ├── components/       # Componentes reutilizáveis
│   ├── config/           # Configurações da aplicação
│   ├── pages/            # Páginas da aplicação
│   ├── services/         # Serviços (API, autenticação, etc.)
│   ├── styles/           # Estilos globais
│   ├── App.js            # Componente raiz
│   └── main.js           # Ponto de entrada da aplicação
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-entrypoint.sh
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## Variáveis de Ambiente

| Variável          | Descrição                               | Valor Padrão                 |
|-------------------|----------------------------------------|------------------------------|
| VITE_API_BASE_URL | URL base da API do backend             | http://localhost:8000/api    |

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Constrói a aplicação para produção
- `npm run preview` - Previsualiza a build de produção localmente
- `npm run start` - Inicia o servidor de produção (após o build)

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
