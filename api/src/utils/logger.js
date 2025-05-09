// src/utils/logger.js
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Utilidad para gestionar logs en la aplicación
 */
class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
        this.enabledLevels = {
            error: true,
            warn: true,
            info: process.env.NODE_ENV !== 'production',
            debug: process.env.NODE_ENV === 'development',
            verbose: false
        };

        // Crear directorio de logs si no existe
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }

        // Habilitar/deshabilitar logging según variable de entorno
        this.enabled = process.env.ENABLE_LOGGING === 'true';
    }

    /**
     * Genera un mensaje de log formateado
     * @param {string} level - Nivel del log (error, warn, info, debug, verbose)
     * @param {string} message - Mensaje a registrar
     * @param {Object} data - Datos adicionales (opcional)
     * @returns {string} - Mensaje formateado
     * @private
     */
    _formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

        if (data) {
            try {
                // Si data es una instancia de Error, añadir stack trace
                if (data instanceof Error) {
                    formattedMessage += `\n    ${data.stack || data.message}`;
                } else {
                    // Intentar convertir a JSON si es posible
                    formattedMessage += `\n    ${JSON.stringify(data, null, 2)}`;
                }
            } catch (e) {
                formattedMessage += `\n    [Non-stringifiable data: ${typeof data}]`;
            }
        }

        return formattedMessage;
    }

    /**
     * Escribe un mensaje en el archivo de log correspondiente
     * @param {string} level - Nivel del log (error, warn, info, debug, verbose)
     * @param {string} message - Mensaje a registrar
     * @param {Object} data - Datos adicionales (opcional)
     * @private
     */
    _writeToFile(level, message, data = null) {
        if (!this.enabled || !this.enabledLevels[level]) {
            return;
        }

        const formattedMessage = this._formatMessage(level, message, data);
        const date = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const logFile = path.join(this.logDir, `${date}.log`);

        try {
            fs.appendFileSync(logFile, formattedMessage + '\n');
        } catch (e) {
            console.error(`Error writing to log file: ${e.message}`);
        }
    }

    /**
     * Registra un mensaje de error
     * @param {string} message - Mensaje a registrar
     * @param {Error|Object} error - Error o datos adicionales
     */
    error(message, error = null) {
        console.error(`[ERROR] ${message}`, error);
        this._writeToFile('error', message, error);
    }

    /**
     * Registra un mensaje de advertencia
     * @param {string} message - Mensaje a registrar
     * @param {Object} data - Datos adicionales (opcional)
     */
    warn(message, data = null) {
        console.warn(`[WARN] ${message}`, data);
        this._writeToFile('warn', message, data);
    }

    /**
     * Registra un mensaje informativo
     * @param {string} message - Mensaje a registrar
     * @param {Object} data - Datos adicionales (opcional)
     */
    info(message, data = null) {
        if (this.enabledLevels.info) {
            console.info(`[INFO] ${message}`, data);
        }
        this._writeToFile('info', message, data);
    }

    /**
     * Registra un mensaje de depuración
     * @param {string} message - Mensaje a registrar
     * @param {Object} data - Datos adicionales (opcional)
     */
    debug(message, data = null) {
        if (this.enabledLevels.debug) {
            console.debug(`[DEBUG] ${message}`, data);
        }
        this._writeToFile('debug', message, data);
    }

    /**
     * Registra un mensaje detallado
     * @param {string} message - Mensaje a registrar
     * @param {Object} data - Datos adicionales (opcional)
     */
    verbose(message, data = null) {
        if (this.enabledLevels.verbose) {
            console.log(`[VERBOSE] ${message}`, data);
        }
        this._writeToFile('verbose', message, data);
    }

    /**
     * Registra una conversación completa
     * @param {string} conversationId - ID de la conversación
     * @param {Object} conversation - Datos de la conversación
     */
    logConversation(conversationId, conversation) {
        if (!this.enabled) {
            return;
        }

        try {
            const conversationDir = path.join(this.logDir, 'conversations');

            // Crear directorio si no existe
            if (!fs.existsSync(conversationDir)) {
                fs.mkdirSync(conversationDir, { recursive: true });
            }

            const logFile = path.join(conversationDir, `${conversationId}.json`);
            fs.writeFileSync(logFile, JSON.stringify(conversation, null, 2));
        } catch (e) {
            console.error(`Error logging conversation: ${e.message}`);
        }
    }
}

module.exports = new Logger();