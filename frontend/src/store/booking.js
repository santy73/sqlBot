// src/store/bookings.js
import bookingService from '@/services/bookingService';

export default {
    namespaced: true,
    state: {
        searchResults: [],
        currentItem: null,
        searchFilters: {},
        recentSearches: [],
        generatedUrl: null,
        loadingResults: false,
        error: null
    },
    mutations: {
        SET_SEARCH_RESULTS(state, results) {
            state.searchResults = results;
        },
        SET_CURRENT_ITEM(state, item) {
            state.currentItem = item;
        },
        SET_SEARCH_FILTERS(state, filters) {
            state.searchFilters = filters;
        },
        ADD_RECENT_SEARCH(state, search) {
            // Mantener solo las 5 búsquedas más recientes
            state.recentSearches = [search, ...state.recentSearches.slice(0, 4)];
        },
        SET_GENERATED_URL(state, url) {
            state.generatedUrl = url;
        },
        SET_LOADING_RESULTS(state, loading) {
            state.loadingResults = loading;
        },
        SET_ERROR(state, error) {
            state.error = error;
        }
    },
    actions: {
        async searchBookingOptions({ commit, state }, { type, filters = {} }) {
            commit('SET_LOADING_RESULTS', true);
            commit('SET_ERROR', null);

            try {
                const response = await bookingService.getBookingOptions(type, filters);
                commit('SET_SEARCH_RESULTS', response.data.results || []);
                commit('SET_SEARCH_FILTERS', filters);

                // Guardar búsqueda reciente
                commit('ADD_RECENT_SEARCH', {
                    type,
                    filters,
                    timestamp: new Date().toISOString(),
                    resultCount: response.data.results.length
                });

                return response.data;
            } catch (error) {
                commit('SET_ERROR', error.message || 'Error al buscar opciones');
                commit('SET_SEARCH_RESULTS', []);
                throw error;
            } finally {
                commit('SET_LOADING_RESULTS', false);
            }
        },

        async getItemDetails({ commit }, { type, id }) {
            commit('SET_ERROR', null);

            try {
                const response = await bookingService.getItemDetails(type, id);
                commit('SET_CURRENT_ITEM', response.data.item);
                return response.data.item;
            } catch (error) {
                commit('SET_ERROR', error.message || 'Error al obtener detalles');
                commit('SET_CURRENT_ITEM', null);
                throw error;
            }
        },

        async generateBookingURL({ commit }, params) {
            commit('SET_ERROR', null);

            try {
                const response = await bookingService.generateBookingURL(params);
                commit('SET_GENERATED_URL', response.data.url);
                return response.data.url;
            } catch (error) {
                commit('SET_ERROR', error.message || 'Error al generar URL');
                commit('SET_GENERATED_URL', null);
                throw error;
            }
        },

        async checkAvailability({ commit }, params) {
            commit('SET_ERROR', null);

            try {
                const response = await bookingService.checkAvailability(params);
                return response.data.availability;
            } catch (error) {
                commit('SET_ERROR', error.message || 'Error al verificar disponibilidad');
                throw error;
            }
        },

        clearSearchResults({ commit }) {
            commit('SET_SEARCH_RESULTS', []);
        },

        clearCurrentItem({ commit }) {
            commit('SET_CURRENT_ITEM', null);
        }
    },
    getters: {
        hasSearchResults: state => state.searchResults.length > 0,
        resultCount: state => state.searchResults.length,
        searchResults: state => state.searchResults,
        currentItem: state => state.currentItem,
        currentFilters: state => state.searchFilters,
        recentSearches: state => state.recentSearches,
        generatedUrl: state => state.generatedUrl,
        isLoading: state => state.loadingResults,
        hasError: state => !!state.error,
        errorMessage: state => state.error
    }
};