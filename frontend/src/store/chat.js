// src/store/chat.js
import chatService from '@/services/chatService';
import { v4 as uuidv4 } from 'uuid';

export default {
    namespaced: true,
    state: {
        sessionId: null,
        conversationId: null,
        messages: [],
        isTyping: false,
        suggestions: [],
        currentBanner: null,
        error: null
    },
    mutations: {
        SET_SESSION_ID(state, id) {
            state.sessionId = id;
        },
        SET_CONVERSATION_ID(state, id) {
            state.conversationId = id;
        },
        ADD_MESSAGE(state, message) {
            state.messages.push(message);
        },
        SET_MESSAGES(state, messages) {
            state.messages = messages;
        },
        SET_TYPING(state, isTyping) {
            state.isTyping = isTyping;
        },
        SET_SUGGESTIONS(state, suggestions) {
            state.suggestions = suggestions;
        },
        SET_CURRENT_BANNER(state, banner) {
            state.currentBanner = banner;
        },
        SET_ERROR(state, error) {
            state.error = error;
        }
    },
    actions: {
        initSession({ commit, state }) {
            // Usar sessionId existente o crear uno nuevo
            const sessionId = state.sessionId || localStorage.getItem('chatSessionId') || uuidv4();
            commit('SET_SESSION_ID', sessionId);
            localStorage.setItem('chatSessionId', sessionId);
            return sessionId;
        },

        async initConversation({ commit, dispatch }) {
            try {
                const sessionId = await dispatch('initSession');
                const response = await chatService.initConversation(sessionId);
                commit('SET_CONVERSATION_ID', response.data.conversationId);

                // Agregar mensaje de bienvenida
                commit('ADD_MESSAGE', {
                    id: uuidv4(),
                    role: 'assistant',
                    content: response.data.welcomeMessage || '¡Hola! Soy el asistente virtual de SamanaInn. ¿En qué puedo ayudarte hoy?',
                    timestamp: new Date().toISOString()
                });

                return response.data;
            } catch (error) {
                commit('SET_ERROR', error.message || 'Error al iniciar conversación');
                throw error;
            }
        },

        async sendMessage({ commit, state }, message) {
            if (!message.trim()) return;

            // Agregar mensaje del usuario
            const userMessageId = uuidv4();
            commit('ADD_MESSAGE', {
                id: userMessageId,
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            });

            // Indicar que el asistente está escribiendo
            commit('SET_TYPING', true);

            try {
                const response = await chatService.sendMessage(
                    state.conversationId,
                    message,
                    { sessionId: state.sessionId }
                );

                // Agregar respuesta del asistente
                commit('ADD_MESSAGE', {
                    id: response.data.messageId,
                    role: 'assistant',
                    content: response.data.message,
                    timestamp: new Date().toISOString()
                });

                // Actualizar sugerencias y banner si existen
                if (response.data.suggestions) {
                    commit('SET_SUGGESTIONS', response.data.suggestions);
                }

                if (response.data.banner) {
                    commit('SET_CURRENT_BANNER', response.data.banner);
                }

                return response.data;
            } catch (error) {
                commit('SET_ERROR', error.message || 'Error al enviar mensaje');

                // Agregar mensaje de error del sistema
                commit('ADD_MESSAGE', {
                    id: uuidv4(),
                    role: 'assistant',
                    content: 'Lo siento, tuve un problema procesando tu solicitud. ¿Podrías intentarlo de nuevo?',
                    isError: true,
                    timestamp: new Date().toISOString()
                });

                throw error;
            } finally {
                commit('SET_TYPING', false);
            }
        },

        async loadConversationHistory({ commit, state }) {
            if (!state.conversationId) return;

            try {
                const response = await chatService.getConversationHistory(state.conversationId);
                commit('SET_MESSAGES', response.data.messages);
                return response.data;
            } catch (error) {
                commit('SET_ERROR', error.message || 'Error al cargar historial');
                throw error;
            }
        },

        async provideFeedback({ commit }, { messageId, helpful, feedback }) {
            try {
                await chatService.provideFeedback(messageId, helpful, feedback);
            } catch (error) {
                commit('SET_ERROR', error.message || 'Error al enviar feedback');
                throw error;
            }
        },

        async endConversation({ commit, state }) {
            if (!state.conversationId) return;

            try {
                await chatService.endConversation(state.conversationId);
                commit('SET_CONVERSATION_ID', null);
            } catch (error) {
                commit('SET_ERROR', error.message || 'Error al finalizar conversación');
                throw error;
            }
        },

        clearMessages({ commit }) {
            commit('SET_MESSAGES', []);
        }
    },
    getters: {
        hasActiveConversation: state => !!state.conversationId,
        messageHistory: state => state.messages,
        isTyping: state => state.isTyping,
        currentSuggestions: state => state.suggestions,
        currentBanner: state => state.currentBanner,
        lastUserMessage: state => {
            const userMessages = state.messages.filter(m => m.role === 'user');
            return userMessages.length ? userMessages[userMessages.length - 1] : null;
        },
        lastAssistantMessage: state => {
            const assistantMessages = state.messages.filter(m => m.role === 'assistant');
            return assistantMessages.length ? assistantMessages[assistantMessages.length - 1] : null;
        }
    }
};