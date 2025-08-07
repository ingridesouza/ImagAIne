import { CONFIG, navigateTo } from './config/config.js';
import { AuthService } from './services/auth.service.js';
import { StorageService } from './services/storage.service.js';

// Páginas
import { HomePage } from './pages/home.js';
import { LoginPage } from './pages/login.js';
import { RegisterPage } from './pages/register.js';
import { VerifyEmailPage } from './pages/verify-email.js';
import { ForgotPasswordPage } from './pages/forgot-password.js';
import { ResetPasswordPage } from './pages/reset-password.js';
import { DashboardPage } from './pages/dashboard.js';

class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Navegação entre páginas
        window.addEventListener('popstate', () => this.render());
        
        // Logout
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-logout]')) {
                e.preventDefault();
                this.handleLogout();
            }
        });
    }

    async handleLogout() {
        try {
            await AuthService.logout();
            navigateTo(CONFIG.ROUTES.LOGIN);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    getCurrentRoute() {
        const path = window.location.pathname;
        
        // Verifica rotas dinâmicas primeiro
        if (path.startsWith('/verify-email/')) {
            const token = path.split('/')[2];
            return { path: '/verify-email', params: { token } };
        }
        
        if (path.startsWith('/reset-password/')) {
            const token = path.split('/')[2];
            return { path: '/reset-password', params: { token } };
        }
        
        // Rotas estáticas
        return { path };
    }

    render() {
        const { path, params = {} } = this.getCurrentRoute();
        const isAuthenticated = StorageService.isAuthenticated();
        
        // Redirecionamentos de autenticação
        if (isAuthenticated && this.isAuthRoute(path)) {
            return navigateTo(CONFIG.ROUTES.DASHBOARD);
        }
        
        if (!isAuthenticated && this.isProtectedRoute(path)) {
            return navigateTo(CONFIG.ROUTES.LOGIN);
        }
        
        // Renderiza a página correspondente
        switch (path) {
            case CONFIG.ROUTES.LOGIN:
                this.appElement.innerHTML = LoginPage();
                break;
                
            case CONFIG.ROUTES.REGISTER:
                this.appElement.innerHTML = RegisterPage();
                break;
                
            case '/verify-email':
                this.appElement.innerHTML = VerifyEmailPage(params);
                break;
                
            case CONFIG.ROUTES.FORGOT_PASSWORD:
                this.appElement.innerHTML = ForgotPasswordPage();
                break;
                
            case '/reset-password':
                this.appElement.innerHTML = ResetPasswordPage(params);
                break;
                
            case CONFIG.ROUTES.DASHBOARD:
                this.appElement.innerHTML = DashboardPage();
                break;
                
            case CONFIG.ROUTES.HOME:
            default:
                this.appElement.innerHTML = HomePage();
        }
        
        // Inicializa os eventos da página após o carregamento
        this.initializePageEvents(path, params);
    }
    
    isAuthRoute(path) {
        return [
            CONFIG.ROUTES.LOGIN,
            CONFIG.ROUTES.REGISTER,
            CONFIG.ROUTES.FORGOT_PASSWORD
        ].includes(path);
    }
    
    isProtectedRoute(path) {
        return [
            CONFIG.ROUTES.DASHBOARD
            // Adicione outras rotas protegidas aqui
        ].includes(path);
    }
    
    initializePageEvents(path, params) {
        switch (path) {
            case CONFIG.ROUTES.LOGIN:
                this.initializeLoginPage();
                break;
                
            case CONFIG.ROUTES.REGISTER:
                this.initializeRegisterPage();
                break;
                
            case '/verify-email':
                this.initializeVerifyEmailPage(params);
                break;
                
            case CONFIG.ROUTES.FORGOT_PASSWORD:
                this.initializeForgotPasswordPage();
                break;
                
            case '/reset-password':
                this.initializeResetPasswordPage(params);
                break;
        }
    }
    
    // Inicializadores de página
    initializeLoginPage() {
        const form = document.getElementById('login-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.querySelector('input[name="email"]').value;
            const password = form.querySelector('input[name="password"]').value;
            const errorElement = form.querySelector('.error-message');
            
            try {
                const user = await AuthService.login(email, password);
                navigateTo(CONFIG.ROUTES.DASHBOARD);
            } catch (error) {
                errorElement.textContent = error.message || 'Falha no login. Verifique suas credenciais.';
                errorElement.style.display = 'block';
            }
        });
    }
    
    initializeRegisterPage() {
        const form = document.getElementById('register-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                email: form.querySelector('input[name="email"]').value,
                first_name: form.querySelector('input[name="first_name"]').value,
                last_name: form.querySelector('input[name="last_name"]').value,
                password: form.querySelector('input[name="password"]').value,
                password2: form.querySelector('input[name="password2"]').value
            };
            
            const errorElement = form.querySelector('.error-message');
            
            try {
                await AuthService.register(formData);
                // Redireciona para a página de verificação de e-mail
                navigateTo('/verify-email/sent');
            } catch (error) {
                errorElement.textContent = error.message || 'Falha no cadastro. Tente novamente.';
                errorElement.style.display = 'block';
            }
        });
    }
    
    async initializeVerifyEmailPage({ token }) {
        if (!token) return;
        
        const messageElement = document.getElementById('verification-message');
        const loadingElement = document.getElementById('verification-loading');
        const successElement = document.getElementById('verification-success');
        const errorElement = document.getElementById('verification-error');
        
        try {
            await AuthService.verifyEmail(token);
            
            loadingElement.style.display = 'none';
            successElement.style.display = 'block';
            
            // Redireciona para o login após 3 segundos
            setTimeout(() => {
                navigateTo(CONFIG.ROUTES.LOGIN);
            }, 3000);
            
        } catch (error) {
            console.error('Verification error:', error);
            loadingElement.style.display = 'none';
            errorElement.style.display = 'block';
            errorElement.textContent = error.message || 'Falha na verificação do e-mail.';
        }
    }
    
    initializeForgotPasswordPage() {
        const form = document.getElementById('forgot-password-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.querySelector('input[name="email"]').value;
            const button = form.querySelector('button[type="submit"]');
            const successElement = form.querySelector('.success-message');
            const errorElement = form.querySelector('.error-message');
            
            button.disabled = true;
            button.innerHTML = 'Enviando...';
            
            try {
                await AuthService.forgotPassword(email);
                successElement.style.display = 'block';
                errorElement.style.display = 'none';
            } catch (error) {
                errorElement.textContent = error.message || 'Falha ao enviar e-mail de recuperação.';
                errorElement.style.display = 'block';
                successElement.style.display = 'none';
            } finally {
                button.disabled = false;
                button.innerHTML = 'Enviar link de recuperação';
            }
        });
    }
    
    initializeResetPasswordPage({ token }) {
        const form = document.getElementById('reset-password-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newPassword = form.querySelector('input[name="new_password"]').value;
            const confirmPassword = form.querySelector('input[name="confirm_password"]').value;
            const button = form.querySelector('button[type="submit"]');
            const successElement = form.querySelector('.success-message');
            const errorElement = form.querySelector('.error-message');
            
            if (newPassword !== confirmPassword) {
                errorElement.textContent = 'As senhas não coincidem.';
                errorElement.style.display = 'block';
                return;
            }
            
            button.disabled = true;
            button.innerHTML = 'Redefinindo...';
            
            try {
                await AuthService.resetPassword(token, newPassword);
                successElement.style.display = 'block';
                errorElement.style.display = 'none';
                
                // Redireciona para o login após 3 segundos
                setTimeout(() => {
                    navigateTo(CONFIG.ROUTES.LOGIN);
                }, 3000);
                
            } catch (error) {
                errorElement.textContent = error.message || 'Falha ao redefinir a senha.';
                errorElement.style.display = 'block';
                successElement.style.display = 'none';
            } finally {
                button.disabled = false;
                button.innerHTML = 'Redefinir senha';
            }
        });
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
