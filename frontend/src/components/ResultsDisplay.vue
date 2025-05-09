<template>
    <div class="results-display">
        <div class="results-header">
            <h2>{{ resultsTitle }}</h2>
            <button @click="$emit('clear-results')" class="clear-button">
                Limpiar resultados
            </button>
        </div>

        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Cargando resultados...</p>
        </div>

        <div v-else-if="results.length === 0" class="no-results">
            <p>No se encontraron resultados para tu búsqueda.</p>
        </div>

        <div v-else class="results-list">
            <div v-for="(item, index) in results" :key="index" class="result-item" @click="$emit('item-click', item)">
                <div class="result-image">
                    <img :src="item.image || '/assets/images/placeholder.jpg'" :alt="item.title">
                </div>
                <div class="result-details">
                    <h3>{{ item.title }}</h3>
                    <p v-if="item.location" class="location">{{ item.location }}</p>
                    <p class="description">{{ item.shortDescription || item.description }}</p>
                    <div v-if="item.price" class="price">
                        <span>Desde </span>
                        <strong>${{ item.price }}</strong>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="results.length > displayLimit" class="view-more">
            <button @click="viewAllResults" class="view-all-button">
                Ver todos los resultados ({{ results.length }})
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ResultsDisplay',
    props: {
        results: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            default: 'general'
        }
    },
    data() {
        return {
            displayLimit: 3 // Número de resultados a mostrar por defecto
        };
    },
    computed: {
        resultsTitle() {
            // Título según el tipo
            switch (this.type) {
                case 'accommodation':
                    return 'Alojamientos encontrados';
                case 'restaurant':
                    return 'Restaurantes recomendados';
                case 'tour':
                    return 'Tours y excursiones';
                case 'transport':
                    return 'Opciones de transporte';
                default:
                    return 'Resultados encontrados';
            }
        }
    },
    methods: {
        viewAllResults() {
            // Redirigir a la página de resultados completa
            const url = new URL('/results', window.location.origin);
            url.searchParams.append('type', this.type);

            // Navegar a la página de resultados
            window.location.href = url.toString();
        }
    }
};
</script>

<style scoped>
.results-display {
    margin: 30px 0;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.results-header h2 {
    font-size: 20px;
    color: #2c3e50;
    margin: 0;
}

.clear-button {
    background: none;
    border: none;
    color: #6c757d;
    font-size: 14px;
    cursor: pointer;
    text-decoration: underline;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 0;
}

.spinner {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
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
    padding: 30px 0;
    text-align: center;
    color: #6c757d;
}

.results-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.result-item {
    display: flex;
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
}

.result-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.result-image {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
}

.result-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.result-details {
    padding: 15px;
    flex: 1;
}

.result-details h3 {
    font-size: 18px;
    margin: 0 0 8px;
    color: #2c3e50;
}

.location {
    font-size: 14px;
    color: #6c757d;
    margin: 0 0 8px;
}

.description {
    font-size: 14px;
    color: #6c757d;
    margin: 0 0 10px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.price {
    font-size: 14px;
}

.price strong {
    font-size: 16px;
    color: #28a745;
}

.view-more {
    margin-top: 20px;
    text-align: center;
}

.view-all-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
}

@media (max-width: 768px) {
    .result-item {
        flex-direction: column;
    }

    .result-image {
        width: 100%;
        height: 180px;
    }
}
</style>