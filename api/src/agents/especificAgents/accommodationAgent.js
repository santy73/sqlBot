
// src/agents/specificAgents/accommodationAgent.js
const dbService = require('../../services/dbService');

/**
 * Agente especializado en alojamientos
 * 
 * Este agente se encarga de:
 * - Proporcionar información detallada sobre opciones de alojamiento
 * - Recomendar propiedades según preferencias del usuario
 * - Conocer características específicas de los alojamientos
 */
class AccommodationAgent {
    constructor() {
        this.name = 'AccommodationAgent';
        this.description = 'Agente especializado en alojamientos';
    }

    /**
     * Procesa consultas relacionadas con alojamientos
     * @param {Object} params - Parámetros de la consulta
     * @param {string} userMessage - Mensaje del usuario
     * @param {Array} history - Historial de la conversación
     * @param {Object} context - Contexto adicional
     * @returns {Promise<Object>} - Respuesta procesada
     */
    async processAccommodationQuery(params, userMessage, history = [], context = {}) {
        try {
            console.log(`[${this.name}] Procesando consulta de alojamiento`);

            // Extraer preferencias de alojamiento del mensaje
            const preferences = this._extractAccommodationPreferences(userMessage);

            // Combinar con los parámetros recibidos
            const queryParams = {
                ...params,
                ...preferences
            };

            // Determinar el tipo de consulta de alojamiento
            const queryType = this._determineAccommodationQueryType(userMessage);

            let response;

            switch (queryType) {
                case 'hotel_recommendation':
                    response = await this._getHotelRecommendations(queryParams);
                    break;

                case 'apartment_recommendation':
                    response = await this._getApartmentRecommendations(queryParams);
                    break;

                case 'villa_recommendation':
                    response = await this._getVillaRecommendations(queryParams);
                    break;

                case 'accommodation_details':
                    response = await this._getAccommodationDetails(queryParams);
                    break;

                case 'family_accommodation':
                    response = await this._getFamilyAccommodations(queryParams);
                    break;

                case 'romantic_accommodation':
                    response = await this._getRomanticAccommodations(queryParams);
                    break;

                default:
                    response = this._getGeneralAccommodationInfo();
            }

            return response;
        } catch (error) {
            console.error(`[${this.name}] Error al procesar consulta de alojamiento:`, error);
            return {
                message: "Lo siento, he tenido un problema al procesar tu consulta sobre alojamiento. ¿Puedo ayudarte con algo más?",
                error: true
            };
        }
    }

    /**
     * Extrae preferencias de alojamiento del mensaje
     * @param {string} message - Mensaje del usuario
     * @returns {Object} - Preferencias extraídas
     * @private
     */
    _extractAccommodationPreferences(message) {
        const preferences = {};
        const lowerMessage = message.toLowerCase();

        // Extraer tipo de alojamiento
        if (lowerMessage.includes('hotel')) {
            preferences.accommodationType = 'hotel';
        } else if (lowerMessage.includes('apartamento') || lowerMessage.includes('apartment')) {
            preferences.accommodationType = 'apartment';
        } else if (lowerMessage.includes('villa') || lowerMessage.includes('casa')) {
            preferences.accommodationType = 'villa';
        }

        // Extraer ubicación preferida
        if (lowerMessage.includes('playa') || lowerMessage.includes('beach') || lowerMessage.includes('costa')) {
            preferences.location = 'beach';
        } else if (lowerMessage.includes('centro') || lowerMessage.includes('downtown')) {
            preferences.location = 'downtown';
        } else if (lowerMessage.includes('montaña') || lowerMessage.includes('mountain')) {
            preferences.location = 'mountain';
        }

        // Extraer rango de precio
        if (lowerMessage.includes('barato') || lowerMessage.includes('económico') || lowerMessage.includes('cheap')) {
            preferences.priceRange = 'low';
        } else if (lowerMessage.includes('lujo') || lowerMessage.includes('luxury') || lowerMessage.includes('premium')) {
            preferences.priceRange = 'high';
        }

        // Extraer preferencias de grupo
        if (lowerMessage.includes('familia') || lowerMessage.includes('niños') || lowerMessage.includes('family')) {
            preferences.groupType = 'family';
        } else if (lowerMessage.includes('pareja') || lowerMessage.includes('romántico') || lowerMessage.includes('couple')) {
            preferences.groupType = 'couple';
        } else if (lowerMessage.includes('grupo') || lowerMessage.includes('amigos') || lowerMessage.includes('group')) {
            preferences.groupType = 'group';
        }

        // Extraer preferencias de servicios
        if (lowerMessage.includes('piscina') || lowerMessage.includes('pool')) {
            preferences.amenities = preferences.amenities || [];
            preferences.amenities.push('pool');
        }

        if (lowerMessage.includes('wifi') || lowerMessage.includes('internet')) {
            preferences.amenities = preferences.amenities || [];
            preferences.amenities.push('wifi');
        }

        if (lowerMessage.includes('desayuno') || lowerMessage.includes('breakfast')) {
            preferences.amenities = preferences.amenities || [];
            preferences.amenities.push('breakfast');
        }

        return preferences;
    }

