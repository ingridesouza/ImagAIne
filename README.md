# ImagAIne - Plataforma de Geração e Compartilhamento de Imagens por IA

## 🚀 Visão Geral
O ImagAIne é uma plataforma web que permite aos usuários gerar imagens únicas a partir de descrições textuais (prompts) utilizando inteligência artificial. Desenvolvido com Django, o sistema oferece recursos de autenticação de usuários, geração assíncrona de imagens e compartilhamento público das criações.

## ✨ Recursos Principais

- **Geração de Imagens por IA**: Crie imagens a partir de descrições textuais (prompts).
- **Perfis de Usuário**: Perfis personalizáveis com foto, bio e links de redes sociais.
- **Planos de Assinatura**: Planos Free e Premium com diferentes limites de geração de imagens.
- **Galeria Pública**: Explore e baixe imagens criadas por outros usuários, com o nome do autor.
- **Compartilhamento de Imagens**: Torne suas criações privadas ou públicas.
- **Autenticação Segura**: Sistema de registro e login com JWT (JSON Web Tokens).
- **Painel de Administração Moderno**: Interface de admin aprimorada para fácil gerenciamento de usuários e imagens.

## 🛠️ Tecnologias Utilizadas

### Backend
- **Django**: Framework web Python para desenvolvimento rápido e limpo
- **Django REST Framework**: Para construção de APIs RESTful
- **Celery**: Processamento assíncrono de geração de imagens
- **Redis**: Broker de mensagens para filas de tarefas
- **Hugging Face Diffusers**: Para geração de imagens com IA
- **PostgreSQL**: Banco de dados relacional
- **django-admin-interface**: Para uma interface de administração moderna e personalizável







## 🚀 Como Executar o Projeto

### Pré-requisitos

- Docker e Docker Compose instalados
- Git para clonar o repositório
- Pelo menos 8GB de RAM recomendado para execução local

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/ingridesouza/ImagAIne.git
   cd ImagAIne
   ```

2. Crie um arquivo `.env` na raiz do projeto com as variáveis de ambiente necessárias (veja `.env.example` para referência)

3. Inicie os contêineres Docker:
   ```bash
   docker-compose up -d --build
   ```

4. Acesse a aplicação em:
   
   - API: http://localhost:8000
   - Admin Django: http://localhost:8000/admin

## 🛠️ Endpoints da API

### Autenticação
- `POST /api/auth/register/` - Registrar um novo usuário.
- `POST /api/auth/login/` - Autenticar e obter tokens JWT.
- `POST /api/auth/login/refresh/` - Obter um novo token de acesso usando o token de atualização.

### Usuário e Assinatura
- `GET /api/users/me/` - Obter detalhes do perfil do usuário autenticado.
- `PATCH /api/users/me/` - Atualizar o perfil do usuário (nome, bio, redes sociais, etc.).
- `POST /api/subscription/upgrade/` - Fazer upgrade do plano do usuário para Premium.

### Imagens
- `POST /api/generate/` - Gerar uma nova imagem a partir de um prompt (respeita os limites do plano).
- `GET /api/images/public/` - Listar todas as imagens públicas.
- `GET /api/images/my-images/` - Listar as imagens do usuário autenticado.
- `POST /api/images/<id>/share/` - Tornar uma imagem privada em pública.

## 🤝 Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## ✉️ Contato

- Instagram: [@ingridesouzadev](https://instagram.com/ingridesouzadev)
- LinkedIn: [Ingride Souza](https://www.linkedin.com/in/ingride-souza-a21a4518a/)
- Link do Projeto: [https://github.com/ingridesouza/ImagAIne](https://github.com/ingridesouza/ImagAIne)

## 🙏 Agradecimentos

- À comunidade de código aberto por ferramentas incríveis
- Aos mantenedores das bibliotecas utilizadas
- A todos os contribuidores que ajudaram a melhorar este projeto
