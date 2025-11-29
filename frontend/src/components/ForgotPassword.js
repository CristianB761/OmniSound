import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ForgotPassword.css';

// Importar iconos como componentes React
import { ReactComponent as CloseIcon } from '../icons/CloseIcon.svg';
import { ReactComponent as BackIcon } from '../icons/BackIcon.svg';
import { ReactComponent as SendIcon } from '../icons/SendIcon.svg';
import { ReactComponent as SentIcon } from '../icons/SentIcon.svg';
import { ReactComponent as ValidateIcon } from '../icons/ValidateIcon.svg';
import { ReactComponent as ValidIcon } from '../icons/ValidIcon.svg';
import { ReactComponent as InvalidIcon } from '../icons/InvalidIcon.svg';
import { ReactComponent as ShowPasswordIcon } from '../icons/ShowPasswordIcon.svg';
import { ReactComponent as HidePasswordIcon } from '../icons/HidePasswordIcon.svg';

function ForgotPassword() {
  const [email, setEmail] = useState(''); // Almacena el email ingresado
  const [code, setCode] = useState(''); // Almacena el código de verificación ingresado
  const [newPassword, setNewPassword] = useState(''); // Almacena la nueva contraseña ingresada
  const [isCodeSent, setIsCodeSent] = useState(false); // Indica si el código fue enviado
  const [isCodeValid, setIsCodeValid] = useState(null); //Estado de validación: null = validar, true = válido, false = no válido
  const [showPassword, setShowPassword] = useState(false); // Indica si se muestra la contraseña

  const navigate = useNavigate(); // Hook para navegar entre rutas

  // Efecto para manejar el título de la pestaña y el shortcut de teclado
  useEffect(() => {
    // Cambia el título de la pestaña del navegador cuando el componente se monta
    document.title = "OmniSound - Restablecer contraseña";

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose(); // ESC: Cierra el formulario
      }
    };
    // Agrega el event listener cuando el componente se monta
    document.addEventListener('keydown', handleKeyDown);
    // Limpia el event listener cuando el componente se desmonta
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Array vacío significa que solo se ejecuta una vez

  // Valida el formato del email usando una expresión regular
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Valida que el código tenga exactamente 6 dígitos
  const isValidCode = (code) => {
    return code.length === 6;
  };

  // Valida que la contraseña tenga al menos 8 caracteres
  const isValidPassword = (password) => {
    return password.length >= 8;
  };

  // Simula el envío del código de verificación por email
  const handleSendCode = () => {
    if (email && isValidEmail(email) && !isCodeSent) {
      setIsCodeSent(true);
      console.log('Código enviado a:', email);
      // Aquí iría la lógica real de verificación con el backend
    }
  };

  // Función para manejar cambios en el email
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Si se modifica el email, vuelve al estado de "Enviar código"
    if (isCodeSent) {
      setIsCodeSent(false);
    }
  };

  // Función para manejar cambios en el código
  const handleCodeChange = (e) => {
    const newCode = e.target.value.replace(/\D/g, '').slice(0, 6); // Solo números, máximo 6
    setCode(newCode);
    // Si se modifica el código, vuelve al estado de "Validar código"
    if (isCodeValid !== null) {
      setIsCodeValid(null);
    }
  };

  // Simula la validación del código de verificación
  const handleVerifyCode = () => {
    if (isValidCode(code)) {
      // Simulación: Código válido es "123456"
      if (code === '123456') { // Código de prueba
        setIsCodeValid(true);
        console.log('Código válido');
      } else {
        setIsCodeValid(false);
        console.log('Código no válido');
      }
    }
  };

  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Función para redirigir al formulario inicia sesión
  const handleBack = () => {
    navigate('/signin');
  };

  // Función para redirigir a la página principal
  const handleClose = () => {
    navigate('/foryou');
  };

  // Maneja el envío del formulario
  const handleSubmit = (event) => {
    event.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    console.log('Contraseña restablecida');
    // Aquí iría la lógica real de restablecimiento con el backend
    // Por ahora solo redirige al formulario de inicia sesión
    navigate('/signin');
  };

  // Determina si el formulario completo es válido
  const isFormValid = isValidEmail(email) && 
                      isValidCode(code) && 
                      isValidPassword(newPassword) && 
                      isCodeValid === true; // Código debe estar validado como verdadero

  return (
    <div className="forgotpassword-page">
      <div className="forgotpassword-container">

        {/* Botón Volver a signin con ícono */}
        <button 
          className="forgot-back-button"
          onClick={handleBack}
          type="button"
          data-tooltip="Volver"
        >
          <BackIcon className="back-icon" />
        </button>

        {/* Botón Cerrar formulario con ícono */}
        <button 
          className="forgot-close-button"
          onClick={handleClose}
          type="button"
          data-tooltip="Cerrar"
        >
          <CloseIcon className="close-icon" />
        </button>

        {/* Título del formulario */}
        <h1 className="forgotpassword-title">Restablecer contraseña</h1>
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="forgotpassword-form" noValidate>

          {/* Grupo de input para el email */}
          <div className="forgot-input-group">
            <span className="forgot-input-label">
              Correo electrónico:
            </span>
            <input
              type="text"
              className="forgot-input"
              value={email}
              onChange={handleEmailChange}
              placeholder="Ingrese su correo electrónico"
            />

            {/* Botón Enviar código - Cambia de ícono según el estado */}
            <button
              type="button"
              className="forgot-send-button"
              onClick={handleSendCode}
              disabled={!email || !isValidEmail(email) || isCodeSent}
              data-tooltip={isCodeSent ? "Código enviado" : "Enviar código"}
            >
              {isCodeSent ? <SentIcon className="sent-icon" /> : <SendIcon className="send-icon" />}
            </button>
          </div>

          {/* Grupo de input para el código de verificación */}
          <div className="forgot-input-group">
            <span className="forgot-input-label">
              Código de verificación:
            </span>
            <input
              type="text"
              className={`forgot-input ${isCodeValid === false ? 'invalid-code' : ''}`}
              value={code}
              onChange={handleCodeChange}
              placeholder="Ingrese los 6 dígitos"
              maxLength="6"
            />

            {/* Botón de Validación - Cambia de ícono según el resultado */}
            <button
              type="button"
              className="forgot-verify-button"
              onClick={handleVerifyCode}
              disabled={!isValidCode(code) || isCodeValid !== null}
              data-tooltip={
                isCodeValid === null ? "Validar código" : 
                isCodeValid ? "Código válido" : "Código no válido"
              }
            >
              {isCodeValid === null ? <ValidateIcon className="validate-icon" /> : (isCodeValid ? <ValidIcon className="valid-icon" /> : <InvalidIcon className="invalid-icon" />)}
            </button>
          </div>

          {/* Grupo de input para la contraseña */}
          <div className="forgot-input-group">
            <span className="forgot-input-label">
              Nueva contraseña:
            </span>
            <input
              type={showPassword ? "text" : "password"}
              className="forgot-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ingrese su nueva contraseña"
            />

            {/* Botón de visibilidad */}
            <button
              type="button"
              className="forgot-visibility-button"
              onClick={togglePasswordVisibility}
              disabled={false}
              data-tooltip={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? <ShowPasswordIcon className="show-icon" /> : <HidePasswordIcon className="hide-icon" />}
            </button>
          </div>

          {/* Botón Restablecer constraseña - Se habilita solo cuando es válido */}
          <button
            type="submit"
            className={`forgot-submit-button ${isFormValid ? 'enabled' : 'disabled'}`}
            disabled={!isFormValid}
          >
            Restablecer contraseña
          </button>
        </form>

        {/* Pie de página */}
        <div className="forgot-footer">
          <span>¿No tienes una cuenta?</span>
          {/* Link Crea tu cuenta */}
          <Link 
            to="/signup" 
            className="signup-link"
          >
            Crea tu cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;