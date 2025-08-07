import { CONFIG, navigateTo } from '../config/config.js';
import { AuthService } from '../services/auth.service.js';

export function ForgotPasswordPage() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Esqueceu sua senha?</h1>
                    <p class="text-muted">Informe seu e-mail para receber as instruções de redefinição</p>
                </div>
                
                <div class="auth-body">
                    <form id="forgot-password-form" class="auth-form">
                        <div class="mb-4">
                            <p class="mb-3">
                                Digite o endereço de e-mail associado à sua conta e enviaremos um link para redefinir sua senha.
                            </p>
                            
                            <div class="mb-3">
                                <label for="email" class="form-label">E-mail</label>
                                <input 
                                    type="email" 
                                    class="form-control" 
                                    id="email" 
                                    name="email" 
                                    required
                                    autocomplete="email"
                                    autofocus
                                >
                            </div>
                        </div>
                        
                        <div id="forgot-success" class="alert alert-success mb-3" style="display: none;">
                            <i class="fas fa-check-circle me-2"></i>
                            <span>Enviamos um e-mail com as instruções para redefinir sua senha.</span>
                        </div>
                        
                        <div id="forgot-error" class="alert alert-danger mb-3" style="display: none;">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            <span id="error-message">Ocorreu um erro ao processar sua solicitação.</span>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane me-2"></i>Enviar instruções
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
    const form = document.getElementById('forgot-password-form');
    const successElement = document.getElementById('forgot-success');
    const errorElement = document.getElementById('forgot-error');
    const errorMessageElement = document.getElementById('error-message');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.querySelector('#email').value;
            const button = form.querySelector('button[type="submit"]');
            
            // Validação básica de e-mail
            if (!email || !/\S+@\S+\.\S+/.test(email)) {
                errorMessageElement.textContent = 'Por favor, insira um endereço de e-mail válido.';
                errorElement.style.display = 'block';
                successElement.style.display = 'none';
                return;
            }
            
            // Mostra o estado de carregamento
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando...';
            
            try {
                await AuthService.forgotPassword(email);
                
                // Mostra mensagem de sucesso
                successElement.style.display = 'block';
                errorElement.style.display = 'none';
                
                // Limpa o formulário
                form.reset();
                
                // Rola até a mensagem de sucesso
                successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
            } catch (error) {
                console.error('Forgot password error:', error);
                
                // Trata erros específicos da API
                let errorMessage = 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.';
                
                if (error.response) {
                    const data = await error.response.json();
                    if (data.email) {
                        errorMessage = data.email[0];
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
                button.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Enviar instruções';
            }
        });
    }
    
    // Foca no campo de e-mail quando a página carregar
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }
});
