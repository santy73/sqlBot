// src/controllers/chatController.js
const expertAgent = require('../agents/expertAgent');
const queryAgent = require('../agents/queryAgent');
const bookingAgent = require('../agents/bookingAgent');
const validationAgent = require('../agents/validationAgent');
const aiService = require('../services/aiService');
const dbService = require('../services/dbService');

/**
 * Controlador principal para la gestión del chat
 */
class ChatController {
    /**
     * Procesa un mensaje del usuario y genera una respuesta
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async processMessage(req, res) {
        try {
            const { message, conversationId, context } = req.body;

            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: 'El mensaje es requerido'
                });
            }

            console.log(`Nuevo mensaje recibido: "${message}"`);

            // Obtener o inicializar contexto
            const sessionContext = context || {};

            // Obtener historial de la conversación
            const history = await this._getConversationHistory(conversationId);

            // Procesar el mensaje
            const response = await this._processMessageWithAgents(message, history, sessionContext);

            // Guardar la conversación
            const updatedConversationId = await this._saveConversation(
                conversationId,
                message,
                response,
                sessionContext
            );

            // Enviar respuesta
            return res.status(200).json({
                success: true,
                response,
                conversationId: updatedConversationId
            });
        } catch (error) {
            console.error('Error al procesar mensaje:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al procesar el mensaje'
            });
        }
    }

    /**
     * Obtiene información sobre banners para mostrar
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async getBannerInfo(req, res) {
        try {
            const { type } = req.query;

            // Obtener información del banner según el tipo
            const bannerInfo = await this._getBannerData(type);

            return res.status(200).json({
                success: true,
                banner: bannerInfo
            });
        } catch (error) {
            console.error('Error al obtener información del banner:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al obtener información del banner'
            });
        }
    }

    /**
     * Genera una URL para redirección a página de reserva
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async generateBookingURL(req, res) {
        try {
            const params = req.body;

            if (!params.type) {
                return res.status(400).json({
                    success: false,
                    error: 'El tipo de reserva es requerido'
                });
            }

            // Generar URL de reserva
            const bookingURL = await bookingAgent.generateBookingURL(params);

            return res.status(200).json({
                success: true,
                bookingURL
            });
        } catch (error) {
            console.error('Error al generar URL de reserva:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al generar URL de reserva'
            });
        }
    }

    /**
     * Procesa un mensaje utilizando los agentes
     * @param {string} message - Mensaje del usuario
     * @param {Array} history - Historial de la conversación
     * @param {Object} context - Contexto de la conversación
     * @returns {Promise<Object>} - Respuesta procesada
     * @private
     */
    async _processMessageWithAgents(message, history, context) {
        // Si es un mensaje inicial o no hay contexto, utilizamos el agente experto
        if (!context.processingStage || context.processingStage === 'initial') {
            // Procesar consulta inicial con el agente experto
            const expertResponse = await expertAgent.processInitialQuery(message, history, context);

            // Si hay una siguiente acción definida, la ejecutamos
            if (expertResponse.nextAction) {
                return await this._executeNextAction(expertResponse.nextAction, message, history, {
                    ...context,
                    ...expertResponse.context
                });
            }

            // Validar la respuesta antes de devolverla
            return await validationAgent.validateResponse(expertResponse, message, context);
        }

        // Si ya estamos en una etapa específica de procesamiento, continuamos el flujo
        if (context.processingStage === 'query') {
            // Estamos en etapa de consulta, usar agente de consulta
            const queryResponse = await queryAgent.processQuery(
                context.queryParams || {},
                message,
                history,
                context
            );

            // Validar la respuesta
            return await validationAgent.validateResponse(queryResponse, message, context);
        }

        if (context.processingStage === 'booking') {
            // Estamos en etapa de reserva, usar agente de booking
            const bookingResponse = await bookingAgent.processBookingQuery(
                context.bookingParams || {},
                message,
                history,
                context
            );

            // Validar la respuesta
            return await validationAgent.validateResponse(bookingResponse, message, context);
        }

        // Si no hay un flujo específico, usamos IA general
        const aiResponse = await aiService.processMessage(message, history, context);

        // Validar la respuesta
        return await validationAgent.validateResponse(aiResponse, message, context);
    }

