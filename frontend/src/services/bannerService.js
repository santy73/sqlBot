// src/services/bannerService.js
import axios from 'axios';

// Configuración de la base API
const API_URL = process.env.VUE_APP_API_URL || 'https://api.samanainn.com/chat';

/**
 * Servicio para gestionar los banners dinámicos
 */
const bannerService = {
    /**
     * Obtiene la información del banner según el tipo
     * @param {string} type - Tipo de banner (general, accommodation, etc.)
     * @returns {Promise} - Promesa con datos de respuesta
     */
    getBannerInfo(type = 'general') {
        return axios.get(`${API_URL}/banners`, {
            params: { type }
        });
    },

    /**
     * Obtiene todos los tipos de banners disponibles
     * @returns {Promise} - Promesa con datos de respuesta
     */
    getAvailableBanners() {
        return axios.get(`${API_URL}/banners/list`);
    },

    /**
     * Genera un banner personalizado basado en el contexto de conversación
     * @param {string} conversationId - ID de la conversación
     * @param {string} intent - Intención detectada
     * @returns {Promise} - Promesa con datos de respuesta
     */
    getPersonalizedBanner(conversationId, intent) {
        return axios.get(`${API_URL}/banners/personalized`, {
            params: {
                conversationId,
                intent
            }
        });
    }
};

export default bannerService;