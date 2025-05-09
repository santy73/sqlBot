// src/agents/expertAgent.js
const aiService = require('../services/aiService');

/**
 * Agente Experto en SamanaInn
 * 
 * Este agente es el coordinador principal que:
 * - Analiza la consulta inicial del usuario
 * - Determina qué otros agentes deben involucrarse
 * - Coordina la conversación completa
 * - Gestiona la UI (banners, navegación)
 */
class ExpertAgent {
    constructor() {
        this.name = 'ExpertAgent';
        this.description = 'Agente principal que coordina la conversación y otros agentes';
    }

    /**
     * Procesa el mensaje inicial y decide qué agentes utilizar
     * @param {string} userMessage - Mensaje del usuario
     * @param {Array} history - Historial de la conversación
     * @param {Object} context - Contexto adicional
     * @returns {Promise<Object>} - Respuesta procesada
     */
    async processInitialQuery(userMessage, history = [], context = {}) {
        try {
            // 1. Analizar la intención del usuario
            const intent = await this._analyzeIntent(userMessage);

            // 2. Determinar qué agente(s) debe manejar la consulta
            const agents = this._determineRequiredAgents(intent);

            // 3. Preparar contexto para la respuesta
            const responseContext = {
                ...context,
                intent,
                activeAgents: agents,
                processingStage: 'initial'
            };

            // 4. Determinar si se necesita modificar la UI
            const uiActions = this._determineUIActions(intent);

            // 5. Preparar la respuesta inicial
            return {
                message: this._createInitialResponse(intent),
                context: responseContext,
                ui: uiActions,
                nextAction: this._determineNextAction(intent, agents)
            };
        } catch (error) {
            console.error(`[${this.name}] Error al procesar consulta inicial:`, error);
            return {
                message: "Lo siento, he tenido un problema al procesar tu consulta. ¿Podrías intentarlo de nuevo o formularla de otra manera?",
                error: true
            };
        }
    }

    /**
     * Analiza la intención del usuario
     * @param {string} message - Mensaje del usuario
     * @returns {Promise<Object>} - Intención detectada
     * @private
     */
    async _analyzeIntent(message) {
        // En implementación real, esto utilizaría el servicio de IA para NLU
        // Aquí usamos una versión simplificada basada en palabras clave

        const lowerMessage = message.toLowerCase();

        // Categorías generales
        if (lowerMessage.includes('alojamiento') ||
            lowerMessage.includes('hotel') ||
            lowerMessage.includes('apartamento') ||
            lowerMessage.includes('casa') ||
            lowerMessage.includes('donde dormir') ||
            lowerMessage.includes('hospedaje')) {
            return {
                type: 'accommodation',
                confidence: 0.9,
                details: { searchType: 'accommodation' }
            };
        }

        if (lowerMessage.includes('restaurante') ||
            lowerMessage.includes('comer') ||
            lowerMessage.includes('comida') ||
            lowerMessage.includes('gastronomía') ||
            lowerMessage.includes('plato')) {
            return {
                type: 'gastronomy',
                confidence: 0.9,
                details: { searchType: 'restaurant' }
            };
        }

        if (lowerMessage.includes('excursión') ||
            lowerMessage.includes('tour') ||
            lowerMessage.includes('actividad') ||
            lowerMessage.includes('visitar') ||
            lowerMessage.includes('qué hacer')) {
            return {
                type: 'activities',
                confidence: 0.9,
                details: { searchType: 'tour' }
            };
        }

        if (lowerMessage.includes('vehículo') ||
            lowerMessage.includes('coche') ||
            lowerMessage.includes('auto') ||
            lowerMessage.includes('carro') ||
            lowerMessage.includes('alquiler')) {
            return {
                type: 'transport',
                confidence: 0.9,
                details: { searchType: 'car' }
            };
        }

        if (lowerMessage.includes('samana') ||
            lowerMessage.includes('república dominicana') ||
            lowerMessage.includes('información')) {
            return {
                type: 'information',
                confidence: 0.8,
                details: {
                    searchType: 'information',
                    location: 'Samana'
                }
            };
        }

        // Si no hay match claro, asumimos que el usuario quiere información general
        return {
            type: 'general',
            confidence: 0.6,
            details: { searchType: 'general' }
        };
    }

