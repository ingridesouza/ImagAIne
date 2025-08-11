# ImagAIne - Plataforma de Geração e Compartilhamento de Imagens por IA

## 🚀 Visão Geral
O ImagAIne é uma plataforma web que permite aos usuários gerar imagens únicas a partir de descrições textuais (prompts) utilizando inteligência artificial. Desenvolvido com Django, o sistema oferece recursos de autenticação de usuários, geração assíncrona de imagens e compartilhamento público das criações.

## ✨ Recursos Principais

- **Geração de Imagens**: Crie imagens a partir de descrições textuais usando modelos de IA avançados
- **Compartilhamento Público**: Torne suas imagens disponíveis para toda a comunidade
- **Galeria Pública**: Explore e baixe imagens criadas por outros usuários
- **Busca Inteligente**: Encontre imagens por palavras-chave ou similaridade de conceito
- **Autenticação Segura**: Sistema de login e registro com JWT (JSON Web Tokens)
- **Interface Responsiva**: Acessível em dispositivos móveis e desktop

## 🛠️ Tecnologias Utilizadas

### Backend
- **Django**: Framework web Python para desenvolvimento rápido e limpo
- **Django REST Framework**: Para construção de APIs RESTful
- **Celery**: Processamento assíncrono de geração de imagens
- **Redis**: Broker de mensagens para filas de tarefas
- **Hugging Face Diffusers**: Para geração de imagens com IA
- **PostgreSQL**: Banco de dados relacional







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
- `POST /api/token/` - Obter token JWT (login)
- `POST /api/token/refresh/` - Atualizar token JWT
- `POST /api/register/` - Registrar novo usuário

### Imagens
- `POST /api/generate/` - Gerar nova imagem a partir de um prompt
- `GET /api/images/public/` - Listar imagens públicas
- `GET /api/images/my-images/` - Listar imagens do usuário autenticado
- `PATCH /api/images/<id>/share/` - Compartilhar/remover compartilhamento de imagem

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
