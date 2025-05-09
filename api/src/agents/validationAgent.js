// src/agents/validationAgent.js

/**
 * Agente de Validación
 * 
 * Este agente se encarga de:
 * - Verificar que las respuestas cumplan con las políticas establecidas
 * - Filtrar información sensible o no relevante
 * - Asegurar que las respuestas sean seguras y apropiadas
 */
class ValidationAgent {
    constructor() {
        this.name = 'ValidationAgent';
        this.description = 'Agente que valida y filtra las respuestas del sistema';
    }

    /**
     * Valida una respuesta antes de enviarla al usuario
     * @param {Object} response - Respuesta generada por otros agentes
     * @param {string} userMessage - Mensaje original del usuario
     * @param {Object} context - Contexto de la conversación
     * @returns {Promise<Object>} - Respuesta validada y posiblemente modificada
     */
    async validateResponse(response, userMessage, context = {}) {
        try {
            console.log(`[${this.name}] Validando respuesta:`, {
                hasMessage: !!response.message,
                messageLength: response.message ? response.message.length : 0,
                hasUI: !!response.ui,
                hasResults: !!response.results,
                resultCount: response.results ? response.results.length : 0
            });

            // Verificar si la respuesta contiene contenido
            if (!response.message && !response.error) {
                return this._generateErrorResponse("No se pudo generar una respuesta válida");
            }

            // Si hay un error reportado, devolver el mensaje de error
            if (response.error) {
                return response;
            }

            // Validar el contenido del mensaje
            const validatedMessage = this._validateMessageContent(response.message, context);

            // Validar elementos de UI
            const validatedUI = response.ui ? this._validateUIElements(response.ui) : undefined;

            // Validar resultados
            const validatedResults = response.results ? this._validateResults(response.results) : undefined;

            // Construir la respuesta validada
            return {
                ...response,
                message: validatedMessage,
                ui: validatedUI,
                results: validatedResults,
                validatedBy: this.name
            };
        } catch (error) {
            console.error(`[${this.name}] Error durante la validación:`, error);
            return this._generateErrorResponse("Ocurrió un error durante la validación de la respuesta");
        }
    }

    /**
     * Valida el contenido de un mensaje
     * @param {string} message - Mensaje a validar
     * @param {Object} context - Contexto de la conversación
     * @returns {string} - Mensaje validado
     * @private
     */
    _validateMessageContent(message, context) {
        if (!message) {
            return "Lo siento, no puedo proporcionar una respuesta en este momento. ¿Hay algo más en lo que pueda ayudarte?";
        }

        // Verificar longitud del mensaje
        if (message.length > 2000) {
            message = message.substring(0, 1997) + "...";
        }

        // Verificar contenido prohibido (implementación básica)
        const prohibitedPatterns = [
            /\b(contraseña|password|credencial)\b/i,
            /\b(datos personales|información privada)\b/i,
            /\b(whatsapp|telegram|número personal)\b/i
        ];

        let containsProhibitedContent = false;

        prohibitedPatterns.forEach(pattern => {
            if (pattern.test(message)) {
                containsProhibitedContent = true;
            }
        });

        if (containsProhibitedContent) {
            return "Lo siento, no puedo proporcionar ese tipo de información. ¿Puedo ayudarte con otra consulta relacionada con Samaná?";
        }

        // Verificar si la respuesta es relevante al contexto
        if (context.intent && context.intent.type) {
            const intentType = context.intent.type;

            // Verificar relevancia básica (implementación simplificada)
            const intentKeywords = {
                accommodation: ['alojamiento', 'hotel', 'apartamento', 'casa', 'habitación', 'villa'],
                gastronomy: ['restaurante', 'comida', 'gastronomía', 'cocina', 'comer'],
                activities: ['excursión', 'tour', 'actividad', 'visita', 'aventura'],
                transport: ['vehículo', 'coche', 'carro', 'transporte', 'traslado'],
                information: ['samaná', 'república dominicana', 'información', 'lugar', 'destino']
            };

            const relevantKeywords = intentKeywords[intentType] || [];
            let isRelevant = false;

            relevantKeywords.forEach(keyword => {
                if (message.toLowerCase().includes(keyword)) {
                    isRelevant = true;
                }
            });

            // Si no parece relevante, añadimos un enfoque al inicio
            if (!isRelevant && relevantKeywords.length > 0) {
                const prefix = this._getRelevancePrefix(intentType);
                return prefix + message;
            }
        }

        return message;
    }

