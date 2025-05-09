// src/services/agentService.js
const agents = require('../agents');
const { logger } = require('../utils');

/**
 * Servicio para gestionar la selección y coordinación de agentes
 */
class AgentService {
    /**
     * Detecta y selecciona los agentes adecuados para una consulta
     * @param {string} userMessage - Mensaje del usuario
     * @param {Object} context - Contexto de la conversación
     * @returns {Promise<Array>} - Lista de agentes seleccionados
     */
    async detectRequiredAgents(userMessage, context = {}) {
        try {
            // Si ya hay una detección previa en el contexto, la utilizamos
            if (context.activeAgents && Array.isArray(context.activeAgents) && context.activeAgents.length > 0) {
                return context.activeAgents;
            }

            // Por defecto siempre incluimos el agente de validación
            const requiredAgents = ['ValidationAgent'];

            // Detección basada en palabras clave (implementación básica)
            const lowerMessage = userMessage.toLowerCase();

            // Detección para alojamiento
            if (lowerMessage.includes('hotel') ||
                lowerMessage.includes('alojamiento') ||
                lowerMessage.includes('hospedaje') ||
                lowerMessage.includes('habitación') ||
                lowerMessage.includes('apartamento') ||
                lowerMessage.includes('villa')) {
                requiredAgents.push('AccommodationAgent');
            }

            // Detección para gastronomía
            if (lowerMessage.includes('restaurante') ||
                lowerMessage.includes('comida') ||
                lowerMessage.includes('comer') ||
                lowerMessage.includes('gastronomía') ||
                lowerMessage.includes('plato')) {
                requiredAgents.push('GastronomyAgent');
            }

            // Detección para actividades
            if (lowerMessage.includes('actividad') ||
                lowerMessage.includes('excursión') ||
                lowerMessage.includes('tour') ||
                lowerMessage.includes('visitar') ||
                lowerMessage.includes('hacer')) {
                requiredAgents.push('ActivitiesAgent');
            }

            // Detección para transporte
            if (lowerMessage.includes('transporte') ||
                lowerMessage.includes('coche') ||
                lowerMessage.includes('carro') ||
                lowerMessage.includes('moto') ||
                lowerMessage.includes('vehículo')) {
                requiredAgents.push('TransportAgent');
            }

            // Detección para reservas
            if (lowerMessage.includes('reserva') ||
                lowerMessage.includes('booking') ||
                lowerMessage.includes('disponibilidad') ||
                lowerMessage.includes('precio') ||
                lowerMessage.includes('tarifa')) {
                requiredAgents.push('BookingAgent');
            }

            // Si no detectamos ningún agente específico, añadimos el agente de consulta general
            if (requiredAgents.length <= 1) {
                requiredAgents.push('QueryAgent');
            }

            // Siempre incluimos el agente experto si no está ya
            if (!requiredAgents.includes('ExpertAgent')) {
                requiredAgents.push('ExpertAgent');
            }

            return requiredAgents;
        } catch (error) {
            logger.error('Error en detección de agentes requeridos:', error);
            // En caso de error, devolvemos los agentes básicos
            return ['ValidationAgent', 'ExpertAgent', 'QueryAgent'];
        }
    }

    /**
     * Obtiene instancias de los agentes requeridos
     * @param {Array} agentNames - Nombres de los agentes
     * @returns {Array} - Instancias de los agentes
     */
    getAgentInstances(agentNames) {
        if (!agentNames || !Array.isArray(agentNames)) {
            return [];
        }

        // Obtener instancias válidas de los agentes
        return agentNames
            .map(name => agents.getAgentByName(name))
            .filter(agent => agent !== null);
    }

