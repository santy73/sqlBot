// src/agents/bookingAgent.js
const dbService = require('../services/dbService');

/**
 * Agente de Booking
 * 
 * Este agente se encarga de:
 * - Manejar consultas específicas sobre reservas
 * - Generar URLs para redireccionar a páginas de reserva
 * - Sugerir servicios adicionales relacionados con una reserva
 */
class BookingAgent {
    constructor() {
        this.name = 'BookingAgent';
        this.description = 'Agente especializado en gestionar la información de reservas';
    }

    /**
     * Procesa consultas relacionadas con reservas
     * @param {Object} params - Parámetros de la consulta
     * @param {string} userMessage - Mensaje del usuario
     * @param {Array} history - Historial de la conversación
     * @param {Object} context - Contexto adicional
     * @returns {Promise<Object>} - Respuesta procesada
     */
    async processBookingQuery(params, userMessage, history = [], context = {}) {
        try {
            console.log(`[${this.name}] Procesando consulta de reserva con parámetros:`, params);

            // Determinar el tipo de consulta de reserva
            const queryType = this._determineBookingQueryType(userMessage, params);

            let response;

            switch (queryType) {
                case 'availability':
                    response = await this._checkAvailability(params);
                    break;

                case 'details':
                    response = await this._getBookingDetails(params);
                    break;

                case 'recommendations':
                    response = await this._getRelatedRecommendations(params);
                    break;

                case 'pricing':
                    response = await this._getPricingInformation(params);
                    break;

                default:
                    response = this._getGeneralBookingInfo(params);
            }

            return response;
        } catch (error) {
            console.error(`[${this.name}] Error al procesar consulta de reserva:`, error);
            return {
                message: "Lo siento, he tenido un problema al procesar la información de reserva. ¿Podrías intentarlo de nuevo?",
                error: true
            };
        }
    }

    /**
     * Genera una URL para redireccionar a la página de reserva
     * @param {Object} params - Parámetros para la URL
     * @returns {Promise<string>} - URL generada
     */
    async generateBookingURL(params) {
        try {
            const baseURL = 'https://samanainn.com';
            let url = '';

            switch (params.type) {
                case 'accommodation':
                    url = `${baseURL}/hotel/${params.slug || ''}`;
                    break;

                case 'restaurant':
                    url = `${baseURL}/restaurant/${params.slug || ''}`;
                    break;

                case 'tour':
                    url = `${baseURL}/tour/${params.slug || ''}`;
                    break;

                case 'car':
                    url = `${baseURL}/car/${params.slug || ''}`;
                    break;

                default:
                    url = baseURL;
            }

            // Añadir parámetros de búsqueda si existen
            const queryParams = [];

            if (params.checkIn) {
                queryParams.push(`check_in=${encodeURIComponent(params.checkIn)}`);
            }

            if (params.checkOut) {
                queryParams.push(`check_out=${encodeURIComponent(params.checkOut)}`);
            }

            if (params.adults) {
                queryParams.push(`adults=${params.adults}`);
            }

            if (params.children) {
                queryParams.push(`children=${params.children}`);
            }

            if (queryParams.length > 0) {
                url += '?' + queryParams.join('&');
            }

            return url;
        } catch (error) {
            console.error(`[${this.name}] Error al generar URL de reserva:`, error);
            return 'https://samanainn.com';
        }
    }

