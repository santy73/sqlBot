
// src/agents/specificAgents/transportAgent.js
const dbService = require('../../services/dbService');

/**
 * Agente especializado en transporte
 * 
 * Este agente se encarga de:
 * - Proporcionar información sobre opciones de transporte en Samaná
 * - Recomendar servicios de alquiler de vehículos
 * - Informar sobre traslados entre puntos de interés
 */
class TransportAgent {
    constructor() {
        this.name = 'TransportAgent';
        this.description = 'Agente especializado en transporte y movilidad';
    }

    /**
     * Procesa consultas relacionadas con transporte
     * @param {Object} params - Parámetros de la consulta
     * @param {string} userMessage - Mensaje del usuario
     * @param {Array} history - Historial de la conversación
     * @param {Object} context - Contexto adicional
     * @returns {Promise<Object>} - Respuesta procesada
     */
    async processTransportQuery(params, userMessage, history = [], context = {}) {
        try {
            console.log(`[${this.name}] Procesando consulta de transporte`);

            // Extraer preferencias de transporte del mensaje
            const preferences = this._extractTransportPreferences(userMessage);

            // Combinar con los parámetros recibidos
            const queryParams = {
                ...params,
                ...preferences
            };

            // Determinar el tipo de consulta de transporte
            const queryType = this._determineTransportQueryType(userMessage);

            let response;

            switch (queryType) {
                case 'car_rental':
                    response = await this._getCarRentalInfo(queryParams);
                    break;

                case 'airport_transfer':
                    response = await this._getAirportTransferInfo(queryParams);
                    break;

                case 'public_transport':
                    response = await this._getPublicTransportInfo(queryParams);
                    break;

                case 'taxi_info':
                    response = await this._getTaxiInfo(queryParams);
                    break;

                default:
                    response = this._getGeneralTransportInfo();
            }

            return response;
        } catch (error) {
            console.error(`[${this.name}] Error al procesar consulta de transporte:`, error);
            return {
                message: "Lo siento, he tenido un problema al procesar tu consulta sobre transporte. ¿Puedo ayudarte con algo más?",
                error: true
            };
        }
    }

    /**
     * Extrae preferencias de transporte del mensaje
     * @param {string} message - Mensaje del usuario
     * @returns {Object} - Preferencias extraídas
     * @private
     */
    _extractTransportPreferences(message) {
        const preferences = {};
        const lowerMessage = message.toLowerCase();

        // Extraer tipo de vehículo
        if (lowerMessage.includes('coche') || lowerMessage.includes('auto') || lowerMessage.includes('car')) {
            preferences.vehicleType = 'car';
        } else if (lowerMessage.includes('moto') || lowerMessage.includes('scooter')) {
            preferences.vehicleType = 'motorcycle';
        } else if (lowerMessage.includes('quad') || lowerMessage.includes('atv') || lowerMessage.includes('buggy')) {
            preferences.vehicleType = 'atv';
        }

        // Extraer duración
        if (lowerMessage.includes('dia') || lowerMessage.includes('day')) {
            const dayMatch = message.match(/(\d+)\s*(dia|días|day|days)/i);
            if (dayMatch) {
                preferences.rentalDays = parseInt(dayMatch[1]);
            } else {
                preferences.rentalDays = 1; // Por defecto 1 día
            }
        }

        // Extraer preferencias de precio
        if (lowerMessage.includes('barato') || lowerMessage.includes('económico') || lowerMessage.includes('cheap')) {
            preferences.priceRange = 'low';
        } else if (lowerMessage.includes('lujo') || lowerMessage.includes('luxury') || lowerMessage.includes('premium')) {
            preferences.priceRange = 'high';
        }

        return preferences;
    }

    /**
     * Determina el tipo de consulta de transporte
     * @param {string} message - Mensaje del usuario
     * @returns {string} - Tipo de consulta
     * @private
     */
    _determineTransportQueryType(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('alquiler') || lowerMessage.includes('rent') ||
            lowerMessage.includes('alquilar') ||
            (lowerMessage.includes('coche') && (lowerMessage.includes('conseguir') || lowerMessage.includes('obtener')))) {
            return 'car_rental';
        }

