// src/services/bookingService.js
import axios from 'axios';

// Configuración de la base API
const API_URL = process.env.VUE_APP_API_URL || 'https://api.samanainn.com/chat';

/**
 * Servicio para gestionar acciones relacionadas con reservas
 */
const bookingService = {
    /**
     * Genera una URL para redireccionar a la página de reserva
     * @param {Object} params - Parámetros de reserva
     * @returns {Promise} - Promesa con datos de respuesta
     */
    generateBookingURL(params) {
        return axios.post(`${API_URL}/booking/generate-url`, params);
    },

    /**
     * Verifica la disponibilidad de una opción de reserva
     * @param {Object} params - Parámetros para verificar disponibilidad
     * @returns {Promise} - Promesa con datos de respuesta
     */
    checkAvailability(params) {
        return axios.post(`${API_URL}/booking/check-availability`, params);
    },

    /**
     * Obtiene opciones de reserva según criterios
     * @param {string} type - Tipo de servicio (accommodation, restaurant, etc.)
     * @param {Object} filters - Filtros para la búsqueda
     * @returns {Promise} - Promesa con datos de respuesta
     */
    getBookingOptions(type, filters = {}) {
        return axios.get(`${API_URL}/booking/options`, {
            params: {
                type,
                ...filters
            }
        });
    },

    /**
     * Obtiene detalles de una opción específica
     * @param {string} type - Tipo de servicio
     * @param {string} id - ID del elemento
     * @returns {Promise} - Promesa con datos de respuesta
     */
    getItemDetails(type, id) {
        return axios.get(`${API_URL}/booking/details`, {
            params: {
                type,
                id
            }
        });
    }
};

export default bookingService;