    /**
     * Genera un prefijo para hacer relevante la respuesta
     * @param {string} intentType - Tipo de intención
     * @returns {string} - Prefijo para añadir
     * @private
     */
    _getRelevancePrefix(intentType) {
        switch (intentType) {
            case 'accommodation':
                return "Respecto a tu consulta sobre alojamiento en Samaná: ";
            case 'gastronomy':
                return "En cuanto a los restaurantes y opciones gastronómicas en Samaná: ";
            case 'activities':
                return "Sobre las actividades y excursiones disponibles en Samaná: ";
            case 'transport':
                return "En relación con las opciones de transporte en Samaná: ";
            case 'information':
                return "Acerca de tu consulta sobre Samaná: ";
            default:
                return "";
        }
    }

    /**
     * Valida elementos de UI
     * @param {Object} ui - Elementos de UI a validar
     * @returns {Object} - Elementos de UI validados
     * @private
     */
    _validateUIElements(ui) {
        if (!ui) {
            return {};
        }

        const validatedUI = { ...ui };

        // Validar banner
        if (validatedUI.updateBanner) {
            if (!validatedUI.bannerType || !this._isValidBannerType(validatedUI.bannerType)) {
                validatedUI.bannerType = 'general';
            }

            if (!validatedUI.bannerTitle) {
                validatedUI.bannerTitle = this._getDefaultBannerTitle(validatedUI.bannerType);
            }
        }

        // Validar botones
        if (validatedUI.showBookingButton && !validatedUI.bookingButtonURL) {
            validatedUI.showBookingButton = false;
        }

        if (validatedUI.showDetailButton && !validatedUI.detailButtonURL) {
            validatedUI.showDetailButton = false;
        }

        // Validar preguntas sugeridas
        if (validatedUI.suggestedQuestions && Array.isArray(validatedUI.suggestedQuestions)) {
            // Asegurarse de que haya como máximo 3 preguntas sugeridas
            validatedUI.suggestedQuestions = validatedUI.suggestedQuestions.slice(0, 3);
        } else {
            // Si no hay preguntas sugeridas válidas, establecer un conjunto predeterminado
            validatedUI.suggestedQuestions = [
                "¿Qué puedo hacer en Samaná?",
                "¿Dónde puedo alojarme en Samaná?",
                "¿Cuál es la mejor época para visitar Samaná?"
            ];
        }

        return validatedUI;
    }

    /**
     * Valida resultados de búsqueda
     * @param {Array} results - Resultados a validar
     * @returns {Array} - Resultados validados
     * @private
     */
    _validateResults(results) {
        if (!Array.isArray(results)) {
            return [];
        }

        // Limitar el número de resultados
        if (results.length > 10) {
            results = results.slice(0, 10);
        }

        // Validar cada resultado
        return results.map(result => {
            const validatedResult = { ...result };

            // Asegurarse de que tenga un título
            if (!validatedResult.title) {
                validatedResult.title = "Elemento sin título";
            }

            // Truncar descripciones largas
            if (validatedResult.content && validatedResult.content.length > 300) {
                validatedResult.content = validatedResult.content.substring(0, 297) + "...";
            }

            if (validatedResult.short_desc && validatedResult.short_desc.length > 150) {
                validatedResult.short_desc = validatedResult.short_desc.substring(0, 147) + "...";
            }

            return validatedResult;
        });
    }

    /**
     * Verifica si el tipo de banner es válido
     * @param {string} bannerType - Tipo de banner
     * @returns {boolean} - Es válido o no
     * @private
     */
    _isValidBannerType(bannerType) {
        const validTypes = [
            'general',
            'accommodation',
            'gastronomy',
            'activities',
            'transport',
            'information'
        ];

        return validTypes.includes(bannerType);
    }

    /**
     * Obtiene un título predeterminado para el banner
     * @param {string} bannerType - Tipo de banner
     * @returns {string} - Título predeterminado
     * @private
     */
    _getDefaultBannerTitle(bannerType) {
        switch (bannerType) {
            case 'accommodation':
                return "Alojamientos en Samaná";
            case 'gastronomy':
                return "Gastronomía de Samaná";
            case 'activities':
                return "Actividades y Excursiones en Samaná";
            case 'transport':
                return "Transporte en Samaná";
            case 'information':
                return "Descubre Samaná";
            default:
                return "Bienvenido a SamanaInn";
        }
    }

    /**
     * Genera una respuesta de error
     * @param {string} errorMessage - Mensaje de error
     * @returns {Object} - Respuesta de error formateada
     * @private
     */
    _generateErrorResponse(errorMessage) {
        return {
            message: errorMessage || "Lo siento, ha ocurrido un error al procesar tu solicitud. ¿Puedo ayudarte con algo más?",
            error: true,
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

module.exports = new ValidationAgent();