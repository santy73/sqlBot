<template>
    <div id="app">
        <header class="header">
            <div class="logo">
                <img src="/assets/images/logo.png" alt="SamanaInn Logo" />
            </div>
            <nav class="nav">
                <ul>
                    <li><a href="https://samanainn.com">Inicio</a></li>
                    <li><a href="https://samanainn.com/hotels">Alojamientos</a></li>
                    <li><a href="https://samanainn.com/restaurants">Restaurantes</a></li>
                    <li><a href="https://samanainn.com/tours">Excursiones</a></li>
                    <li><a href="https://samanainn.com/blog">Blog</a></li>
                </ul>
            </nav>
            <div class="language-switcher">
                <button @click="changeLanguage('es')" :class="{ active: currentLanguage === 'es' }">ES</button>
                <button @click="changeLanguage('en')" :class="{ active: currentLanguage === 'en' }">EN</button>
            </div>
        </header>

        <main class="main">
            <div class="chat-container">
                <h1>{{ translations.title }}</h1>
                <p class="subtitle">{{ translations.subtitle }}</p>

                <ChatInterface ref="chatInterface" />
            </div>
        </main>

        <footer class="footer">
            <div class="footer-content">
                <div class="footer-logo">
                    <img src="/assets/images/logo.png" alt="SamanaInn Logo" />
                    <p>{{ translations.footerTagline }}</p>
                </div>

                <div class="footer-links">
                    <h3>{{ translations.quickLinks }}</h3>
                    <ul>
                        <li><a href="https://samanainn.com/about">{{ translations.about }}</a></li>
                        <li><a href="https://samanainn.com/contact">{{ translations.contact }}</a></li>
                        <li><a href="https://samanainn.com/faq">{{ translations.faq }}</a></li>
                        <li><a href="https://samanainn.com/terms">{{ translations.terms }}</a></li>
                        <li><a href="https://samanainn.com/privacy">{{ translations.privacy }}</a></li>
                    </ul>
                </div>

                <div class="footer-social">
                    <h3>{{ translations.followUs }}</h3>
                    <div class="social-icons">
                        <a href="https://facebook.com/samanainn" target="_blank" rel="noopener"><i
                                class="icon-facebook"></i></a>
                        <a href="https://instagram.com/samanainn" target="_blank" rel="noopener"><i
                                class="icon-instagram"></i></a>
                        <a href="https://twitter.com/samanainn" target="_blank" rel="noopener"><i
                                class="icon-twitter"></i></a>
                    </div>
                </div>

                <div class="footer-contact">
                    <h3>{{ translations.contactUs }}</h3>
                    <p><i class="icon-map-marker"></i> Samaná, República Dominicana</p>
                    <p><i class="icon-phone"></i> +1 (809) 123-4567</p>
                    <p><i class="icon-envelope"></i> info@samanainn.com</p>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; 2025 SamanaInn. {{ translations.allRightsReserved }}</p>
            </div>
        </footer>
    </div>
</template>

<script>
import ChatInterface from './components/ChatInterface.vue';

export default {
    name: 'App',
    components: {
        ChatInterface
    },

    data() {
        return {
            currentLanguage: 'es',
            translations: {
                // Español por defecto
                title: 'Asistente Virtual de SamanaInn',
                subtitle: 'Tu guía personal para descubrir lo mejor de Samaná',
                footerTagline: 'Tu destino para descubrir Samaná',
                quickLinks: 'Enlaces rápidos',
                about: 'Sobre nosotros',
                contact: 'Contacto',
                faq: 'Preguntas frecuentes',
                terms: 'Términos de uso',
                privacy: 'Política de privacidad',
                followUs: 'Síguenos',
                contactUs: 'Contáctanos',
                allRightsReserved: 'Todos los derechos reservados'
            },
            translations_en: {
                // Inglés
                title: 'SamanaInn Virtual Assistant',
                subtitle: 'Your personal guide to discover the best of Samaná',
                footerTagline: 'Your destination to discover Samaná',
                quickLinks: 'Quick Links',
                about: 'About us',
                contact: 'Contact',
                faq: 'FAQ',
                terms: 'Terms of use',
                privacy: 'Privacy policy',
                followUs: 'Follow us',
                contactUs: 'Contact us',
                allRightsReserved: 'All rights reserved'
            }
        };
    },

    mounted() {
        // Detectar idioma preferido del navegador o de localStorage
        this.detectPreferredLanguage();
    },

    methods: {
        changeLanguage(lang) {
            this.currentLanguage = lang;

            if (lang === 'en') {
                this.translations = this.translations_en;
            } else {
                // Restaurar traducciones por defecto (español)
                this.translations = {
                    title: 'Asistente Virtual de SamanaInn',
                    subtitle: 'Tu guía personal para descubrir lo mejor de Samaná',
                    footerTagline: 'Tu destino para descubrir Samaná',
                    quickLinks: 'Enlaces rápidos',
                    about: 'Sobre nosotros',
                    contact: 'Contacto',
                    faq: 'Preguntas frecuentes',
                    terms: 'Términos de uso',
                    privacy: 'Política de privacidad',
                    followUs: 'Síguenos',
                    contactUs: 'Contáctanos',
                    allRightsReserved: 'Todos los derechos reservados'
                };
            }

            // Guardar preferencia en localStorage
            localStorage.setItem('samanainn_language', lang);
        },

        detectPreferredLanguage() {
            // Comprobar si hay una preferencia guardada
            const savedLang = localStorage.getItem('samanainn_language');

            if (savedLang) {
                this.changeLanguage(savedLang);
                return;
            }

            // Detectar idioma del navegador
            const browserLang = navigator.language || navigator.userLanguage;

            if (browserLang && browserLang.toLowerCase().includes('en')) {
                this.changeLanguage('en');
            } else {
                // Por defecto, español
                this.changeLanguage('es');
            }
        }
    }
};
</script>

