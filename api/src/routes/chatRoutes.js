// src/routes/chatRoutes.js
const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

/**
 * @route   POST /api/chat/message
 * @desc    Procesa un mensaje del usuario
 * @access  Public
 */
router.post('/message', chatController.processMessage.bind(chatController));

/**
 * @route   GET /api/chat/conversations
 * @desc    Obtiene el historial de conversaciones
 * @access  Public
 */
router.get('/conversations', chatController.getConversationHistory.bind(chatController));

/**
 * @route   GET /api/chat/conversations/:conversationId/messages
 * @desc    Obtiene los mensajes de una conversación
 * @access  Public
 */
router.get('/conversations/:conversationId/messages', chatController.getConversationMessages.bind(chatController));

/**
 * @route   PUT /api/chat/conversations/:conversationId/close
 * @desc    Cierra una conversación
 * @access  Public
 */
router.put('/conversations/:conversationId/close', chatController.closeConversation.bind(chatController));

module.exports = router;