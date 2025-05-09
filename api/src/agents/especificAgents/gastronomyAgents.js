// src/agents/specificAgents/gastronomyAgent.js
const dbService = require('../../services/dbService');

/**
 * Agente especializado en gastronomía
 * 
 * Este agente se encarga de:
 * - Proporcionar información detallada sobre restaurantes
 * - Recomendar opciones gastronómicas según preferencias
 * - Conocer especialidades locales y platos típicos
 */
class GastronomyAgent {
    constructor() {
        this.name = 'GastronomyAgent';
        this.description = 'Agente especializado en gastronomía y restaurantes';
    }

    /**
     * Procesa consultas relacionadas con gastronomía
     * @param {Object} params - Parámetros de la consulta
     * @param {string} userMessage - Mensaje del usuario
     * @param {Array} history - Historial de la conversación
     * @param {Object} context - Contexto adicional
     * @returns {Promise<Object>} - Respuesta procesada
     */
    async processGastronomyQuery(params, userMessage, history = [], context = {}) {
        try {
            console.log(`[${this.name}] Procesando consulta de gastronomía`);

            // Extraer preferencias gastronómicas del mensaje
            const preferences = this._extractGastronomicPreferences(userMessage);

            // Combinar con los parámetros recibidos
            const queryParams = {
                ...params,
                ...preferences
            };

            // Determinar el tipo de consulta gastronómica
            const queryType = this._determineGastronomyQueryType(userMessage);

            let response;

            switch (queryType) {
                case 'restaurant_recommendation':
                    response = await this._getRestaurantRecommendations(queryParams);
                    break;

                case 'local_cuisine':
                    response = await this._getLocalCuisineInfo(queryParams);
                    break;

                case 'dish_info':
                    response = await this._getDishInfo(queryParams);
                    break;

                default:
                    response = this._getGeneralGastronomyInfo();
            }

            return response;
        } catch (error) {
            console.error(`[${this.name}] Error al procesar consulta de gastronomía:`, error);
            return {
                message: "Lo siento, he tenido un problema al procesar tu consulta sobre gastronomía. ¿Puedo ayudarte con algo más?",
                error: true
            };
        }
    }

    /**
     * Extrae preferencias gastronómicas del mensaje
     * @param {string} message - Mensaje del usuario
     * @returns {Object} - Preferencias extraídas
     * @private
     */
    _extractGastronomicPreferences(message) {
        const preferences = {};
        const lowerMessage = message.toLowerCase();

        // Extraer tipo de cocina
        if (lowerMessage.includes('dominicana') || lowerMessage.includes('local') || lowerMessage.includes('típica')) {
            preferences.cuisineType = 'local';
        } else if (lowerMessage.includes('italiana') || lowerMessage.includes('pizza') || lowerMessage.includes('pasta')) {
            preferences.cuisineType = 'italian';
        } else if (lowerMessage.includes('mariscos') || lowerMessage.includes('pescado') || lowerMessage.includes('seafood')) {
            preferences.cuisineType = 'seafood';
        } else if (lowerMessage.includes('internacional')) {
            preferences.cuisineType = 'international';
        }

        // Extraer preferencias de precio
        if (lowerMessage.includes('barato') || lowerMessage.includes('económico')) {
            preferences.priceRange = 'low';
        } else if (lowerMessage.includes('caro') || lowerMessage.includes('lujo') || lowerMessage.includes('exclusivo')) {
            preferences.priceRange = 'high';
        }

        // Extraer preferencias de ambiente
        if (lowerMessage.includes('romántico') || lowerMessage.includes('pareja')) {
            preferences.ambience = 'romantic';
        } else if (lowerMessage.includes('familia') || lowerMessage.includes('niños')) {
            preferences.ambience = 'family';
        } else if (lowerMessage.includes('vista') || lowerMessage.includes('panorámica') || lowerMessage.includes('mar')) {
            preferences.ambience = 'view';
        }

        return preferences;
    }

    /**
     * Determina el tipo de consulta gastronómica
     * @param {string} message - Mensaje del usuario
     * @returns {string} - Tipo de consulta
     * @private
     */
    _determineGastronomyQueryType(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('restaurante') ||
            lowerMessage.includes('donde comer') ||
            lowerMessage.includes('recomienda')) {
            return 'restaurant_recommendation';
        }

        if (lowerMessage.includes('comida típica') ||
            lowerMessage.includes('platos dominicanos') ||
            lowerMessage.includes('gastronomía local')) {
            return 'local_cuisine';
        }

        if (lowerMessage.includes('qué es') ||
            lowerMessage.includes('cómo se prepara') ||
            lowerMessage.includes('ingredientes')) {
            return 'dish_info';
        }

