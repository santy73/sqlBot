// src/store/index.js
import { createStore } from 'vuex';
import chat from './chat';
import bookings from './bookings';

export default createStore({
    state: {
        locale: 'es',
        isLoading: false,
        error: null
    },
    mutations: {
        SET_LOADING(state, isLoading) {
            state.isLoading = isLoading;
        },
        SET_ERROR(state, error) {
            state.error = error;
        },
        SET_LOCALE(state, locale) {
            state.locale = locale;
        }
    },
    actions: {
        setLoading({ commit }, isLoading) {
            commit('SET_LOADING', isLoading);
        },
        setError({ commit }, error) {
            commit('SET_ERROR', error);
        },
        setLocale({ commit }, locale) {
            commit('SET_LOCALE', locale);
            localStorage.setItem('locale', locale);
        }
    },
    getters: {
        isLoading: state => state.isLoading,
        hasError: state => state.error !== null,
        errorMessage: state => state.error,
        currentLocale: state => state.locale
    },
    modules: {
        chat,
        bookings
    }
});