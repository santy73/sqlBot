// src/utils/responseFormatter.js

/**
 * Utilidad para formatear respuestas de la API
 */
class ResponseFormatter {
    /**
     * Formatea una respuesta exitosa
     * @param {Object} data - Datos a incluir en la respuesta
     * @param {string} message - Mensaje descriptivo (opcional)
     * @returns {Object} - Respuesta formateada
     */
    success(data, message = null) {
        const response = {
            success: true,
            data
        };

        if (message) {
            response.message = message;
        }

        return response;
    }

    /**
     * Formatea una respuesta de error
     * @param {string} message - Mensaje de error
     * @param {number} statusCode - Código de estado HTTP
     * @param {Object} errors - Detalles adicionales del error (opcional)
     * @returns {Object} - Respuesta de error formateada
     */
    error(message, statusCode = 400, errors = null) {
        const response = {
            success: false,
            message,
            statusCode
        };

        if (errors) {
            response.errors = errors;
        }

        return response;
    }

    /**
     * Formatea una respuesta de chat
     * @param {Object} chatResponse - Respuesta del sistema de chat
     * @param {string} conversationId - ID de la conversación
     * @returns {Object} - Respuesta formateada para el cliente
     */
    chatResponse(chatResponse, conversationId) {
        return {
            success: true,
            response: chatResponse,
            conversationId,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Formatea una respuesta de búsqueda
     * @param {Array} results - Resultados de la búsqueda
     * @param {Object} metadata - Metadatos de la búsqueda
     * @returns {Object} - Respuesta formateada
     */
    searchResults(results, metadata = {}) {
        return {
            success: true,
            results,
            metadata,
            count: results.length,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Formatea una respuesta de banner
     * @param {Object} banner - Información del banner
     * @returns {Object} - Respuesta formateada
     */
    bannerInfo(banner) {
        return {
            success: true,
            banner,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Formatea una URL generada
     * @param {string} url - URL generada
     * @param {string} type - Tipo de URL (booking, detail, etc.)
     * @returns {Object} - Respuesta formateada
     */
    generatedURL(url, type) {
        return {
            success: true,
            url,
            type,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new ResponseFormatter();