// src/controllers/bannerController.js
const { logger, responseFormatter } = require('../utils');

/**
 * Controlador para gestionar banners dinámicos
 */
class BannerController {
    /**
     * Obtiene información de banner según el tipo
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async getBannerInfo(req, res) {
        try {
            const { type } = req.query;

            // Obtener datos del banner según el tipo
            const bannerInfo = this._getBannerData(type || 'general');

            return res.status(200).json(
                responseFormatter.success({ banner: bannerInfo })
            );
        } catch (error) {
            logger.error('Error al obtener información de banner:', error);
            return res.status(500).json(
                responseFormatter.error('Error al obtener información de banner')
            );
        }
    }

    /**
     * Obtiene una lista de banners disponibles
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    async getAvailableBanners(req, res) {
        try {
            const bannerTypes = [
                'general',
                'accommodation',
                'gastronomy',
                'activities',
                'transport',
                'information'
            ];

            // Obtener información básica de todos los tipos de banner
            const banners = bannerTypes.map(type => ({
                type,
                title: this._getDefaultBannerTitle(type),
                updatedAt: new Date().toISOString()
            }));

            return res.status(200).json(
                responseFormatter.success({ banners })
            );
        } catch (error) {
            logger.error('Error al obtener lista de banners:', error);
            return res.status(500).json(
                responseFormatter.error('Error al obtener lista de banners')
            );
        }
    }

    /**
     * Obtiene datos para mostrar en un banner
     * @param {string} type - Tipo de banner
     * @returns {Object} - Información del banner
     * @private
     */
    _getBannerData(type = 'general') {
        const bannerData = {
            general: {
                title: "Descubre Samaná",
                subtitle: "Un paraíso en República Dominicana",
                imageUrl: "/assets/images/banner_general.jpg",
                action: {
                    text: "Explorar",
                    url: "/explore"
                }
            },
            accommodation: {
                title: "Alojamientos en Samaná",
                subtitle: "Desde hoteles de lujo hasta villas privadas",
                imageUrl: "/assets/images/banner_accommodation.jpg",
                action: {
                    text: "Ver alojamientos",
                    url: "/hotels"
                }
            },
            gastronomy: {
                title: "Sabores de Samaná",
                subtitle: "Descubre la gastronomía local",
                imageUrl: "/assets/images/banner_gastronomy.jpg",
                action: {
                    text: "Ver restaurantes",
                    url: "/restaurants"
                }
            },
            activities: {
                title: "Aventuras en Samaná",
                subtitle: "Excursiones y actividades para todos",
                imageUrl: "/assets/images/banner_activities.jpg",
                action: {
                    text: "Ver actividades",
                    url: "/tours"
                }
            },
            transport: {
                title: "Transporte en Samaná",
                subtitle: "Moverse por la península",
                imageUrl: "/assets/images/banner_transport.jpg",
                action: {
                    text: "Ver opciones",
                    url: "/cars"
                }
            },
            information: {
                title: "Información sobre Samaná",
                subtitle: "Todo lo que necesitas saber",
                imageUrl: "/assets/images/banner_information.jpg",
                action: {
                    text: "Leer más",
                    url: "/blog"
                }
            }
        };

        return bannerData[type] || bannerData.general;
    }

    /**
     * Obtiene un título predeterminado para el banner
     * @param {string} type - Tipo de banner
     * @returns {string} - Título predeterminado
     * @private
     */
    _getDefaultBannerTitle(type) {
        switch (type) {
            case 'accommodation':
                return "Alojamientos en Samaná";
            case 'gastronomy':
                return "Gastronomía de Samaná";
            case 'activities':
                return "Actividades y Excursiones en Samaná";
            case 'transport':
                return "Transporte en Samaná";
            case 'information':
                return "Información sobre Samaná";
            default:
                return "Descubre Samaná";
        }
    }
}

module.exports = new BannerController();