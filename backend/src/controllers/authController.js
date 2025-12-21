const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  // 1. ENVIAR CÓDIGO DE VERIFICACIÓN
  sendCode: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'El email es requerido' });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El formato del email no es válido' });
      }

      // Verificar si el email ya está registrado
      const existingUser = await User.findByEmail(email);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Generar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Guardar en base de datos (expira en 10 minutos)
      await User.saveVerificationCode(email, code);

      // Mostramos el código en consola
      console.log(`\nCódigo de verificación para ${email}: ${code}`);

      res.json({ 
        success: true,
        message: 'Código de verificación enviado' 
      });
    } catch (error) {
      console.error('Error en sendCode:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // 2. VERIFICAR CÓDIGO
  verifyCode: async (req, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ error: 'Email y código son requeridos' });
      }

      // Verificar el código
      const verification = await User.verifyCode(email, code);

      if (verification.length === 0) {
        return res.status(400).json({ error: 'Código no válido o expirado' });
      }

      res.json({ 
        success: true,
        message: 'Código verificado correctamente'
      });
    } catch (error) {
      console.error('Error al verificar código:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // 3. REGISTRAR USUARIO
  register: async (req, res) => {
    try {
      const { email, password, day, month, year, code } = req.body;

      // Validar campos requeridos
      if (!email || !password || !day || !month || !year || !code) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El formato del email no es válido' });
      }

      // Validar contraseña (mínimo 8 caracteres)
      if (password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
      }

      // Validar código de 6 dígitos
      if (code.length !== 6) {
        return res.status(400).json({ error: 'El código debe tener 6 dígitos' });
      }

      // Verificar el código antes de registrar
      const verification = await User.verifyCode(email, code);
      if (verification.length === 0) {
        return res.status(400).json({ error: 'Código de verificación no válido o expirado' });
      }

      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Generar username automático (email sin dominio)
      const username = email.split('@')[0];

      // Verificar si el username ya existe
      const existingUsername = await User.findByUsername(username);
      if (existingUsername.length > 0) {
        // Si el username existe, agregar números aleatorios
        const randomNum = Math.floor(Math.random() * 1000);
        username = `${username}${randomNum}`;
      }

      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Formatear fecha de nacimiento
      const birth_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // Crear usuario
      const result = await User.create({
        email,
        username,
        password_hash,
        birth_date
      });

      console.log(`\n===================================`);
      console.log(`USUARIO REGISTRADO`);
      console.log(`ID: ${result.insertId}`);
      console.log(`Email: ${email}`);
      console.log(`Username: ${username}`);
      console.log(`Fecha de nacimiento: ${birth_date}`);
      console.log(`===================================\n`);

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: result.insertId, 
          email: email,
          username: username 
        },
        process.env.JWT_SECRET || 'omnisound_dev_secret_key_2024',
        { expiresIn: '7d' }
      );

      // Eliminar el código de verificación después de usarlo
      await User.deleteVerificationCode(email);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        token: token,
        user: {
          id: result.insertId,
          email: email,
          username: username,
          birth_date: birth_date
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = authController;