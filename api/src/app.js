// src/app.js (actualizado con autenticación)
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { testConnection } = require('./config/database');
const { apiAuth } = require('./middleware/auth');
const chatRoutes = require('./routes/chatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const bannerRoutes = require('./routes/bannerRoutes');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
    origin: 'https://samanainn.com',
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'X-API-Key'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(morgan('dev')); // Logging
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite por IP
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', apiLimiter);

const compression = require('compression');
app.use(compression());


// Ruta de verificación de salud (sin autenticación)
app.get('/health', async (req, res) => {
    const dbConnected = await testConnection();
    res.status(200).json({
        status: 'ok',
        dbConnected,
        timestamp: new Date().toISOString()
    });
});

// Ruta de bienvenida (sin autenticación)
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Bienvenido a la API de SamanaInn Chat',
        version: '1.0.0',
        documentation: '/api-docs'
    });
});

// Rutas protegidas con autenticación API Key
app.use('/api/chat', apiAuth, chatRoutes);
app.use('/api/booking', apiAuth, bookingRoutes);
app.use('/api/banner', apiAuth, bannerRoutes);

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