    /**
     * Determina el tipo de consulta de alojamiento
     * @param {string} message - Mensaje del usuario
     * @returns {string} - Tipo de consulta
     * @private
     */
    _determineAccommodationQueryType(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('hotel') &&
            (lowerMessage.includes('recomend') || lowerMessage.includes('mejor'))) {
            return 'hotel_recommendation';
        }

        if ((lowerMessage.includes('apartamento') || lowerMessage.includes('apartment')) &&
            (lowerMessage.includes('recomend') || lowerMessage.includes('mejor'))) {
            return 'apartment_recommendation';
        }

        if ((lowerMessage.includes('villa') || lowerMessage.includes('casa')) &&
            (lowerMessage.includes('recomend') || lowerMessage.includes('mejor'))) {
            return 'villa_recommendation';
        }

        if (lowerMessage.includes('familia') || lowerMessage.includes('niños') ||
            (lowerMessage.includes('family') && lowerMessage.includes('alojamiento'))) {
            return 'family_accommodation';
        }

        if (lowerMessage.includes('pareja') || lowerMessage.includes('romántico') ||
            (lowerMessage.includes('couple') && lowerMessage.includes('alojamiento'))) {
            return 'romantic_accommodation';
        }

        if (lowerMessage.includes('detalle') || lowerMessage.includes('informacion') ||
            lowerMessage.includes('caracteristicas')) {
            return 'accommodation_details';
        }

