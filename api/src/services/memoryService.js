// src/services/memoryService.js
const { conversation: conversationModel } = require('../models');
const { logger } = require('../utils');

/**
 * Servicio para gestionar la memoria contextual entre conversaciones
 */
class MemoryService {
    /**
     * Recupera la memoria para un usuario específico
     * @param {string} userId - ID del usuario
     * @param {string} sessionId - ID de sesión (para usuarios no autenticados)
     * @returns {Promise<Object>} - Memoria del usuario
     */
    async getUserMemory(userId, sessionId) {
        try {
            // Intentar recuperar desde usuario autenticado primero
            if (userId) {
                const memory = await this._getUserMemoryById(userId);
                if (memory) return memory;
            }

            // Si no hay usuario autenticado o no tiene memoria, intentar con sessionId
            if (sessionId) {
                return await this._getSessionMemory(sessionId);
            }

            // Si no hay ni userId ni sessionId, devolver memoria vacía
            return this._getEmptyMemory();
        } catch (error) {
            logger.error('Error al recuperar memoria del usuario:', error);
            return this._getEmptyMemory();
        }
    }

    /**
     * Actualiza la memoria de un usuario con nueva información
     * @param {Object} memory - Objeto de memoria actual
     * @param {Object} context - Contexto de la conversación actual
     * @param {string} userId - ID del usuario (opcional)
     * @param {string} sessionId - ID de sesión (opcional)
     * @returns {Promise<Object>} - Memoria actualizada
     */
    async updateMemory(memory, context, userId, sessionId) {
        try {
            if (!memory) memory = this._getEmptyMemory();

            // Actualizar la memoria con el nuevo contexto
            const updatedMemory = this._mergeMemoryWithContext(memory, context);

            // Guardar la memoria actualizada
            if (userId) {
                await this._saveUserMemory(userId, updatedMemory);
            } else if (sessionId) {
                await this._saveSessionMemory(sessionId, updatedMemory);
            }

            return updatedMemory;
        } catch (error) {
            logger.error('Error al actualizar memoria:', error);
            return memory || this._getEmptyMemory();
        }
    }

    /**
     * Combina la memoria existente con nuevo contexto
     * @param {Object} memory - Memoria existente
     * @param {Object} context - Nuevo contexto
     * @returns {Object} - Memoria combinada
     * @private
     */
    _mergeMemoryWithContext(memory, context) {
        if (!context) return memory;

        const updatedMemory = { ...memory };

        // Actualizar preferencias del usuario
        if (context.userPreferences) {
            updatedMemory.userPreferences = {
                ...(updatedMemory.userPreferences || {}),
                ...context.userPreferences
            };
        }

        // Actualizar conversaciones recientes
        if (context.intent && context.intent.type) {
            const topic = context.intent.type;
            updatedMemory.recentTopics = updatedMemory.recentTopics || [];

            // Añadir a la lista de temas recientes si no está ya
            if (!updatedMemory.recentTopics.includes(topic)) {
                updatedMemory.recentTopics.unshift(topic);
                // Mantener solo los 5 temas más recientes
                updatedMemory.recentTopics = updatedMemory.recentTopics.slice(0, 5);
            }
        }

        // Actualizar búsquedas recientes
        if (context.lastSearch) {
            updatedMemory.searches = updatedMemory.searches || {};

            // Guardar la última búsqueda según tipo
            if (context.lastSearch.type) {
                updatedMemory.searches[context.lastSearch.type] = {
                    timestamp: new Date().toISOString(),
                    params: context.lastSearch.params || {},
                    resultCount: context.lastSearch.resultCount || 0
                };
            }
        }

        // Actualizar selecciones del usuario
        if (context.selectedItem) {
            updatedMemory.selections = updatedMemory.selections || [];
            updatedMemory.selections.unshift({
                type: context.selectedItem.type,
                id: context.selectedItem.id,
                name: context.selectedItem.name,
                timestamp: new Date().toISOString()
            });

            // Mantener solo las 10 selecciones más recientes
            updatedMemory.selections = updatedMemory.selections.slice(0, 10);
        }

        // Actualizar última actividad
        updatedMemory.lastActivity = new Date().toISOString();

        return updatedMemory;
    }

