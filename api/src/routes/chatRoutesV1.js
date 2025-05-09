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
