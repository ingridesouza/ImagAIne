// Importações de configuração
import { CONFIG } from '../config/config.js';

// Importação de serviços
import { AuthService } from '../services/auth.service.js';
import { StorageService } from '../services/storage.service.js';

// Importação de páginas
import { HomePage } from '../pages/home.js';
import { LoginPage } from '../pages/login.js';
import { RegisterPage } from '../pages/register.js';
import { VerifyEmailPage } from '../pages/verify-email.js';
import { ForgotPasswordPage } from '../pages/forgot-password.js';
import { ResetPasswordPage } from '../pages/reset-password.js';
import { DashboardPage } from '../pages/dashboard.js';
import { ProfilePage } from '../pages/profile.js';

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

// Função para renderizar a página com base na rota
function renderPage() {
  const path = window.location.pathname;
  const appElement = document.getElementById('app');
  
  // Verifica se o usuário está autenticado
  const isAuthenticated = StorageService.isAuthenticated();
  
  // Se a rota for protegida e o usuário não estiver autenticado, redireciona para o login
  if (isProtectedRoute(path) && !isAuthenticated) {
    window.location.href = CONFIG.ROUTES.LOGIN;
    return;
  }
  
  // Se a rota for de autenticação e o usuário já estiver autenticado, redireciona para o dashboard
  if (isAuthRoute(path) && isAuthenticated) {
    window.location.href = CONFIG.ROUTES.DASHBOARD;
    return;
  }
  
  // Renderiza a página correspondente à rota
  const page = routes[path] || routes[CONFIG.ROUTES.HOME];
  appElement.innerHTML = page ? page() : '<h1>Página não encontrada</h1>';
  
  // Inicializa os eventos da página
  initializePageEvents(path);
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
function initializePageEvents(path) {
  // Adicione a inicialização de eventos específicos da página aqui
  if (path === CONFIG.ROUTES.LOGIN) {
    initializeLoginPage();
  } else if (path === CONFIG.ROUTES.REGISTER) {
    initializeRegisterPage();
  } else if (path === '/profile') {
    initializeProfilePage();
  }
  // Adicione outras inicializações de página conforme necessário
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Renderiza a página inicial
  renderPage();
  
  // Configura o manipulador de eventos para navegação
  window.addEventListener('popstate', renderPage);
  
  // Configura a navegação para links internos
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-route]')) {
      e.preventDefault();
      const path = e.target.getAttribute('data-route');
      window.history.pushState({}, '', path);
      renderPage();
    }
  });
});

// Exporta as funções necessárias para uso em outros arquivos
window.navigateTo = (path) => {
  window.history.pushState({}, '', path);
  renderPage();
};

// Inicializa a aplicação
renderPage();
