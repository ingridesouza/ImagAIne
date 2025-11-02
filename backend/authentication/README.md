# Authentication Module

Camada responsavel pelos fluxos de cadastro, login, verificacao de e-mail, redefinicao de senha e gerenciamento de perfil da plataforma ImagAIne. O modulo estende o usuario padrao do Django para suportar login por e-mail e integra o Simple JWT para emissao de tokens.

## Principais recursos
- **Usuario personalizado** (`authentication.models.User`) com identificador UUID, campo `email` unico e flag `is_verified`.
- **Registro com dupla confirmacao de senha** e envio automatico de e-mail com link de verificacao.
- **Login por e-mail** com bloqueio enquanto o usuario nao confirmar o endereco.
- **Reset de senha** com tokens temporarios (`PasswordResetToken`) validos por 24 horas.
- **Perfil autenticado** disponivel via `GET` e `PUT`.
- Templates HTML para e-mails de verificacao, reset e boas-vindas em `authentication/templates/emails/`.

## Dependencias relevantes
- `djangorestframework`
- `djangorestframework-simplejwt`
- `python-decouple`
- Servico de e-mail SMTP configurado via variaveis de ambiente (veja `.env` na raiz).

## Endpoints
Todos os caminhos abaixo estao sob o prefixo `/api/auth/`.

| Metodo | Caminho                   | Descricao                                                                   |
| ------ | ------------------------- | --------------------------------------------------------------------------- |
| POST   | `register/`               | Cria usuario, dispara e-mail de verificacao.                                |
| POST   | `login/`                  | Valida credenciais e retorna tokens JWT.                                    |
| POST   | `token/refresh/`          | Gera novo access token a partir do refresh token.                           |
| GET    | `verify-email/<token>/`   | Marca usuario como verificado e envia e-mail de boas-vindas.                |
| POST   | `password/reset/request/` | Cria token de reset e envia link por e-mail.                                |
| POST   | `password/reset/confirm/` | Atualiza a senha utilizando token valido.                                   |
| GET    | `profile/`                | Retorna dados basicos do usuario autenticado.                               |
| PUT    | `profile/`                | Atualiza nome, sobrenome ou username do usuario autenticado.                |

> O endpoint `/api/token/verify/` (definido no projeto principal) continua disponivel para verificar tokens emitidos.

## Variaveis de ambiente
O modulo utiliza as seguintes chaves (definidas no arquivo `.env` da raiz):

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@example.com
EMAIL_HOST_PASSWORD=senha-ou-app-password
DEFAULT_FROM_EMAIL=seu-email@example.com
FRONTEND_URL=http://localhost:3000

SECRET_KEY=chave-secreta # tambem usada pelo Simple JWT
```

`FRONTEND_URL` e utilizado para construir os links de verificacao e reset enviados por e-mail.

## Modelos
- `User`: estende `AbstractUser`, substitui o identificador por UUID, usa `email` como `USERNAME_FIELD` e adiciona campos `is_verified` e `verification_token`.
- `PasswordResetToken`: armazena tokens de reset com data de expiracao (`expires_at`) e flag `is_used`.

## Fluxos principais
### Registro
1. `POST /api/auth/register/` com os campos `email`, `username`, `first_name`, `last_name`, `password`, `password2`.
2. Usuario e criado, token de verificacao (UUID) e persistido.
3. E-mail HTML `emails/verification.html` e enviado com link `<FRONTEND_URL>/verify-email/<token>/`.
4. Ao acessar o link, `VerifyEmailView` define `is_verified=True`, limpa o token e dispara `emails/welcome.html`.

### Reset de senha
1. `POST /api/auth/password/reset/request/` com `email`.
2. Tokens ativos do usuario sao invalidados, novo registro `PasswordResetToken` (expira em 24 horas) e criado.
3. E-mail `emails/password_reset.html` envia link `<FRONTEND_URL>/reset-password/<token>/`.
4. `POST /api/auth/password/reset/confirm/` com `token`, `new_password` e `new_password_confirm` atualiza a senha e marca o token como usado.

### Login e JWT
- `UserLoginView` autentica por `email` e `password`, exige `is_verified=True`.
- `RefreshToken.for_user` gera par `refresh` e `access`, retornados ao cliente.
- Simple JWT tambem atualiza `last_login` por configuracao em `settings.py`.

## Execucao local
Com dependencias instaladas (veja README da raiz):
```bash
python backend/manage.py makemigrations authentication
python backend/manage.py migrate
python backend/manage.py runserver
```
Para testar envio de e-mails em desenvolvimento, ajuste `EMAIL_BACKEND` no `.env` (por exemplo, `django.core.mail.backends.console.EmailBackend`).

## Testes manuais sugeridos
1. Registrar novo usuario, checar e-mail enviado e tentar login antes e depois da verificacao.
2. Solicitar reset de senha, utilizar o token recebido e validar bloqueio apos expirar ou reutilizar.
3. Atualizar o perfil autenticado e garantir que o username permanece unico.

## Estendendo o modulo
- Personalize os templates HTML em `templates/emails/` para refletir a identidade visual do produto.
- Adicione campos extras aos serializers `UserSerializer` ou `UserRegistrationSerializer` conforme necessario.
- Implemente throttling ou rate limiting via DRF configurando `DEFAULT_THROTTLE_CLASSES` em `settings.py` caso deseje limitar tentativas de login.
