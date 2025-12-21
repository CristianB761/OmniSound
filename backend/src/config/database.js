const mysql = require('mysql2');
require('dotenv').config();

// Crear pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'OmniSoundDB',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Probar la conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a MySQL:', err.message);
        console.log('Configuración usada:');
        console.log('Host:', process.env.DB_HOST || 'localhost');
        console.log('User:', process.env.DB_USER || 'root');
        console.log('Database:', process.env.DB_NAME || 'OmniSoundDB');
        
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('Problema con usuario/contraseña');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('La base de datos no existe');
            console.log('Solución: Ejecuta CREATE DATABASE OmniSoundDB; en MySQL');
        } else if (err.code === 'ECONNREFUSED') {
            console.log('MySQL no está corriendo');
        }
        process.exit(1);
    } else {
        console.log('Conectado a MySQL - Base de datos:', process.env.DB_NAME || 'OmniSoundDB');
        connection.release();
    }
});

// Exportar para usar promesas
const promisePool = pool.promise();

module.exports = {
    pool,
    promisePool
};