// src/models/index.js
const conversation = require('./conversationv1');
const booking = require('./booking');
const content = require('./content');

/**
 * Exporta todos los modelos disponibles
 */
module.exports = {
    conversation,
    booking,
    content
};