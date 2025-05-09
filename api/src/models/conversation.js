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
            const query = `
        SELECT * FROM chat_conversations
        WHERE id = ?
      `;

            const [rows] = await pool.query(query, [conversationId]);

            if (rows.length === 0) {
                return null;
            }

            // Parsear el campo context que está en formato JSON
            const conversation = rows[0];
            if (conversation.context) {
                try {
                    conversation.context = JSON.parse(conversation.context);
                } catch (e) {
                    logger.warn(`Error parsing context for conversation ${conversationId}`, e);
                    conversation.context = {};
                }
            }

            return conversation;
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
            const query = `
        SELECT id, content, \`from\`, metadata, created_at
        FROM chat_messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC
        LIMIT ?
      `;

            const [rows] = await pool.query(query, [conversationId, limit]);

            // Parsear el campo metadata que está en formato JSON
            return rows.map(message => {
                if (message.metadata) {
                    try {
                        message.metadata = JSON.parse(message.metadata);
                    } catch (e) {
                        logger.warn(`Error parsing metadata for message ${message.id}`, e);
                        message.metadata = {};
                    }
                }
                return message;
            });
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
            // Verificar si la conversación existe
            const conversation = await this.getById(conversationId);

            if (!conversation) {
                throw new Error(`La conversación con ID ${conversationId} no existe`);
            }

            // Preparar metadatos en formato JSON
            const metadata = message.metadata ? JSON.stringify(message.metadata) : null;

            const query = `
        INSERT INTO chat_messages (conversation_id, content, \`from\`, metadata)
        VALUES (?, ?, ?, ?)
      `;

            const [result] = await pool.query(query, [
                conversationId,
                message.content,
                message.from,
                metadata
            ]);

            // Actualizar la fecha de la conversación
            await pool.query(
                'UPDATE chat_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [conversationId]
            );

            // Actualizar analytics si existe
            this._updateAnalytics(conversationId);

            return {
                id: result.insertId,
                conversationId,
                content: message.content,
                from: message.from,
                metadata: message.metadata || {},
                created_at: new Date().toISOString()
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
            // Generar un ID único para la conversación
            const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Preparar contexto en formato JSON
            const context = data.context ? JSON.stringify(data.context) : null;

            const query = `
        INSERT INTO chat_conversations (id, user_id, session_id, context, status)
        VALUES (?, ?, ?, ?, ?)
      `;

            await pool.query(query, [
                conversationId,
                data.userId || null,
                data.sessionId || null,
                context,
                'active'
            ]);

            // Crear entrada en analytics
            await this._createAnalyticsEntry(conversationId);

            logger.debug('Nueva conversación creada:', {
                conversationId,
                userId: data.userId
            });

            return {
                id: conversationId,
                userId: data.userId || null,
                sessionId: data.sessionId || null,
                context: data.context || {},
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
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
            // Convertir contexto a formato JSON
            const contextJSON = JSON.stringify(context);

            const query = `
        UPDATE chat_conversations
        SET context = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

            const [result] = await pool.query(query, [contextJSON, conversationId]);

            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Error al actualizar contexto de conversación:', error);
            throw error;
        }
    }

    /**
     * Cambia el estado de una conversación
     * @param {string} conversationId - ID de la conversación
     * @param {string} status - Nuevo estado ('active', 'closed', 'archived')
     * @returns {Promise<boolean>} - True si se actualizó correctamente
     */
    async updateStatus(conversationId, status) {
        try {
            const validStatuses = ['active', 'closed', 'archived'];

            if (!validStatuses.includes(status)) {
                throw new Error(`Estado '${status}' no válido. Los estados válidos son: ${validStatuses.join(', ')}`);
            }

            const query = `
        UPDATE chat_conversations
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

            const [result] = await pool.query(query, [status, conversationId]);

            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Error al actualizar estado de conversación:', error);
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
            // Eliminación en cascada gracias a las restricciones de clave foránea
            const query = `
        DELETE FROM chat_conversations
        WHERE id = ?
      `;

            const [result] = await pool.query(query, [conversationId]);

            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Error al eliminar conversación:', error);
            throw error;
        }
    }

    /**
     * Obtiene conversaciones por usuario
     * @param {number} userId - ID del usuario
     * @param {number} limit - Límite de resultados
     * @param {number} offset - Desplazamiento para paginación
     * @returns {Promise<Array>} - Conversaciones del usuario
     */
    async getByUserId(userId, limit = 10, offset = 0) {
        try {
            const query = `
        SELECT c.*, 
               (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = c.id) as message_count,
               (SELECT content FROM chat_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
        FROM chat_conversations c
        WHERE c.user_id = ?
        ORDER BY c.updated_at DESC
        LIMIT ? OFFSET ?
      `;

            const [rows] = await pool.query(query, [userId, limit, offset]);

            // Parsear contexto JSON
            return rows.map(conversation => {
                if (conversation.context) {
                    try {
                        conversation.context = JSON.parse(conversation.context);
                    } catch (e) {
                        conversation.context = {};
                    }
                }
                return conversation;
            });
        } catch (error) {
            logger.error('Error al obtener conversaciones por usuario:', error);
            throw error;
        }
    }

    /**
     * Obtiene conversaciones por sesión
     * @param {string} sessionId - ID de sesión
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Array>} - Conversaciones de la sesión
     */
    async getBySessionId(sessionId, limit = 5) {
        try {
            const query = `
        SELECT c.*, 
               (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = c.id) as message_count
        FROM chat_conversations c
        WHERE c.session_id = ?
        ORDER BY c.updated_at DESC
        LIMIT ?
      `;

            const [rows] = await pool.query(query, [sessionId, limit]);

            // Parsear contexto JSON
            return rows.map(conversation => {
                if (conversation.context) {
                    try {
                        conversation.context = JSON.parse(conversation.context);
                    } catch (e) {
                        conversation.context = {};
                    }
                }
                return conversation;
            });
        } catch (error) {
            logger.error('Error al obtener conversaciones por sesión:', error);
            throw error;
        }
    }

    /**
     * Asigna un usuario a una conversación
     * @param {string} conversationId - ID de la conversación
     * @param {number} userId - ID del usuario
     * @returns {Promise<boolean>} - True si se asignó correctamente
     */
    async assignUser(conversationId, userId) {
        try {
            const query = `
        UPDATE chat_conversations
        SET user_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

            const [result] = await pool.query(query, [userId, conversationId]);

            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Error al asignar usuario a conversación:', error);
            throw error;
        }
    }

    /**
     * Crea una entrada en la tabla de analytics
     * @param {string} conversationId - ID de la conversación
     * @returns {Promise<boolean>} - True si se creó correctamente
     * @private
     */
    async _createAnalyticsEntry(conversationId) {
        try {
            const query = `
        INSERT INTO chat_analytics (conversation_id, total_messages)
        VALUES (?, 0)
      `;

            await pool.query(query, [conversationId]);
            return true;
        } catch (error) {
            logger.error('Error al crear entrada de analytics:', error);
            return false;
        }
    }

    /**
     * Actualiza analytics de la conversación
     * @param {string} conversationId - ID de la conversación
     * @returns {Promise<boolean>} - True si se actualizó correctamente
     * @private
     */
    async _updateAnalytics(conversationId) {
        try {
            // Actualizar contador de mensajes
            const query = `
        UPDATE chat_analytics
        SET total_messages = (
            SELECT COUNT(*) FROM chat_messages WHERE conversation_id = ?
        ),
        conversation_duration = TIMESTAMPDIFF(
            SECOND, 
            (SELECT created_at FROM chat_conversations WHERE id = ?),
            CURRENT_TIMESTAMP
        )
        WHERE conversation_id = ?
      `;

            await pool.query(query, [conversationId, conversationId, conversationId]);
            return true;
        } catch (error) {
            logger.error('Error al actualizar analytics:', error);
            return false;
        }
    }
}

module.exports = new ConversationModel();