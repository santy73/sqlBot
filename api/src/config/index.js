// src/config/index.js
const database = require('./database');
const aiConfig = require('./ai');

module.exports = {
    database,
    ai: aiConfig
};