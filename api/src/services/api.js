// Actualización del componente de chat para incluir autenticación API

// Servicio de API para el frontend
// src/services/api.js
export default {
    // API Key para acceso al backend
    apiKey: 'samanainn_api_key_2025_secret', // Idealmente esto vendría de una variable de entorno

    // URL base de la API
    baseUrl: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',

    /**
     * Realiza una petición GET a la API
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} params - Parámetros de la petición
     * @returns {Promise} - Promesa con la respuesta
     */
    async get(endpoint, params = {}) {
        // Construir URL con parámetros query
        const url = new URL(`${this.baseUrl}/${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        // Realizar petición con autenticación
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey
            }
        });

        // Verificar respuesta
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    },

    /**
     * Realiza una petición POST a la API
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar
     * @returns {Promise} - Promesa con la respuesta
     */
    async post(endpoint, data = {}) {
        const url = `${this.baseUrl}/${endpoint}`;

        // Realizar petición con autenticación
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey
            },
            body: JSON.stringify(data)
        });

        // Verificar respuesta
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    },

    /**
     * Realiza una petición PUT a la API
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar
     * @returns {Promise} - Promesa con la respuesta
     */
    async put(endpoint, data = {}) {
        const url = `${this.baseUrl}/${endpoint}`;

        // Realizar petición con autenticación
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey
            },
            body: JSON.stringify(data)
        });

        // Verificar respuesta
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }
};

// Actualización de componente ChatInterface.vue (solo la parte del método sendMessageToAPI)
// Este fragmento debe reemplazar el método existente en el componente

/*
// Enviar mensaje a la API
async sendMessageToAPI(message) {
  try {
    // Usar el servicio API con autenticación
    return await api.post('chat/message', {
      message,
      conversationId: this.conversationId,
      context: this.context,
      sessionId: localStorage.getItem('sessionId') || `session_${Date.now()}`
    });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    throw error;
  }
}
*/