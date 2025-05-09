// src/models/content.js
const { pool } = require('../config/database');
const { logger } = require('../utils');

/**
 * Modelo para gestionar contenido del blog y descripciones
 */
class ContentModel {
    /**
     * Busca contenido en el blog según palabras clave
     * @param {string} keyword - Palabra clave para buscar
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Array>} - Resultados de la búsqueda
     */
    async searchBlogContent(keyword, limit = 10) {
        try {
            const query = `
        SELECT id, title, content, slug, created_at
        FROM core_news
        WHERE status = 'publish' 
        AND (title LIKE ? OR content LIKE ?)
        ORDER BY created_at DESC
        LIMIT ?
      `;

            const searchTerm = `%${keyword}%`;
            const [rows] = await pool.query(query, [searchTerm, searchTerm, limit]);

            return rows;
        } catch (error) {
            logger.error('Error al buscar en el blog:', error);
            throw error;
        }
    }

    /**
     * Obtiene un artículo del blog por su ID o slug
     * @param {string|number} identifier - ID o slug del artículo
     * @returns {Promise<Object|null>} - Artículo encontrado o null
     */
    async getBlogArticle(identifier) {
        try {
            let query;
            let params;

            // Determinar si el identificador es un ID o un slug
            if (Number.isInteger(Number(identifier))) {
                query = `
          SELECT id, title, content, slug, created_at, author_id, image_id, cat_id
          FROM core_news
          WHERE id = ? AND status = 'publish'
        `;
                params = [identifier];
            } else {
                query = `
          SELECT id, title, content, slug, created_at, author_id, image_id, cat_id
          FROM core_news
          WHERE slug = ? AND status = 'publish'
        `;
                params = [identifier];
            }

            const [rows] = await pool.query(query, params);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            logger.error('Error al obtener artículo del blog:', error);
            throw error;
        }
    }

    /**
     * Obtiene artículos del blog por categoría
     * @param {number} categoryId - ID de la categoría
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Array>} - Artículos encontrados
     */
    async getBlogByCategory(categoryId, limit = 10) {
        try {
            const query = `
        SELECT id, title, content, slug, created_at, author_id, image_id
        FROM core_news
        WHERE cat_id = ? AND status = 'publish'
        ORDER BY created_at DESC
        LIMIT ?
      `;

            const [rows] = await pool.query(query, [categoryId, limit]);

            return rows;
        } catch (error) {
            logger.error('Error al obtener artículos por categoría:', error);
            throw error;
        }
    }

    /**
     * Obtiene las categorías del blog
     * @returns {Promise<Array>} - Categorías del blog
     */
    async getBlogCategories() {
        try {
            const query = `
        SELECT id, name, content, slug
        FROM core_news_category
        WHERE status = 'publish'
        ORDER BY name
      `;

            const [rows] = await pool.query(query);

            return rows;
        } catch (error) {
            logger.error('Error al obtener categorías del blog:', error);
            throw error;
        }
    }

    /**
     * Obtiene artículos destacados del blog
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Array>} - Artículos destacados
     */
    async getFeaturedBlogArticles(limit = 5) {
        try {
            // Esta consulta dependerá de cómo se marcan los artículos destacados
            // en la base de datos existente. Aquí una implementación basada en
            // la suposición de que hay un campo "is_featured" o algo similar.
            const query = `
        SELECT id, title, content, slug, created_at, author_id, image_id
        FROM core_news
        WHERE status = 'publish'
        ORDER BY created_at DESC
        LIMIT ?
      `;

            const [rows] = await pool.query(query, [limit]);

            return rows;
        } catch (error) {
            logger.error('Error al obtener artículos destacados:', error);
            throw error;
        }
    }

    /**
     * Obtiene información sobre un lugar/destino
     * @param {string} name - Nombre del lugar
     * @returns {Promise<Object|null>} - Información del lugar
     */
    async getLocationInfo(name) {
        try {
            const query = `
        SELECT l.id, l.name, l.content, l.map_lat, l.map_lng,
               l.trip_ideas, l.gallery
        FROM bravo_locations l
        WHERE l.status = 'publish' 
        AND l.name LIKE ?
      `;

            const [rows] = await pool.query(query, [`%${name}%`]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            logger.error('Error al obtener información de ubicación:', error);
            throw error;
        }
    }
}

module.exports = new ContentModel();