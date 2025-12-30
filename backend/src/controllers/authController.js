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

      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'El email ya está en uso' });
      }

      // Generar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Guardar en base de datos (expira en 10 minutos)
      await User.saveVerificationCode(email, code);

      // Mostrar en consola
      console.log(`\nCódigo de verificación para ${email}: ${code}`);

      res.json({ 
        success: true,
        message: 'Código de verificación enviado' 
      });
    } catch (error) {
      console.error('Error al enviar código:', error);
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

  // 3. CREAR CUENTA (SIGNUP)
  signup: async (req, res) => {
    try {
      const { email, password, day, month, year, code } = req.body;

      // Validar inputs requeridos
      if (!email || !password || !day || !month || !year || !code) {
        return res.status(400).json({ error: 'Todos los inputs son obligatorios' });
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

      // Verificar el código antes de crear la cuenta
      const verification = await User.verifyCode(email, code);
      if (verification.length === 0) {
        return res.status(400).json({ error: 'Código de verificación no válido o expirado' });
      }

      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'El email ya está en uso' });
      }

      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Formatear fecha de nacimiento
      const birth_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // Crear cuenta
      const result = await User.create({
        email,
        password_hash,
        birth_date
      });

      console.log(`\n===================================`);
      console.log(`CUENTA CREADA`);
      console.log(`ID: ${result.insertId}`);
      console.log(`Email: ${email}`);
      console.log(`Username: ${result.username}`);
      console.log(`Fecha de nacimiento:${birth_date}`);
      console.log(`===================================`);

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: result.insertId, 
          email: email,
          username: result.username 
        },
        process.env.JWT_SECRET || 'omnisound_dev_secret_key_2024',
        { expiresIn: '7d' }
      );

      // Eliminar el código de verificación después de usarlo
      await User.deleteVerificationCode(email);

      res.status(201).json({
        success: true,
        message: 'Cuenta creada',
        token: token,
        user: {
          id: result.insertId,
          email: email,
          username: result.username,
          birth_date: birth_date
        }
      });

    } catch (error) {
      console.error('Error al crear cuenta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // 4. INICIAR SESIÓN (SIGNIN)
  signin: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validar inputs requeridos
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El formato del email no es válido' });
      }

      // Buscar usuario por email
      const users = await User.findByEmail(email);
      if (users.length === 0) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      const user = users[0];

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          username: user.username 
        },
        process.env.JWT_SECRET || 'omnisound_dev_secret_key_2024',
        { expiresIn: '7d' }
      );

      console.log(`\n===================================`);
      console.log(`SESIÓN INICIADA`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Username: ${user.username}`);
      console.log(`===================================`);

      res.json({
        success: true,
        message: 'Sesión iniciada',
        token: token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          birth_date: user.birth_date,
        }
      });

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // 5. ENVIAR CÓDIGO PARA RESTABLECER CONTRASEÑA
  sendPasswordResetCode: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'El email es requerido' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El formato del email no es válido' });
      }

      // Verificar si el email existe en el sistema
      const existingUser = await User.findByEmail(email);
      if (existingUser.length === 0) {
        return res.status(404).json({ error: 'Email no encontrado' });
      }

      // Generar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Guardar en la tabla password_resets (expira en 1 hora)
      await User.savePasswordResetToken(email, code);

      // Mostrar en consola
      console.log(`\nCódigo de restablecimiento para ${email}: ${code}`);

      res.json({
        success: true,
        message: 'Código de restablecimiento enviado'
      });

    } catch (error) {
      console.error('Error al enviar código de restablecimiento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // 6. VERIFICAR CÓDIGO DE RESTABLECIMIENTO
  verifyPasswordResetCode: async (req, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ error: 'Email y código son requeridos' });
      }

      // Verificar el código
      const verification = await User.verifyPasswordResetToken(email, code);

      if (verification.length === 0) {
        return res.status(400).json({ error: 'Código no válido o expirado' });
      }

      res.json({
        success: true,
        message: 'Código verificado correctamente'
      });

    } catch (error) {
      console.error('Error al verificar código de restablecimiento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // 7. RESTABLECER CONTRASEÑA (PASSWORDRESET)
  resetPassword: async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El formato del email no es válido' });
      }

      // Validar longitud de contraseña
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
      }

      // Verificar el código antes de restablecer
      const verification = await User.verifyPasswordResetToken(email, code);
      if (verification.length === 0) {
        return res.status(400).json({ error: 'Código de restablecimiento no válido o expirado' });
      }

      // Encriptar nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);

      // Actualizar contraseña en la base de datos
      await User.updatePassword(email, password_hash);

      // Eliminar el token después de usarlo
      await User.deletePasswordResetToken(email);

      console.log(`\n===================================`);
      console.log(`CONTRASEÑA RESTABLECIDA`);
      console.log(`Email: ${email}`);
      console.log(`===================================`);

      res.json({
        success: true,
        message: 'Contraseña restablecida'
      });

    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = authController;