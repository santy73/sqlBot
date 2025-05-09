// src/routes/chatRoutes.js
const express = require('express');
const chatController = require('../controllers/chatController');

router = express.Router();

/**
 * @route   POST /api/chat/message
 * @desc    Procesa un mensaje del usuario
 * @access  Public
 */
router.post('/message', chatController.processMessage.bind(chatController));

module.exports = router;

// src/routes/bookingRoutes.js
const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

/**
 * @route   POST /api/booking/generate-url
 * @desc    Genera una URL para redirección a página de reserva
 * @access  Public
 */
router.post('/generate-url', chatController.generateBookingURL.bind(chatController));

module.exports = router;

// src/routes/bannerRoutes.js
const express = require('express');
const chatController = require('../controllers/chatController');

//const router = express.Router();

/**
 * @route   GET /api/banner/info
 * @desc    Obtiene información sobre banners para mostrar
 * @access  Public
 */
router.get('/info', chatController.getBannerInfo.bind(chatController));

module.exports = router;