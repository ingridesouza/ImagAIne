// Importações de configuração
import { CONFIG } from './config/config.js';

// Importação de serviços
import { AuthService } from './services/auth.service.js';
import { StorageService } from './services/storage.service.js';

// Importação de páginas
import { HomePage } from './pages/home.js';
import { LoginPage } from './pages/login.js';
import { RegisterPage } from './pages/register.js';
import { VerifyEmailPage } from './pages/verify-email.js';
import { ForgotPasswordPage } from './pages/forgot-password.js';
import { ResetPasswordPage } from './pages/reset-password.js';
import { DashboardPage } from './pages/dashboard.js';
import { ProfilePage } from './pages/profile.js';

// Configuração global
window.CONFIG = CONFIG;
window.AuthService = AuthService;
window.StorageService = StorageService;

// Mapeamento de rotas para páginas
const routes = {
  [CONFIG.ROUTES.HOME]: HomePage,
  [CONFIG.ROUTES.LOGIN]: LoginPage,
  [CONFIG.ROUTES.REGISTER]: RegisterPage,
  [CONFIG.ROUTES.VERIFY_EMAIL]: VerifyEmailPage,
  [CONFIG.ROUTES.FORGOT_PASSWORD]: ForgotPasswordPage,
  [CONFIG.ROUTES.RESET_PASSWORD]: ResetPasswordPage,
  [CONFIG.ROUTES.DASHBOARD]: DashboardPage,
  '/profile': ProfilePage,
};

// Função para navegar entre páginas
window.navigateTo = (path) => {
  window.history.pushState({}, '', path);
  renderPage();
};

// Função para renderizar a página com base na rota
function renderPage() {
  const path = window.location.pathname;
  
  // Verifica se o usuário está autenticado
  const isAuthenticated = StorageService.isAuthenticated();
  
  // Se a rota for protegida e o usuário não estiver autenticado, redireciona para o login
  if (isProtectedRoute(path) && !isAuthenticated) {
    navigateTo(CONFIG.ROUTES.LOGIN);
    return;
  }
  
  // Se a rota for de autenticação e o usuário já estiver autenticado, redireciona para o dashboard
  if (isAuthRoute(path) && isAuthenticated) {
    navigateTo(CONFIG.ROUTES.DASHBOARD);
    return;
  }
  
  // Obtém os parâmetros da rota para páginas dinâmicas
  let routeParams = {};
  let routePath = path;
  
  // Verifica rotas dinâmicas
  if (path.startsWith('/verify-email/')) {
    routePath = '/verify-email';
    routeParams.token = path.split('/')[2];
  } else if (path.startsWith('/reset-password/')) {
    routePath = '/reset-password';
    routeParams.token = path.split('/')[2];
  }
  
  // Renderiza a página correspondente à rota
  const page = routes[routePath] || routes[CONFIG.ROUTES.HOME];
  const appElement = document.getElementById('app');
  appElement.innerHTML = page ? page(routeParams) : '<h1>Página não encontrada</h1>';
  
  // Inicializa os eventos da página
  initializePageEvents(routePath, routeParams);
}

// Função para verificar se uma rota é protegida
function isProtectedRoute(path) {
  const protectedRoutes = [
    CONFIG.ROUTES.DASHBOARD,
    '/profile',
    // Adicione outras rotas protegidas aqui
  ];
  
  return protectedRoutes.includes(path);
}

// Função para verificar se uma rota é de autenticação
function isAuthRoute(path) {
  const authRoutes = [
    CONFIG.ROUTES.LOGIN,
    CONFIG.ROUTES.REGISTER,
    CONFIG.ROUTES.FORGOT_PASSWORD,
    // Adicione outras rotas de autenticação aqui
  ];
  
  return authRoutes.includes(path);
}

// Função para inicializar os eventos da página
function initializePageEvents(path, params = {}) {
  switch (path) {
    case CONFIG.ROUTES.LOGIN:
      initializeLoginPage();
      break;
      
    case CONFIG.ROUTES.REGISTER:
      initializeRegisterPage();
      break;
      
    case CONFIG.ROUTES.VERIFY_EMAIL:
      initializeVerifyEmailPage(params);
      break;
      
    case CONFIG.ROUTES.FORGOT_PASSWORD:
      initializeForgotPasswordPage();
      break;
      
    case CONFIG.ROUTES.RESET_PASSWORD:
      initializeResetPasswordPage(params);
      break;
      
    case '/profile':
      initializeProfilePage();
      break;
      
    // Adicione outras inicializações de página conforme necessário
  }
  
  // Configura o evento de logout para todos os botões de logout
  const logoutButtons = document.querySelectorAll('[data-logout]');
  logoutButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await AuthService.logout();
        navigateTo(CONFIG.ROUTES.HOME);
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  });
  
  // Configura a navegação para links internos
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-route]')) {
      e.preventDefault();
      const route = e.target.getAttribute('data-route');
      navigateTo(route);
    }
  });
}

// Inicializadores de páginas
function initializeLoginPage() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        await AuthService.login(email, password);
        navigateTo(CONFIG.ROUTES.DASHBOARD);
      } catch (error) {
        console.error('Login error:', error);
        // Mostrar mensagem de erro
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
          errorElement.textContent = 'Credenciais inválidas. Tente novamente.';
          errorElement.style.display = 'block';
        }
      }
    });
  }
}

