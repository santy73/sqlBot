<template>
  <div class="chat-container" :class="{ compact }">
    <!-- Historial de mensajes -->
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
        <div class="message-content">
          <div v-if="message.role === 'assistant'" class="assistant-avatar">AI</div>
          <div v-html="formatMessage(message.content)"></div>
        </div>
        <div class="message-time">{{ formatTime(message.timestamp) }}</div>
      </div>

      <!-- Indicador de escritura -->
      <div v-if="isTyping" class="message assistant typing">
        <div class="message-content">
          <div class="assistant-avatar">AI</div>
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- Desplazamiento automático al final -->
      <div ref="messagesEnd"></div>
    </div>

    <!--Sugerencias -->
    <div v-if="suggestions && suggestions.length > 0" class="chat-suggestions">
      <button v-for="(suggestion, idx) in suggestions" :key="idx" class="suggestion-button"
        @click="$emit('suggestion-click', suggestion)">
        {{ suggestion }}
      </button>
    </div>

    < !--Área de entrada de mensaje-->
      <div class="chat-input-area">
        <input v-model="userMessage" type="text" placeholder="Escribe tu mensaje aquí..." @keyup.enter="sendMessage"
          :disabled="isTyping" class="chat-input" />
        <button @click="sendMessage" :disabled="!userMessage.trim() || isTyping" class="send-button">
          <span>↑</span>
        </button>
      </div>
  </div>
</template>

<script>
export default {
  name: 'ChatBox',
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    isTyping: {
      type: Boolean,
      default: false
    },
    suggestions: {
      type: Array,
      default: () => []
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userMessage: ''
    };
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      deep: true
    },
    isTyping() {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    }
  },
  mounted() {
    this.scrollToBottom();
  },
  methods: {
    sendMessage() {
      if (!this.userMessage.trim() || this.isTyping) return;

      this.$emit('send-message', this.userMessage);
      this.userMessage = '';
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      const end = this.$refs.messagesEnd;

      if (container && end) {
        container.scrollTop = container.scrollHeight;
      }
    },
    formatMessage(text) {
      // Procesar URLs
      const urlPattern = /(https?:\/\/[^\s]+)/g;
      return text
        .replace(urlPattern, '<a href="$1" target="_blank">$1</a>')
        .replace(/\n/g, '<br>');
    },
    formatTime(timestamp) {
      if (!timestamp) return '';

      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 500px;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  background-color: white;
  overflow: hidden;
}

.chat-container.compact {
  height: 100%;
  box-shadow: none;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: #f8f9fa;
}

.message {
  max-width: 80%;
  margin-bottom: 15px;
  border-radius: 12px;
  padding: 10px 15px;
  position: relative;
}

.message.user {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 0;
}

.message.assistant {
  align-self: flex-start;
  background-color: #e9ecef;
  color: #212529;
  margin-right: auto;
  border-bottom-left-radius: 0;
}

.message-content {
  display: flex;
  align-items: flex-start;
}

.assistant-avatar {
  width: 30px;
  height: 30px;
  background-color: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 10px;
  flex-shrink: 0;
}

.message-time {
  font-size: 10px;
  text-align: right;
  margin-top: 5px;
  opacity: 0.8;
}

.typing-indicator {
  display: flex;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  margin: 0 2px;
  background-color: #6c757d;
  border-radius: 50%;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }

  100% {
    transform: translateY(0);
  }
}

.chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.suggestion-button {
  background-color: white;
  border: 1px solid #007bff;
  color: #007bff;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.suggestion-button:hover {
  background-color: #007bff;
  color: white;
}

.chat-input-area {
  display: flex;
  padding: 15px;
  background-color: white;
  border-top: 1px solid #dee2e6;
}

.chat-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ced4da;
  border-radius: 20px;
  font-size: 14px;
  background-color: #f8f9fa;
}

.send-button {
  width: 40px;
  height: 40px;
  margin-left: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.send-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>