import { CONFIG, navigateTo } from '../config/config.js';
import { AuthService } from '../services/auth.service.js';

export function LoginPage() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Login</h1>
                    <p class="text-muted">Acesse sua conta para continuar</p>
                </div>
                
                <div class="auth-body">
                    <form id="login-form" class="auth-form">
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
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <label for="password" class="form-label">Senha</label>
                                <a href="${CONFIG.ROUTES.FORGOT_PASSWORD}" class="small">Esqueceu a senha?</a>
                            </div>
                            <input 
                                type="password" 
                                class="form-control" 
                                id="password" 
                                name="password" 
                                required
                                autocomplete="current-password"
                            >
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-sign-in-alt me-2"></i>Entrar
                            </button>
                        </div>
                        
                        <div id="login-error" class="alert alert-danger mt-3" style="display: none;">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            <span>E-mail ou senha inválidos. Tente novamente.</span>
                        </div>
                    </form>
                    
                    <div class="auth-footer text-center mt-4">
                        <p class="mb-0">Não tem uma conta? 
                            <a href="${CONFIG.ROUTES.REGISTER}">Cadastre-se</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Inicialização dos eventos da página de login
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const errorElement = document.getElementById('login-error');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.querySelector('#email').value;
            const password = form.querySelector('#password').value;
            const button = form.querySelector('button[type="submit"]');
            
            // Mostra o estado de carregamento
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Entrando...';
            
            try {
                const user = await AuthService.login(email, password);
                // Redireciona para o dashboard após o login bem-sucedido
                navigateTo(CONFIG.ROUTES.DASHBOARD);
            } catch (error) {
                console.error('Login error:', error);
                errorElement.textContent = error.message || 'E-mail ou senha inválidos. Tente novamente.';
                errorElement.style.display = 'block';
                
                // Foca no campo de e-mail e rola até o erro
                form.querySelector('#email').focus();
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } finally {
                // Restaura o botão ao estado normal
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Entrar';
            }
        });
    }
    
    // Foca no campo de e-mail quando a página carregar
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }
});
