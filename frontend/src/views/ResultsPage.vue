<template>
    <div class="results-container">
        <div class="results-header">
            <h1>{{ pageTitle }}</h1>
            <p class="results-summary">{{ resultsSummary }}</p>

            <!-- Filtros -->
            <div class="filters-section">
                <button @click="toggleFilters" class="filter-toggle-btn">
                    {{ showFilters ? 'Ocultar filtros' : 'Mostrar filtros' }}
                </button>

                <div v-if="showFilters" class="filters-container">
                    <!-- Filtros varían según el tipo de resultado -->
                    <div v-if="resultType === 'accommodation'" class="filters-grid">
                        <div class="filter-group">
                            <label>Tipo</label>
                            <select v-model="filters.accommodationType">
                                <option value="">Todos</option>
                                <option value="hotel">Hotel</option>
                                <option value="apartment">Apartamento</option>
                                <option value="villa">Villa</option>
                                <option value="hostel">Hostal</option>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label>Precio</label>
                            <select v-model="filters.priceRange">
                                <option value="">Todos</option>
                                <option value="economic">Económico</option>
                                <option value="medium">Medio</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>

                        <!-- Más filtros -->
                    </div>

                    <div v-else-if="resultType === 'restaurant'" class="filters-grid">
                        <!-- Filtros específicos para restaurantes -->
                    </div>

                    <div class="filter-actions">
                        <button @click="applyFilters" class="apply-filters-btn">Aplicar filtros</button>
                        <button @click="clearFilters" class="clear-filters-btn">Limpiar filtros</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Resultados de búsqueda -->
        <div class="results-grid">
            <div v-if="loadingResults" class="loading-indicator">
                <div class="spinner"></div>
                <p>Cargando resultados...</p>
            </div>

            <div v-else-if="results.length === 0" class="no-results">
                <p>No se encontraron resultados para tu búsqueda.</p>
                <button @click="goBack" class="back-btn">Volver a la búsqueda</button>
            </div>

            <div v-for="item in results" :key="item.id" class="result-card" @click="viewItemDetails(item)">
                <div class="result-image">
                    <img :src="item.image || '/assets/images/placeholder.jpg'" :alt="item.title">
                </div>
                <div class="result-info">
                    <h3>{{ item.title }}</h3>
                    <div class="result-rating" v-if="item.rating">
                        <span class="stars">★★★★★</span>
                        <span class="rating-value">{{ item.rating }}</span>
                    </div>
                    <p class="result-location" v-if="item.location">{{ item.location }}</p>
                    <p class="result-description">{{ item.shortDescription }}</p>
                    <div class="result-price" v-if="item.price">
                        <span class="price-label">Desde</span>
                        <span class="price-value">${{ item.price }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Paginación -->
        <div class="pagination" v-if="results.length > 0">
            <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)" class="pagination-btn">
                Anterior
            </button>

            <div class="page-numbers">
                <button v-for="page in totalPages" :key="page"
                    :class="['page-number', { active: page === currentPage }]" @click="changePage(page)">
                    {{ page }}
                </button>
            </div>

            <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)" class="pagination-btn">
                Siguiente
            </button>
        </div>

        <!-- Chat flotante -->
        <div class="floating-chat-trigger" @click="toggleChat">
            <span class="chat-icon">💬</span>
            <span class="chat-label">¿Necesitas ayuda?</span>
        </div>

        <div class="floating-chat" v-if="showChat">
            <div class="chat-header">
                <h3>Asistente de SamanaInn</h3>
                <button @click="toggleChat" class="chat-close">×</button>
            </div>

            <ChatBox :messages="messages" :is-typing="isTyping" :suggestions="suggestions" :compact="true"
                @send-message="handleSendMessage" @suggestion-click="handleSuggestionClick" />
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import ChatBox from '@/components/ChatBox.vue';

