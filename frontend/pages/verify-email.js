import { CONFIG } from '../config/config.js';

export function VerifyEmailPage({ token }) {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Verificação de E-mail</h1>
                </div>
                
                <div class="auth-body">
                    <div id="verification-loading" class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Carregando...</span>
                        </div>
                        <p class="mt-3">Verificando seu endereço de e-mail...</p>
                    </div>
                    
                    <div id="verification-success" class="text-center" style="display: none;">
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>
                            E-mail verificado com sucesso!
                        </div>
                        <p>Você será redirecionado para a página de login em instantes...</p>
                    </div>
                    
                    <div id="verification-error" class="alert alert-danger" style="display: none;">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        <span>Ocorreu um erro ao verificar seu e-mail. O link pode ter expirado ou ser inválido.</span>
                    </div>
                    
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

// Inicializa a verificação do e-mail quando o token estiver presente
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        // Se houver um token na URL, atualiza a página com o token na rota
        window.history.replaceState({}, '', `${CONFIG.ROUTES.VERIFY_EMAIL}?token=${token}`);
        
        // Dispara o evento de popstate para forçar a renderização da página
        window.dispatchEvent(new Event('popstate'));
    }
});
