// src/models/booking.js
const { pool } = require('../config/database');
const { logger } = require('../utils');

/**
 * Modelo para interactuar con las tablas de reservas
 */
class BookingModel {
    /**
     * Verifica la disponibilidad de un alojamiento
     * @param {number} accommodationId - ID del alojamiento
     * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
     * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
     * @param {number} guests - Número de huéspedes
     * @returns {Promise<Object>} - Información de disponibilidad
     */
    async checkHotelAvailability(accommodationId, startDate, endDate, guests = 1) {
        try {
            // En fase 1, simulamos la verificación sin implementación real en BD

            // Aquí debería estar la consulta real a la base de datos
            // para verificar disponibilidad según las fechas y alojamiento

            // Simular una respuesta para la fase 1
            return {
                available: true,
                price: 120.00,
                totalPrice: 120.00 * (this._daysBetween(startDate, endDate) || 1),
                currency: 'USD',
                roomsAvailable: 3
            };
        } catch (error) {
            logger.error('Error al verificar disponibilidad de hotel:', error);
            throw error;
        }
    }

    /**
     * Verifica la disponibilidad de un tour
     * @param {number} tourId - ID del tour
     * @param {string} date - Fecha del tour (YYYY-MM-DD)
     * @param {number} participants - Número de participantes
     * @returns {Promise<Object>} - Información de disponibilidad
     */
    async checkTourAvailability(tourId, date, participants = 1) {
        try {
            // En fase 1, simulamos la verificación sin implementación real en BD

            // Simular una respuesta para la fase 1
            return {
                available: true,
                price: 50.00,
                totalPrice: 50.00 * participants,
                currency: 'USD',
                spotsAvailable: 10
            };
        } catch (error) {
            logger.error('Error al verificar disponibilidad de tour:', error);
            throw error;
        }
    }

    /**
     * Verifica la disponibilidad de un restaurante
     * @param {number} restaurantId - ID del restaurante
     * @param {string} date - Fecha de la reserva (YYYY-MM-DD)
     * @param {string} time - Hora de la reserva (HH:MM)
     * @param {number} guests - Número de comensales
     * @returns {Promise<Object>} - Información de disponibilidad
     */
    async checkRestaurantAvailability(restaurantId, date, time, guests = 2) {
        try {
            // En fase 1, simulamos la verificación sin implementación real en BD

            // Simular una respuesta para la fase 1
            return {
                available: true,
                possibleTimes: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30'],
                tablesAvailable: 4
            };
        } catch (error) {
            logger.error('Error al verificar disponibilidad de restaurante:', error);
            throw error;
        }
    }

    /**
     * Verifica la disponibilidad de un vehículo
     * @param {number} carId - ID del vehículo
     * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
     * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
     * @returns {Promise<Object>} - Información de disponibilidad
     */
    async checkCarAvailability(carId, startDate, endDate) {
        try {
            // En fase 1, simulamos la verificación sin implementación real en BD

            // Simular una respuesta para la fase 1
            return {
                available: true,
                price: 40.00,
                totalPrice: 40.00 * (this._daysBetween(startDate, endDate) || 1),
                currency: 'USD',
                carsAvailable: 2
            };
        } catch (error) {
            logger.error('Error al verificar disponibilidad de vehículo:', error);
            throw error;
        }
    }

    /**
     * Obtiene hoteles por filtros específicos
     * @param {Object} filters - Filtros para la búsqueda
     * @returns {Promise<Array>} - Hoteles encontrados
     */
    async getHotels(filters = {}) {
        try {
            let query = `
        SELECT h.id, h.title, h.content, h.address, h.price, h.sale_price, 
               h.star_rate, h.review_score, h.map_lat, h.map_lng, 
               h.gallery, h.video, h.policy,
               l.name as location_name
        FROM bravo_hotels h
        LEFT JOIN bravo_locations l ON h.location_id = l.id
        WHERE h.status = 'publish'
      `;

            const queryParams = [];

            // Aplicar filtros si existen
            if (filters.location) {
                query += ' AND l.name LIKE ?';
                queryParams.push(`%${filters.location}%`);
            }

            if (filters.maxPrice) {
                query += ' AND (h.price <= ? OR h.sale_price <= ?)';
                queryParams.push(filters.maxPrice, filters.maxPrice);
            }

            if (filters.minPrice) {
                query += ' AND (h.price >= ? OR (h.sale_price IS NOT NULL AND h.sale_price >= ?))';
                queryParams.push(filters.minPrice, filters.minPrice);
            }

            if (filters.rating) {
                query += ' AND h.star_rate >= ?';
                queryParams.push(filters.rating);
            }

            if (filters.isFeatured) {
                query += ' AND h.is_featured = 1';
            }

            // Ordenar resultados
            query += ' ORDER BY h.is_featured DESC, h.id DESC';

            // Limitar resultados
            if (filters.limit) {
                query += ' LIMIT ?';
                queryParams.push(parseInt(filters.limit));
            }

            const [rows] = await pool.query(query, queryParams);
            return rows;
        } catch (error) {
            logger.error('Error al obtener hoteles:', error);
            throw error;
        }
    }

