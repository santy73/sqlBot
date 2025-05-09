// src/agents/queryAgent.js
const dbService = require('../services/dbService');

/**
 * Agente de Consulta
 * 
 * Este agente se encarga de:
 * - Interpretar consultas específicas del usuario
 * - Determinar qué datos son necesarios para la búsqueda
 * - Ejecutar consultas a la base de datos
 * - Formatear los resultados para presentarlos
 */
class QueryAgent {
    constructor() {
        this.name = 'QueryAgent';
        this.description = 'Agente que maneja consultas específicas y búsquedas en la base de datos';
    }

    /**
     * Procesa una consulta según la intención detectada
     * @param {Object} params - Parámetros de la consulta
     * @param {string} userMessage - Mensaje del usuario
     * @param {Array} history - Historial de la conversación
     * @param {Object} context - Contexto adicional
     * @returns {Promise<Object>} - Resultados procesados
     */
    async processQuery(params, userMessage, history = [], context = {}) {
        try {
            console.log(`[${this.name}] Procesando consulta con parámetros:`, params);

            // Extraer parámetros de búsqueda del mensaje del usuario
            const extractedParams = await this._extractSearchParams(userMessage, params.intentType);

            // Combinar con los parámetros recibidos
            const searchParams = { ...params, ...extractedParams };

            // Realizar la consulta según el tipo de búsqueda
            let results = [];
            let responseMessage = '';
            let uiActions = {};

            switch (searchParams.searchType) {
                case 'accommodation':
                    results = await this._searchAccommodations(searchParams);
                    responseMessage = this._formatAccommodationResponse(results, searchParams);
                    uiActions = this._prepareAccommodationUI(results, searchParams);
                    break;

                case 'restaurant':
                    results = await this._searchRestaurants(searchParams);
                    responseMessage = this._formatRestaurantResponse(results, searchParams);
                    uiActions = this._prepareRestaurantUI(results, searchParams);
                    break;

                case 'tour':
                    results = await this._searchTours(searchParams);
                    responseMessage = this._formatTourResponse(results, searchParams);
                    uiActions = this._prepareTourUI(results, searchParams);
                    break;

                case 'information':
                    results = await this._getLocationInfo(searchParams);
                    responseMessage = this._formatLocationResponse(results, searchParams);
                    uiActions = this._prepareLocationUI(results, searchParams);
                    break;

                default:
                    responseMessage = "No he podido determinar exactamente qué estás buscando. ¿Podrías ser más específico? Puedo ayudarte con alojamientos, restaurantes, excursiones o información general sobre Samaná.";
                    uiActions = {
                        showResults: false,
                        updateBanner: true,
                        bannerType: 'general'
                    };
            }

            return {
                message: responseMessage,
                results,
                ui: uiActions,
                context: {
                    ...context,
                    lastSearch: {
                        type: searchParams.searchType,
                        params: searchParams,
                        resultCount: results.length
                    }
                }
            };
        } catch (error) {
            console.error(`[${this.name}] Error al procesar consulta:`, error);
            return {
                message: "Lo siento, he tenido un problema al buscar la información solicitada. ¿Podrías intentarlo de nuevo?",
                error: true
            };
        }
    }

