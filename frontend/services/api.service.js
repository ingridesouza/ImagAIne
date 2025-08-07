/**
 * Serviço base para chamadas à API
 * Fornece métodos HTTP genéricos (get, post, put, delete)
 */

export class ApiService {
    /**
     * Faz uma requisição HTTP genérica
     * @param {string} url - URL do endpoint
     * @param {string} method - Método HTTP (GET, POST, PUT, DELETE, etc.)
     * @param {Object} [data] - Dados a serem enviados no corpo da requisição
     * @param {Object} [headers] - Cabeçalhos adicionais
     * @returns {Promise<Object>} - Resposta da API
     */
    static async request(url, method = 'GET', data = null, headers = {}) {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            credentials: 'include' // Importante para cookies de autenticação
        };

        if (data) {
            if (method.toUpperCase() === 'GET') {
                // Para requisições GET, adiciona os parâmetros na URL
                const params = new URLSearchParams();
                Object.keys(data).forEach(key => {
                    if (data[key] !== undefined && data[key] !== null) {
                        params.append(key, data[key]);
                    }
                });
                url += `?${params.toString()}`;
            } else {
                // Para outros métodos, envia os dados no corpo
                config.body = JSON.stringify(data);
            }
        }

        // Adiciona o token de autenticação se existir
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Verifica se a resposta é um JSON
            const contentType = response.headers.get('content-type');
            const responseData = contentType && contentType.includes('application/json') 
                ? await response.json() 
                : await response.text();

            if (!response.ok) {
                // Se a resposta não for bem-sucedida, lança um erro
                const error = new Error(responseData.message || 'Erro na requisição');
                error.status = response.status;
                error.data = responseData;
                throw error;
            }

            return responseData;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    /**
     * Faz uma requisição GET
     * @param {string} url - URL do endpoint
     * @param {Object} [params] - Parâmetros de consulta
     * @param {Object} [headers] - Cabeçalhos adicionais
     * @returns {Promise<Object>} - Resposta da API
     */
    static async get(url, params = {}, headers = {}) {
        return this.request(url, 'GET', params, headers);
    }

    /**
     * Faz uma requisição POST
     * @param {string} url - URL do endpoint
     * @param {Object} [data] - Dados a serem enviados
     * @param {Object} [headers] - Cabeçalhos adicionais
     * @returns {Promise<Object>} - Resposta da API
     */
    static async post(url, data = {}, headers = {}) {
        return this.request(url, 'POST', data, headers);
    }

    /**
     * Faz uma requisição PUT
     * @param {string} url - URL do endpoint
     * @param {Object} [data] - Dados a serem enviados
     * @param {Object} [headers] - Cabeçalhos adicionais
     * @returns {Promise<Object>} - Resposta da API
     */
    static async put(url, data = {}, headers = {}) {
        return this.request(url, 'PUT', data, headers);
    }

    /**
     * Faz uma requisição DELETE
     * @param {string} url - URL do endpoint
     * @param {Object} [data] - Dados a serem enviados
     * @param {Object} [headers] - Cabeçalhos adicionais
     * @returns {Promise<Object>} - Resposta da API
     */
    static async delete(url, data = {}, headers = {}) {
        return this.request(url, 'DELETE', data, headers);
    }

    /**
     * Faz upload de arquivo
     * @param {string} url - URL do endpoint
     * @param {FormData} formData - Dados do formulário com o arquivo
     * @param {Object} [headers] - Cabeçalhos adicionais
     * @returns {Promise<Object>} - Resposta da API
     */
    static async upload(url, formData, headers = {}) {
        const config = {
            method: 'POST',
            body: formData,
            headers: {
                // O Content-Type será definido automaticamente com o boundary
                ...headers
            },
            credentials: 'include'
        };

        // Adiciona o token de autenticação se existir
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const responseData = await response.json();

            if (!response.ok) {
                const error = new Error(responseData.message || 'Erro no upload');
                error.status = response.status;
                error.data = responseData;
                throw error;
            }

            return responseData;
        } catch (error) {
            console.error('Erro no upload:', error);
            throw error;
        }
    }
}