    /**
     * Determina qué agentes deben manejar esta intención
     * @param {Object} intent - Intención del usuario
     * @returns {Array} - Lista de agentes a invocar
     * @private
     */
    _determineRequiredAgents(intent) {
        const agents = ['ValidationAgent']; // ValidationAgent siempre se incluye

        switch (intent.type) {
            case 'accommodation':
                agents.push('QueryAgent', 'BookingAgent', 'AccommodationAgent');
                break;
            case 'gastronomy':
                agents.push('QueryAgent', 'GastronomyAgent');
                break;
            case 'activities':
                agents.push('QueryAgent', 'ActivitiesAgent');
                break;
            case 'transport':
                agents.push('QueryAgent', 'TransportAgent');
                break;
            case 'information':
                agents.push('QueryAgent');
                break;
            default:
                // Para general o desconocido, solo QueryAgent
                agents.push('QueryAgent');
        }

        return agents;
    }

    /**
     * Determina las acciones de UI necesarias
     * @param {Object} intent - Intención del usuario
     * @returns {Object} - Acciones de UI
     * @private
     */
    _determineUIActions(intent) {
        // Definir acciones de UI según la intención
        const actions = {
            updateBanner: true,
            bannerType: intent.type,
            showResults: false, // Inicialmente sin resultados
            suggestedQuestions: this._getSuggestedQuestions(intent)
        };

        return actions;
    }

    /**
     * Genera preguntas sugeridas según la intención
     * @param {Object} intent - Intención del usuario
     * @returns {Array} - Preguntas sugeridas
     * @private
     */
    _getSuggestedQuestions(intent) {
        switch (intent.type) {
            case 'accommodation':
                return [
                    '¿Qué hoteles hay cerca de la playa?',
                    '¿Dónde puedo encontrar alojamiento para familias?',
                    '¿Cuáles son los alojamientos con mejor relación calidad-precio?'
                ];
            case 'gastronomy':
                return [
                    '¿Dónde puedo comer comida típica dominicana?',
                    '¿Cuáles son los mejores restaurantes de mariscos?',
                    '¿Hay restaurantes con vistas al mar?'
                ];
            case 'activities':
                return [
                    '¿Qué excursiones hay para ver ballenas?',
                    '¿Cómo puedo visitar El Limón?',
                    '¿Qué actividades se recomiendan para familias?'
                ];
            case 'transport':
                return [
                    '¿Dónde puedo alquilar un coche?',
                    '¿Hay servicio de traslado desde el aeropuerto?',
                    '¿Cuál es la mejor manera de moverse por Samaná?'
                ];
            default:
                return [
                    '¿Qué puedo hacer en Samaná?',
                    '¿Cuál es la mejor época para visitar Samaná?',
                    '¿Dónde están las mejores playas?'
                ];
        }
    }

    /**
     * Crea la respuesta inicial
     * @param {Object} intent - Intención del usuario
     * @returns {string} - Respuesta inicial
     * @private
     */
    _createInitialResponse(intent) {
        switch (intent.type) {
            case 'accommodation':
                return "Entiendo que estás buscando alojamiento en Samaná. Tenemos varias opciones que podrían interesarte. ¿Podrías decirme para qué fechas estás buscando, cuántas personas son y si tienes alguna preferencia de ubicación o tipo de alojamiento?";

            case 'gastronomy':
                return "Samaná tiene una excelente oferta gastronómica. Puedo ayudarte a encontrar restaurantes según tus preferencias. ¿Buscas algún tipo de cocina en particular, como comida dominicana, mariscos o internacional? ¿Tienes alguna preferencia de ubicación o presupuesto?";

            case 'activities':
                return "Samaná ofrece muchas actividades y excursiones interesantes. Desde avistamiento de ballenas (en temporada) hasta visitas al Parque Nacional Los Haitises o la cascada Salto El Limón. ¿Hay algún tipo de actividad que te interese especialmente?";

            case 'transport':
                return "Puedo ayudarte con opciones de transporte en Samaná. ¿Estás interesado en alquilar un vehículo, conocer sobre el transporte público o quizás necesitas un servicio de traslado desde el aeropuerto?";

            case 'information':
                return "Samaná es una hermosa península en el noreste de República Dominicana conocida por sus playas paradisíacas, naturaleza exuberante y experiencias únicas. ¿Hay algo específico sobre Samaná que te gustaría conocer?";

            default:
                return "¡Bienvenido a SamanaInn! Puedo ayudarte a encontrar alojamiento, restaurantes, actividades o información sobre Samaná. ¿En qué puedo asistirte hoy?";
        }
    }
}

module.exports = new ExpertAgent();
// Este agente es el coordinador principal que analiza la consulta inicial del usuario, determina qué otros agentes deben involucrarse, coordina la conversación completa y gestiona la UI (banners, navegación).