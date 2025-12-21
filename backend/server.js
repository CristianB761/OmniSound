const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const { promisePool } = require('./src/config/database');

const app = express();

// Configurar CORS para aceptar peticiones del frontend
app.use(cors({
  origin: 'http://localhost:3000', // URL de tu frontend
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Usar rutas de autenticación
app.use('/api/auth', authRoutes);

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

app.listen(PORT, () => {
  console.log(`===================================`);
  console.log(`Servidor backend iniciado`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`===================================`);
});