<style>
/* Reset básico */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
}

/* Layout principal */
#app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* Header */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.logo img {
    height: 50px;
}

.nav ul {
    display: flex;
    list-style: none;
}

.nav li {
    margin: 0 15px;
}

.nav a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    font-size: 16px;
    transition: color 0.3s;
}

.nav a:hover {
    color: #3498db;
}

.language-switcher {
    display: flex;
}

.language-switcher button {
    background: none;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #666;
}

.language-switcher button.active {
    color: #3498db;
    font-weight: 700;
}

/* Main content */
.main {
    flex: 1;
    padding: 40px 20px;
}

.chat-container {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
}

h1 {
    font-size: 32px;
    margin-bottom: 10px;
    color: #2c3e50;
}

.subtitle {
    font-size: 18px;
    color: #7f8c8d;
    margin-bottom: 40px;
}

/* Footer */
.footer {
    background-color: #2c3e50;
    color: #ecf0f1;
    padding-top: 40px;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    padding: 0 20px 40px;
}

.footer-logo img {
    height: 60px;
    margin-bottom: 15px;
}

.footer-logo p {
    font-size: 14px;
    line-height: 1.4;
}

.footer h3 {
    font-size: 18px;
    margin-bottom: 15px;
    color: #3498db;
}

.footer-links ul {
    list-style: none;
}

.footer-links li {
    margin-bottom: 10px;
}

.footer-links a {
    text-decoration: none;
    color: #ecf0f1;
    transition: color 0.3s;
}

.footer-links a:hover {
    color: #3498db;
}

.social-icons {
    display: flex;
    gap: 15px;
}

.social-icons a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: #34495e;
    border-radius: 50%;
    color: #ecf0f1;
    text-decoration: none;
    transition: background-color 0.3s;
}

.social-icons a:hover {
    background-color: #3498db;
}

.footer-contact p {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.footer-contact i {
    margin-right: 10px;
    color: #3498db;
}

.footer-bottom {
    background-color: #1a252f;
    padding: 20px;
    text-align: center;
    font-size: 14px;
}

/* Iconos (se reemplazarían por una biblioteca como Font Awesome) */
[class^="icon-"] {
    font-family: "Font Awesome 5 Free";
    font-weight: 900;
}

.icon-facebook::before {
    content: "\f39e";
}

.icon-instagram::before {
    content: "\f16d";
}

.icon-twitter::before {
    content: "\f099";
}

.icon-map-marker::before {
    content: "\f3c5";
}

.icon-phone::before {
    content: "\f095";
}

.icon-envelope::before {
    content: "\f0e0";
}

/* Responsive */
@media (max-width: 768px) {
    .header {
        flex-direction: column;
        padding: 15px;
    }

    .logo {
        margin-bottom: 15px;
    }

    .nav ul {
        flex-wrap: wrap;
        justify-content: center;
    }

    .nav li {
        margin: 5px 10px;
    }

    .language-switcher {
        margin-top: 15px;
    }

    h1 {
        font-size: 28px;
    }

    .subtitle {
        font-size: 16px;
        margin-bottom: 30px;
    }

    .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .footer-logo {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .social-icons {
        justify-content: center;
    }

    .footer-contact p {
        justify-content: center;
    }
}
</style>