
// src/agents/specificAgents/activitiesAgent.js
const dbService = require('../../services/dbService');

/**
 * Agente especializado en actividades y excursiones
 * 
 * Este agente se encarga de:
 * - Recomendar actividades y excursiones según preferencias
 * - Proporcionar información detallada sobre atracciones
 * - Conocer temporadas y mejores momentos para visitas
 */
class ActivitiesAgent {
    constructor() {
        this.name = 'ActivitiesAgent';
        this.description = 'Agente especializado en actividades y excursiones';
    }

    /**
     * Procesa consultas relacionadas con actividades
     * @param {Object} params - Parámetros de la consulta
     * @param {string} userMessage - Mensaje del usuario
     * @param {Array} history - Historial de la conversación
     * @param {Object} context - Contexto adicional
     * @returns {Promise<Object>} - Respuesta procesada
     */
    async processActivitiesQuery(params, userMessage, history = [], context = {}) {
        try {
            console.log(`[${this.name}] Procesando consulta de actividades`);

            // Extraer preferencias de actividades del mensaje
            const preferences = this._extractActivityPreferences(userMessage);

            // Combinar con los parámetros recibidos
            const queryParams = {
                ...params,
                ...preferences
            };

            // Determinar el tipo de consulta de actividades
            const queryType = this._determineActivityQueryType(userMessage);

            let response;

            switch (queryType) {
                case 'whale_watching':
                    response = await this._getWhaleWatchingInfo(queryParams);
                    break;

                case 'beaches':
                    response = await this._getBeachesInfo(queryParams);
                    break;

                case 'hiking':
                    response = await this._getHikingInfo(queryParams);
                    break;

                case 'el_limon':
                    response = await this._getElLimonInfo(queryParams);
                    break;

                case 'los_haitises':
                    response = await this._getLosHaitisesInfo(queryParams);
                    break;

                case 'tour_recommendation':
                    response = await this._getTourRecommendations(queryParams);
                    break;

                default:
                    response = this._getGeneralActivitiesInfo();
            }

            return response;
        } catch (error) {
            console.error(`[${this.name}] Error al procesar consulta de actividades:`, error);
            return {
                message: "Lo siento, he tenido un problema al procesar tu consulta sobre actividades. ¿Puedo ayudarte con algo más?",
                error: true
            };
        }
    }

    /**
     * Extrae preferencias de actividades del mensaje
     * @param {string} message - Mensaje del usuario
     * @returns {Object} - Preferencias extraídas
     * @private
     */
    _extractActivityPreferences(message) {
        const preferences = {};
        const lowerMessage = message.toLowerCase();

        // Extraer tipo de actividad
        if (lowerMessage.includes('ballena') || lowerMessage.includes('whale')) {
            preferences.activityType = 'whale_watching';
        } else if (lowerMessage.includes('playa') || lowerMessage.includes('beach')) {
            preferences.activityType = 'beach';
        } else if (lowerMessage.includes('senderismo') || lowerMessage.includes('hiking') || lowerMessage.includes('caminata')) {
            preferences.activityType = 'hiking';
        } else if (lowerMessage.includes('limon') || lowerMessage.includes('cascada') || lowerMessage.includes('waterfall')) {
            preferences.activityType = 'el_limon';
        } else if (lowerMessage.includes('haitises') || lowerMessage.includes('parque nacional')) {
            preferences.activityType = 'los_haitises';
        }

        // Extraer duración preferida
        if (lowerMessage.includes('dia completo') || lowerMessage.includes('full day')) {
            preferences.duration = 'full_day';
        } else if (lowerMessage.includes('medio dia') || lowerMessage.includes('half day')) {
            preferences.duration = 'half_day';
        }

        // Extraer preferencias de tipo de grupo
        if (lowerMessage.includes('familia') || lowerMessage.includes('niños') || lowerMessage.includes('family')) {
            preferences.groupType = 'family';
        } else if (lowerMessage.includes('pareja') || lowerMessage.includes('romantico') || lowerMessage.includes('couple')) {
            preferences.groupType = 'couple';
        } else if (lowerMessage.includes('aventura') || lowerMessage.includes('adventure')) {
            preferences.groupType = 'adventure';
        }

        return preferences;
    }

