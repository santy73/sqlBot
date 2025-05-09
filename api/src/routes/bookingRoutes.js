
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
