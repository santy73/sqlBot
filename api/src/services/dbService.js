// src/services/dbService.js
const { pool } = require('../config/database');

/**
 * Servicio para interactuar con la base de datos MySQL
 */
class DbService {
    /**
     * Obtiene alojamientos según criterios de búsqueda
     * @param {Object} filters - Filtros de búsqueda
     * @returns {Promise<Array>} - Lista de alojamientos
     */
    async getAccommodations(filters = {}) {
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
            console.error('Error al obtener alojamientos:', error);
            throw error;
        }
    }

    /**
     * Obtiene restaurantes según criterios de búsqueda
     * @param {Object} filters - Filtros de búsqueda
     * @returns {Promise<Array>} - Lista de restaurantes
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

            // Ordenar y limitar
            query += ' ORDER BY r.is_featured DESC, r.id DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                queryParams.push(parseInt(filters.limit));
            }

            const [rows] = await pool.query(query, queryParams);
            return rows;
        } catch (error) {
            console.error('Error al obtener restaurantes:', error);
            throw error;
        }
    }

    /**
     * Obtiene tours/excursiones según criterios
     * @param {Object} filters - Filtros de búsqueda
     * @returns {Promise<Array>} - Lista de tours
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

            if (filters.duration) {
                query += ' AND t.duration <= ?';
                queryParams.push(filters.duration);
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
            console.error('Error al obtener tours:', error);
            throw error;
        }
    }

    /**
     * Busca en el blog por contenido relevante
     * @param {string} keyword - Palabra clave para buscar
     * @returns {Promise<Array>} - Artículos del blog
     */
    async searchBlogContent(keyword) {
        try {
            const query = `
        SELECT id, title, content, slug, created_at
        FROM core_news
        WHERE status = 'publish' 
        AND (title LIKE ? OR content LIKE ?)
        ORDER BY created_at DESC
        LIMIT 10
      `;

            const searchTerm = `%${keyword}%`;
            const [rows] = await pool.query(query, [searchTerm, searchTerm]);
            return rows;
        } catch (error) {
            console.error('Error al buscar en el blog:', error);
            throw error;
        }
    }

    /**
     * Obtiene información de ubicaciones/destinos
     * @param {string} locationName - Nombre de la ubicación
     * @returns {Promise<Object>} - Datos de la ubicación
     */
    async getLocationInfo(locationName) {
        try {
            const query = `
        SELECT l.id, l.name, l.content, l.map_lat, l.map_lng,
               l.trip_ideas, l.gallery
        FROM bravo_locations l
        WHERE l.status = 'publish' 
        AND l.name LIKE ?
      `;

            const [rows] = await pool.query(query, [`%${locationName}%`]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error al obtener información de ubicación:', error);
            throw error;
        }
    }

    /**
     * Guarda una conversación en la base de datos
     * @param {Object} conversation - Datos de la conversación
     * @returns {Promise<number>} - ID de la conversación
     */
    async saveConversation(conversation) {
        // Esta función se implementará cuando creemos la tabla de conversaciones
        // Por ahora, devolvemos un ID mock
        return Promise.resolve(Date.now());
    }
}

module.exports = new DbService();