    /**
     * Recupera memoria de un usuario autenticado
     * @param {string} userId - ID del usuario
     * @returns {Promise<Object|null>} - Memoria del usuario o null
     * @private
     */
    async _getUserMemoryById(userId) {
        try {
            // En una implementación completa, esto consultaría la base de datos
            // por ahora, implementamos una solución básica

            // Buscar conversaciones recientes del usuario
            const userConversations = await conversationModel.getByUserId(userId, 10);

            if (!userConversations || userConversations.length === 0) {
                return null;
            }

            // Combinar contextos de conversaciones para crear memoria
            const memory = this._getEmptyMemory();

            for (const conversation of userConversations) {
                if (conversation.context) {
                    // Extraer y combinar información relevante del contexto
                    this._mergeMemoryWithContext(memory, conversation.context);
                }
            }

            return memory;
        } catch (error) {
            logger.error('Error al recuperar memoria de usuario por ID:', error);
            return null;
        }
    }

    /**
     * Recupera memoria asociada a una sesión
     * @param {string} sessionId - ID de sesión
     * @returns {Promise<Object|null>} - Memoria de la sesión o null
     * @private
     */
    async _getSessionMemory(sessionId) {
        try {
            // Buscar conversaciones recientes de la sesión
            const sessionConversations = await conversationModel.getBySessionId(sessionId, 5);

            if (!sessionConversations || sessionConversations.length === 0) {
                return this._getEmptyMemory();
            }

            // Combinar contextos de conversaciones para crear memoria
            const memory = this._getEmptyMemory();

            for (const conversation of sessionConversations) {
                if (conversation.context) {
                    // Extraer y combinar información relevante del contexto
                    this._mergeMemoryWithContext(memory, conversation.context);
                }
            }

            return memory;
        } catch (error) {
            logger.error('Error al recuperar memoria de sesión:', error);
            return this._getEmptyMemory();
        }
    }

    /**
     * Guarda la memoria para un usuario autenticado
     * @param {string} userId - ID del usuario
     * @param {Object} memory - Memoria a guardar
     * @returns {Promise<boolean>} - Éxito o fracaso
     * @private
     */
    async _saveUserMemory(userId, memory) {
        try {
            // En una implementación completa, esto guardaría en la base de datos
            // En esta fase, simulamos el éxito de la operación

            // Consideraciones para implementación real:
            // 1. Crear tabla específica para memoria de usuario
            // 2. Actualizar registro existente o crear uno nuevo
            // 3. Gestionar versiones o historial de cambios

            logger.debug(`Simulando guardado de memoria para usuario ${userId}`);
            return true;
        } catch (error) {
            logger.error('Error al guardar memoria de usuario:', error);
            return false;
        }
    }

    /**
     * Guarda la memoria para una sesión
     * @param {string} sessionId - ID de sesión
     * @param {Object} memory - Memoria a guardar
     * @returns {Promise<boolean>} - Éxito o fracaso
     * @private
     */
    async _saveSessionMemory(sessionId, memory) {
        try {
            // En una implementación completa, esto guardaría en la base de datos
            // En esta fase, simulamos el éxito de la operación

            logger.debug(`Simulando guardado de memoria para sesión ${sessionId}`);
            return true;
        } catch (error) {
            logger.error('Error al guardar memoria de sesión:', error);
            return false;
        }
    }

    /**
     * Obtiene estructura de memoria vacía
     * @returns {Object} - Objeto de memoria vacío inicializado
     * @private
     */
    _getEmptyMemory() {
        return {
            userPreferences: {},
            recentTopics: [],
            searches: {},
            selections: [],
            lastActivity: new Date().toISOString(),
            created: new Date().toISOString()
        };
    }

    /**
     * Genera recomendaciones basadas en la memoria del usuario
     * @param {Object} memory - Memoria del usuario
     * @param {string} currentContext - Contexto actual 
     * @returns {Object} - Recomendaciones personalizadas
     */
    generateRecommendations(memory, currentContext) {
        try {
            if (!memory) return null;

            const recommendations = {
                topics: [],
                items: []
            };

            // Recomendar temas basados en historiales previos
            if (memory.recentTopics && memory.recentTopics.length > 0) {
                // Filtrar tema actual si está en la lista
                const filteredTopics = memory.recentTopics.filter(
                    topic => topic !== currentContext
                );

                // Añadir hasta 3 temas recientes como recomendaciones
                recommendations.topics = filteredTopics.slice(0, 3);
            }

            // Recomendar elementos basados en selecciones previas
            if (memory.selections && memory.selections.length > 0) {
                // Agrupar selecciones por tipo
                const selectionsByType = {};
                memory.selections.forEach(selection => {
                    if (!selectionsByType[selection.type]) {
                        selectionsByType[selection.type] = [];
                    }

                    // Evitar duplicados
                    if (!selectionsByType[selection.type].some(item => item.id === selection.id)) {
                        selectionsByType[selection.type].push(selection);
                    }
                });

                // Añadir las selecciones más recientes como recomendaciones
                Object.keys(selectionsByType).forEach(type => {
                    const typeItems = selectionsByType[type].slice(0, 2);
                    recommendations.items.push(...typeItems);
                });
            }

            return recommendations;
        } catch (error) {
            logger.error('Error al generar recomendaciones:', error);
            return null;
        }
    }

