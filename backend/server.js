const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { promisePool } = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const songRoutes = require('./src/routes/songRoutes');

const app = express();

// Configurar CORS para aceptar peticiones del frontend
app.use(cors({
  origin: 'http://localhost:3000', // URL de tu frontend
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

const path = require('path');

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Usar rutas de autenticación
app.use('/api/auth', authRoutes);

// Usar rutas de perfil
app.use('/api/profile', profileRoutes);

// Usar rutas de canciones
app.use('/api/songs', songRoutes);

// Servir archivos de audios e imágenes de canciones
app.use('/uploads/audios', express.static(path.join(__dirname, 'uploads/audios')));
app.use('/uploads/song-images', express.static(path.join(__dirname, 'uploads/song-images')));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend de OmniSound funcionando!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health'
    }
  });
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Puerto
const PORT = process.env.PORT || 5000;

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.url,
    method: req.method
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Contacta al administrador'
  });
});

app.listen(PORT, async () => {
    try {
        // Verificar conexión a DB
        const [rows] = await promisePool.query('SELECT 1');
        console.log('Base de datos conectada');

        console.log(`\n===================================`);
        console.log(`Servidor backend iniciado`);
        console.log(`URL: http://localhost:${PORT}`);
        console.log(`Health: http://localhost:${PORT}/api/health`);
        console.log(`Entorno: ${process.env.NODE_ENV}`);
        console.log(`===================================`);
    } catch (error) {
        console.error('Error conectando a la base de datos:', error.message);
        process.exit(1);
    }
});