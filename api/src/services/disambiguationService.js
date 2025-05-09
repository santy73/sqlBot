// src/services/disambiguationService.js
const aiService = require('./aiService');
const { logger } = require('../utils');

/**
 * Servicio para resolver ambigüedades en las consultas de los usuarios
 */
class DisambiguationService {
    /**
     * Detecta si una consulta es ambigua
     * @param {string} userMessage - Mensaje del usuario
     * @param {Object} context - Contexto de la conversación
     * @returns {Promise<boolean>} - True si la consulta es ambigua
     */
    async isAmbiguous(userMessage, context = {}) {
        try {
            // Consulta muy corta (menos de 3 palabras)
            if (userMessage.trim().split(/\s+/).length < 3) {
                // Excepciones para consultas cortas pero claras
                const clearShortQueries = [
                    'ayuda', 'help',
                    'hola', 'hello', 'hi',
                    'gracias', 'thank you', 'thanks'
                ];

                // Si es una consulta corta clara, no es ambigua
                for (const query of clearShortQueries) {
                    if (userMessage.toLowerCase().includes(query)) {
                        return false;
                    }
                }

                return true;
            }

            // Mensajes con múltiples preguntas o temas
            if ((userMessage.match(/\?/g) || []).length > 1) {
                return true;
            }

            // Mensajes con pronombres ambiguos sin contexto previo
            const ambiguousPronouns = ['esto', 'eso', 'aquello', 'lo', 'este', 'ese', 'aquel', 'esa', 'esta'];
            const containsAmbiguousPronoun = ambiguousPronouns.some(pronoun =>
                new RegExp(`\\b${pronoun}\\b`, 'i').test(userMessage)
            );

            // Si contiene pronombres ambiguos y no hay contexto previo
            if (containsAmbiguousPronoun && (!context.intent || !context.lastSearch)) {
                return true;
            }

            // Usar IA para detección más avanzada si es necesario
            if (process.env.ENABLE_AI_DISAMBIGUATION === 'true') {
                return await this._checkWithAI(userMessage, context);
            }

            return false;
        } catch (error) {
            logger.error('Error al detectar ambigüedad:', error);
            return false; // En caso de error, asumimos que no es ambigua
        }
    }

    /**
     * Genera preguntas de clarificación para resolver ambigüedades
     * @param {string} userMessage - Mensaje del usuario
     * @param {Object} context - Contexto de la conversación
     * @returns {Promise<Object>} - Información de desambiguación
     */
    async generateClarificationQuestions(userMessage, context = {}) {
        try {
            const questions = [];

            // Generar preguntas según el contexto actual
            if (!context.intent || !context.intent.type) {
                // Sin intención clara, preguntar sobre el tema general
                questions.push("¿Estás interesado en información sobre alojamiento, restaurantes, actividades o transporte?");
            } else {
                // Según el tipo de intención, generar preguntas específicas
                switch (context.intent.type) {
                    case 'accommodation':
                        if (!context.userPreferences || !context.userPreferences.accommodationType) {
                            questions.push("¿Qué tipo de alojamiento estás buscando? ¿Hotel, apartamento o villa?");
                        }
                        if (!context.userPreferences || !context.userPreferences.budget) {
                            questions.push("¿Tienes alguna preferencia de presupuesto (económico, medio o premium)?");
                        }
                        break;

                    case 'gastronomy':
                        if (!context.userPreferences || !context.userPreferences.cuisineType) {
                            questions.push("¿Qué tipo de comida te interesa? ¿Local dominicana, mariscos, internacional?");
                        }
                        break;

                    case 'activities':
                        if (!context.userPreferences || !context.userPreferences.activityType) {
                            questions.push("¿Qué tipo de actividades prefieres? ¿Playa, naturaleza, aventura, cultura?");
                        }
                        break;

                    case 'transport':
                        if (!context.userPreferences || !context.userPreferences.vehicleType) {
                            questions.push("¿Necesitas información sobre alquiler de vehículos, transporte público o traslados?");
                        }
                        break;
                }
            }

            // Si no se generaron preguntas específicas, usar preguntas genéricas
            if (questions.length === 0) {
                questions.push("¿Podrías darme más detalles sobre lo que estás buscando?");
                questions.push("¿Hay alguna preferencia específica que deba tener en cuenta?");
            }

            // Si hay AI disponible, usar IA para generar preguntas más naturales
            if (process.env.ENABLE_AI_DISAMBIGUATION === 'true' && questions.length > 0) {
                const aiQuestions = await this._generateAIQuestions(userMessage, context);
                if (aiQuestions && aiQuestions.length > 0) {
                    return {
                        isAmbiguous: true,
                        message: aiQuestions[0],
                        additionalQuestions: aiQuestions.slice(1),
                        originalMessage: userMessage
                    };
                }
            }

            return {
                isAmbiguous: true,
                message: questions[0],
                additionalQuestions: questions.slice(1),
                originalMessage: userMessage
            };
        } catch (error) {
            logger.error('Error al generar preguntas de clarificación:', error);
            return {
                isAmbiguous: true,
                message: "¿Podrías proporcionar más detalles sobre lo que estás buscando?",
                originalMessage: userMessage
            };
        }
    }