    /**
     * Extrae parámetros de búsqueda del mensaje del usuario
     * @param {string} message - Mensaje del usuario
     * @param {string} intentType - Tipo de intención
     * @returns {Promise<Object>} - Parámetros extraídos
     * @private
     */
    async _extractSearchParams(message, intentType) {
        // En implementación real, esto utilizaría NLP para extraer entidades y parámetros
        // Para esta fase, usamos una implementación básica basada en palabras clave

        const params = {};
        const lowerMessage = message.toLowerCase();

        // Buscar ubicaciones
        if (lowerMessage.includes('playa') || lowerMessage.includes('costa') || lowerMessage.includes('mar')) {
            params.location = 'playa';
        } else if (lowerMessage.includes('centro')) {
            params.location = 'centro';
        }

        // Buscar presupuesto
        if (lowerMessage.includes('económico') || lowerMessage.includes('barato')) {
            params.budget = 'bajo';
        } else if (lowerMessage.includes('lujo') || lowerMessage.includes('premium')) {
            params.budget = 'alto';
        }

        // Buscar número de personas
        const personMatches = message.match(/(\d+)\s*(persona|personas|huéspedes|adultos|visitantes)/i);
        if (personMatches) {
            params.people = parseInt(personMatches[1]);
        }

        // Identificar fechas (implementación básica)
        if (lowerMessage.includes('mañana')) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            params.startDate = tomorrow.toISOString().split('T')[0];
        } else if (lowerMessage.includes('próxima semana')) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            params.startDate = nextWeek.toISOString().split('T')[0];
        }

        // Convertir presupuesto a rangos numéricos para consultas
        if (params.budget === 'bajo') {
            params.maxPrice = 100;
        } else if (params.budget === 'medio') {
            params.minPrice = 100;
            params.maxPrice = 300;
        } else if (params.budget === 'alto') {
            params.minPrice = 300;
        }

        return params;
    }

    /**
     * Busca alojamientos en la base de datos
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<Array>} - Resultados de la búsqueda
     * @private
     */
    async _searchAccommodations(params) {
        // Preparar filtros para la consulta
        const filters = {
            limit: 10 // Limitar a 10 resultados por defecto
        };

        // Aplicar filtros según los parámetros
        if (params.location) {
            filters.location = params.location;
        }

        if (params.minPrice) {
            filters.minPrice = params.minPrice;
        }

        if (params.maxPrice) {
            filters.maxPrice = params.maxPrice;
        }

        if (params.rating) {
            filters.rating = params.rating;
        }

        // Realizar la consulta a la base de datos
        return await dbService.getAccommodations(filters);
    }

    /**
     * Busca restaurantes en la base de datos
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<Array>} - Resultados de la búsqueda
     * @private
     */
    async _searchRestaurants(params) {
        // Preparar filtros para la consulta
        const filters = {
            limit: 10 // Limitar a 10 resultados por defecto
        };

        // Aplicar filtros según los parámetros
        if (params.location) {
            filters.location = params.location;
        }

        if (params.category) {
            filters.category = params.category;
        }

        if (params.maxPrice) {
            filters.maxPrice = params.maxPrice;
        }

        // Realizar la consulta a la base de datos
        return await dbService.getRestaurants(filters);
    }

    /**
     * Busca tours/excursiones en la base de datos
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<Array>} - Resultados de la búsqueda
     * @private
     */
    async _searchTours(params) {
        // Preparar filtros para la consulta
        const filters = {
            limit: 10 // Limitar a 10 resultados por defecto
        };

        // Aplicar filtros según los parámetros
        if (params.location) {
            filters.location = params.location;
        }

        if (params.category) {
            filters.category = params.category;
        }

        if (params.duration) {
            filters.duration = params.duration;
        }

        // Realizar la consulta a la base de datos
        return await dbService.getTours(filters);
    }

    /**
     * Obtiene información sobre una ubicación
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<Object>} - Información de la ubicación
     * @private
     */
    async _getLocationInfo(params) {
        // Si no hay un nombre de ubicación específico, usamos Samaná por defecto
        const locationName = params.name || 'Samana';

        // Realizar la consulta a la base de datos
        const locationInfo = await dbService.getLocationInfo(locationName);

        // Si encontramos información específica, la devolvemos
        if (locationInfo) {
            return locationInfo;
        }

        // Si no hay información específica, buscamos en el blog
        const blogResults = await dbService.searchBlogContent(locationName);

        return {
            name: locationName,
            blogResults
        };
    }

    /**
     * Formatea la respuesta para alojamientos
     * @param {Array} results - Resultados de la búsqueda
     * @param {Object} params - Parámetros de búsqueda
     * @returns {string} - Mensaje formateado
     * @private
     */
    _formatAccommodationResponse(results, params) {
        if (!results || results.length === 0) {
            return "Lo siento, no he encontrado alojamientos que coincidan con tus criterios. ¿Te gustaría modificar tu búsqueda o intentar con otros filtros?";
        }

        let response = `He encontrado ${results.length} alojamiento${results.length === 1 ? '' : 's'} que podrían interesarte en Samaná`;

        if (params.location) {
            response += ` cerca de ${params.location}`;
        }

        response += ". ";

        // Mencionar algunos de los resultados
        if (results.length <= 3) {
            // Si hay pocos resultados, los mencionamos todos
            response += "Entre ellos están: " + results.map(r => r.title).join(", ") + ". ";
        } else {
            // Si hay muchos, mencionamos los primeros 3
            response += "Entre ellos están: " + results.slice(0, 3).map(r => r.title).join(", ") + ", entre otros. ";
        }

        response += "¿Te gustaría más información sobre alguno de estos alojamientos o prefieres filtrar más la búsqueda?";

        return response;
    }

    /**
     * Formatea la respuesta para restaurantes
     * @param {Array} results - Resultados de la búsqueda
     * @param {Object} params - Parámetros de búsqueda
     * @returns {string} - Mensaje formateado
     * @private
     */
    _formatRestaurantResponse(results, params) {
        if (!results || results.length === 0) {
            return "Lo siento, no he encontrado restaurantes que coincidan con tus criterios. ¿Te gustaría modificar tu búsqueda o intentar con otros filtros?";
        }

        let response = `He encontrado ${results.length} restaurante${results.length === 1 ? '' : 's'} en Samaná`;

        if (params.category) {
            response += ` de cocina ${params.category}`;
        }

        if (params.location) {
            response += ` cerca de ${params.location}`;
        }

        response += ". ";

        // Mencionar algunos de los resultados
        if (results.length <= 3) {
            response += "Entre ellos están: " + results.map(r => r.title).join(", ") + ". ";
        } else {
            response += "Entre ellos están: " + results.slice(0, 3).map(r => r.title).join(", ") + ", entre otros. ";
        }

        response += "¿Te gustaría más información sobre alguno de estos restaurantes o prefieres filtrar más la búsqueda?";

        return response;
    }

    /**
     * Formatea la respuesta para tours/excursiones
     * @param {Array} results - Resultados de la búsqueda
     * @param {Object} params - Parámetros de búsqueda
     * @returns {string} - Mensaje formateado
     * @private
     */
    _formatTourResponse(results, params) {
        if (!results || results.length === 0) {
            return "Lo siento, no he encontrado excursiones o actividades que coincidan con tus criterios. ¿Te gustaría modificar tu búsqueda o intentar con otros filtros?";
        }

        let response = `He encontrado ${results.length} excursion${results.length === 1 ? '' : 'es'}/actividad${results.length === 1 ? '' : 'es'} en Samaná`;

        if (params.category) {
            response += ` de tipo ${params.category}`;
        }

        if (params.location) {
            response += ` cerca de ${params.location}`;
        }

        response += ". ";

        // Mencionar algunos de los resultados
        if (results.length <= 3) {
            response += "Entre ellas están: " + results.map(r => r.title).join(", ") + ". ";
        } else {
            response += "Entre ellas están: " + results.slice(0, 3).map(r => r.title).join(", ") + ", entre otras. ";
        }

        response += "¿Te gustaría más información sobre alguna de estas actividades o prefieres filtrar más la búsqueda?";

        return response;
    }

    /**
     * Formatea la respuesta para información de ubicación
     * @param {Object} results - Resultados de la búsqueda
     * @param {Object} params - Parámetros de búsqueda
     * @returns {string} - Mensaje formateado
     * @private
     */
    _formatLocationResponse(results, params) {
        if (!results) {
            return "Lo siento, no he encontrado información específica sobre ese lugar. ¿Puedo ayudarte con información sobre Samaná en general?";
        }

        let response = '';

        if (results.content) {
            // Si tenemos una descripción formal de la ubicación
            response = results.content;

            // Limitamos la longitud de la respuesta
            if (response.length > 500) {
                response = response.substring(0, 500) + "...";
            }
        } else if (results.blogResults && results.blogResults.length > 0) {
            // Si tenemos resultados del blog
            response = `He encontrado algunos artículos en nuestro blog sobre ${results.name}:`;

            results.blogResults.slice(0, 3).forEach(article => {
                response += `\n- ${article.title}`;
            });

            response += "\n\n¿Te gustaría leer alguno de estos artículos o prefieres información sobre algo específico?";
        } else {
            // Respuesta genérica si no hay información específica
            response = `Samaná es una hermosa península en el noreste de República Dominicana, conocida por sus playas paradisíacas, naturaleza exuberante y experiencias únicas como el avistamiento de ballenas jorobadas. ¿Hay algo específico sobre Samaná que te gustaría conocer?`;
        }

        return response;
    }

    /**
     * Prepara acciones de UI para alojamientos
     * @param {Array} results - Resultados de la búsqueda
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Object} - Acciones de UI
     * @private
     */
    _prepareAccommodationUI(results, params) {
        return {
            showResults: results && results.length > 0,
            resultType: 'accommodation',
            updateBanner: true,
            bannerType: 'accommodation',
            bannerTitle: 'Alojamientos en Samaná',
            bannerImage: results && results.length > 0 && results[0].gallery ?
                results[0].gallery.split(',')[0] : null,
            suggestedQuestions: this._getSuggestedQuestionsForAccommodation(results, params)
        };
    }

    /**
     * Prepara acciones de UI para restaurantes
     * @param {Array} results - Resultados de la búsqueda
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Object} - Acciones de UI
     * @private
     */
    _prepareRestaurantUI(results, params) {
        return {
            showResults: results && results.length > 0,
            resultType: 'restaurant',
            updateBanner: true,
            bannerType: 'gastronomy',
            bannerTitle: 'Restaurantes en Samaná',
            bannerImage: results && results.length > 0 && results[0].gallery ?
                results[0].gallery.split(',')[0] : null,
            suggestedQuestions: this._getSuggestedQuestionsForRestaurants(results, params)
        };
    }

    /**
     * Prepara acciones de UI para tours
     * @param {Array} results - Resultados de la búsqueda
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Object} - Acciones de UI
     * @private
     */
    _prepareTourUI(results, params) {
        return {
            showResults: results && results.length > 0,
            resultType: 'tour',
            updateBanner: true,
            bannerType: 'activities',
            bannerTitle: 'Actividades y Excursiones en Samaná',
            bannerImage: results && results.length > 0 && results[0].gallery ?
                results[0].gallery.split(',')[0] : null,
            suggestedQuestions: this._getSuggestedQuestionsForTours(results, params)
        };
    }

    /**
     * Prepara acciones de UI para información de ubicación
     * @param {Object} results - Resultados de la búsqueda
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Object} - Acciones de UI
     * @private
     */
    _prepareLocationUI(results, params) {
        return {
            showResults: results && results.blogResults && results.blogResults.length > 0,
            resultType: 'information',
            updateBanner: true,
            bannerType: 'information',
            bannerTitle: `Información sobre ${results.name || 'Samaná'}`,
            bannerImage: results && results.gallery ?
                results.gallery.split(',')[0] : null,
            suggestedQuestions: [
                '¿Qué lugares debo visitar en Samaná?',
                '¿Cuál es la mejor época para visitar Samaná?',
                '¿Cómo llego a Samaná desde Santo Domingo?'
            ]
        };
    }

    /**
     * Genera preguntas sugeridas para alojamientos
     * @param {Array} results - Resultados de la búsqueda
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Array} - Preguntas sugeridas
     * @private
     */
    _getSuggestedQuestionsForAccommodation(results, params) {
        if (!results || results.length === 0) {
            return [
                '¿Qué alojamientos hay cerca de la playa?',
                '¿Dónde puedo encontrar alojamiento para familias?',
                '¿Cuáles son los alojamientos con mejor relación calidad-precio?'
            ];
        }

        const suggestions = [];

        // Añadir sugerencias basadas en los resultados
        if (results.length > 0) {
            suggestions.push(`¿Puedes darme más detalles sobre ${results[0].title}?`);
        }

        if (results.length > 1) {
            suggestions.push(`¿Cuál es la diferencia entre ${results[0].title} y ${results[1].title}?`);
        }

        // Añadir sugerencias de refinamiento
        if (!params.location) {
            suggestions.push('¿Hay alojamientos cerca de la playa?');
        }

        if (!params.budget) {
            suggestions.push('¿Cuáles son las opciones más económicas?');
        }

        // Asegurarse de tener al menos 3 sugerencias
        while (suggestions.length < 3) {
            const defaultSuggestions = [
                '¿Estos alojamientos incluyen desayuno?',
                '¿Hay opciones con piscina?',
                '¿Cuáles tienen las mejores vistas?',
                '¿Hay opciones para familias con niños?'
            ];

            const randomSuggestion = defaultSuggestions[Math.floor(Math.random() * defaultSuggestions.length)];

            if (!suggestions.includes(randomSuggestion)) {
                suggestions.push(randomSuggestion);
            }
        }

        return suggestions.slice(0, 3); // Limitar a 3 sugerencias
    }

    /**
     * Genera preguntas sugeridas para restaurantes
     * @param {Array} results - Resultados de la búsqueda
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Array} - Preguntas sugeridas
     * @private
     */
    _getSuggestedQuestionsForRestaurants(results, params) {
        if (!results || results.length === 0) {
            return [
                '¿Dónde puedo comer comida típica dominicana?',
                '¿Cuáles son los mejores restaurantes de mariscos?',
                '¿Hay restaurantes con vistas al mar?'
            ];
        }

        const suggestions = [];

        // Añadir sugerencias basadas en los resultados
        if (results.length > 0) {
            suggestions.push(`¿Qué tipo de comida sirven en ${results[0].title}?`);
        }

        if (results.length > 1) {
            suggestions.push(`¿Necesito reservar mesa en ${results[1].title}?`);
        }

        // Añadir sugerencias de refinamiento
        if (!params.category) {
            suggestions.push('¿Dónde puedo comer mariscos frescos?');
        }

        // Asegurarse de tener al menos 3 sugerencias
        while (suggestions.length < 3) {
            const defaultSuggestions = [
                '¿Hay restaurantes con terraza o vistas al mar?',
                '¿Cuál es el mejor restaurante para cenar romántica?',
                '¿Qué restaurantes ofrecen cocina local auténtica?',
                '¿Hay opciones para dietas especiales como vegetarianos?'
            ];

            const randomSuggestion = defaultSuggestions[Math.floor(Math.random() * defaultSuggestions.length)];

            if (!suggestions.includes(randomSuggestion)) {
                suggestions.push(randomSuggestion);
            }
        }

        return suggestions.slice(0, 3); // Limitar a 3 sugerencias
    }

    /**
     * Genera preguntas sugeridas para tours
     * @param {Array} results - Resultados de la búsqueda
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Array} - Preguntas sugeridas
     * @private
     */
    _getSuggestedQuestionsForTours(results, params) {
        if (!results || results.length === 0) {
            return [
                '¿Qué excursiones hay para ver ballenas?',
                '¿Cómo puedo visitar El Limón?',
                '¿Qué actividades se recomiendan para familias?'
            ];
        }

        const suggestions = [];

        // Añadir sugerencias basadas en los resultados
        if (results.length > 0) {
            suggestions.push(`¿Cuánto dura la excursión a ${results[0].title}?`);
        }

        if (results.length > 1) {
            suggestions.push(`¿Qué incluye la excursión a ${results[1].title}?`);
        }

        // Añadir sugerencias de refinamiento
        if (!params.duration) {
            suggestions.push('¿Hay excursiones de medio día?');
        }

        // Asegurarse de tener al menos 3 sugerencias
        while (suggestions.length < 3) {
            const defaultSuggestions = [
                '¿Cuáles son las excursiones más populares?',
                '¿Hay actividades para niños?',
                '¿Qué excursiones incluyen transporte desde el hotel?',
                '¿Puedo hacer avistamiento de ballenas en esta época?'
            ];

            const randomSuggestion = defaultSuggestions[Math.floor(Math.random() * defaultSuggestions.length)];

            if (!suggestions.includes(randomSuggestion)) {
                suggestions.push(randomSuggestion);
            }
        }

        return suggestions.slice(0, 3); // Limitar a 3 sugerencias
    }
}
module.export = new QueryAgent();