// src/controllers/bookingController.js
const { booking: bookingModel } = require('../models');
const bookingAgent = require('../agents/bookingAgent');
const { logger, responseFormatter } = require('../utils');

/**
 * Controlador para gestionar operaciones relacionadas con reservas
 */
class BookingController {
    /**
     * Genera una URL para redireccionar a la página de reserva
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async generateBookingURL(req, res) {
        try {
            const params = req.body;

            if (!params || !params.type) {
                return res.status(400).json(
                    responseFormatter.error('El tipo de reserva es requerido')
                );
            }

            // Generar URL de reserva
            const bookingURL = await bookingAgent.generateBookingURL(params);

            return res.status(200).json(
                responseFormatter.generatedURL(bookingURL, params.type)
            );
        } catch (error) {
            logger.error('Error al generar URL de reserva:', error);
            return res.status(500).json(
                responseFormatter.error('Error al generar URL de reserva')
            );
        }
    }

    /**
     * Verifica la disponibilidad de una opción de reserva
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async checkAvailability(req, res) {
        try {
            const { type, id, startDate, endDate, guests } = req.body;

            if (!type || !id || !startDate) {
                return res.status(400).json(
                    responseFormatter.error('Faltan parámetros requeridos: tipo, id y fecha inicial')
                );
            }

            let availability;

            // Verificar disponibilidad según el tipo
            switch (type) {
                case 'accommodation':
                    availability = await bookingModel.checkHotelAvailability(
                        id,
                        startDate,
                        endDate || startDate,
                        guests || 1
                    );
                    break;

                case 'restaurant':
                    const time = req.body.time || '19:00';
                    availability = await bookingModel.checkRestaurantAvailability(
                        id,
                        startDate,
                        time,
                        guests || 2
                    );
                    break;

                case 'tour':
                    availability = await bookingModel.checkTourAvailability(
                        id,
                        startDate,
                        guests || 1
                    );
                    break;

                case 'car':
                    availability = await bookingModel.checkCarAvailability(
                        id,
                        startDate,
                        endDate || startDate
                    );
                    break;

                default:
                    return res.status(400).json(
                        responseFormatter.error('Tipo de reserva no válido')
                    );
            }

            return res.status(200).json(
                responseFormatter.success({
                    availability,
                    type,
                    id,
                    startDate,
                    endDate: endDate || startDate
                })
            );
        } catch (error) {
            logger.error('Error al verificar disponibilidad:', error);
            return res.status(500).json(
                responseFormatter.error('Error al verificar disponibilidad')
            );
        }
    }

    /**
     * Obtiene opciones de reserva según criterios
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async getBookingOptions(req, res) {
        try {
            const { type, ...filters } = req.query;

            if (!type) {
                return res.status(400).json(
                    responseFormatter.error('El tipo de servicio es requerido')
                );
            }

            let results;

            // Obtener opciones según el tipo
            switch (type) {
                case 'accommodation':
                    results = await bookingModel.getHotels(filters);
                    break;

                case 'restaurant':
                    results = await bookingModel.getRestaurants(filters);
                    break;

                case 'tour':
                    results = await bookingModel.getTours(filters);
                    break;

                case 'car':
                    results = await bookingModel.getCars(filters);
                    break;

                default:
                    return res.status(400).json(
                        responseFormatter.error('Tipo de servicio no válido')
                    );
            }

            return res.status(200).json(
                responseFormatter.searchResults(results, {
                    type,
                    filters,
                    count: results.length
                })
            );
        } catch (error) {
            logger.error('Error al obtener opciones de reserva:', error);
            return res.status(500).json(
                responseFormatter.error('Error al obtener opciones de reserva')
            );
        }
    }
}

module.exports = new BookingController();