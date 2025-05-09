// src/middleware/auth.js
const { logger } = require('../utils');

/**
 * Middleware para autenticar peticiones a la API usando API Key
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const apiAuth = (req, res, next) => {
    // Obtener API key del header o query param
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    // Verificar si se proporcionó una API key
    if (!apiKey) {
        logger.warn('Intento de acceso sin API key');
        return res.status(401).json({
            success: false,
            message: 'API key requerida'
        });
    }

    // Verificar si la API key es válida (comparar con la almacenada en variables de entorno)
    const validApiKey = process.env.API_SECRET_KEY;

    if (apiKey !== validApiKey) {
        logger.warn('Intento de acceso con API key inválida', {
            providedKey: apiKey.substring(0, 4) + '***'
        });

        return res.status(403).json({
            success: false,
            message: 'API key inválida'
        });
    }

    // Si la autenticación es exitosa, continuar
    next();
};

module.exports = {
    apiAuth
};