    /**
     * Ejecuta la siguiente acción según lo determinado por un agente
     * @param {Object} action - Descripción de la acción a ejecutar
     * @param {string} message - Mensaje del usuario
     * @param {Array} history - Historial de la conversación
     * @param {Object} context - Contexto de la conversación
     * @returns {Promise<Object>} - Resultado de la acción
     * @private
     */
    async _executeNextAction(action, message, history, context) {
        console.log('Ejecutando siguiente acción:', action);

        switch (action.type) {
            case 'query':
                // Acción de consulta
                const queryResponse = await queryAgent.processQuery(
                    action.params || {},
                    message,
                    history,
                    {
                        ...context,
                        processingStage: 'query',
                        queryParams: action.params
                    }
                );

                return await validationAgent.validateResponse(queryResponse, message, context);

            case 'booking':
                // Acción de reserva
                const bookingResponse = await bookingAgent.processBookingQuery(
                    action.params || {},
                    message,
                    history,
                    {
                        ...context,
                        processingStage: 'booking',
                        bookingParams: action.params
                    }
                );

                return await validationAgent.validateResponse(bookingResponse, message, context);

            case 'respond':
                // Acción de respuesta directa (sin procesar más)
                return {
                    message: action.params && action.params.message ?
                        action.params.message :
                        "Entiendo tu consulta. ¿Puedes darme más detalles para ayudarte mejor?",
                    ui: action.params && action.params.ui ? action.params.ui : {}
                };

            default:
                // Acción no reconocida, devolver respuesta general
                return {
                    message: "No he podido determinar cómo procesar tu consulta. ¿Podrías reformularla o ser más específico?",
                    ui: {
                        suggestedQuestions: [
                            "¿Qué puedo hacer en Samaná?",
                            "¿Dónde puedo alojarme en Samaná?",
                            "¿Cuáles son los mejores restaurantes en Samaná?"
                        ]
                    }
                };
        }
    }

    /**
     * Obtiene el historial de una conversación
     * @param {string} conversationId - ID de la conversación
     * @returns {Promise<Array>} - Historial de mensajes
     * @private
     */
    async _getConversationHistory(conversationId) {
        // En una implementación real, obtendríamos el historial de la base de datos
        // Para esta fase, devolvemos un array vacío
        return [];
    }

    /**
     * Guarda la conversación en la base de datos
     * @param {string} conversationId - ID de la conversación (opcional)
     * @param {string} message - Mensaje del usuario
     * @param {Object} response - Respuesta del sistema
     * @param {Object} context - Contexto de la conversación
     * @returns {Promise<string>} - ID de la conversación
     * @private
     */
    async _saveConversation(conversationId, message, response, context) {
        // En una implementación real, guardaríamos en la base de datos
        // Para esta fase, simplemente devolvemos un ID
        return conversationId || `conv_${Date.now()}`;
    }

    /**
     * Obtiene datos para mostrar en un banner
     * @param {string} type - Tipo de banner
     * @returns {Promise<Object>} - Información del banner
     * @private
     */
    async _getBannerData(type = 'general') {
        // En una implementación real, consultaríamos la base de datos
        // Para esta fase, devolvemos datos estáticos según el tipo

        const bannerData = {
            general: {
                title: "Descubre Samaná",
                subtitle: "Un paraíso en República Dominicana",
                imageUrl: "/assets/images/banner_general.jpg",
                action: {
                    text: "Explorar",
                    url: "/explore"
                }
            },
            accommodation: {
                title: "Alojamientos en Samaná",
                subtitle: "Desde hoteles de lujo hasta villas privadas",
                imageUrl: "/assets/images/banner_accommodation.jpg",
                action: {
                    text: "Ver alojamientos",
                    url: "/hotels"
                }
            },
            gastronomy: {
                title: "Sabores de Samaná",
                subtitle: "Descubre la gastronomía local",
                imageUrl: "/assets/images/banner_gastronomy.jpg",
                action: {
                    text: "Ver restaurantes",
                    url: "/restaurants"
                }
            },
            activities: {
                title: "Aventuras en Samaná",
                subtitle: "Excursiones y actividades para todos",
                imageUrl: "/assets/images/banner_activities.jpg",
                action: {
                    text: "Ver actividades",
                    url: "/tours"
                }
            },
            transport: {
                title: "Transporte en Samaná",
                subtitle: "Moverse por la península",
                imageUrl: "/assets/images/banner_transport.jpg",
                action: {
                    text: "Ver opciones",
                    url: "/cars"
                }
            }
        };

        return bannerData[type] || bannerData.general;
    }
}

module.exports = new ChatController();