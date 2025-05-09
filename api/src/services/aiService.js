// src/services/aiService.js
const { default: axios } = require('axios');
const { logger } = require('../utils');
const { ai: aiConfig } = require('../config');
require('dotenv').config();

/**
 * Servicio para integración con modelos de lenguaje avanzados en producción
 */
class AIService {
    constructor() {
        this.provider = process.env.AI_PROVIDER || 'openai';
        this.apiKey = this.provider === 'openai'
            ? process.env.OPENAI_API_KEY || process.env.AI_API_KEY
            : process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY;

        if (!this.apiKey) {
            throw new Error(`API Key no configurada para el proveedor: ${this.provider}`);
        }

        logger.info(`Servicio de IA inicializado con proveedor: ${this.provider}`);
    }

    /**
     * Procesa un mensaje a través del modelo de lenguaje
     * @param {string} userMessage - Mensaje del usuario
     * @param {Array} conversationHistory - Historial de la conversación
     * @param {Object} context - Contexto adicional
     * @returns {Promise<Object>} - Respuesta procesada
     */
    async processMessage(userMessage, conversationHistory = [], context = {}) {
        try {
            logger.debug('Procesando mensaje con IA', {
                provider: this.provider,
                historyLength: conversationHistory.length,
                contextKeys: Object.keys(context)
            });

            // Obtener el tipo de consulta del contexto o inferirlo
            const queryType = this._getQueryType(context, userMessage);

            // Preparar el prompt con las instrucciones específicas para el tipo de consulta
            const promptData = this._preparePrompt(userMessage, conversationHistory, context, queryType);

            // Realizar la llamada al API
            const response = await this._callModelAPI(promptData);

            // Extraer y estructurar la respuesta
            const parsedResponse = await this._parseModelResponse(response, context, queryType);

            // Actualizar el contexto con información de la respuesta
            const updatedContext = this._updateContext(context, parsedResponse, queryType);

            return {
                ...parsedResponse,
                context: updatedContext
            };
        } catch (error) {
            logger.error('Error en procesamiento de IA:', error);
            throw error;
        }
    }

    /**
     * Determina el tipo de consulta basado en contexto y mensaje
     * @param {Object} context - Contexto de la conversación
     * @param {string} message - Mensaje del usuario
     * @returns {string} - Tipo de consulta
     * @private
     */
    _getQueryType(context, message) {
        // Si ya hay un tipo en el contexto, lo usamos
        if (context.intent && context.intent.type) {
            return context.intent.type;
        }

        // Si no, intentamos inferirlo del mensaje
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('hotel') ||
            lowerMessage.includes('alojamiento') ||
            lowerMessage.includes('habitación') ||
            lowerMessage.includes('hospedaje') ||
            lowerMessage.includes('apartamento') ||
            lowerMessage.includes('villa')) {
            return 'accommodation';
        }

        if (lowerMessage.includes('restaurante') ||
            lowerMessage.includes('comer') ||
            lowerMessage.includes('comida') ||
            lowerMessage.includes('gastronomía')) {
            return 'gastronomy';
        }

        if (lowerMessage.includes('actividad') ||
            lowerMessage.includes('excursión') ||
            lowerMessage.includes('tour') ||
            lowerMessage.includes('visitar')) {
            return 'activities';
        }

        if (lowerMessage.includes('transporte') ||
            lowerMessage.includes('coche') ||
            lowerMessage.includes('carro') ||
            lowerMessage.includes('llegar')) {
            return 'transport';
        }

