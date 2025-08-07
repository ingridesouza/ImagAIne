import { CONFIG, navigateTo } from '../config/config.js';
import { AuthService } from '../services/auth.service.js';

export function RegisterPage() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Criar Conta</h1>
                    <p class="text-muted">Preencha os dados para se cadastrar</p>
                </div>
                
                <div class="auth-body">
                    <form id="register-form" class="auth-form">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="first_name" class="form-label">Nome</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    id="first_name" 
                                    name="first_name" 
                                    required
                                    autocomplete="given-name"
                                    autofocus
                                >
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label for="last_name" class="form-label">Sobrenome</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    id="last_name" 
                                    name="last_name" 
                                    required
                                    autocomplete="family-name"
                                >
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="email" class="form-label">E-mail</label>
                            <input 
                                type="email" 
                                class="form-control" 
                                id="email" 
                                name="email" 
                                required
                                autocomplete="email"
                            >
                        </div>
                        
                        <div class="mb-3">
                            <label for="password" class="form-label">Senha</label>
                            <div class="input-group">
                                <input 
                                    type="password" 
                                    class="form-control" 
                                    id="password" 
                                    name="password" 
                                    required
                                    autocomplete="new-password"
                                    aria-describedby="passwordHelp"
                                >
                                <button class="btn btn-outline-secondary toggle-password" type="button">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div id="passwordHelp" class="form-text">
                                A senha deve ter pelo menos 8 caracteres, incluindo letras e números.
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="password2" class="form-label">Confirmar Senha</label>
                            <div class="input-group">
                                <input 
                                    type="password" 
                                    class="form-control" 
                                    id="password2" 
                                    name="password2" 
                                    required
                                    autocomplete="new-password"
                                >
                                <button class="btn btn-outline-secondary toggle-password" type="button">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-check mb-4">
                            <input 
                                class="form-check-input" 
                                type="checkbox" 
                                id="terms" 
                                name="terms" 
                                required
                            >
                            <label class="form-check-label" for="terms">
                                Concordo com os <a href="#" target="_blank">Termos de Uso</a> e 
                                <a href="#" target="_blank">Política de Privacidade</a>
                            </label>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-user-plus me-2"></i>Criar Conta
                            </button>
                        </div>
                        
                        <div id="register-error" class="alert alert-danger mt-3" style="display: none;">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            <span id="error-message">Ocorreu um erro ao criar sua conta. Por favor, tente novamente.</span>
                        </div>
                    </form>
                    
                    <div class="auth-footer text-center mt-4">
                        <p class="mb-0">Já tem uma conta? 
                            <a href="${CONFIG.ROUTES.LOGIN}">Faça login</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Inicialização dos eventos da página de registro
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const errorElement = document.getElementById('register-error');
    const errorMessageElement = document.getElementById('error-message');
    
    // Alternar visibilidade da senha
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.closest('.input-group').querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validação de senha
            const password = form.querySelector('#password').value;
            const password2 = form.querySelector('#password2').value;
            
            if (password !== password2) {
                errorMessageElement.textContent = 'As senhas não coincidem.';
                errorElement.style.display = 'block';
                form.querySelector('#password2').focus();
                return;
            }
            
            if (password.length < 8) {
                errorMessageElement.textContent = 'A senha deve ter pelo menos 8 caracteres.';
                errorElement.style.display = 'block';
                form.querySelector('#password').focus();
                return;
            }
            
            const formData = {
                email: form.querySelector('#email').value,
                first_name: form.querySelector('#first_name').value,
                last_name: form.querySelector('#last_name').value,
                password: password,
                password2: password2
            };
            
            const button = form.querySelector('button[type="submit"]');
            
            // Mostra o estado de carregamento
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Criando conta...';
            
            try {
                await AuthService.register(formData);
                
                // Redireciona para a página de confirmação de e-mail
                navigateTo('/verify-email/sent');
                
            } catch (error) {
                console.error('Registration error:', error);
                
                // Trata erros específicos da API
                let errorMessage = 'Ocorreu um erro ao criar sua conta. Por favor, tente novamente.';
                
                if (error.response) {
                    const data = await error.response.json();
                    if (data.email) {
                        errorMessage = data.email[0];
                        form.querySelector('#email').focus();
                    } else if (data.password) {
                        errorMessage = data.password[0];
                        form.querySelector('#password').focus();
                    } else if (data.non_field_errors) {
                        errorMessage = data.non_field_errors[0];
                    }
                }
                
                errorMessageElement.textContent = errorMessage;
                errorElement.style.display = 'block';
                
                // Rola até o erro
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
            } finally {
                // Restaura o botão ao estado normal
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-user-plus me-2"></i>Criar Conta';
            }
        });
    }
    
    // Foca no primeiro campo quando a página carregar
    const firstNameInput = document.getElementById('first_name');
    if (firstNameInput) {
        firstNameInput.focus();
    }
});
