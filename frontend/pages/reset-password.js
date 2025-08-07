import { CONFIG, navigateTo } from '../config/config.js';
import { AuthService } from '../services/auth.service.js';

export function ResetPasswordPage({ token }) {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Redefinir Senha</h1>
                    <p class="text-muted">Crie uma nova senha para sua conta</p>
                </div>
                
                <div class="auth-body">
                    <form id="reset-password-form" class="auth-form">
                        <input type="hidden" id="token" value="${token || ''}">
                        
                        <div class="mb-3">
                            <label for="new_password" class="form-label">Nova Senha</label>
                            <div class="input-group">
                                <input 
                                    type="password" 
                                    class="form-control" 
                                    id="new_password" 
                                    name="new_password" 
                                    required
                                    autocomplete="new-password"
                                    minlength="8"
                                >
                                <button class="btn btn-outline-secondary toggle-password" type="button">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="form-text">
                                A senha deve ter pelo menos 8 caracteres, incluindo letras e números.
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label for="confirm_password" class="form-label">Confirmar Nova Senha</label>
                            <div class="input-group">
                                <input 
                                    type="password" 
                                    class="form-control" 
                                    id="confirm_password" 
                                    name="confirm_password" 
                                    required
                                    autocomplete="new-password"
                                    minlength="8"
                                >
                                <button class="btn btn-outline-secondary toggle-password" type="button">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="invalid-feedback" id="password-match-error" style="display: none;">
                                As senhas não coincidem.
                            </div>
                        </div>
                        
                        <div id="reset-success" class="alert alert-success mb-3" style="display: none;">
                            <i class="fas fa-check-circle me-2"></i>
                            <span>Sua senha foi redefinida com sucesso! Redirecionando para o login...</span>
                        </div>
                        
                        <div id="reset-error" class="alert alert-danger mb-3" style="display: none;">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            <span id="error-message">Ocorreu um erro ao redefinir sua senha.</span>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Redefinir Senha
                            </button>
                        </div>
                    </form>
                    
                    <div class="text-center mt-4">
                        <a href="${CONFIG.ROUTES.LOGIN}" class="btn btn-link">
                            <i class="fas fa-arrow-left me-2"></i>Voltar para o login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Inicialização dos eventos da página
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const successElement = document.getElementById('reset-success');
    const errorElement = document.getElementById('reset-error');
    const errorMessageElement = document.getElementById('error-message');
    const passwordMatchError = document.getElementById('password-match-error');
    
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
    
    // Validação em tempo real da confirmação de senha
    const newPasswordInput = document.getElementById('new_password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    
    if (newPasswordInput && confirmPasswordInput) {
        [newPasswordInput, confirmPasswordInput].forEach(input => {
            input.addEventListener('input', () => {
                if (newPasswordInput.value && confirmPasswordInput.value) {
                    if (newPasswordInput.value !== confirmPasswordInput.value) {
                        passwordMatchError.style.display = 'block';
                        confirmPasswordInput.classList.add('is-invalid');
                    } else {
                        passwordMatchError.style.display = 'none';
                        confirmPasswordInput.classList.remove('is-invalid');
                    }
                } else {
                    passwordMatchError.style.display = 'none';
                    confirmPasswordInput.classList.remove('is-invalid');
                }
            });
        });
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const token = document.getElementById('token').value;
            const newPassword = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            const button = form.querySelector('button[type="submit"]');
            
            // Validação de senha
            if (newPassword.length < 8) {
                errorMessageElement.textContent = 'A senha deve ter pelo menos 8 caracteres.';
                errorElement.style.display = 'block';
                successElement.style.display = 'none';
                newPasswordInput.focus();
                return;
            }
            
            if (newPassword !== confirmPassword) {
                errorMessageElement.textContent = 'As senhas não coincidem.';
                errorElement.style.display = 'block';
                successElement.style.display = 'none';
                confirmPasswordInput.focus();
                return;
            }
            
            if (!token) {
                errorMessageElement.textContent = 'Token de redefinição inválido ou expirado.';
                errorElement.style.display = 'block';
                successElement.style.display = 'none';
                return;
            }
            
            // Mostra o estado de carregamento
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Redefinindo...';
            
            try {
                await AuthService.resetPassword(token, newPassword);
                
                // Mostra mensagem de sucesso
                successElement.style.display = 'block';
                errorElement.style.display = 'none';
                
                // Redireciona para o login após 3 segundos
                setTimeout(() => {
                    navigateTo(CONFIG.ROUTES.LOGIN);
                }, 3000);
                
            } catch (error) {
                console.error('Reset password error:', error);
                
                // Trata erros específicos da API
                let errorMessage = 'Ocorreu um erro ao redefinir sua senha. Tente novamente mais tarde.';
                
                if (error.response) {
                    const data = await error.response.json();
                    if (data.token) {
                        errorMessage = 'O link de redefinição é inválido ou expirou. Solicite um novo link.';
                    } else if (data.new_password) {
                        errorMessage = data.new_password[0];
                    } else if (data.non_field_errors) {
                        errorMessage = data.non_field_errors[0];
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                errorMessageElement.textContent = errorMessage;
                errorElement.style.display = 'block';
                successElement.style.display = 'none';
                
                // Rola até o erro
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
            } finally {
                // Restaura o botão ao estado normal
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-save me-2"></i>Redefinir Senha';
            }
        });
    }
    
    // Foca no campo de nova senha quando a página carregar
    if (newPasswordInput) {
        newPasswordInput.focus();
    }
});
