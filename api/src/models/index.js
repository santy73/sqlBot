// src/models/index.js
const conversation = require('./conversation');
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