    /**
     * Ejecuta la cadena de procesamiento a través de varios agentes
     * @param {string} userMessage - Mensaje del usuario
     * @param {Array} history - Historial de la conversación
     * @param {Object} context - Contexto de la conversación
     * @returns {Promise<Object>} - Respuesta final procesada
     */
    async processWithAgents(userMessage, history = [], context = {}) {
        try {
            // Detectar agentes requeridos
            const requiredAgentNames = await this.detectRequiredAgents(userMessage, context);

            // Obtener instancias
            const agentInstances = this.getAgentInstances(requiredAgentNames);

            // Iniciar con el agente experto
            const expertAgent = agents.getAgentByName('ExpertAgent');
            if (!expertAgent) {
                throw new Error('Agente experto no disponible');
            }

            // Obtener respuesta inicial del agente experto
            let response = await expertAgent.processInitialQuery(userMessage, history, context);

            // Verificar si hay una acción siguiente definida
            if (response.nextAction) {
                // Ejecutar siguiente acción con el agente adecuado
                const nextAgent = this._getAgentForAction(response.nextAction.type);
                if (nextAgent) {
                    response = await this._executeAgentAction(
                        nextAgent,
                        response.nextAction,
                        userMessage,
                        history,
                        context
                    );
                }
            }

            // Validar respuesta final
            const validationAgent = agents.getAgentByName('ValidationAgent');
            if (validationAgent) {
                response = await validationAgent.validateResponse(response, userMessage, context);
            }

            // Actualizar contexto con agentes utilizados
            return {
                ...response,
                context: {
                    ...(response.context || {}),
                    activeAgents: requiredAgentNames
                }
            };

        } catch (error) {
            logger.error('Error en procesamiento con agentes:', error);
            return {
                message: "Lo siento, he tenido un problema al procesar tu consulta. ¿Puedes intentarlo de nuevo?",
                error: true
            };
        }
    }

    /**
     * Obtiene el agente adecuado para una acción
     * @param {string} actionType - Tipo de acción
     * @returns {Object} - Instancia del agente
     * @private
     */
    _getAgentForAction(actionType) {
        switch (actionType) {
            case 'query':
                return agents.getAgentByName('QueryAgent');
            case 'booking':
                return agents.getAgentByName('BookingAgent');
            case 'accommodation':
                return agents.getAgentByName('AccommodationAgent');
            case 'gastronomy':
                return agents.getAgentByName('GastronomyAgent');
            case 'activities':
                return agents.getAgentByName('ActivitiesAgent');
            case 'transport':
                return agents.getAgentByName('TransportAgent');
            default:
                return null;
        }
    }

    /**
     * Ejecuta una acción con un agente específico
     * @param {Object} agent - Instancia del agente
     * @param {Object} action - Acción a ejecutar
     * @param {string} userMessage - Mensaje del usuario
     * @param {Array} history - Historial de la conversación
     * @param {Object} context - Contexto de la conversación
     * @returns {Promise<Object>} - Respuesta del agente
     * @private
     */
    async _executeAgentAction(agent, action, userMessage, history, context) {
        // Verificar método a invocar según el tipo de agente
        let methodName;

        if (agent.name === 'QueryAgent') {
            methodName = 'processQuery';
        } else if (agent.name === 'BookingAgent') {
            methodName = 'processBookingQuery';
        } else if (agent.name === 'AccommodationAgent') {
            methodName = 'processAccommodationQuery';
        } else if (agent.name === 'GastronomyAgent') {
            methodName = 'processGastronomyQuery';
        } else if (agent.name === 'ActivitiesAgent') {
            methodName = 'processActivitiesQuery';
        } else if (agent.name === 'TransportAgent') {
            methodName = 'processTransportQuery';
        } else {
            throw new Error(`Método no definido para agente: ${agent.name}`);
        }

        // Verificar que el método exista
        if (typeof agent[methodName] !== 'function') {
            throw new Error(`Método ${methodName} no implementado en agente ${agent.name}`);
        }

        // Ejecutar el método con los parámetros adecuados
        return await agent[methodName](
            action.params || {},
            userMessage,
            history,
            {
                ...context,
                processingStage: action.type,
                actionParams: action.params
            }
        );
    }
}

module.exports = new AgentService();