export default {
    name: 'ResultsPage',
    components: {
        ChatBox
    },
    data() {
        return {
            showFilters: false,
            showChat: false,
            currentPage: 1,
            itemsPerPage: 9,
            filters: {
                accommodationType: '',
                priceRange: '',
                location: '',
                amenities: []
            }
        };
    },
    computed: {
        ...mapState('bookings', [
            'searchResults',
            'searchFilters',
            'loadingResults'
        ]),
        ...mapState('chat', [
            'messages',
            'isTyping',
            'suggestions'
        ]),
        results() {
            // Aplicar paginación a los resultados
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.searchResults.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.searchResults.length / this.itemsPerPage);
        },
        resultType() {
            // Obtenido de la ruta o del estado
            return this.$route.query.type || 'general';
        },
        pageTitle() {
            // Título según el tipo de resultado
            switch (this.resultType) {
                case 'accommodation':
                    return 'Alojamientos en Samaná';
                case 'restaurant':
                    return 'Restaurantes en Samaná';
                case 'tour':
                    return 'Tours y Excursiones en Samaná';
                case 'car':
                    return 'Vehículos en Samaná';
                default:
                    return 'Resultados de búsqueda';
            }
        },
        resultsSummary() {
            const count = this.searchResults.length;
            return `Mostrando ${count} ${count === 1 ? 'resultado' : 'resultados'} ${this.getFilterSummary()}`;
        }
    },
    created() {
        // Cargar resultados basados en la URL
        this.loadResultsFromQuery();

        // Iniciar chat si no está activo
        if (!this.messages.length) {
            this.initConversation();
        }
    },
    methods: {
        ...mapActions('bookings', [
            'searchBookingOptions',
            'getItemDetails'
        ]),
        ...mapActions('chat', [
            'initConversation',
            'sendMessage'
        ]),
        loadResultsFromQuery() {
            const { type, ...queryParams } = this.$route.query;

            if (type) {
                // Convertir parámetros de consulta a filtros
                const filters = this.parseQueryParams(queryParams);

                // Actualizar filtros locales
                this.filters = { ...filters };

                // Buscar opciones
                this.searchBookingOptions({ type, filters });
            }
        },
        parseQueryParams(queryParams) {
            const filters = {};

            // Mapear parámetros de consulta a filtros
            Object.entries(queryParams).forEach(([key, value]) => {
                if (key === 'amenities' && value) {
                    filters.amenities = value.split(',');
                } else if (value) {
                    filters[key] = value;
                }
            });

            return filters;
        },
        getFilterSummary() {
            const appliedFilters = [];

            // Crear resumen de filtros aplicados
            Object.entries(this.filters).forEach(([key, value]) => {
                if (value && value.length) {
                    appliedFilters.push(this.getFilterLabel(key, value));
                }
            });

            return appliedFilters.length ? `con filtros: ${appliedFilters.join(', ')}` : '';
        },
        getFilterLabel(key, value) {
            // Mapear claves de filtro a etiquetas legibles
            const filterLabels = {
                accommodationType: 'Tipo de alojamiento',
                priceRange: 'Rango de precio',
                location: 'Ubicación'
            };

            return `${filterLabels[key] || key}: ${value}`;
        },
        toggleFilters() {
            this.showFilters = !this.showFilters;
        },
        toggleChat() {
            this.showChat = !this.showChat;
        },
        applyFilters() {
            // Actualizar URL con los filtros
            const query = {
                ...this.$route.query,
                ...this.filters
            };

            // Limpiar parámetros vacíos
            Object.keys(query).forEach(key => {
                if (!query[key]) delete query[key];
            });

            // Actualizar ruta sin recargar
            this.$router.replace({ query });

            // Buscar con nuevos filtros
            this.searchBookingOptions({
                type: this.resultType,
                filters: this.filters
            });

            // Reiniciar paginación
            this.currentPage = 1;
        },
        clearFilters() {
            // Reiniciar filtros
            this.filters = {
                accommodationType: '',
                priceRange: '',
                location: '',
                amenities: []
            };

            // Aplicar
            this.applyFilters();
        },
        changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                // Desplazar al inicio de los resultados
                this.$nextTick(() => {
                    const resultsEl = document.querySelector('.results-grid');
                    if (resultsEl) {
                        resultsEl.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }
        },
        viewItemDetails(item) {
            // Navegar a la página de detalles
            window.location.href = item.detailUrl || `/detail/${this.resultType}/${item.id}`;
        },
        goBack() {
            this.$router.push('/');
        },
        async handleSendMessage(message) {
            await this.sendMessage(message);
        },
        handleSuggestionClick(suggestion) {
            this.handleSendMessage(suggestion);
        }
    }
};
</script>

