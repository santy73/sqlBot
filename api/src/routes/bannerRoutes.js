
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