        return 'general';
    }

    /**
     * Obtiene recomendaciones de hoteles
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Recomendaciones de hoteles
     * @private
     */
    async _getHotelRecommendations(params) {
        // Convertir preferencias a filtros para consulta a BD
        const filters = {
            limit: 5,
            accommodationType: 'hotel'
        };

        if (params.location) {
            filters.location = params.location;
        }

        if (params.priceRange === 'low') {
            filters.maxPrice = 100;
        } else if (params.priceRange === 'high') {
            filters.minPrice = 300;
        }

        if (params.amenities && params.amenities.includes('pool')) {
            filters.hasPool = true;
        }

        // Obtener hoteles de la base de datos
        const hotels = await dbService.getAccommodations(filters);

        // Preparar respuesta
        let message = "Basándome en tus preferencias, te recomiendo ";

        if (hotels.length === 0) {
            message = "Lo siento, no he encontrado hoteles que coincidan exactamente con tus preferencias. Te sugiero estas opciones populares en Samaná:";
            // Obtener hoteles destacados como alternativa
            const featuredHotels = await dbService.getAccommodations({
                limit: 3,
                isFeatured: true,
                accommodationType: 'hotel'
            });

            if (featuredHotels.length > 0) {
                hotels.push(...featuredHotels);
            } else {
                return {
                    message: "Lo siento, no he podido encontrar hoteles disponibles que coincidan con tus criterios. ¿Podrías reformular tu búsqueda con otros criterios?",
                    ui: {
                        suggestedQuestions: [
                            "¿Qué hoteles hay cerca de la playa?",
                            "¿Cuáles son los hoteles más económicos?",
                            "¿Hay alojamientos tipo apartamento disponibles?"
                        ]
                    }
                };
            }
        }

        // Formato de respuesta con hoteles
        if (hotels.length === 1) {
            message += `el hotel ${hotels[0].title}. `;
            if (hotels[0].short_desc) {
                message += hotels[0].short_desc + " ";
            }
        } else {
            message += "estos hoteles: ";
            hotels.slice(0, 3).forEach((hotel, index) => {
                message += `${hotel.title}`;
                if (index < Math.min(hotels.length, 3) - 2) {
                    message += ", ";
                } else if (index === Math.min(hotels.length, 3) - 2) {
                    message += " y ";
                }
            });
            message += ". ";

            // Añadir descripción del primer hotel
            if (hotels[0].short_desc) {
                message += `${hotels[0].title} ofrece ${hotels[0].short_desc}. `;
            }
        }

        message += "¿Te gustaría obtener más información sobre alguno de estos hoteles o prefieres ver más opciones?";

        return {
            message,
            results: hotels,
            ui: {
                showResults: true,
                resultType: 'accommodation',
                updateBanner: true,
                bannerType: 'accommodation',
                bannerTitle: 'Hoteles en Samaná',
                suggestedQuestions: [
                    `¿Qué servicios ofrece ${hotels[0].title}?`,
                    "¿Hay hoteles con piscina?",
                    "¿Cuál es el mejor hotel para familias?"
                ]
            }
        };
    }

    /**
     * Obtiene recomendaciones de apartamentos
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Recomendaciones de apartamentos
     * @private
     */
    async _getApartmentRecommendations(params) {
        // Convertir preferencias a filtros para consulta a BD
        const filters = {
            limit: 5,
            accommodationType: 'apartment'
        };

        // Aplicar filtros según las preferencias
        if (params.location) {
            filters.location = params.location;
        }

        if (params.priceRange === 'low') {
            filters.maxPrice = 100;
        } else if (params.priceRange === 'high') {
            filters.minPrice = 200;
        }

        // Obtener apartamentos de la base de datos
        const apartments = await dbService.getAccommodations(filters);

        // Preparar respuesta similar a la de hoteles pero adaptada a apartamentos
        let message = "Basándome en tus preferencias, te recomiendo ";

        if (apartments.length === 0) {
            message = "Lo siento, no he encontrado apartamentos que coincidan exactamente con tus preferencias. Te sugiero estas opciones populares en Samaná:";
            // Obtener apartamentos destacados como alternativa
            const featuredApartments = await dbService.getAccommodations({
                limit: 3,
                isFeatured: true,
                accommodationType: 'apartment'
            });

            if (featuredApartments.length > 0) {
                apartments.push(...featuredApartments);
            } else {
                return {
                    message: "Lo siento, no he podido encontrar apartamentos disponibles que coincidan con tus criterios. ¿Podrías reformular tu búsqueda o considerar otros tipos de alojamiento?",
                    ui: {
                        suggestedQuestions: [
                            "¿Qué hoteles hay disponibles?",
                            "¿Hay villas o casas para alquilar?",
                            "¿Cuáles son las opciones más económicas?"
                        ]
                    }
                };
            }
        }

        // Formato de respuesta con apartamentos
        if (apartments.length === 1) {
            message += `el apartamento ${apartments[0].title}. `;
            if (apartments[0].short_desc) {
                message += apartments[0].short_desc + " ";
            }
        } else {
            message += "estos apartamentos: ";
            apartments.slice(0, 3).forEach((apartment, index) => {
                message += `${apartment.title}`;
                if (index < Math.min(apartments.length, 3) - 2) {
                    message += ", ";
                } else if (index === Math.min(apartments.length, 3) - 2) {
                    message += " y ";
                }
            });
            message += ". ";

            // Añadir descripción del primer apartamento
            if (apartments[0].short_desc) {
                message += `${apartments[0].title} ofrece ${apartments[0].short_desc}. `;
            }
        }

        message += "¿Te gustaría obtener más información sobre alguno de estos apartamentos o prefieres ver más opciones?";

        return {
            message,
            results: apartments,
            ui: {
                showResults: true,
                resultType: 'accommodation',
                updateBanner: true,
                bannerType: 'accommodation',
                bannerTitle: 'Apartamentos en Samaná',
                suggestedQuestions: [
                    `¿Cuántas habitaciones tiene ${apartments[0].title}?`,
                    "¿Hay apartamentos con vista al mar?",
                    "¿Cuál es el mejor apartamento para grupos?"
                ]
            }
        };
    }

    /**
     * Obtiene recomendaciones de villas
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Recomendaciones de villas
     * @private
     */
    async _getVillaRecommendations(params) {
        // Similar a las funciones anteriores pero para villas
        const filters = {
            limit: 5,
            accommodationType: 'villa'
        };

        // Aplicar filtros según las preferencias
        if (params.location) {
            filters.location = params.location;
        }

        if (params.priceRange === 'low') {
            filters.maxPrice = 300;
        } else if (params.priceRange === 'high') {
            filters.minPrice = 500;
        }

        // Obtener villas de la base de datos
        const villas = await dbService.getAccommodations(filters);

        // Preparar respuesta
        let message = "Basándome en tus preferencias, te recomiendo ";

        if (villas.length === 0) {
            message = "Lo siento, no he encontrado villas que coincidan exactamente con tus preferencias. Te sugiero estas opciones populares en Samaná:";
            // Obtener villas destacadas como alternativa
            const featuredVillas = await dbService.getAccommodations({
                limit: 3,
                isFeatured: true,
                accommodationType: 'villa'
            });

            if (featuredVillas.length > 0) {
                villas.push(...featuredVillas);
            } else {
                return {
                    message: "Lo siento, no he podido encontrar villas disponibles que coincidan con tus criterios. ¿Podrías reformular tu búsqueda o considerar otros tipos de alojamiento?",
                    ui: {
                        suggestedQuestions: [
                            "¿Qué apartamentos hay disponibles?",
                            "¿Cuáles son las opciones más lujosas?",
                            "¿Hay villas con piscina privada?"
                        ]
                    }
                };
            }
        }

        // Formato de respuesta con villas
        if (villas.length === 1) {
            message += `la villa ${villas[0].title}. `;
            if (villas[0].short_desc) {
                message += villas[0].short_desc + " ";
            }
        } else {
            message += "estas villas: ";
            villas.slice(0, 3).forEach((villa, index) => {
                message += `${villa.title}`;
                if (index < Math.min(villas.length, 3) - 2) {
                    message += ", ";
                } else if (index === Math.min(villas.length, 3) - 2) {
                    message += " y ";
                }
            });
            message += ". ";

            // Añadir descripción de la primera villa
            if (villas[0].short_desc) {
                message += `${villas[0].title} ofrece ${villas[0].short_desc}. `;
            }
        }

        message += "¿Te gustaría obtener más información sobre alguna de estas villas o prefieres ver más opciones?";

        return {
            message,
            results: villas,
            ui: {
                showResults: true,
                resultType: 'accommodation',
                updateBanner: true,
                bannerType: 'accommodation',
                bannerTitle: 'Villas en Samaná',
                suggestedQuestions: [
                    `¿${villas[0].title} tiene piscina privada?`,
                    "¿Hay villas cerca de la playa?",
                    "¿Cuál es la capacidad máxima de estas villas?"
                ]
            }
        };
    }

    /**
     * Obtiene detalles de un alojamiento específico
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Detalles del alojamiento
     * @private
     */
    async _getAccommodationDetails(params) {
        // En este caso, deberíamos tener un ID o nombre de alojamiento específico
        let accommodationId = null;
        let accommodationName = null;

        // Intentar extraer ID o nombre del alojamiento
        if (params.accommodationId) {
            accommodationId = params.accommodationId;
        } else if (params.userMessage) {
            // Aquí tendríamos que hacer un procesamiento más sofisticado para extraer el nombre
            // del alojamiento del mensaje del usuario. Para simplificar, asumimos que no tenemos
            // esta información en esta fase.
            accommodationName = null;
        }

        // Si no tenemos forma de identificar el alojamiento específico
        if (!accommodationId && !accommodationName) {
            return {
                message: "Para darte información detallada sobre un alojamiento específico, necesito saber cuál te interesa. ¿Podrías decirme qué alojamiento te gustaría conocer mejor? Puedo recomendarte opciones populares si lo prefieres.",
                ui: {
                    suggestedQuestions: [
                        "¿Cuáles son los mejores hoteles en Samaná?",
                        "Muéstrame apartamentos cerca de la playa",
                        "¿Hay villas con piscina privada?"
                    ]
                }
            };
        }

        // Para esta fase, simularemos que obtenemos información detallada
        // En implementación real, haríamos una consulta a la BD con el ID o nombre

        const detailInfo = {
            message: "El alojamiento que buscas cuenta con excelentes instalaciones, incluyendo habitaciones espaciosas, Wi-Fi gratuito, y una ubicación privilegiada en Samaná. Lamentablemente, no puedo darte información más específica sin conocer exactamente qué alojamiento te interesa. Si me indicas el nombre del hotel, apartamento o villa, podré proporcionarte detalles más precisos sobre sus características, servicios y ubicación.",
            ui: {
                updateBanner: true,
                bannerType: 'accommodation',
                suggestedQuestions: [
                    "¿Qué hoteles recomiendas en Samaná?",
                    "Busco un alojamiento cerca de la playa",
                    "¿Cuáles son las opciones más económicas?"
                ]
            }
        };

        return detailInfo;
    }

    /**
     * Obtiene alojamientos recomendados para familias
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Alojamientos para familias
     * @private
     */
    async _getFamilyAccommodations(params) {
        // Filtros específicos para familias
        const filters = {
            limit: 5,
            groupType: 'family'
        };

        // Aplicar otros filtros si existen
        if (params.accommodationType) {
            filters.accommodationType = params.accommodationType;
        }

        if (params.location) {
            filters.location = params.location;
        }

        // Obtener alojamientos de la base de datos
        const familyAccommodations = await dbService.getAccommodations(filters);

        // Preparar respuesta
        let message = "Para familias con niños, recomiendo especialmente ";

        if (familyAccommodations.length === 0) {
            message = "Lo siento, no he encontrado alojamientos específicos para familias según tus criterios. Te sugiero estas opciones que suelen ser adecuadas para familias:";
            // Obtener alternativas
            const alternativeAccommodations = await dbService.getAccommodations({
                limit: 3,
                isFeatured: true
            });

            if (alternativeAccommodations.length > 0) {
                familyAccommodations.push(...alternativeAccommodations);
            } else {
                return {
                    message: "Lo siento, no he podido encontrar alojamientos específicos para familias. ¿Podrías indicarme qué características son importantes para ti (como ubicación, presupuesto, etc.)?",
                    ui: {
                        suggestedQuestions: [
                            "¿Hay hoteles con actividades para niños?",
                            "¿Cuáles son los alojamientos más seguros?",
                            "¿Qué zonas son mejores para familias?"
                        ]
                    }
                };
            }
        }

        // Formato de respuesta con alojamientos
        if (familyAccommodations.length === 1) {
            message += `el alojamiento ${familyAccommodations[0].title}. `;
            if (familyAccommodations[0].short_desc) {
                message += familyAccommodations[0].short_desc + " ";
            }
            message += "Este lugar es ideal para familias porque ofrece amplias habitaciones, actividades para niños y una ubicación segura.";
        } else {
            message += "estos alojamientos: ";
            familyAccommodations.slice(0, 3).forEach((accommodation, index) => {
                message += `${accommodation.title}`;
                if (index < Math.min(familyAccommodations.length, 3) - 2) {
                    message += ", ";
                } else if (index === Math.min(familyAccommodations.length, 3) - 2) {
                    message += " y ";
                }
            });
            message += ". Estos lugares son ideales para familias porque suelen ofrecer habitaciones espaciosas, actividades para niños, y ubicaciones seguras. ";

            // Añadir descripción del primer alojamiento
            if (familyAccommodations[0].short_desc) {
                message += `En particular, ${familyAccommodations[0].title} ofrece ${familyAccommodations[0].short_desc}. `;
            }
        }

        message += "¿Te gustaría obtener más información sobre alguno de estos alojamientos para familias?";

        return {
            message,
            results: familyAccommodations,
            ui: {
                showResults: true,
                resultType: 'accommodation',
                updateBanner: true,
                bannerType: 'accommodation',
                bannerTitle: 'Alojamientos para Familias en Samaná',
                suggestedQuestions: [
                    `¿${familyAccommodations[0].title} tiene servicios para niños?`,
                    "¿Hay actividades para niños incluidas?",
                    "¿Cuál es el mejor para bebés pequeños?"
                ]
            }
        };
    }

    /**
     * Obtiene alojamientos recomendados para parejas
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Alojamientos para parejas
     * @private
     */
    async _getRomanticAccommodations(params) {
        // Filtros específicos para parejas
        const filters = {
            limit: 5,
            groupType: 'couple'
        };

        // Aplicar otros filtros si existen
        if (params.accommodationType) {
            filters.accommodationType = params.accommodationType;
        }

        if (params.location) {
            filters.location = params.location;
        }

        // Obtener alojamientos de la base de datos
        const romanticAccommodations = await dbService.getAccommodations(filters);

        // Preparar respuesta similar a la de familias pero adaptada a parejas
        let message = "Para parejas que buscan un ambiente romántico, recomiendo especialmente ";

        if (romanticAccommodations.length === 0) {
            message = "Lo siento, no he encontrado alojamientos específicos para parejas según tus criterios. Te sugiero estas opciones que suelen ser adecuadas para una escapada romántica:";
            // Obtener alternativas
            const alternativeAccommodations = await dbService.getAccommodations({
                limit: 3,
                isFeatured: true
            });

            if (alternativeAccommodations.length > 0) {
                romanticAccommodations.push(...alternativeAccommodations);
            } else {
                return {
                    message: "Lo siento, no he podido encontrar alojamientos específicos para parejas. ¿Podrías indicarme qué características son importantes para ti (como ubicación, presupuesto, etc.)?",
                    ui: {
                        suggestedQuestions: [
                            "¿Hay alojamientos con vistas al mar para parejas?",
                            "¿Cuáles son los alojamientos más románticos?",
                            "¿Hay alojamientos solo para adultos?"
                        ]
                    }
                };
            }
        }

        // Formato de respuesta con alojamientos
        if (romanticAccommodations.length === 1) {
            message += `el alojamiento ${romanticAccommodations[0].title}. `;
            if (romanticAccommodations[0].short_desc) {
                message += romanticAccommodations[0].short_desc + " ";
            }
            message += "Este lugar es ideal para parejas porque ofrece un ambiente íntimo, hermosas vistas y servicios especiales para disfrutar en pareja.";
        } else {
            message += "estos alojamientos: ";
            romanticAccommodations.slice(0, 3).forEach((accommodation, index) => {
                message += `${accommodation.title}`;
                if (index < Math.min(romanticAccommodations.length, 3) - 2) {
                    message += ", ";
                } else if (index === Math.min(romanticAccommodations.length, 3) - 2) {
                    message += " y ";
                }
            });
            message += ". Estos lugares son ideales para parejas porque suelen ofrecer ambientes íntimos, hermosas vistas y servicios especiales para disfrutar en pareja. ";

            // Añadir descripción del primer alojamiento
            if (romanticAccommodations[0].short_desc) {
                message += `En particular, ${romanticAccommodations[0].title} ofrece ${romanticAccommodations[0].short_desc}. `;
            }
        }

        message += "¿Te gustaría obtener más información sobre alguno de estos alojamientos románticos?";

        return {
            message,
            results: romanticAccommodations,
            ui: {
                showResults: true,
                resultType: 'accommodation',
                updateBanner: true,
                bannerType: 'accommodation',
                bannerTitle: 'Alojamientos Románticos en Samaná',
                suggestedQuestions: [
                    `¿${romanticAccommodations[0].title} ofrece paquetes románticos?`,
                    "¿Hay alojamientos con spa para parejas?",
                    "¿Cuál es el más exclusivo para una luna de miel?"
                ]
            }
        };
    }

    /**
     * Obtiene información general sobre alojamientos
     * @returns {Object} - Información general
     * @private
     */
    _getGeneralAccommodationInfo() {
        return {
            message: "Samaná ofrece una amplia variedad de opciones de alojamiento para todos los gustos y presupuestos. Puedes encontrar desde hoteles de lujo frente al mar hasta acogedoras villas en las montañas. La zona de Las Terrenas es popular por sus resorts todo incluido y apartamentos cerca de la playa, mientras que Santa Bárbara de Samaná ofrece hoteles con vistas a la bahía. También hay opciones más rurales cerca de El Limón, ideales para quienes buscan tranquilidad en medio de la naturaleza. Los precios varían según la temporada, siendo más altos durante el invierno (diciembre a abril) que es considerada temporada alta. ¿Qué tipo de alojamiento estás buscando o tienes alguna preferencia específica?",
            ui: {
                updateBanner: true,
                bannerType: 'accommodation',
                suggestedQuestions: [
                    "¿Cuáles son los mejores hoteles en Las Terrenas?",
                    "¿Hay opciones económicas cerca de la playa?",
                    "¿Qué alojamientos recomiendas para familias?"
                ]
            }
        };
    }
}

module.exports = new AccommodationAgent();