function initializeRegisterPage() {
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        password_confirmation: document.getElementById('password_confirmation').value
      };
      
      try {
        await AuthService.register(formData);
        navigateTo(CONFIG.ROUTES.LOGIN);
      } catch (error) {
        console.error('Registration error:', error);
        // Mostrar mensagem de erro
        const errorElement = document.getElementById('register-error');
        if (errorElement) {
          errorElement.textContent = 'Erro ao registrar. Tente novamente.';
          errorElement.style.display = 'block';
        }
      }
    });
  }
}

function initializeVerifyEmailPage({ token }) {
  const verifyButton = document.getElementById('verify-email-button');
  if (verifyButton) {
    verifyButton.addEventListener('click', async () => {
      try {
        await AuthService.verifyEmail(token);
        // Mostrar mensagem de sucesso
        const messageElement = document.getElementById('verification-message');
        if (messageElement) {
          messageElement.textContent = 'E-mail verificado com sucesso!';
          messageElement.className = 'alert alert-success';
        }
      } catch (error) {
        console.error('Email verification error:', error);
        // Mostrar mensagem de erro
        const messageElement = document.getElementById('verification-message');
        if (messageElement) {
          messageElement.textContent = 'Erro ao verificar e-mail. Tente novamente.';
          messageElement.className = 'alert alert-danger';
        }
      }
    });
  }
}

function initializeForgotPasswordPage() {
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      
      try {
        await AuthService.forgotPassword(email);
        // Mostrar mensagem de sucesso
        const messageElement = document.getElementById('forgot-password-message');
        if (messageElement) {
          messageElement.textContent = 'E-mail de recuperação enviado com sucesso!';
          messageElement.className = 'alert alert-success';
        }
      } catch (error) {
        console.error('Forgot password error:', error);
        // Mostrar mensagem de erro
        const messageElement = document.getElementById('forgot-password-message');
        if (messageElement) {
          messageElement.textContent = 'Erro ao enviar e-mail de recuperação. Tente novamente.';
          messageElement.className = 'alert alert-danger';
        }
      }
    });
  }
}

function initializeResetPasswordPage({ token }) {
  const resetPasswordForm = document.getElementById('reset-password-form');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('new_password').value;
      
      try {
        await AuthService.resetPassword(token, newPassword);
        // Mostrar mensagem de sucesso e redirecionar para o login
        const messageElement = document.getElementById('reset-password-message');
        if (messageElement) {
          messageElement.textContent = 'Senha redefinida com sucesso! Redirecionando para o login...';
          messageElement.className = 'alert alert-success';
          
          // Redireciona para o login após 2 segundos
          setTimeout(() => {
            navigateTo(CONFIG.ROUTES.LOGIN);
          }, 2000);
        }
      } catch (error) {
        console.error('Reset password error:', error);
        // Mostrar mensagem de erro
        const messageElement = document.getElementById('reset-password-message');
        if (messageElement) {
          messageElement.textContent = 'Erro ao redefinir senha. Tente novamente.';
          messageElement.className = 'alert alert-danger';
        }
      }
    });
  }
}

function initializeProfilePage() {
  // Adiciona o evento de submit do formulário de perfil
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        first_name: document.getElementById('first-name').value,
        last_name: document.getElementById('last-name').value,
        display_name: document.getElementById('display-name').value,
        bio: document.getElementById('bio').value
      };
      
      try {
        // Aqui você faria a chamada para a API para atualizar o perfil
        // await AuthService.updateProfile(formData);
        
        // Simulando uma resposta de sucesso
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success mt-3';
        alertDiv.textContent = 'Perfil atualizado com sucesso!';
        
        // Remove alertas anteriores
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
          existingAlert.remove();
        }
        
        // Adiciona o novo alerta
        profileForm.prepend(alertDiv);
        
        // Remove o alerta após 3 segundos
        setTimeout(() => {
          alertDiv.remove();
        }, 3000);
        
      } catch (error) {
        console.error('Error updating profile:', error);
        
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger mt-3';
        alertDiv.textContent = 'Erro ao atualizar perfil. Tente novamente.';
        
        // Remove alertas anteriores
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
          existingAlert.remove();
        }
        
        // Adiciona o novo alerta
        profileForm.prepend(alertDiv);
      }
    });
  }
  
  // Adiciona o evento de exclusão de conta
  const deleteAccountForm = document.getElementById('delete-account-form');
  if (deleteAccountForm) {
    deleteAccountForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const password = document.getElementById('current-password').value;
      const confirmDelete = document.getElementById('confirm-delete').checked;
      
      if (!confirmDelete) {
        alert('Por favor, confirme que deseja excluir sua conta.');
        return;
      }
      
      if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
        try {
          await AuthService.deleteAccount(password);
          alert('Sua conta foi excluída com sucesso.');
          navigateTo(CONFIG.ROUTES.HOME);
        } catch (error) {
          console.error('Error deleting account:', error);
          alert('Erro ao excluir a conta. Verifique sua senha e tente novamente.');
        }
      }
    });
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Renderiza a página inicial
  renderPage();
  
  // Configura o manipulador de eventos para navegação
  window.addEventListener('popstate', renderPage);
});
