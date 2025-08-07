import { CONFIG, navigateTo } from '../config/config.js';

export function EmailSentPage() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="text-center mb-4">
                        <div class="email-sent-icon">
                            <i class="fas fa-envelope-open-text"></i>
                        </div>
                        <h1>Verifique seu e-mail</h1>
                    </div>
                </div>
                
                <div class="auth-body text-center">
                    <p class="mb-4">
                        Enviamos um link de confirmação para o seu endereço de e-mail.
                        Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
                    </p>
                    
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Não recebeu o e-mail?</strong> Verifique sua pasta de spam ou 
                        <a href="#" id="resend-email" class="alert-link">clique aqui para reenviar</a>.
                    </div>
                    
                    <div id="resend-success" class="alert alert-success mt-3" style="display: none;">
                        <i class="fas fa-check-circle me-2"></i>
                        E-mail reenviado com sucesso!
                    </div>
                    
                    <div id="resend-error" class="alert alert-danger mt-3" style="display: none;">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        <span>Ocorreu um erro ao reenviar o e-mail. Tente novamente mais tarde.</span>
                    </div>
                    
                    <div class="d-grid gap-2 mt-4">
                        <a href="${CONFIG.ROUTES.LOGIN}" class="btn btn-outline-primary">
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
    const resendLink = document.getElementById('resend-email');
    const successElement = document.getElementById('resend-success');
    const errorElement = document.getElementById('resend-error');
    
    if (resendLink) {
        resendLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Aqui você pode adicionar a lógica para reenviar o e-mail
            // Por exemplo, fazer uma chamada para a API de reenvio
            
            // Simulando o reenvio do e-mail
            try {
                // Mostra o estado de carregamento
                resendLink.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
                
                // Simula uma chamada à API (substitua pelo código real)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Mostra mensagem de sucesso
                successElement.style.display = 'block';
                errorElement.style.display = 'none';
                
                // Restaura o link após 5 segundos
                setTimeout(() => {
                    resendLink.innerHTML = 'clique aqui para reenviar';
                }, 5000);
                
            } catch (error) {
                console.error('Error resending email:', error);
                errorElement.style.display = 'block';
                successElement.style.display = 'none';
                resendLink.innerHTML = 'clique aqui para reenviar';
            }
        });
    }
});