        return 'general';
    }

    /**
     * Obtiene recomendaciones de restaurantes
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Recomendaciones de restaurantes
     * @private
     */
    async _getRestaurantRecommendations(params) {
        // Convertir preferencias a filtros para consulta a BD
        const filters = {
            limit: 5
        };

        if (params.cuisineType) {
            filters.category = params.cuisineType;
        }

        if (params.priceRange === 'low') {
            filters.maxPrice = 30;
        } else if (params.priceRange === 'high') {
            filters.minPrice = 50;
        }

        // Obtener restaurantes de la base de datos
        const restaurants = await dbService.getRestaurants(filters);

        // Preparar respuesta
        let message = "Basándome en tus preferencias, te recomiendo ";

        if (restaurants.length === 0) {
            message = "Lo siento, no he encontrado restaurantes que coincidan exactamente con tus preferencias. Te sugiero ampliar tu búsqueda o probar estas opciones populares en Samaná:";
            // Obtener restaurantes destacados como alternativa
            const featuredRestaurants = await dbService.getRestaurants({ limit: 3, isFeatured: true });

            if (featuredRestaurants.length > 0) {
                restaurants.push(...featuredRestaurants);
            } else {
                return {
                    message: "Lo siento, no he podido encontrar restaurantes que coincidan con tus criterios. ¿Podrías reformular tu búsqueda con otros criterios?",
                    ui: {
                        suggestedQuestions: [
                            "¿Qué restaurantes hay cerca de la playa?",
                            "¿Dónde puedo comer comida dominicana auténtica?",
                            "¿Cuáles son los restaurantes más populares en Samaná?"
                        ]
                    }
                };
            }
        }

        // Formato de respuesta con restaurantes
        if (restaurants.length === 1) {
            message += `el restaurante ${restaurants[0].title}. `;
            if (restaurants[0].short_desc) {
                message += restaurants[0].short_desc + " ";
            }
        } else {
            message += "estos restaurantes: ";
            restaurants.slice(0, 3).forEach((restaurant, index) => {
                message += `${restaurant.title}`;
                if (index < Math.min(restaurants.length, 3) - 2) {
                    message += ", ";
                } else if (index === Math.min(restaurants.length, 3) - 2) {
                    message += " y ";
                }
            });
            message += ". ";

            // Añadir descripción del primer restaurante
            if (restaurants[0].short_desc) {
                message += `${restaurants[0].title} ofrece ${restaurants[0].short_desc}. `;
            }
        }

        message += "¿Te gustaría obtener más información sobre alguno de estos restaurantes o prefieres ver más opciones?";

        return {
            message,
            results: restaurants,
            ui: {
                showResults: true,
                resultType: 'restaurant',
                updateBanner: true,
                bannerType: 'gastronomy',
                bannerTitle: 'Restaurantes en Samaná',
                suggestedQuestions: [
                    `¿Qué tipo de comida sirven en ${restaurants[0].title}?`,
                    "¿Hay restaurantes con terraza o vistas al mar?",
                    "¿Dónde puedo probar pescado fresco?"
                ]
            }
        };
    }

    /**
     * Obtiene información sobre la gastronomía local
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información sobre la gastronomía local
     * @private
     */
    async _getLocalCuisineInfo(params) {
        // En una implementación real, obtendríamos esta información de una base de datos
        // o servicio externo. Para esta fase, usamos información predefinida.

        const localCuisineInfo = {
            message: "La gastronomía de Samaná está marcada por su ubicación costera, con una fuerte influencia de la cocina dominicana tradicional y toques especiales de la península. Los mariscos frescos y el pescado son protagonistas en muchos restaurantes locales. Platos emblemáticos incluyen el pescado con coco, mofongo (puré de plátano verde con chicharrones), sancocho (guiso tradicional dominicano) y, por supuesto, los dulces de coco característicos de la región. Los restaurantes locales suelen ofrecer estas delicias con un toque auténtico que refleja la cultura y tradiciones de Samaná. ¿Te gustaría conocer más sobre algún plato específico o prefieres recomendaciones de restaurantes donde probar estas especialidades?",
            ui: {
                updateBanner: true,
                bannerType: 'gastronomy',
                suggestedQuestions: [
                    "¿Qué es el pescado con coco?",
                    "¿Dónde puedo probar mofongo auténtico?",
                    "¿Cuáles son los dulces típicos de Samaná?"
                ]
            }
        };

        return localCuisineInfo;
    }

    /**
     * Obtiene información sobre un plato específico
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información sobre el plato
     * @private
     */
    async _getDishInfo(params) {
        // Detectar el plato mencionado en el mensaje
        let dishName = '';

        if (params.userMessage) {
            const lowerMessage = params.userMessage.toLowerCase();

            if (lowerMessage.includes('pescado con coco')) {
                dishName = 'pescado con coco';
            } else if (lowerMessage.includes('mofongo')) {
                dishName = 'mofongo';
            } else if (lowerMessage.includes('sancocho')) {
                dishName = 'sancocho';
            } else if (lowerMessage.includes('dulce de coco')) {
                dishName = 'dulce de coco';
            }
        }

        // Información predefinida sobre platos
        const dishInfo = {
            'pescado con coco': {
                description: "El pescado con coco es un plato emblemático de Samaná. Consiste en pescado fresco (generalmente mero o dorado) cocinado en una rica salsa de leche de coco con especias locales, cebolla, pimiento y ajo. Se sirve tradicionalmente con arroz blanco y tostones (plátano verde frito). Este plato refleja perfectamente la fusión de ingredientes locales y la influencia caribeña en la cocina de Samaná.",
                restaurants: ["El Pescador", "La Terrasse", "Pueblo de los Pescadores"]
            },
            'mofongo': {
                description: "El mofongo es un plato tradicional dominicano hecho de plátano verde frito que se machaca con ajo, chicharrón (piel de cerdo frita) y aceite de oliva hasta formar una masa. Se sirve generalmente en forma de cuenco y puede rellenarse con carne, pollo, mariscos o vegetales en salsa. Es un plato contundente y lleno de sabor que representa la esencia de la cocina dominicana.",
                restaurants: ["El Mofongo Loco", "Restaurante Luis", "La Casa de Doña Chichi"]
            },
            'sancocho': {
                description: "El sancocho dominicano es un guiso espeso y sustancioso que combina diferentes carnes (pollo, res, cerdo), tubérculos como yuca, ñame, plátano y batata, y verduras como maíz, auyama (calabaza) y cebolla. Se cocina a fuego lento durante horas para que todos los sabores se mezclen. Es considerado el plato nacional de República Dominicana y se sirve tradicionalmente en ocasiones especiales.",
                restaurants: ["La Cocina Dominicana", "Comedor Típico", "El Criollo"]
            },
            'dulce de coco': {
                description: "Los dulces de coco son una especialidad de Samaná, gracias a la abundancia de cocoteros en la península. Se preparan con coco rallado fresco, azúcar moreno, canela y vainilla, cocinados hasta obtener una textura espesa y caramelizada. Existen muchas variantes, algunas con leche, otras con piña o batata. Estos dulces se pueden encontrar tanto en restaurantes como vendidos por lugareños en las playas y calles de Samaná.",
                restaurants: ["Dulcería Samaná", "Café del Mar", "Las Delicias"]
            }
        };

        // Respuesta por defecto si no se reconoce el plato
        if (!dishName || !dishInfo[dishName]) {
            return {
                message: "Lo siento, no tengo información específica sobre ese plato. Algunos platos típicos de Samaná incluyen el pescado con coco, mofongo, sancocho y los dulces de coco. ¿Te gustaría saber más sobre alguno de estos platos?",
                ui: {
                    suggestedQuestions: [
                        "¿Qué es el pescado con coco?",
                        "¿Cómo se prepara el mofongo?",
                        "¿Dónde puedo probar la gastronomía local?"
                    ]
                }
            };
        }

        // Construir respuesta con información del plato
        const info = dishInfo[dishName];
        let message = info.description + " ";

        if (info.restaurants && info.restaurants.length > 0) {
            message += `Puedes probar excelente ${dishName} en restaurantes como ${info.restaurants.join(", ")}.`;
        }

        message += " ¿Te gustaría conocer otros platos típicos o saber dónde encontrar los mejores restaurantes para probar esta especialidad?";

        return {
            message,
            ui: {
                updateBanner: true,
                bannerType: 'gastronomy',
                suggestedQuestions: [
                    `¿Dónde está ubicado ${info.restaurants[0]}?`,
                    "¿Qué otros platos típicos hay en Samaná?",
                    "¿Cuál es el mejor restaurante para comida local?"
                ]
            }
        };
    }

    /**
     * Obtiene información general sobre gastronomía
     * @returns {Object} - Información general
     * @private
     */
    _getGeneralGastronomyInfo() {
        return {
            message: "Samaná ofrece una excelente variedad gastronómica, desde restaurantes de cocina dominicana tradicional hasta opciones internacionales. La cocina local destaca por sus mariscos frescos, el famoso pescado con coco, mofongo y los dulces típicos elaborados con coco. Los restaurantes se encuentran tanto en Las Terrenas como en Santa Bárbara de Samaná, muchos con vistas al mar y ambientes relajados. ¿Te interesa algún tipo de cocina en particular o prefieres una recomendación general?",
            ui: {
                updateBanner: true,
                bannerType: 'gastronomy',
                suggestedQuestions: [
                    "¿Dónde puedo comer mariscos frescos?",
                    "¿Cuáles son los mejores restaurantes para comida dominicana?",
                    "¿Hay restaurantes con vistas al mar?"
                ]
            }
        };
    }
}

module.exports = new GastronomyAgent();