    /**
     * Detecta posibles preferencias basadas en patrones de conversación
     * @param {string} conversationId - ID de la conversación
     * @returns {Promise<Object>} - Preferencias detectadas
     */
    async detectPreferences(conversationId) {
        try {
            // Obtener mensajes de la conversación
            const messages = await conversationModel.getHistory(conversationId);

            if (!messages || messages.length < 3) {
                return null; // No hay suficientes mensajes para análisis
            }

            const preferences = {
                topics: new Set(),
                interests: new Set(),
                budget: null,
                groupType: null,
                location: null
            };

            // Analizar mensajes del usuario
            const userMessages = messages.filter(msg => msg.from === 'user');

            // Patrones para detectar preferencias (implementación básica)
            const budgetPatterns = [
                { pattern: /(económico|barato|asequible|low cost|bajo presupuesto)/i, value: 'low' },
                { pattern: /(moderado|medio|standard|regular)/i, value: 'medium' },
                { pattern: /(lujo|premium|exclusivo|alto|caro)/i, value: 'high' }
            ];

            const groupPatterns = [
                { pattern: /(familia|niños|hijos|familiar)/i, value: 'family' },
                { pattern: /(pareja|romántico|aniversario|luna de miel)/i, value: 'couple' },
                { pattern: /(amigos|grupo|varios|compañeros)/i, value: 'group' },
                { pattern: /(solo|individual|por mi cuenta)/i, value: 'solo' }
            ];

            const interestPatterns = [
                { pattern: /(playa|mar|arena|costa|nadar)/i, value: 'beach' },
                { pattern: /(naturaleza|paisaje|parque|bosque|flora|fauna)/i, value: 'nature' },
                { pattern: /(aventura|deportes|activo|adrenalina)/i, value: 'adventure' },
                { pattern: /(cultura|historia|museo|arquitectura)/i, value: 'culture' },
                { pattern: /(gastronomía|comida|comer|restaurante|cocina)/i, value: 'gastronomy' },
                { pattern: /(relajación|descanso|tranquilidad|paz|spa)/i, value: 'relaxation' }
            ];

            const locationPatterns = [
                { pattern: /(Las Terrenas)/i, value: 'Las Terrenas' },
                { pattern: /(Santa Bárbara|Santa Barbara)/i, value: 'Santa Barbara' },
                { pattern: /(Las Galeras)/i, value: 'Las Galeras' },
                { pattern: /(El Limón|El Limon)/i, value: 'El Limon' },
                { pattern: /(Cayo Levantado|Bacardi)/i, value: 'Cayo Levantado' }
            ];

            // Analizar cada mensaje
            userMessages.forEach(message => {
                const text = message.content.toLowerCase();

                // Detectar presupuesto
                budgetPatterns.forEach(pattern => {
                    if (pattern.pattern.test(text)) {
                        preferences.budget = pattern.value;
                    }
                });

                // Detectar tipo de grupo
                groupPatterns.forEach(pattern => {
                    if (pattern.pattern.test(text)) {
                        preferences.groupType = pattern.value;
                    }
                });

                // Detectar intereses
                interestPatterns.forEach(pattern => {
                    if (pattern.pattern.test(text)) {
                        preferences.interests.add(pattern.value);
                    }
                });

                // Detectar ubicación
                locationPatterns.forEach(pattern => {
                    if (pattern.pattern.test(text)) {
                        preferences.location = pattern.value;
                    }
                });

                // Detectar temas generales
                if (/(hotel|alojamiento|hospedaje|habitación)/i.test(text)) {
                    preferences.topics.add('accommodation');
                }
                if (/(restaurante|comida|cena|almuerzo|desayuno)/i.test(text)) {
                    preferences.topics.add('gastronomy');
                }
                if (/(actividad|excursión|tour|visita|aventura)/i.test(text)) {
                    preferences.topics.add('activities');
                }
                if (/(transporte|coche|carro|llegar|aeropuerto)/i.test(text)) {
                    preferences.topics.add('transport');
                }
            });

            // Convertir Sets a Arrays para la respuesta
            return {
                topics: Array.from(preferences.topics),
                interests: Array.from(preferences.interests),
                budget: preferences.budget,
                groupType: preferences.groupType,
                location: preferences.location
            };
        } catch (error) {
            logger.error('Error al detectar preferencias:', error);
            return null;
        }
    }
}

module.exports = new MemoryService();