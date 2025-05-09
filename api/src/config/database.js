// src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de conexión a la base de datos MySQL existente
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dbV2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión a la base de datos establecida correctamente.');
        connection.release();
        return true;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        return false;
    }
};

module.exports = {
    pool,
    testConnection
};