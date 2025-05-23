// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { testConnection } = require('./config/database');
const chatRoutes = require('./routes/chatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const bannerRoutes = require('./routes/bannerRoutes');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logging

// Rutas
app.use('/api/chat', chatRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/banner', bannerRoutes);

// Ruta de verificación de salud
app.get('/health', async (req, res) => {
    const dbConnected = await testConnection();
    res.status(200).json({
        status: 'ok',
        dbConnected,
        timestamp: new Date().toISOString()
    });
});

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Bienvenido a la API de SamanaInn Chat',
        version: '1.0.0',
        documentation: '/api-docs'
    });
});

// Manejador de errores
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err);
    res.status(500).json({
        success: false,
        error: 'Error del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Manejador de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

// Iniciar servidor
const startServer = async () => {
    try {
        // Probar conexión a la base de datos
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.warn('La aplicación se iniciará sin conexión a la base de datos');
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`Servidor iniciado en http://localhost:${PORT}`);
            console.log(`Estado de la base de datos: ${dbConnected ? 'Conectada' : 'No conectada'}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Iniciar servidor si es el archivo principal
if (require.main === module) {
    startServer();
}

module.exports = app;