        if (lowerMessage.includes('aeropuerto') || lowerMessage.includes('airport') ||
            lowerMessage.includes('transfer') || lowerMessage.includes('traslado')) {
            return 'airport_transfer';
        }

        if (lowerMessage.includes('público') || lowerMessage.includes('public') ||
            lowerMessage.includes('bus') || lowerMessage.includes('guagua')) {
            return 'public_transport';
        }

        if (lowerMessage.includes('taxi') || lowerMessage.includes('uber') ||
            lowerMessage.includes('transporte privado')) {
            return 'taxi_info';
        }

        return 'general';
    }

    /**
     * Obtiene información sobre alquiler de vehículos
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información sobre alquiler de vehículos
     * @private
     */
    async _getCarRentalInfo(params) {
        // Buscar opciones de alquiler disponibles
        const carRentals = await dbService.getTours({
            category: 'car_rental',
            limit: 3
        });

        const carRentalInfo = {
            message: "El alquiler de vehículos es una excelente opción para explorar Samaná con libertad. Puedes alquilar coches, motos, quads o buggies según tus preferencias. Los precios para coches suelen oscilar entre 40-80 USD por día dependiendo del modelo, mientras que las motos y quads son más económicos (25-50 USD/día). Se recomienda reservar con antelación, especialmente en temporada alta. La mayoría de compañías requieren una licencia de conducir válida y un depósito. Las carreteras en Samaná son generalmente buenas en las vías principales, pero pueden ser más accidentadas en zonas rurales. Un coche es ideal para visitar múltiples playas y atracciones, mientras que los quads son populares para rutas de aventura. ¿Te interesa algún tipo de vehículo en particular?",
            results: carRentals,
            ui: {
                showResults: carRentals && carRentals.length > 0,
                resultType: 'transport',
                updateBanner: true,
                bannerType: 'transport',
                bannerTitle: 'Alquiler de Vehículos en Samaná',
                suggestedQuestions: [
                    "¿Dónde puedo alquilar un coche en Samaná?",
                    "¿Cuánto cuesta alquilar un quad por día?",
                    "¿Necesito un permiso especial para conducir en República Dominicana?"
                ]
            }
        };

        return carRentalInfo;
    }

    /**
     * Obtiene información sobre traslados desde/hacia el aeropuerto
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información sobre traslados
     * @private
     */
    async _getAirportTransferInfo(params) {
        // Buscar servicios de traslado disponibles
        const transferServices = await dbService.getTours({
            category: 'transfer',
            limit: 3
        });

        const transferInfo = {
            message: "Para llegar a Samaná desde los aeropuertos cercanos, tienes varias opciones. El aeropuerto más cercano es El Catey (AZS), a unos 30-45 minutos en coche de Las Terrenas. Sin embargo, muchos visitantes llegan a través del Aeropuerto Internacional de Santo Domingo (SDQ) o de Puerto Plata (POP), que están a unas 2-3 horas por carretera. Puedes contratar un servicio de traslado privado, que cuesta aproximadamente 80-150 USD dependiendo del aeropuerto de origen y tu destino final en Samaná. También hay taxis disponibles pero suelen ser más caros. Otra opción es el autobús público (guagua) desde Santo Domingo, que es más económico pero toma más tiempo y solo llega a puntos principales. La opción más cómoda es reservar un traslado con anticipación para que te estén esperando a tu llegada.",
            results: transferServices,
            ui: {
                showResults: transferServices && transferServices.length > 0,
                resultType: 'transport',
                updateBanner: true,
                bannerType: 'transport',
                bannerTitle: 'Traslados a Samaná',
                suggestedQuestions: [
                    "¿Cuánto cuesta un traslado desde Santo Domingo?",
                    "¿Hay transportes compartidos disponibles?",
                    "¿Cuál es la mejor manera de llegar desde Puerto Plata?"
                ]
            }
        };

        return transferInfo;
    }

    /**
     * Obtiene información sobre transporte público
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información sobre transporte público
     * @private
     */
    async _getPublicTransportInfo(params) {
        const publicTransportInfo = {
            message: "El transporte público en Samaná consiste principalmente en 'guaguas' (minibuses locales) y 'motoconchos' (mototaxis). Las guaguas conectan los principales pueblos como Santa Bárbara de Samaná, Las Terrenas, Las Galeras y El Limón. Son económicas (1-3 USD por trayecto) pero no siguen horarios estrictos; salen cuando están llenas. Los motoconchos son abundantes y convenientes para distancias cortas dentro de los pueblos, con precios negociables (generalmente 1-2 USD por trayecto dentro del mismo pueblo). También hay 'carros públicos' (taxis compartidos) que siguen rutas fijas entre pueblos. El transporte público es económico pero puede ser incómodo y lento. Si planeas visitar múltiples lugares o tienes un itinerario ajustado, considera alquilar un vehículo o contratar un taxista para el día.",
            ui: {
                updateBanner: true,
                bannerType: 'transport',
                bannerTitle: 'Transporte Público en Samaná',
                suggestedQuestions: [
                    "¿Dónde puedo tomar las guaguas en Las Terrenas?",
                    "¿Es seguro usar los motoconchos?",
                    "¿Hay alguna aplicación para pedir taxis en Samaná?"
                ]
            }
        };

        return publicTransportInfo;
    }

    /**
     * Obtiene información sobre taxis y servicios similares
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información sobre taxis
     * @private
     */
    async _getTaxiInfo(params) {
        const taxiInfo = {
            message: "Los taxis en Samaná no suelen usar taxímetro, por lo que es recomendable acordar el precio antes de iniciar el viaje. Dentro de los pueblos, un trayecto corto puede costar 5-10 USD, mientras que los viajes entre diferentes localidades (como de Las Terrenas a Playa Rincón) pueden costar 30-50 USD. Algunas alternativas son los 'motoconchos' (mototaxis) para distancias cortas, o contratar un taxista para todo el día (aproximadamente 80-120 USD), lo que puede ser conveniente si planeas visitar varios lugares. Aplicaciones como Uber no están disponibles en Samaná, pero muchos hoteles y restaurantes tienen taxistas de confianza a quienes pueden llamar. También puedes guardar el número de un taxista que te guste para futuros traslados. En general, los taxis son seguros pero asegúrate de usar servicios recomendados por tu alojamiento.",
            ui: {
                updateBanner: true,
                bannerType: 'transport',
                bannerTitle: 'Taxis en Samaná',
                suggestedQuestions: [
                    "¿Cuánto cuesta un taxi de Las Terrenas a El Limón?",
                    "¿Cómo puedo encontrar un taxi confiable?",
                    "¿Es mejor contratar un taxista para todo el día?"
                ]
            }
        };

        return taxiInfo;
    }

    /**
     * Obtiene información general sobre transporte
     * @returns {Object} - Información general
     * @private
     */
    _getGeneralTransportInfo() {
        return {
            message: "Para moverte por Samaná tienes varias opciones según tu presupuesto y preferencias. El alquiler de vehículos (coches, motos o quads) ofrece mayor libertad para explorar la península a tu ritmo. El transporte público incluye 'guaguas' (minibuses) que conectan los principales pueblos y son económicas pero con horarios variables. Los 'motoconchos' (mototaxis) son perfectos para trayectos cortos dentro de los pueblos. Los taxis son convenientes pero más caros y se recomienda acordar el precio antes. Para llegar a Samaná desde los aeropuertos, puedes contratar servicios de traslado privados o utilizar autobuses públicos desde Santo Domingo. La península tiene carreteras bien mantenidas en las rutas principales, pero pueden ser más rústicas en zonas remotas. ¿Hay alguna opción de transporte específica sobre la que te gustaría más información?",
            ui: {
                updateBanner: true,
                bannerType: 'transport',
                suggestedQuestions: [
                    "¿Dónde puedo alquilar un coche?",
                    "¿Cómo llego desde el aeropuerto de Santo Domingo?",
                    "¿Es fácil moverse entre las diferentes playas?"
                ]
            }
        };
    }
}