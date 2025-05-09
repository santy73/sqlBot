// src/services/analyticsService.js
const { pool } = require('../config/database');
const { logger } = require('../utils');

class AnalyticsService {
    async updateTopic(conversationId, topic) {
        try {
            const query = `
        UPDATE chat_analytics
        SET topic = ?
        WHERE conversation_id = ?
      `;
            await pool.query(query, [topic, conversationId]);
            return true;
        } catch (error) {
            logger.error('Error updating conversation topic:', error);
            return false;
        }
    }

    async updateAgentsUsed(conversationId, agents) {
        try {
            const agentsJson = JSON.stringify(agents);
            const query = `
        UPDATE chat_analytics
        SET agents_used = ?
        WHERE conversation_id = ?
      `;
            await pool.query(query, [agentsJson, conversationId]);
            return true;
        } catch (error) {
            logger.error('Error updating agents used:', error);
            return false;
        }
    }

    // Métodos adicionales para análisis de sentimiento, etc.
}

module.exports = new AnalyticsService();