    /**
     * Determina el tipo de consulta de reserva
     * @param {string} message - Mensaje del usuario
     * @param {Object} params - Parámetros de la consulta
     * @returns {string} - Tipo de consulta
     * @private
     */
    _determineBookingQueryType(message, params) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('disponible') ||
            lowerMessage.includes('disponibilidad') ||
            lowerMessage.includes('fechas')) {
            return 'availability';
        }

        if (lowerMessage.includes('detalle') ||
            lowerMessage.includes('información') ||
            lowerMessage.includes('descrip')) {
            return 'details';
        }

        if (lowerMessage.includes('recomienda') ||
            lowerMessage.includes('similar') ||
            lowerMessage.includes('alternativa')) {
            return 'recommendations';
        }

        if (lowerMessage.includes('precio') ||
            lowerMessage.includes('tarifa') ||
            lowerMessage.includes('costo') ||
            lowerMessage.includes('cuánto')) {
            return 'pricing';
        }

        return 'general';
    }

    /**
     * Verifica la disponibilidad para una reserva
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información de disponibilidad
     * @private
     */
    async _checkAvailability(params) {
        // En una implementación real, consultaríamos la base de datos para verificar disponibilidad
        // Para esta fase, simulamos la respuesta

        // Generamos una URL para la página de reserva
        const bookingURL = await this.generateBookingURL(params);

        return {
            message: "Para verificar la disponibilidad exacta y precios actualizados, te recomiendo visitar directamente la página de reservas. Ahí podrás ver todas las opciones disponibles para las fechas que te interesan y completar tu reserva en caso de que encuentres algo que se ajuste a tus necesidades.",
            bookingURL,
            ui: {
                showBookingButton: true,
                bookingButtonText: 'Ver disponibilidad',
                bookingButtonURL: bookingURL
            }
        };
    }

    /**
     * Obtiene detalles de una opción de reserva
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Detalles de la opción
     * @private
     */
    async _getBookingDetails(params) {
        // En una implementación real, consultaríamos la base de datos para obtener detalles
        // Para esta fase, simulamos la respuesta

        let detailMessage = "Lo siento, no tengo información detallada sobre esa opción específica. ";

        // Si tenemos un ID o slug, podríamos buscar información más específica
        if (params.id || params.slug) {
            detailMessage = "Para ver todos los detalles completos, fotos, servicios incluidos y opiniones de otros viajeros, te recomiendo visitar la página completa del alojamiento. Ahí encontrarás toda la información que necesitas para tomar una decisión.";
        } else {
            detailMessage += "Te recomiendo especificar qué opción te interesa para poder darte información más precisa.";
        }

        // Generamos una URL para la página de detalles
        const detailURL = await this.generateBookingURL(params);

        return {
            message: detailMessage,
            detailURL,
            ui: {
                showDetailButton: true,
                detailButtonText: 'Ver detalles completos',
                detailButtonURL: detailURL
            }
        };
    }

    /**
     * Obtiene recomendaciones relacionadas
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Recomendaciones relacionadas
     * @private
     */
    async _getRelatedRecommendations(params) {
        // En una implementación real, consultaríamos la base de datos para obtener recomendaciones
        // Para esta fase, simulamos la respuesta

        // Aquí simularíamos una consulta de recomendaciones según el tipo
        const recommendations = [];

        if (params.type === 'accommodation') {
            recommendations.push({
                title: "Hotel Las Ballenas",
                description: "Hotel boutique con vistas al mar",
                slug: "hotel-las-ballenas"
            });
            recommendations.push({
                title: "Villa Las Palmeras",
                description: "Villa privada con piscina",
                slug: "villa-las-palmeras"
            });
        } else if (params.type === 'restaurant') {
            recommendations.push({
                title: "El Pescador",
                description: "Especialidad en mariscos frescos",
                slug: "el-pescador"
            });
            recommendations.push({
                title: "Cafe del Mar",
                description: "Cocina internacional con vistas",
                slug: "cafe-del-mar"
            });
        } else if (params.type === 'tour') {
            recommendations.push({
                title: "Excursión a Los Haitises",
                description: "Aventura en parque nacional",
                slug: "excursion-los-haitises"
            });
            recommendations.push({
                title: "Tour de ballenas jorobadas",
                description: "Avistamiento de ballenas en temporada",
                slug: "tour-ballenas-jorobadas"
            });
        }

        let message = "Lo siento, no tengo recomendaciones similares disponibles en este momento.";

        if (recommendations.length > 0) {
            message = `Basándome en tu interés, te puedo recomendar estas opciones similares: ${recommendations.map(r => r.title).join(", ")}. ¿Te gustaría más información sobre alguna de ellas?`;
        }

        return {
            message,
            recommendations,
            ui: {
                showRecommendations: recommendations.length > 0,
                recommendationsType: params.type || 'general'
            }
        };
    }

    /**
     * Obtiene información de precios
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información de precios
     * @private
     */
    async _getPricingInformation(params) {
        // En una implementación real, consultaríamos la base de datos para obtener precios actualizados
        // Para esta fase, simulamos la respuesta

        // Generamos una URL para la página de reserva
        const pricingURL = await this.generateBookingURL(params);

        return {
            message: "Los precios pueden variar según la temporada, disponibilidad y promociones actuales. Para ver los precios exactos y actualizados para las fechas que te interesan, te recomiendo visitar la página de reservas donde encontrarás toda la información detallada.",
            pricingURL,
            ui: {
                showPricingButton: true,
                pricingButtonText: 'Ver precios actualizados',
                pricingButtonURL: pricingURL
            }
        };
    }

    /**
     * Obtiene información general sobre reservas
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise<Object>} - Información general
     * @private
     */
    _getGeneralBookingInfo(params) {
        // Proporcionar información general sobre reservas
        let message = "Para realizar una reserva en SamanaInn, necesitas seleccionar el tipo de servicio (alojamiento, restaurante, excursión, etc.), las fechas deseadas y el número de personas. Una vez en la página de reserva, podrás ver la disponibilidad, precios y completar tu reserva de forma segura con diferentes métodos de pago.";

        if (params.type) {
            switch (params.type) {
                case 'accommodation':
                    message = "Para reservar alojamiento en Samaná, te recomendamos hacerlo con antelación, especialmente en temporada alta (diciembre a abril). Puedes encontrar desde hoteles de lujo hasta apartamentos y villas privadas. ¿Te gustaría ver opciones específicas?";
                    break;

                case 'restaurant':
                    message = "Para reservar en restaurantes de Samaná, especialmente los más populares, te recomendamos hacerlo con 1-2 días de antelación. Muchos restaurantes ofrecen menús especiales y vistas al mar. ¿Buscas algún tipo de cocina en particular?";
                    break;

                case 'tour':
                    message = "Las excursiones en Samaná suelen requerir reserva previa, especialmente en temporada alta. Ofrecemos tours a Los Haitises, Salto El Limón, avistamiento de ballenas (en temporada) y muchas más actividades. ¿Hay alguna que te interese especialmente?";
                    break;
            }
        }

        return {
            message,
            ui: {
                suggestedQuestions: [
                    "¿Cuál es la mejor época para visitar Samaná?",
                    "¿Qué necesito para hacer una reserva?",
                    "¿Tienen ofertas especiales disponibles?"
                ]
            }
        };
    }
}

module.exports = new BookingAgent();