    /**
     * Obtiene tours por filtros específicos
     * @param {Object} filters - Filtros para la búsqueda
     * @returns {Promise<Array>} - Tours encontrados
     */
    async getTours(filters = {}) {
        try {
            let query = `
        SELECT t.id, t.title, t.content, t.short_desc, t.address, 
               t.price, t.sale_price, t.duration, t.review_score,
               t.map_lat, t.map_lng, t.gallery, t.video, 
               t.include, t.exclude, t.itinerary,
               l.name as location_name,
               tc.name as category_name
        FROM bravo_tours t
        LEFT JOIN bravo_locations l ON t.location_id = l.id
        LEFT JOIN bravo_tour_category tc ON t.category_id = tc.id
        WHERE t.status = 'publish'
      `;

            const queryParams = [];

            // Aplicar filtros
            if (filters.location) {
                query += ' AND l.name LIKE ?';
                queryParams.push(`%${filters.location}%`);
            }

            if (filters.category) {
                query += ' AND tc.name LIKE ?';
                queryParams.push(`%${filters.category}%`);
            }

            if (filters.maxDuration) {
                query += ' AND t.duration <= ?';
                queryParams.push(filters.maxDuration);
            }

            if (filters.minDuration) {
                query += ' AND t.duration >= ?';
                queryParams.push(filters.minDuration);
            }

            if (filters.isFeatured) {
                query += ' AND t.is_featured = 1';
            }

            // Ordenar y limitar
            query += ' ORDER BY t.is_featured DESC, t.id DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                queryParams.push(parseInt(filters.limit));
            }

            const [rows] = await pool.query(query, queryParams);
            return rows;
        } catch (error) {
            logger.error('Error al obtener tours:', error);
            throw error;
        }
    }

    /**
     * Obtiene restaurantes por filtros específicos
     * @param {Object} filters - Filtros para la búsqueda
     * @returns {Promise<Array>} - Restaurantes encontrados
     */
    async getRestaurants(filters = {}) {
        try {
            let query = `
        SELECT r.id, r.title, r.content, r.address, r.price, r.sale_price, 
               r.review_score, r.map_lat, r.map_lng, r.gallery, r.video,
               l.name as location_name,
               rc.name as category_name
        FROM bravo_restaurants r
        LEFT JOIN bravo_locations l ON r.location_id = l.id
        LEFT JOIN bravo_restaurant_category rc ON r.category_id = rc.id
        WHERE r.status = 'publish'
      `;

            const queryParams = [];

            // Aplicar filtros
            if (filters.location) {
                query += ' AND l.name LIKE ?';
                queryParams.push(`%${filters.location}%`);
            }

            if (filters.category) {
                query += ' AND rc.name LIKE ?';
                queryParams.push(`%${filters.category}%`);
            }

            if (filters.maxPrice) {
                query += ' AND (r.price <= ? OR r.sale_price <= ?)';
                queryParams.push(filters.maxPrice, filters.maxPrice);
            }

            if (filters.isFeatured) {
                query += ' AND r.is_featured = 1';
            }

            // Ordenar y limitar
            query += ' ORDER BY r.is_featured DESC, r.id DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                queryParams.push(parseInt(filters.limit));
            }

            const [rows] = await pool.query(query, queryParams);
            return rows;
        } catch (error) {
            logger.error('Error al obtener restaurantes:', error);
            throw error;
        }
    }

    /**
     * Obtiene vehículos por filtros específicos
     * @param {Object} filters - Filtros para la búsqueda
     * @returns {Promise<Array>} - Vehículos encontrados
     */
    async getCars(filters = {}) {
        try {
            let query = `
        SELECT c.id, c.title, c.content, c.address, c.price, c.sale_price, 
               c.passenger, c.gear, c.baggage, c.door, c.review_score,
               c.map_lat, c.map_lng, c.gallery, c.video,
               l.name as location_name
        FROM bravo_cars c
        LEFT JOIN bravo_locations l ON c.location_id = l.id
        WHERE c.status = 'publish'
      `;

            const queryParams = [];

            // Aplicar filtros
            if (filters.location) {
                query += ' AND l.name LIKE ?';
                queryParams.push(`%${filters.location}%`);
            }

            if (filters.passengers) {
                query += ' AND c.passenger >= ?';
                queryParams.push(filters.passengers);
            }

            if (filters.maxPrice) {
                query += ' AND (c.price <= ? OR c.sale_price <= ?)';
                queryParams.push(filters.maxPrice, filters.maxPrice);
            }

            if (filters.isFeatured) {
                query += ' AND c.is_featured = 1';
            }

            // Ordenar y limitar
            query += ' ORDER BY c.is_featured DESC, c.id DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                queryParams.push(parseInt(filters.limit));
            }

            const [rows] = await pool.query(query, queryParams);
            return rows;
        } catch (error) {
            logger.error('Error al obtener vehículos:', error);
            throw error;
        }
    }

    /**
     * Calcula el número de días entre dos fechas
     * @param {string} startDate - Fecha de inicio
     * @param {string} endDate - Fecha de fin
     * @returns {number} - Número de días
     * @private
     */
    _daysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Asegurarse de que son fechas válidas
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return 0;
        }

        // Convertir a días
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }
}

module.exports = new BookingModel();