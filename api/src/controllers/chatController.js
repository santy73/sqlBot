// src/controllers/chatController.js
const expertAgent = require('../agents/expertAgent');
const queryAgent = require('../agents/queryAgent');
const bookingAgent = require('../agents/bookingAgent');
const validationAgent = require('../agents/validationAgent');
const aiService = require('../services/aiService');
const analyticsService = require('../services/analyticsService');
const { conversation: conversationModel } = require('../models');
const { logger, responseFormatter } = require('../utils');

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
            const { message, conversationId, sessionId, context } = req.body;

            if (!message) {
                return res.status(400).json(
                    responseFormatter.error('El mensaje es requerido')
                );
            }

            logger.debug(`Nuevo mensaje recibido: "${message}"`, {
                conversationId,
                sessionId: sessionId || 'anonymous'
            });

            // Inicializar contexto
            const sessionContext = context || {};

            // Obtener o crear conversación
            let activeConversation;

            if (conversationId) {
                // Obtener conversación existente
                activeConversation = await conversationModel.getById(conversationId);

                if (!activeConversation) {
                    logger.warn(`Conversación no encontrada: ${conversationId}. Creando nueva.`);
                    activeConversation = await this._createNewConversation(req);
                }
            } else {
                // Crear nueva conversación
                activeConversation = await this._createNewConversation(req);
            }

            // Obtener historial de la conversación
            const history = await conversationModel.getHistory(activeConversation.id);

            // Combinar contexto de la conversación con el de la solicitud
            const combinedContext = {
                ...(activeConversation.context || {}),
                ...sessionContext
            };

            // Guardar mensaje del usuario
            await conversationModel.saveMessage(activeConversation.id, {
                content: message,
                from: 'user',
                metadata: { timestamp: new Date().toISOString() }
            });

            // Procesar el mensaje
            const response = await this._processMessageWithAgents(
                message, history, combinedContext
            );

            // Guardar mensaje del bot
            await conversationModel.saveMessage(activeConversation.id, {
                content: response.message,
                from: 'bot',
                metadata: {
                    ui: response.ui,
                    results: response.results,
                    timestamp: new Date().toISOString()
                }
            });

            // Actualizar contexto de la conversación
            if (response.context) {
                await conversationModel.updateContext(activeConversation.id, {
                    ...combinedContext,
                    ...response.context
                });
            }

            // Actualizar analytics
            this._updateAnalytics(activeConversation.id, response);

            // Enviar respuesta
            return res.status(200).json(
                responseFormatter.chatResponse(response, activeConversation.id)
            );
        } catch (error) {
            logger.error('Error al procesar mensaje:', error);
            return res.status(500).json(
                responseFormatter.error('Error al procesar el mensaje')
            );
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

            return res.status(200).json(
                responseFormatter.bannerInfo(bannerInfo)
            );
        } catch (error) {
            logger.error('Error al obtener información del banner:', error);
            return res.status(500).json(
                responseFormatter.error('Error al obtener información del banner')
            );
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
                return res.status(400).json(
                    responseFormatter.error('El tipo de reserva es requerido')
                );
            }

            // Generar URL de reserva
            const bookingURL = await bookingAgent.generateBookingURL(params);

            return res.status(200).json(
                responseFormatter.generatedURL(bookingURL, params.type)
            );
        } catch (error) {
            logger.error('Error al generar URL de reserva:', error);
            return res.status(500).json(
                responseFormatter.error('Error al generar URL de reserva')
            );
        }
    }

    /**
     * Obtiene el historial de conversaciones de un usuario
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async getConversationHistory(req, res) {
        try {
            const { userId, sessionId, limit, offset } = req.query;

            let conversations = [];

            if (userId) {
                // Obtener conversaciones por usuario autenticado
                conversations = await conversationModel.getByUserId(
                    userId,
                    parseInt(limit) || 10,
                    parseInt(offset) || 0
                );
            } else if (sessionId) {
                // Obtener conversaciones por sesión (usuario no autenticado)
                conversations = await conversationModel.getBySessionId(
                    sessionId,
                    parseInt(limit) || 5
                );
            } else {
                return res.status(400).json(
                    responseFormatter.error('Se requiere userId o sessionId')
                );
            }

            return res.status(200).json(
                responseFormatter.success({
                    conversations,
                    count: conversations.length
                })
            );
        } catch (error) {
            logger.error('Error al obtener historial de conversaciones:', error);
            return res.status(500).json(
                responseFormatter.error('Error al obtener historial de conversaciones')
            );
        }
    }

    /**
     * Obtiene mensajes de una conversación específica
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async getConversationMessages(req, res) {
        try {
            const { conversationId } = req.params;
            const { limit } = req.query;

            if (!conversationId) {
                return res.status(400).json(
                    responseFormatter.error('El ID de conversación es requerido')
                );
            }

            // Verificar si la conversación existe
            const conversation = await conversationModel.getById(conversationId);

            if (!conversation) {
                return res.status(404).json(
                    responseFormatter.error('Conversación no encontrada')
                );
            }

            // Obtener mensajes
            const messages = await conversationModel.getHistory(
                conversationId,
                parseInt(limit) || 50
            );

            return res.status(200).json(
                responseFormatter.success({
                    conversation,
                    messages,
                    count: messages.length
                })
            );
        } catch (error) {
            logger.error('Error al obtener mensajes de conversación:', error);
            return res.status(500).json(
                responseFormatter.error('Error al obtener mensajes de conversación')
            );
        }
    }

    /**
     * Cierra una conversación activa
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async closeConversation(req, res) {
        try {
            const { conversationId } = req.params;

            if (!conversationId) {
                return res.status(400).json(
                    responseFormatter.error('El ID de conversación es requerido')
                );
            }

            // Cambiar estado a 'closed'
            const success = await conversationModel.updateStatus(conversationId, 'closed');

            if (!success) {
                return res.status(404).json(
                    responseFormatter.error('Conversación no encontrada')
                );
            }

            return res.status(200).json(
                responseFormatter.success({
                    message: 'Conversación cerrada correctamente'
                })
            );
        } catch (error) {
            logger.error('Error al cerrar conversación:', error);
            return res.status(500).json(
                responseFormatter.error('Error al cerrar conversación')
            );
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
        logger.debug('Ejecutando siguiente acción:', action);

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
     * Crea una nueva conversación
     * @param {Object} req - Objeto de solicitud HTTP
     * @returns {Promise<Object>} - Conversación creada
     * @private
     */
    async _createNewConversation(req) {
        const userId = req.user ? req.user.id : null;
        const sessionId = req.body.sessionId || req.cookies?.sessionId || `session_${Date.now()}`;

        // Crear nueva conversación
        return await conversationModel.create({
            userId,
            sessionId,
            context: req.body.context || {}
        });
    }

    /**
     * Actualiza analytics de la conversación
     * @param {string} conversationId - ID de la conversación
     * @param {Object} response - Respuesta generada
     * @private
     */
    async _updateAnalytics(conversationId, response) {
        try {
            // Detectar tema principal
            if (response.context && response.context.intent && response.context.intent.type) {
                await analyticsService.updateTopic(conversationId, response.context.intent.type);
            }

            // Registrar agentes utilizados
            if (response.context && response.context.activeAgents) {
                await analyticsService.updateAgentsUsed(conversationId, response.context.activeAgents);
            }

            // En futuras fases, aquí se implementaría el análisis de sentimiento
        } catch (error) {
            logger.error('Error al actualizar analytics:', error);
        }
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