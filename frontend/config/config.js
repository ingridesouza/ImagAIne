// Verifica se está rodando em desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development';

// Configurações globais da aplicação
export const CONFIG = {
    // Usa o host.docker.internal para acessar o host do Docker no Windows/macOS
    // No Linux, pode ser necessário usar o IP real do host
    API_BASE_URL: isDevelopment 
        ? 'http://localhost:8000/api' 
        : 'http://backend:8000/api', // Nome do serviço no docker-compose
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login/',
            REGISTER: '/auth/register/',
            VERIFY_EMAIL: (token) => `/auth/verify-email/${token}/`,
            FORGOT_PASSWORD: '/auth/password/reset/request/',
            RESET_PASSWORD: '/auth/password/reset/confirm/',
            PROFILE: '/auth/profile/',
            DELETE_ACCOUNT: '/auth/delete-account/'
        }
    },
    STORAGE_KEYS: {
        AUTH_TOKEN: 'auth_token',
        USER_DATA: 'user_data'
    },
    ROUTES: {
        HOME: '/',
        LOGIN: '/login',
        REGISTER: '/register',
        VERIFY_EMAIL: '/verify-email',
        FORGOT_PASSWORD: '/forgot-password',
        RESET_PASSWORD: '/reset-password',
        DASHBOARD: '/dashboard'
    }
};

// Função para navegação entre páginas
export const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
};

// Função para obter o token de autenticação
export const getAuthToken = () => {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
};

// Função para verificar se o usuário está autenticado
export const isAuthenticated = () => {
    return !!getAuthToken();
};
