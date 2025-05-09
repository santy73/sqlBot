<template>
    <div class="home-container">
        <!-- Banner Dinámico -->
        <DynamicBanner :banner="currentBanner" @action-click="handleBannerAction" />

        <!-- Sección de Chat -->
        <div class="chat-section">
            <h1 class="chat-title">Asistente Virtual de SamanaInn</h1>
            <p class="chat-subtitle">¿En qué puedo ayudarte hoy?</p>

            <ChatBox :messages="messages" :is-typing="isTyping" :suggestions="suggestions"
                @send-message="handleSendMessage" @suggestion-click="handleSuggestionClick" />
        </div>

        <!-- Sección de Resultados -->
        <ResultsDisplay v-if="hasResults" :results="searchResults" :loading="isLoadingResults" :type="resultType"
            @item-click="handleItemClick" @clear-results="clearResults" />

        <!-- Sección de Sugerencias Populares -->
        <div v-if="!hasResults" class="popular-questions">
            <h2>Preguntas populares</h2>
            <div class="questions-grid">
                <button v-for="(question, index) in popularQuestions" :key="index" class="question-button"
                    @click="handleSendMessage(question)">
                    {{ question }}
                </button>
            </div>
        </div>

        <!-- Feedback Form -->
        <div class="feedback-section" v-if="messages.length > 1">
            <p>¿Te está siendo útil esta conversación?</p>
            <div class="feedback-buttons">
                <button @click="provideFeedback(true)" class="btn-feedback positive">Sí</button>
                <button @click="provideFeedback(false)" class="btn-feedback negative">No</button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import ChatBox from '@/components/ChatBox.vue';
import DynamicBanner from '@/components/DynamicBanner.vue';
import ResultsDisplay from '@/components/ResultsDisplay.vue';

export default {
    name: 'HomePage',
    components: {
        ChatBox,
        DynamicBanner,
        ResultsDisplay
    },
    data() {
        return {
            popularQuestions: [
                '¿Qué lugares puedo visitar en Samaná?',
                '¿Cuáles son los mejores restaurantes?',
                '¿Dónde puedo hospedarme en Las Terrenas?',
                '¿Cómo llego a Playa Rincón?',
                '¿Qué excursiones ofrecen a los Haitises?',
                '¿Cuál es la mejor época para visitar Samaná?'
            ],
            feedbackSubmitted: false,
            resultType: 'general'
        };
    },
    computed: {
        ...mapState('chat', [
            'messages',
            'isTyping',
            'suggestions'
        ]),
        ...mapState('bookings', [
            'searchResults',
            'loadingResults'
        ]),
        ...mapGetters('chat', [
            'currentBanner'
        ]),
        ...mapGetters('bookings', [
            'hasSearchResults'
        ]),
        hasResults() {
            return this.hasSearchResults;
        },
        isLoadingResults() {
            return this.loadingResults;
        }
    },
    async created() {
        // Iniciar conversación al cargar la página
        await this.initConversation();
    },
    methods: {
        ...mapActions('chat', [
            'initConversation',
            'sendMessage',
            'provideFeedback'
        ]),
        ...mapActions('bookings', [
            'searchBookingOptions',
            'clearSearchResults'
        ]),
        async handleSendMessage(message) {
            const response = await this.sendMessage(message);

            // Si la respuesta incluye resultados de búsqueda
            if (response && response.searchResults) {
                this.resultType = response.searchType || 'general';
                // Los resultados se manejan a través del store
            }
        },
        handleSuggestionClick(suggestion) {
            this.handleSendMessage(suggestion);
        },
        handleBannerAction(action) {
            if (action && action.url) {
                window.location.href = action.url;
            }
        },
        handleItemClick(item) {
            // Redirigir a la página de detalle
            if (item && item.url) {
                window.location.href = item.url;
            }
        },
        clearResults() {
            this.clearSearchResults();
        },
        provideFeedback(isPositive) {
            if (this.feedbackSubmitted) return;

            const lastAssistantMessage = this.messages.findLast(m => m.role === 'assistant');
            if (lastAssistantMessage) {
                this.provideFeedback({
                    messageId: lastAssistantMessage.id,
                    helpful: isPositive
                });
                this.feedbackSubmitted = true;
            }
        }
    }
};
</script>

<style scoped>
.home-container {
    display: flex;
    flex-direction: column;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.chat-section {
    margin: 30px 0;
    text-align: center;
}

.chat-title {
    font-size: 28px;
    margin-bottom: 10px;
    color: #2c3e50;
}

.chat-subtitle {
    font-size: 18px;
    color: #6c757d;
    margin-bottom: 20px;
}

.popular-questions {
    margin: 40px 0;
}

.popular-questions h2 {
    font-size: 22px;
    color: #2c3e50;
    margin-bottom: 20px;
    text-align: center;
}

.questions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
}

.question-button {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 15px;
    text-align: left;
    font-size: 16px;
    color: #212529;
    cursor: pointer;
    transition: all 0.2s ease;
}

.question-button:hover {
    background-color: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.feedback-section {
    margin: 30px 0;
    text-align: center;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.feedback-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 10px;
}

.btn-feedback {
    padding: 8px 20px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    border: none;
}

.positive {
    background-color: #28a745;
    color: white;
}

.negative {
    background-color: #dc3545;
    color: white;
}

@media (max-width: 768px) {
    .questions-grid {
        grid-template-columns: 1fr;
    }

    .chat-title {
        font-size: 24px;
    }

    .chat-subtitle {
        font-size: 16px;
    }
}
</style>