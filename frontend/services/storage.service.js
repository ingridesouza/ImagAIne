import { CONFIG } from '../config/config.js';

export class StorageService {
    // Token de autenticação
    static getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }

    static setToken(token) {
        if (token) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
        } else {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        }
    }

    // Dados do usuário
    static getUser() {
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
    }

    static setUser(user) {
        if (user) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        } else {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        }
    }

    // Limpar todos os dados de autenticação
    static clearAuth() {
        this.setToken(null);
        this.setUser(null);
    }

    // Verificar se o usuário está autenticado
    static isAuthenticated() {
        return !!this.getToken();
    }

    // Armazenamento genérico
    static getItem(key) {
        const item = localStorage.getItem(key);
        try {
            return item ? JSON.parse(item) : null;
        } catch (e) {
            return item;
        }
    }

    static setItem(key, value) {
        if (value === null || value === undefined) {
            localStorage.removeItem(key);
        } else {
            const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, valueToStore);
        }
    }

    static removeItem(key) {
        localStorage.removeItem(key);
    }

    // Limpar todo o armazenamento (exceto itens específicos que devem persistir)
    static clearAll(keep = []) {
        const itemsToKeep = {};
        
        // Salva os itens que devem ser mantidos
        keep.forEach(key => {
            itemsToKeep[key] = this.getItem(key);
        });
        
        // Limpa todo o armazenamento
        localStorage.clear();
        
        // Restaura os itens que devem ser mantidos
        Object.entries(itemsToKeep).forEach(([key, value]) => {
            if (value !== null) {
                this.setItem(key, value);
            }
        });
    }
}
