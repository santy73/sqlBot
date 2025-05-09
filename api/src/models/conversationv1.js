// src/models/conversation.js
const { pool } = require('../config/database');
const { logger } = require('../utils');

/**
 * Modelo para gestionar conversaciones del chat
 */
class ConversationModel {
    /**
     * Obtiene una conversación por su ID
     * @param {string} conversationId - ID de la conversación
     * @returns {Promise<Object|null>} - Datos de la conversación o null si no existe
     */
    async getById(conversationId) {
        try {
            // Nota: En la fase 1 no tenemos persistencia en BD,
            // esto se implementará en fases posteriores
            return null;
        } catch (error) {
            logger.error('Error al obtener conversación:', error);
            throw error;
        }
    }

    /**
     * Obtiene el historial de mensajes de una conversación
     * @param {string} conversationId - ID de la conversación
     * @param {number} limit - Número máximo de mensajes a obtener
     * @returns {Promise<Array>} - Historial de mensajes
     */
    async getHistory(conversationId, limit = 20) {
        try {
            // Nota: En la fase 1 no tenemos persistencia en BD,
            // esto se implementará en fases posteriores
            return [];
        } catch (error) {
            logger.error('Error al obtener historial de conversación:', error);
            throw error;
        }
    }

    /**
     * Guarda un nuevo mensaje en la conversación
     * @param {string} conversationId - ID de la conversación
     * @param {Object} message - Mensaje a guardar
     * @returns {Promise<Object>} - Mensaje guardado
     */
    async saveMessage(conversationId, message) {
        try {
            // Nota: En la fase 1 no tenemos persistencia en BD,
            // esto se implementará en fases posteriores
            return {
                id: Date.now().toString(),
                conversationId,
                content: message.content,
                from: message.from,
                timestamp: new Date().toISOString(),
                metadata: message.metadata || {}
            };
        } catch (error) {
            logger.error('Error al guardar mensaje:', error);
            throw error;
        }
    }

    /**
     * Crea una nueva conversación
     * @param {Object} data - Datos iniciales de la conversación
     * @returns {Promise<Object>} - Conversación creada
     */
    async create(data = {}) {
        try {
            // Nota: En la fase 1 no tenemos persistencia en BD,
            // esto se implementará en fases posteriores
            const conversationId = `conv_${Date.now()}`;

            const conversation = {
                id: conversationId,
                userId: data.userId || null,
                context: data.context || {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                messages: []
            };

            // Loguear la nueva conversación (solo para desarrollo)
            logger.debug('Nueva conversación creada:', {
                conversationId,
                userId: conversation.userId
            });

            return conversation;
        } catch (error) {
            logger.error('Error al crear conversación:', error);
            throw error;
        }
    }

    /**
     * Actualiza el contexto de una conversación
     * @param {string} conversationId - ID de la conversación
     * @param {Object} context - Nuevo contexto
     * @returns {Promise<boolean>} - True si se actualizó correctamente
     */
    async updateContext(conversationId, context) {
        try {
            // Nota: En la fase 1 no tenemos persistencia en BD,
            // esto se implementará en fases posteriores
            return true;
        } catch (error) {
            logger.error('Error al actualizar contexto de conversación:', error);
            throw error;
        }
    }

    /**
     * Elimina una conversación
     * @param {string} conversationId - ID de la conversación
     * @returns {Promise<boolean>} - True si se eliminó correctamente
     */
    async delete(conversationId) {
        try {
            // Nota: En la fase 1 no tenemos persistencia en BD,
            // esto se implementará en fases posteriores
            return true;
        } catch (error) {
            logger.error('Error al eliminar conversación:', error);
            throw error;
        }
    }
}

module.exports = new ConversationModel();