    /**
     * Determina el tipo de consulta de actividades
     * @param {string} message - Mensaje del usuario
     * @returns {string} - Tipo de consulta
     * @private
     */
    _determineActivityQueryType(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('ballena') || lowerMessage.includes('whale')) {
            return 'whale_watching';
        }

        if (lowerMessage.includes('playa') || lowerMessage.includes('beach')) {
            return 'beaches';
        }

        if (lowerMessage.includes('senderismo') || lowerMessage.includes('hiking') || lowerMessage.includes('caminata')) {
            return 'hiking';
        }

        if (lowerMessage.includes('limon') ||
            (lowerMessage.includes('cascada') || lowerMessage.includes('waterfall')) &&
            lowerMessage.includes('limon')) {
            return 'el_limon';
        }

        if (lowerMessage.includes('haitises') ||
            (lowerMessage.includes('parque') || lowerMessage.includes('park')) &&
            lowerMessage.includes('haitises')) {
            return 'los_haitises';
        }

        if (lowerMessage.includes('tour') ||
            lowerMessage.includes('excursion') ||
            lowerMessage.includes('actividad') ||
            lowerMessage.includes('recomend')) {
            return 'tour_recommendation';
        }

        return 'general';
    }

    /**
     * Obtiene información sobre avistamiento de ballenas
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información sobre avistamiento de ballenas
     * @private
     */
    async _getWhaleWatchingInfo(params) {
        // En una implementación real, consultaríamos la base de datos o una API externa
        // para obtener información actualizada sobre temporada de ballenas

        // Verificar si estamos en temporada de ballenas (enero a marzo)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() devuelve 0-11
        const isWhaleSeasonNow = currentMonth >= 1 && currentMonth <= 3;

        // Construir respuesta
        let message = "El avistamiento de ballenas jorobadas es una de las actividades más populares en Samaná. Cada año, entre enero y marzo, miles de ballenas jorobadas migran a la Bahía de Samaná para aparearse y dar a luz. Los tours salen generalmente del puerto de Samaná y duran aproximadamente 3-4 horas. Es recomendable llevar protector solar, ropa ligera y cámara fotográfica. ";

        if (isWhaleSeasonNow) {
            message += "¡Estamos en plena temporada de ballenas! Es un momento perfecto para hacer esta excursión.";
        } else {
            message += `Actualmente no estamos en temporada de ballenas. La próxima temporada será de enero a marzo ${currentDate.getFullYear() + 1}.`;
        }

        // Buscar tours relacionados con ballenas
        const whaleTours = await dbService.getTours({
            category: 'whale',
            limit: 3
        });

        return {
            message,
            results: whaleTours,
            ui: {
                showResults: whaleTours && whaleTours.length > 0,
                resultType: 'tour',
                updateBanner: true,
                bannerType: 'activities',
                bannerTitle: 'Avistamiento de Ballenas en Samaná',
                suggestedQuestions: [
                    "¿Cuánto cuesta un tour de avistamiento de ballenas?",
                    "¿Es seguro para niños?",
                    "¿Qué otras actividades puedo hacer en Samaná?"
                ]
            }
        };
    }

    /**
     * Obtiene información sobre playas
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información sobre playas
     * @private
     */
    async _getBeachesInfo(params) {
        // Información estática sobre playas principales
        const beachesInfo = {
            message: "Samaná está rodeada de algunas de las playas más hermosas del Caribe. Playa Rincón es considerada una de las más bellas del mundo, con arena blanca y aguas cristalinas, ideal para relajarse y nadar. Playa Las Galeras es perfecta para quienes buscan un ambiente más tranquilo y auténtico. Playa Bonita ofrece buenas condiciones para deportes acuáticos. Playa Cosón es extensa y menos concurrida, ideal para largas caminatas. La mayoría de estas playas cuentan con pequeños restaurantes donde puedes disfrutar de pescado fresco y bebidas. ¿Te gustaría conocer más sobre alguna playa específica o cómo llegar a ellas?",
            ui: {
                updateBanner: true,
                bannerType: 'activities',
                bannerTitle: 'Playas de Samaná',
                suggestedQuestions: [
                    "¿Cómo llego a Playa Rincón?",
                    "¿Cuál es la mejor playa para niños?",
                    "¿Hay tours que incluyan visitas a las playas?"
                ]
            }
        };

        return beachesInfo;
    }

    /**
     * Obtiene información sobre rutas de senderismo
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información sobre senderismo
     * @private
     */
    async _getHikingInfo(params) {
        // Información estática sobre rutas de senderismo
        const hikingInfo = {
            message: "Samaná ofrece varias opciones para los amantes del senderismo. Las rutas más populares incluyen el sendero hacia la Cascada El Limón, que atraviesa exuberante vegetación tropical, el Sendero del Café en la zona montañosa donde puedes ver cómo se cultiva el café, y las rutas dentro del Parque Nacional Los Haitises, donde puedes explorar cuevas con petroglifos taínos. La mayoría de estas rutas requieren un guía local, que puede ser contratado a través de operadores turísticos o directamente en las comunidades cercanas. La mejor época para hacer senderismo es de noviembre a mayo, cuando hay menos lluvias. ¿Estás interesado en alguna ruta en particular?",
            ui: {
                updateBanner: true,
                bannerType: 'activities',
                bannerTitle: 'Senderismo en Samaná',
                suggestedQuestions: [
                    "¿Cuál es la dificultad de estas rutas?",
                    "¿Qué debo llevar para hacer senderismo?",
                    "¿Hay tours guiados disponibles?"
                ]
            }
        };

        return hikingInfo;
    }

    /**
     * Obtiene información sobre la Cascada El Limón
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información sobre El Limón
     * @private
     */
    async _getElLimonInfo(params) {
        // Buscar tours disponibles para El Limón
        const elLimonTours = await dbService.getTours({
            category: 'el_limon',
            limit: 3
        });

        const elLimonInfo = {
            message: "La Cascada El Limón es una de las atracciones naturales más impresionantes de Samaná. Con una caída de agua de aproximadamente 40 metros de altura, se encuentra en medio de un exuberante bosque tropical. Para llegar a la cascada, puedes realizar una excursión a caballo o a pie desde el pueblo de El Limón. El sendero toma aproximadamente 30-45 minutos y atraviesa hermosos paisajes rurales. Una vez en la cascada, podrás nadar en las refrescantes aguas de la piscina natural que se forma en su base. Se recomienda llevar calzado cómodo para caminar, traje de baño, toalla y repelente de insectos. La mejor hora para visitar es por la mañana, cuando hay menos visitantes.",
            results: elLimonTours,
            ui: {
                showResults: elLimonTours && elLimonTours.length > 0,
                resultType: 'tour',
                updateBanner: true,
                bannerType: 'activities',
                bannerTitle: 'Cascada El Limón',
                suggestedQuestions: [
                    "¿Cuánto cuesta la excursión a El Limón?",
                    "¿Es mejor ir a caballo o caminando?",
                    "¿Es adecuado para niños?"
                ]
            }
        };

        return elLimonInfo;
    }

    /**
     * Obtiene información sobre el Parque Nacional Los Haitises
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información sobre Los Haitises
     * @private
     */
    async _getLosHaitisesInfo(params) {
        // Buscar tours disponibles para Los Haitises
        const haitisesTours = await dbService.getTours({
            category: 'los_haitises',
            limit: 3
        });

        const haitisesInfo = {
            message: "El Parque Nacional Los Haitises es uno de los tesoros naturales de República Dominicana. Este parque protegido abarca más de 1,600 km² de manglares, bahías, cavernas con arte rupestre indígena y formaciones kársticas que emergen del agua creando un paisaje único. La mejor manera de explorarlo es mediante un tour en bote que sale desde Samaná o Sabana de la Mar. Durante el recorrido, podrás observar aves como el pelícano pardo y el águila pescadora, explorar cuevas con petroglifos taínos, y admirar la exuberante vegetación. Los tours generalmente incluyen guía, transporte en bote y refrigerios. Se recomienda llevar protector solar, repelente de insectos, cámara fotográfica y ropa ligera.",
            results: haitisesTours,
            ui: {
                showResults: haitisesTours && haitisesTours.length > 0,
                resultType: 'tour',
                updateBanner: true,
                bannerType: 'activities',
                bannerTitle: 'Parque Nacional Los Haitises',
                suggestedQuestions: [
                    "¿Cuánto tiempo dura el tour a Los Haitises?",
                    "¿Qué tipo de vida silvestre puedo ver?",
                    "¿Es adecuado para toda la familia?"
                ]
            }
        };

        return haitisesInfo;
    }

    /**
     * Obtiene recomendaciones de tours según preferencias
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Recomendaciones de tours
     * @private
     */
    async _getTourRecommendations(params) {
        // Convertir preferencias a filtros para consulta a BD
        const filters = {
            limit: 5
        };

        if (params.activityType) {
            filters.category = params.activityType;
        }

        if (params.duration === 'half_day') {
            filters.maxDuration = 4;
        } else if (params.duration === 'full_day') {
            filters.minDuration = 5;
        }

        // Obtener tours de la base de datos
        const tours = await dbService.getTours(filters);

        // Preparar respuesta
        let message = "Basándome en tus preferencias, te recomiendo ";

        if (tours.length === 0) {
            message = "Lo siento, no he encontrado tours que coincidan exactamente con tus preferencias. Te sugiero estas opciones populares en Samaná:";
            // Obtener tours destacados como alternativa
            const featuredTours = await dbService.getTours({ limit: 3, isFeatured: true });

            if (featuredTours.length > 0) {
                tours.push(...featuredTours);
            } else {
                return {
                    message: "Lo siento, no he podido encontrar tours disponibles que coincidan con tus criterios. ¿Podrías reformular tu búsqueda con otros criterios?",
                    ui: {
                        suggestedQuestions: [
                            "¿Qué actividades hay en Samaná?",
                            "¿Hay excursiones para ver ballenas?",
                            "¿Cómo puedo visitar Los Haitises?"
                        ]
                    }
                };
            }
        }

        // Formato de respuesta con tours
        if (tours.length === 1) {
            message += `el tour "${tours[0].title}". `;
            if (tours[0].short_desc) {
                message += tours[0].short_desc + " ";
            }
        } else {
            message += "estos tours: ";
            tours.slice(0, 3).forEach((tour, index) => {
                message += `"${tour.title}"`;
                if (index < Math.min(tours.length, 3) - 2) {
                    message += ", ";
                } else if (index === Math.min(tours.length, 3) - 2) {
                    message += " y ";
                }
            });
            message += ". ";

            // Añadir descripción del primer tour
            if (tours[0].short_desc) {
                message += `${tours[0].title} ${tours[0].short_desc}. `;
            }
        }

        message += "¿Te gustaría obtener más información sobre alguno de estos tours o prefieres ver más opciones?";

        return {
            message,
            results: tours,
            ui: {
                showResults: true,
                resultType: 'tour',
                updateBanner: true,
                bannerType: 'activities',
                bannerTitle: 'Tours y Excursiones en Samaná',
                suggestedQuestions: [
                    `¿Qué incluye el tour "${tours[0].title}"?`,
                    "¿Hay tours de medio día disponibles?",
                    "¿Cuál es la mejor excursión para familias con niños?"
                ]
            }
        };
    }

    /**
     * Obtiene información general sobre actividades
     * @returns {Object} - Información general
     * @private
     */
    _getGeneralActivitiesInfo() {
        return {
            message: "Samaná ofrece una amplia variedad de actividades para todos los gustos. Entre las más populares están el avistamiento de ballenas jorobadas (de enero a marzo), visitar la impresionante Cascada El Limón, explorar el Parque Nacional Los Haitises con sus cuevas y manglares, relajarse en playas paradisíacas como Playa Rincón, y disfrutar de deportes acuáticos como snorkel, buceo y paddle boarding. También puedes hacer excursiones a caballo, recorridos en quad o buggies, y tours culturales para conocer la vida local. ¿Hay alguna actividad específica que te interese o prefieres recomendaciones según tu tipo de viaje?",
            ui: {
                updateBanner: true,
                bannerType: 'activities',
                suggestedQuestions: [
                    "¿Qué actividades recomiendas para familias?",
                    "¿Cuáles son las mejores playas?",
                    "¿Puedo hacer avistamiento de ballenas ahora?"
                ]
            }
        };
    }
}

module.exports = new ActivitiesAgent();