    /**
     * Verifica si un mensaje es ambiguo utilizando IA
     * @param {string} message - Mensaje a verificar
     * @param {Object} context - Contexto de la conversación
     * @returns {Promise<boolean>} - True si es ambiguo
     * @private
     */
    async _checkWithAI(message, context) {
        try {
            // Crear prompt específico para detectar ambigüedad
            const ambiguityPrompt = `
        Analiza si el siguiente mensaje de usuario es ambiguo o necesita clarificación.
        Responde solo con "SI" si es ambiguo o "NO" si es claro.
        
        Mensaje: "${message}"
        
        Contexto previo: ${JSON.stringify(context)}
      `;

            // Usar el servicio de IA para obtener respuesta
            const aiResponse = await aiService.processSimpleQuery(ambiguityPrompt);

            // Analizar respuesta
            const response = aiResponse.message.trim().toLowerCase();
            return response === 'si' || response === 'sí';
        } catch (error) {
            logger.error('Error al verificar ambigüedad con IA:', error);
            return false;
        }
    }

    /**
     * Genera preguntas de clarificación usando IA
     * @param {string} message - Mensaje del usuario
     * @param {Object} context - Contexto de la conversación
     * @returns {Promise<Array>} - Preguntas generadas
     * @private
     */
    async _generateAIQuestions(message, context) {
        try {
            // Crear prompt para generar preguntas de clarificación
            const questionsPrompt = `
        Genera 2-3 preguntas de clarificación para el siguiente mensaje ambiguo.
        Las preguntas deben ayudar a entender mejor qué está buscando el usuario.
        Cada pregunta debe ser clara, específica y relevante para el contexto de Samaná.
        
        Mensaje del usuario: "${message}"
        
        Contexto previo: ${JSON.stringify(context)}
        
        Formato de respuesta: lista numerada de preguntas
      `;

            // Usar el servicio de IA para obtener respuesta
            const aiResponse = await aiService.processSimpleQuery(questionsPrompt);

            // Procesar y extraer preguntas
            const questions = aiResponse.message
                .split('\n')
                .map(line => line.trim())
                .filter(line => /^\d+[\.\)]\s+/.test(line)) // Líneas que comienzan con números
                .map(line => line.replace(/^\d+[\.\)]\s+/, '').trim()) // Eliminar los números
                .filter(line => line.endsWith('?')); // Asegurar que son preguntas

            return questions.length > 0 ? questions : null;
        } catch (error) {
            logger.error('Error al generar preguntas con IA:', error);
            return null;
        }
    }
}

module.exports = new DisambiguationService();