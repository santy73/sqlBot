// src/services/chatService.js
import axios from 'axios';

// Configuración de la base API
const API_URL = process.env.VUE_APP_API_URL || 'https://api.samanainn.com/chat';

/**
 * Servicio para interactuar con el API del chatbot
 */
const chatService = {
    /**
     * Inicializa una nueva conversación con el chatbot
     * @param {string} sessionId - ID de sesión del usuario
     * @returns {Promise} - Promesa con datos de respuesta
     */
    initConversation(sessionId) {
        return axios.post(`${API_URL}/conversations`, {
            sessionId,
            source: 'web'
        });
    },

    /**
     * Envía un mensaje al chatbot y obtiene respuesta
     * @param {string} conversationId - ID de la conversación
     * @param {string} message - Mensaje del usuario
     * @param {Object} context - Contexto adicional opcional
     * @returns {Promise} - Promesa con datos de respuesta
     */
    sendMessage(conversationId, message, context = {}) {
        return axios.post(`${API_URL}/messages`, {
            conversationId,
            message,
            context
        });
    },

    /**
     * Obtiene el historial de mensajes de una conversación
     * @param {string} conversationId - ID de la conversación
     * @returns {Promise} - Promesa con datos de respuesta
     */
    getConversationHistory(conversationId) {
        return axios.get(`${API_URL}/conversations/${conversationId}/messages`);
    },

    /**
     * Proporciona feedback sobre una respuesta del chatbot
     * @param {string} messageId - ID del mensaje
     * @param {boolean} helpful - ¿Fue útil la respuesta?
     * @param {string} feedback - Comentarios opcionales
     * @returns {Promise} - Promesa con datos de respuesta
     */
    provideFeedback(messageId, helpful, feedback = '') {
        return axios.post(`${API_URL}/feedback`, {
            messageId,
            helpful,
            feedback
        });
    },

    /**
     * Marca una conversación como finalizada
     * @param {string} conversationId - ID de la conversación
     * @returns {Promise} - Promesa con datos de respuesta
     */
    endConversation(conversationId) {
        return axios.put(`${API_URL}/conversations/${conversationId}`, {
            status: 'archived'
        });
    }
};

export default chatService;