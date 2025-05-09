// src/utils/urlBuilder.js
require('dotenv').config();

/**
 * Utilidad para construir URLs para la aplicación
 */
class URLBuilder {
    constructor() {
        this.baseURL = process.env.BASE_URL || 'https://samanainn.com';
    }

    /**
     * Construye una URL con los parámetros proporcionados
     * @param {string} path - Ruta de la URL
     * @param {Object} params - Parámetros de consulta
     * @returns {string} - URL completa
     */
    build(path, params = {}) {
        // Construir la URL base
        let url = `${this.baseURL}/${path.replace(/^\//, '')}`;

        // Agregar parámetros de consulta si existen
        const queryParams = this._formatQueryParams(params);
        if (queryParams) {
            url += `?${queryParams}`;
        }

        return url;
    }

    /**
     * Construye una URL para un alojamiento
     * @param {Object} accommodation - Datos del alojamiento
     * @param {Object} params - Parámetros adicionales
     * @returns {string} - URL de alojamiento
     */
    accommodation(accommodation, params = {}) {
        const path = `hotel/${accommodation.slug || accommodation.id}`;
        return this.build(path, params);
    }

    /**
     * Construye una URL para un restaurante
     * @param {Object} restaurant - Datos del restaurante
     * @param {Object} params - Parámetros adicionales
     * @returns {string} - URL de restaurante
     */
    restaurant(restaurant, params = {}) {
        const path = `restaurant/${restaurant.slug || restaurant.id}`;
        return this.build(path, params);
    }

    /**
     * Construye una URL para un tour/excursión
     * @param {Object} tour - Datos del tour
     * @param {Object} params - Parámetros adicionales
     * @returns {string} - URL de tour
     */
    tour(tour, params = {}) {
        const path = `tour/${tour.slug || tour.id}`;
        return this.build(path, params);
    }

    /**
     * Construye una URL para un alquiler de vehículo
     * @param {Object} car - Datos del vehículo
     * @param {Object} params - Parámetros adicionales
     * @returns {string} - URL de alquiler
     */
    car(car, params = {}) {
        const path = `car/${car.slug || car.id}`;
        return this.build(path, params);
    }

    /**
     * Construye una URL de búsqueda
     * @param {string} type - Tipo de búsqueda (hotel, restaurant, tour, car)
     * @param {Object} filters - Filtros de búsqueda
     * @returns {string} - URL de búsqueda
     */
    search(type, filters = {}) {
        return this.build(type, filters);
    }

    /**
     * Construye una URL para un artículo del blog
     * @param {Object} article - Datos del artículo
     * @returns {string} - URL del artículo
     */
    blogArticle(article) {
        const path = `blog/${article.slug || article.id}`;
        return this.build(path);
    }

    /**
     * Formatea los parámetros de consulta para la URL
     * @param {Object} params - Parámetros de consulta
     * @returns {string} - Cadena de parámetros formateada
     * @private
     */
    _formatQueryParams(params) {
        if (!params || Object.keys(params).length === 0) {
            return '';
        }

        return Object.entries(params)
            .filter(([_, value]) => value !== null && value !== undefined)
            .map(([key, value]) => {
                // Formatear fechas si es necesario
                if (value instanceof Date) {
                    value = value.toISOString().split('T')[0];
                }

                // Manejar arrays
                if (Array.isArray(value)) {
                    return value.map(v => `${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`).join('&');
                }

                return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            })
            .join('&');
    }
}

module.exports = new URLBuilder();