<style scoped>
.results-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.results-header {
    margin-bottom: 30px;
}

.results-header h1 {
    font-size: 28px;
    color: #2c3e50;
    margin-bottom: 10px;
}

.results-summary {
    color: #6c757d;
    margin-bottom: 20px;
}

.filters-section {
    margin-bottom: 30px;
}

.filter-toggle-btn {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
}

.filters-container {
    margin-top: 15px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #dee2e6;
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.filter-group {
    display: flex;
    flex-direction: column;
}

.filter-group label {
    margin-bottom: 5px;
    font-size: 14px;
    font-weight: 500;
}

.filter-group select,
.filter-group input {
    padding: 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
}

.filter-actions {
    display: flex;
    gap: 10px;
}

.apply-filters-btn,
.clear-filters-btn {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    border: none;
}

.apply-filters-btn {
    background-color: #007bff;
    color: white;
}

.clear-filters-btn {
    background-color: #6c757d;
    color: white;
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 25px;
    margin-bottom: 30px;
}

.result-card {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    background-color: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.result-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.result-image {
    height: 200px;
    overflow: hidden;
}

.result-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.result-info {
    padding: 15px;
}

.result-info h3 {
    font-size: 18px;
    margin-top: 0;
    margin-bottom: 10px;
    color: #2c3e50;
}

.result-rating {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.stars {
    color: #ffc107;
    margin-right: 5px;
}

.rating-value {
    font-weight: 500;
}

.result-location {
    font-size: 14px;
    color: #6c757d;
    margin-bottom: 10px;
}

.result-description {
    font-size: 14px;
    color: #6c757d;
    margin-bottom: 15px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.result-price {
    display: flex;
    align-items: center;
}

.price-label {
    font-size: 12px;
    color: #6c757d;
    margin-right: 5px;
}

.price-value {
    font-size: 18px;
    font-weight: 700;
    color: #28a745;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
}

.pagination-btn {
    padding: 8px 16px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    cursor: pointer;
    color: #212529;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-numbers {
    display: flex;
    margin: 0 10px;
}

.page-number {
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 5px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    cursor: pointer;
}

.page-number.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
}

.loading-indicator {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 50px 0;
}

.spinner {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 50px 0;
}

.back-btn {
    margin-top: 15px;
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.floating-chat-trigger {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border-radius: 50px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    z-index: 1000;
}

.chat-icon {
    font-size: 24px;
    margin-right: 8px;
}

.floating-chat {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 350px;
    height: 500px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #007bff;
    color: white;
}

.chat-header h3 {
    margin: 0;
    font-size: 16px;
}

.chat-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    line-height: 1;
}

@media (max-width: 768px) {
    .results-grid {
        grid-template-columns: 1fr;
    }

    .filters-grid {
        grid-template-columns: 1fr;
    }

    .floating-chat {
        width: 300px;
        height: 450px;
    }

    .chat-label {
        display: none;
    }

    .floating-chat-trigger {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        justify-content: center;
        padding: 0;
    }

    .chat-icon {
        margin-right: 0;
    }
}
</style>