-- chat_schema.sql
-- Esquema para el sistema de chat de SamanaInn

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS chat_conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) DEFAULT NULL,
  session_id VARCHAR(100) NOT NULL,
  status ENUM('active', 'archived', 'deleted') DEFAULT 'active',
  source VARCHAR(50) DEFAULT 'web',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id)
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  role ENUM('user', 'assistant', 'system') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id),
  INDEX idx_conversation_id (conversation_id)
);

-- Tabla de análisis y métricas
CREATE TABLE IF NOT EXISTS chat_analytics (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  intent_type VARCHAR(50) DEFAULT NULL,
  topic VARCHAR(100) DEFAULT NULL,
  agents_used JSON DEFAULT NULL,
  session_duration INT DEFAULT NULL,
  action_taken VARCHAR(100) DEFAULT NULL,
  feedback_score TINYINT DEFAULT NULL,
  user_location VARCHAR(100) DEFAULT NULL,
  url_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id),
  INDEX idx_intent_type (intent_type),
  INDEX idx_topic (topic)
);

-- Tabla de contexto de conversación
CREATE TABLE IF NOT EXISTS chat_context (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  context_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id),
  INDEX idx_conversation_id (conversation_id)
);

-- Tabla de acciones recomendadas
CREATE TABLE IF NOT EXISTS chat_actions (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  action_data JSON NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id),
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_action_type (action_type)
);

-- Tabla de ajustes y configuración
CREATE TABLE IF NOT EXISTS chat_settings (
  id VARCHAR(36) PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_setting_key (setting_key)
);

-- Insertar configuraciones iniciales
INSERT IGNORE INTO chat_settings (id, setting_key, setting_value) VALUES 
(UUID(), 'default_language', 'es'),
(UUID(), 'ai_provider', 'anthropic'),
(UUID(), 'ai_model', 'claude-3-sonnet-20240229'),
(UUID(), 'max_context_length', '10'),
(UUID(), 'enable_banner_personalization', 'true'),
(UUID(), 'enable_disambiguation', 'true');