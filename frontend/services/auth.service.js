import { ApiService } from './api.service.js';
import { CONFIG } from '../config/config.js';

export class AuthService {
    static async login(email, password) {
        try {
            const response = await ApiService.post(CONFIG.ENDPOINTS.AUTH.LOGIN, {
                email,
                password
            });

            // Salva o token e os dados do usuário
            localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.access);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

            return response.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async register(userData) {
        try {
            const response = await ApiService.post(CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    static async verifyEmail(token) {
        try {
            const response = await ApiService.get(CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL(token));
            return response;
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    }

    static async forgotPassword(email) {
        try {
            const response = await ApiService.post(CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
            return response;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    static async resetPassword(token, newPassword) {
        try {
            const response = await ApiService.post(CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
                token,
                new_password: newPassword
            });
            return response;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
    }

    static getCurrentUser() {
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
    }

    static isAuthenticated() {
        return !!this.getCurrentUser();
    }

    /**
     * Exclui permanentemente a conta do usuário
     * @param {string} password - Senha atual do usuário para confirmação
     * @returns {Promise<Object>} Resposta da API
     */
    static async deleteAccount(password) {
        try {
            const response = await ApiService.delete(CONFIG.ENDPOINTS.AUTH.DELETE_ACCOUNT, {
                current_password: password
            });
            
            // Remove os dados de autenticação após a exclusão bem-sucedida
            localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
            
            return response;
        } catch (error) {
            console.error('Delete account error:', error);
            throw error;
        }
    }
}
