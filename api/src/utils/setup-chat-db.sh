#!/bin/bash
# setup-chat-db.sh
# Script para crear las tablas necesarias para el sistema de chat

# Variables de entorno (edita según tu configuración)
DB_USER="root"
DB_PASSWORD=""
DB_NAME="dbV2"
DB_HOST="localhost"

# Archivo SQL
SQL_FILE="chat_tables.sql"

# Crear archivo SQL con las tablas necesarias
cat > $SQL_FILE << 'EOF'
-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS `chat_conversations` (
  `id` VARCHAR(50) NOT NULL COMMENT 'ID único de la conversación',
  `user_id` BIGINT UNSIGNED NULL COMMENT 'ID del usuario si está autenticado',
  `session_id` VARCHAR(100) NULL COMMENT 'ID de sesión para usuarios no autenticados',
  `context` JSON NULL COMMENT 'Contexto de la conversación en formato JSON',
  `status` ENUM('active', 'closed', 'archived') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_session_id` (`session_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `conversation_id` VARCHAR(50) NOT NULL COMMENT 'ID de la conversación',
  `content` TEXT NOT NULL COMMENT 'Contenido del mensaje',
  `from` ENUM('user', 'bot') NOT NULL COMMENT 'Origen del mensaje',
  `metadata` JSON NULL COMMENT 'Metadatos adicionales (agentes, acciones, etc.)',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_conversation_id` (`conversation_id`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_chat_messages_conversation_id` FOREIGN KEY (`conversation_id`) 
    REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para análisis de conversaciones
CREATE TABLE IF NOT EXISTS `chat_analytics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `conversation_id` VARCHAR(50) NOT NULL,
  `sentiment_score` DECIMAL(3,2) NULL COMMENT 'Puntuación de sentimiento (-1 a 1)',
  `satisfaction_score` DECIMAL(3,2) NULL COMMENT 'Puntuación de satisfacción (0 a 1)',
  `topic` VARCHAR(50) NULL COMMENT 'Tema principal de la conversación',
  `agents_used` JSON NULL COMMENT 'Agentes utilizados en la conversación',
  `total_messages` INT UNSIGNED NOT NULL DEFAULT 0,
  `conversation_duration` INT UNSIGNED NULL COMMENT 'Duración en segundos',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_conversation_id` (`conversation_id`),
  CONSTRAINT `fk_chat_analytics_conversation_id` FOREIGN KEY (`conversation_id`) 
    REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
EOF

# Ejecutar script SQL
echo "Creando tablas para el sistema de chat..."
mysql -h $DB_HOST -u $DB_USER --password=$DB_PASSWORD $DB_NAME < $SQL_FILE

# Verificar resultado
if [ $? -eq 0 ]; then
  echo "Tablas creadas correctamente."
else
  echo "Error al crear las tablas. Verifica tus credenciales o permisos."
  exit 1
fi

# Limpiar
rm $SQL_FILE

echo "Configuración completada."