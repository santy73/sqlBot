// src/agents/index.js
const expertAgent = require('./expertAgent');
const queryAgent = require('./queryAgent');
const bookingAgent = require('./bookingAgent');
const validationAgent = require('./validationAgent');
const gastronomyAgent = require('./specificAgents/gastronomyAgent');
const activitiesAgent = require('./specificAgents/activitiesAgent');
const accommodationAgent = require('./specificAgents/accommodationAgent');
const transportAgent = require('./specificAgents/transportAgent');

/**
 * Módulo que exporta todos los agentes disponibles
 */
module.exports = {
    expertAgent,
    queryAgent,
    bookingAgent,
    validationAgent,
    gastronomyAgent,
    activitiesAgent,
    accommodationAgent,
    transportAgent,

    /**
     * Obtiene un agente por su nombre
     * @param {string} agentName - Nombre del agente
     * @returns {Object|null} - Instancia del agente o null si no existe
     */
    getAgentByName(agentName) {
        switch (agentName) {
            case 'ExpertAgent':
                return expertAgent;
            case 'QueryAgent':
                return queryAgent;
            case 'BookingAgent':
                return bookingAgent;
            case 'ValidationAgent':
                return validationAgent;
            case 'GastronomyAgent':
                return gastronomyAgent;
            case 'ActivitiesAgent':
                return activitiesAgent;
            case 'AccommodationAgent':
                return accommodationAgent;
            case 'TransportAgent':
                return transportAgent;
            default:
                return null;
        }
    }
};