        // Por defecto, usamos el tipo general
        return 'default';
    }

    /**
     * Prepara el prompt para el modelo de IA
     * @param {string} userMessage - Mensaje del usuario
     * @param {Array} history - Historial de la conversación
     * @param {Object} context - Contexto adicional
     * @param {string} queryType - Tipo de consulta
     * @returns {Object} - Datos del prompt formateados para el API
     * @private
     */
    _preparePrompt(userMessage, history, context, queryType) {
        // Obtener las instrucciones del sistema según el tipo de consulta
        const systemInstruction = this._getSystemInstruction(queryType, context);

        // Limitar el historial para no exceder límites de tokens
        const limitedHistory = this._limitConversationHistory(history);

        // Formatear según el proveedor (OpenAI o Anthropic)
        if (this.provider === 'openai') {
            return this._formatOpenAIPrompt(systemInstruction, limitedHistory, userMessage, context);
        } else {
            return this._formatAnthropicPrompt(systemInstruction, limitedHistory, userMessage, context);
        }
    }

    /**
     * Obtiene las instrucciones del sistema para un tipo de consulta
     * @param {string} queryType - Tipo de consulta
     * @param {Object} context - Contexto adicional
     * @returns {string} - Instrucciones del sistema
     * @private
     */
    _getSystemInstruction(queryType, context) {
        // Obtener instrucciones base del tipo de consulta
        let instruction = aiConfig.conversation.systemInstructions[queryType] ||
            aiConfig.conversation.systemInstructions.default;

        // Añadir información contextual específica
        if (context.userPreferences) {
            instruction += `\n\nPreferencias del usuario:`;

            if (context.userPreferences.budget) {
                instruction += `\n- Presupuesto: ${context.userPreferences.budget}`;
            }

            if (context.userPreferences.groupType) {
                instruction += `\n- Tipo de grupo: ${context.userPreferences.groupType}`;
            }

            if (context.userPreferences.interests && context.userPreferences.interests.length) {
                instruction += `\n- Intereses: ${context.userPreferences.interests.join(', ')}`;
            }
        }

        // Añadir información específica según tipo de consulta
        if (queryType === 'accommodation' && context.lastSearch && context.lastSearch.accommodations) {
            instruction += `\n\nÚltima búsqueda de alojamientos: ${context.lastSearch.accommodations.length} resultados encontrados.`;
        }

        // Añadir instrucciones para desambiguación y experiencia de usuario
        instruction += `
    
    Instrucciones adicionales:
    
    1. Si la consulta del usuario es ambigua, solicita clarificación de forma específica.
    
    2. Proporciona respuestas concretas y enfócate en información factual relevante para Samaná.
    
    3. Cuando ofrezcas recomendaciones, organízalas en orden de relevancia y explica brevemente por qué las recomiendas.
    
    4. Para las búsquedas de servicios (alojamiento, restaurantes, etc.), pregunta por detalles específicos si no los has obtenido aún.
    
    5. Formatea tus respuestas con claridad, usando párrafos cortos.
    
    6. Cuando menciones servicios específicos, incluye suficiente información para que el usuario pueda tomar una decisión.
    
    7. No inventes información sobre servicios, precios o disponibilidad que no conozcas con certeza.
    
    8. Si no tienes suficiente información para responder adecuadamente, indica qué información necesitas para proporcionar una mejor respuesta.
    `;

        return instruction;
    }

    /**
     * Formatea el prompt para OpenAI (GPT-4o)
     * @param {string} systemInstruction - Instrucciones del sistema
     * @param {Array} history - Historial limitado
     * @param {string} userMessage - Mensaje del usuario
     * @param {Object} context - Contexto adicional
     * @returns {Object} - Prompt formateado para OpenAI
     * @private
     */
    _formatOpenAIPrompt(systemInstruction, history, userMessage, context) {
        const messages = [
            { role: 'system', content: systemInstruction }
        ];

        // Añadir historial previo
        history.forEach(item => {
            const role = item.from === 'user' ? 'user' : 'assistant';
            messages.push({ role, content: item.content });
        });

        // Añadir funciones para estructurar la respuesta
        const functions = [
            {
                name: 'generate_response',
                description: 'Genera una respuesta estructurada para el usuario',
                parameters: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'El mensaje textual para mostrar al usuario'
                        },
                        intent: {
                            type: 'object',
                            description: 'La intención detectada en la consulta del usuario',
                            properties: {
                                type: {
                                    type: 'string',
                                    enum: ['accommodation', 'gastronomy', 'activities', 'transport', 'general'],
                                    description: 'Tipo de intención detectada'
                                },
                                confidence: {
                                    type: 'number',
                                    description: 'Nivel de confianza en la detección de intención (0-1)'
                                },
                                entityType: {
                                    type: 'string',
                                    description: 'Tipo de entidad principal en la consulta'
                                },
                                entities: {
                                    type: 'array',
                                    description: 'Entidades detectadas en la consulta',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            type: { type: 'string' },
                                            value: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        action: {
                            type: 'object',
                            description: 'Acción recomendada basada en la consulta',
                            properties: {
                                type: {
                                    type: 'string',
                                    enum: ['search', 'book', 'info', 'none'],
                                    description: 'Tipo de acción recomendada'
                                },
                                parameters: {
                                    type: 'object',
                                    description: 'Parámetros para la acción',
                                    additionalProperties: true
                                }
                            }
                        },
                        userPreferences: {
                            type: 'object',
                            description: 'Preferencias detectadas del usuario',
                            properties: {
                                budget: { type: 'string' },
                                groupType: { type: 'string' },
                                interests: {
                                    type: 'array',
                                    items: { type: 'string' }
                                },
                                location: { type: 'string' }
                            },
                            additionalProperties: true
                        },
                        suggestedQuestions: {
                            type: 'array',
                            description: 'Preguntas sugeridas para continuar la conversación',
                            items: { type: 'string' }
                        }
                    },
                    required: ['message']
                }
            }
        ];

        // Añadir mensaje actual del usuario
        messages.push({ role: 'user', content: userMessage });

        return {
            model: aiConfig.openai.modelName,
            messages,
            functions,
            function_call: { name: 'generate_response' },
            temperature: aiConfig.openai.temperature,
            max_tokens: aiConfig.openai.maxTokens
        };
    }

    /**
     * Formatea el prompt para Anthropic (Claude)
     * @param {string} systemInstruction - Instrucciones del sistema
     * @param {Array} history - Historial limitado
     * @param {string} userMessage - Mensaje del usuario
     * @param {Object} context - Contexto adicional
     * @returns {Object} - Prompt formateado para Anthropic
     * @private
     */
    _formatAnthropicPrompt(systemInstruction, history, userMessage, context) {
        // Construir el historial en formato Anthropic
        let messages = [];

        // Añadir historial previo
        history.forEach(item => {
            const role = item.from === 'user' ? 'user' : 'assistant';
            messages.push({
                role,
                content: [{ type: 'text', text: item.content }]
            });
        });

        // Añadir mensaje actual del usuario con instrucciones para formato estructurado
        const structuredResponseInstruction = `
    Por favor, proporciona tu respuesta en un formato JSON estructurado dentro de un bloque de código, seguido de tu mensaje normal. El formato debe ser:
    
    \`\`\`json
    {
      "intent": {
        "type": "tipo_de_intencion",
        "confidence": 0.9,
        "entityType": "tipo_entidad_principal",
        "entities": [
          { "name": "nombre_entidad", "type": "tipo_entidad", "value": "valor" }
        ]
      },
      "action": {
        "type": "tipo_accion",
        "parameters": { }
      },
      "userPreferences": {
        "budget": "presupuesto_detectado",
        "groupType": "tipo_grupo",
        "interests": ["interés1", "interés2"],
        "location": "ubicación_preferida"
      },
      "suggestedQuestions": [
        "pregunta1",
        "pregunta2",
        "pregunta3"
      ]
    }
    \`\`\`
    
    Después de este bloque JSON, escribe tu respuesta normal para el usuario.
    
    Mi pregunta es: ${userMessage}
    `;

        messages.push({
            role: 'user',
            content: [{ type: 'text', text: structuredResponseInstruction }]
        });

        return {
            model: aiConfig.anthropic.modelName,
            messages,
            system: systemInstruction,
            temperature: aiConfig.anthropic.temperature,
            max_tokens: aiConfig.anthropic.maxTokens
        };
    }

    /**
     * Limita el historial de conversación para no exceder límites de tokens
     * @param {Array} history - Historial completo
     * @returns {Array} - Historial limitado
     * @private
     */
    _limitConversationHistory(history) {
        if (!history || history.length === 0) {
            return [];
        }

        const maxHistory = aiConfig.conversation.maxHistoryLength || 20;

        // Si el historial es más corto que el máximo, devolver todo
        if (history.length <= maxHistory) {
            return history;
        }

        // Si es más largo, limitar pero mantener contexto
        return history.slice(-maxHistory);
    }

    /**
     * Llama al API del modelo de lenguaje
     * @param {Object} promptData - Datos del prompt
     * @returns {Promise<Object>} - Respuesta del API
     * @private
     */
    async _callModelAPI(promptData) {
        try {
            let response;

            if (this.provider === 'openai') {
                response = await axios.post(
                    aiConfig.openai.apiUrl,
                    promptData,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.apiKey}`
                        }
                    }
                );
                return response.data;
            } else {
                response = await axios.post(
                    aiConfig.anthropic.apiUrl,
                    promptData,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-API-Key': this.apiKey,
                            'anthropic-version': '2023-06-01'
                        }
                    }
                );
                return response.data;
            }
        } catch (error) {
            const statusCode = error.response?.status || 'unknown';
            const errorData = error.response?.data || {};

            logger.error(`Error en llamada a ${this.provider} API (${statusCode}):`, errorData);

            throw new Error(`Error en ${this.provider} API: ${error.message}`);
        }
    }

    /**
     * Procesa la respuesta del modelo
     * @param {Object} apiResponse - Respuesta del API
     * @param {Object} context - Contexto original
     * @param {string} queryType - Tipo de consulta
     * @returns {Promise<Object>} - Respuesta estructurada
     * @private
     */
    async _parseModelResponse(apiResponse, context, queryType) {
        try {
            let responseText = '';
            let structuredData = null;

            // Extraer texto y datos estructurados según el proveedor
            if (this.provider === 'openai') {
                // Para OpenAI, los datos estructurados vienen en la función
                if (apiResponse.choices && apiResponse.choices[0]) {
                    const functionCall = apiResponse.choices[0].message.function_call;

                    if (functionCall && functionCall.name === 'generate_response') {
                        try {
                            structuredData = JSON.parse(functionCall.arguments);
                            responseText = structuredData.message || '';
                        } catch (e) {
                            logger.error('Error al parsear respuesta estructurada de OpenAI:', e);
                            responseText = apiResponse.choices[0].message.content || '';
                        }
                    } else {
                        responseText = apiResponse.choices[0].message.content || '';
                    }
                }
            } else {
                // Para Anthropic, buscamos el JSON en el texto
                if (apiResponse.content && apiResponse.content[0]) {
                    const fullText = apiResponse.content[0].text || '';

                    // Intentar extraer el bloque JSON
                    const jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```/);

                    if (jsonMatch && jsonMatch[1]) {
                        try {
                            structuredData = JSON.parse(jsonMatch[1]);

                            // Extraer el texto después del bloque JSON
                            const textAfterJson = fullText.substring(fullText.indexOf('```', fullText.indexOf('```json') + 7) + 4).trim();
                            responseText = textAfterJson;
                        } catch (e) {
                            logger.error('Error al parsear respuesta estructurada de Anthropic:', e);
                            responseText = fullText;
                        }
                    } else {
                        responseText = fullText;
                    }
                }
            }

            // Si no pudimos extraer datos estructurados, crear una estructura básica
            if (!structuredData) {
                structuredData = {
                    intent: {
                        type: queryType,
                        confidence: 0.7
                    },
                    suggestedQuestions: [
                        '¿Qué puedo hacer en Samaná?',
                        '¿Dónde puedo alojarme en Samaná?',
                        '¿Cuáles son los mejores restaurantes?'
                    ]
                };
            }

            // Construir la respuesta final
            return {
                message: responseText,
                type: structuredData.intent?.type || queryType,
                action: structuredData.action,
                userPreferences: structuredData.userPreferences,
                suggestedQuestions: structuredData.suggestedQuestions,
                intent: structuredData.intent,
                confidence: structuredData.intent?.confidence || 0.7,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Error al procesar respuesta del modelo:', error);

            // Respuesta de fallback
            return {
                message: "Lo siento, no pude procesar tu consulta correctamente. ¿Podrías reformularla?",
                type: queryType,
                error: true,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Actualiza el contexto con información de la respuesta
     * @param {Object} currentContext - Contexto actual
     * @param {Object} response - Respuesta procesada
     * @param {string} queryType - Tipo de consulta
     * @returns {Object} - Contexto actualizado
     * @private
     */
    _updateContext(currentContext, response, queryType) {
        const updatedContext = { ...currentContext };

        // Actualizar intención
        if (response.intent) {
            updatedContext.intent = response.intent;
        }

        // Actualizar preferencias de usuario si hay nuevas
        if (response.userPreferences) {
            updatedContext.userPreferences = {
                ...(updatedContext.userPreferences || {}),
                ...response.userPreferences
            };
        }

        // Registrar la última acción
        if (response.action) {
            updatedContext.lastAction = response.action;
        }

        // Registrar el tipo de consulta actual
        updatedContext.currentQueryType = queryType;

        return updatedContext;
    }

    /**
     * Analiza el sentimiento de un texto
     * @param {string} text - Texto a analizar
     * @returns {Promise<Object>} - Análisis de sentimiento
     */
    async analyzeSentiment(text) {
        try {
            // Construir prompt para análisis de sentimiento
            let promptData;

            if (this.provider === 'openai') {
                promptData = {
                    model: aiConfig.openai.modelName,
                    messages: [
                        {
                            role: 'system',
                            content: 'Analiza el sentimiento del siguiente texto y proporciona una puntuación entre -1 (muy negativo) y 1 (muy positivo). Responde ÚNICAMENTE con un número decimal entre -1 y 1, sin texto adicional.'
                        },
                        {
                            role: 'user',
                            content: text
                        }
                    ],
                    temperature: 0.1
                };
            } else {
                promptData = {
                    model: aiConfig.anthropic.modelName,
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: `Analiza el sentimiento del siguiente texto y proporciona una puntuación entre -1 (muy negativo) y 1 (muy positivo). Responde ÚNICAMENTE con un número decimal entre -1 y 1, sin texto adicional.\n\nTexto: "${text}"`
                                }
                            ]
                        }
                    ],
                    system: 'Eres un analizador preciso de sentimiento. Respondes solo con números decimales entre -1 y 1.',
                    temperature: 0.1,
                    max_tokens: 10
                };
            }

            // Llamar al API
            const response = await this._callModelAPI(promptData);

            // Extraer puntuación de sentimiento
            let sentimentScore;

            if (this.provider === 'openai') {
                sentimentScore = parseFloat(response.choices[0].message.content.trim());
            } else {
                sentimentScore = parseFloat(response.content[0].text.trim());
            }

            // Validar resultado
            if (isNaN(sentimentScore) || sentimentScore < -1 || sentimentScore > 1) {
                throw new Error('Respuesta de sentimiento inválida');
            }

            // Clasificar el sentimiento
            let category;
            if (sentimentScore <= -0.6) category = 'very_negative';
            else if (sentimentScore <= -0.2) category = 'negative';
            else if (sentimentScore < 0.2) category = 'neutral';
            else if (sentimentScore < 0.6) category = 'positive';
            else category = 'very_positive';

            return {
                score: sentimentScore,
                category,
                text
            };
        } catch (error) {
            logger.error('Error en análisis de sentimiento:', error);
            return {
                score: 0,
                category: 'neutral',
                error: true
            };
        }
    }
}

module.exports = new AIService();