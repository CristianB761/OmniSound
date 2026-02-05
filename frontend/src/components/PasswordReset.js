import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './PasswordReset.css';

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

function PasswordReset() {
  const [email, setEmail] = useState(''); // Almacena el email ingresado
  const [code, setCode] = useState(''); // Almacena el código de verificación
  const [newPassword, setNewPassword] = useState(''); // Almacena la nueva contraseña
  const [isCodeSent, setIsCodeSent] = useState(false); // Indica si el código fue enviado
  const [isCodeValid, setIsCodeValid] = useState(null); // Estado de validación del código
  const [showPassword, setShowPassword] = useState(false); // Controla visibilidad de contraseña

  const navigate = useNavigate(); // Hook para navegación entre rutas

  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    document.title = "OmniSound - Restablecer contraseña";

    // Configurar tecla ESC para cerrar
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    // Agrega el event listener cuando el componente se monta
    document.addEventListener('keydown', handleKeyDown);

    // Limpia el event listener cuando el componente se desmonta
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Array vacío significa que solo se ejecuta una vez

  // Valida formato de email usando expresión regular
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Valida longitud del código (debe tener 6 dígitos)
  const isValidCode = (code) => {
    return code.length === 6;
  };

  // Valida longitud mínima de contraseña
  const isValidPassword = (password) => {
    return password.length >= 8;
  };

  // Maneja cambios en el campo de email
  const handleEmailChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    setEmail(value);

    // Resetea estado de código si email cambia
    if (isCodeSent) {
      setIsCodeSent(false);
    }
  };

  // Maneja cambios en el campo de código
  const handleCodeChange = (e) => {
    const value = e.target.value
      .replace(/\s/g, '')
      .replace(/\D/g, '')
      .slice(0, 6);
    setCode(value);

    // Resetea estado de validación
    if (isCodeValid !== null) {
      setIsCodeValid(null);
    }
  };

  // Maneja cambios en el campo de nueva contraseña
  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  // Alterna entre mostrar y ocultar la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Navega de regreso a la página de inicio de sesión
  const handleBack = () => {
    navigate('/signin');
  };

  // Cierra formulario y redirige a la página principal
  const handleClose = () => {
    navigate('/foryou');
  };

  // Envía código de verificación al servidor
  const handleSendCode = async () => {
    if (email && isValidEmail(email) && !isCodeSent) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/send-password-reset-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (response.ok) {
          setIsCodeSent(true);
        } else {
          const data = await response.json();
          console.error('Error al enviar código:', data.error);
        }
      } catch (error) {
        console.error('Error de red:', error);
      }
    }
  };

  // Verifica código con el servidor
  const handleVerifyCode = async () => {
    if (isValidCode(code)) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/verify-password-reset-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code })
        });

        const data = await response.json();

        if (response.ok) {
          setIsCodeValid(true);
        } else {
          setIsCodeValid(false);
        }
      } catch (error) {
        console.error('Error de red:', error);
        setIsCodeValid(false);
      }
    }
  };

  // Maneja el envío del formulario para restablecer contraseña
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/signin');
      } else {
        console.error('Error al restablecer contraseña:', data.error);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  // Verifica si todo el formulario es válido
  const isFormValid = isValidEmail(email) && 
                      isValidCode(code) && 
                      isValidPassword(newPassword) && 
                      isCodeValid === true;

  return (
    <div className="passwordreset-page">
      <div className="passwordreset-container">
        {/* Botón Volver con ícono */}
        <button 
          className="passwordreset-back-button"
          onClick={handleBack}
          type="button"
          data-tooltip="Volver"
        >
          <BackIcon className="back-icon" />
        </button>

        {/* Botón Cerrar con ícono */}
        <button 
          className="passwordreset-close-button"
          onClick={handleClose}
          type="button"
          data-tooltip="Cerrar"
        >
          <CloseIcon className="close-icon" />
        </button>

        {/* Título del formulario */}
        <h1 className="passwordreset-title">Restablecer contraseña</h1>
        <form onSubmit={handleSubmit} className="passwordreset-form" noValidate>

          {/* Grupo para email */}
          <div className="passwordreset-input-group">
            <span className="passwordreset-input-label">
              Correo electrónico:
            </span>
            {/* Input email */}
            <input
              type="text"
              className="passwordreset-input"
              value={email}
              onChange={handleEmailChange}
              placeholder="Ingrese su correo electrónico"
            />

            {/* Botón Enviar código */}
            <button
              type="button"
              className="passwordreset-send-button"
              onClick={handleSendCode}
              disabled={!email || !isValidEmail(email) || isCodeSent}
              data-tooltip={isCodeSent ? "Código enviado" : "Enviar código"}
            >
              {isCodeSent ? <SentIcon className="sent-icon" /> : <SendIcon className="send-icon" />}
            </button>
          </div>

          {/* Grupo para código de verificación */}
          <div className="passwordreset-input-group">
            <span className="passwordreset-input-label">
              Código de verificación:
            </span>
            {/* Input código de verificación */}
            <input
              type="text"
              className={`passwordreset-input ${isCodeValid === false ? 'invalid-code' : ''}`}
              value={code}
              onChange={handleCodeChange}
              placeholder="Ingrese los 6 dígitos"
              maxLength="6"
            />

            {/* Botón Validar código */}
            <button
              type="button"
              className="passwordreset-verify-button"
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

          {/* Grupo para nueva contraseña */}
          <div className="passwordreset-input-group">
            <span className="passwordreset-input-label">
              Nueva contraseña:
            </span>
            {/* Input nueva contraseña */}
            <input
              type={showPassword ? "text" : "password"}
              className="passwordreset-input"
              value={newPassword}
              onChange={handleNewPasswordChange}
              placeholder="Ingrese su nueva contraseña"
            />

            {/* Botón Mostrar/Ocultar contraseña */}
            <button
              type="button"
              className="passwordreset-visibility-button"
              onClick={togglePasswordVisibility}
              disabled={false}
              data-tooltip={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? <ShowPasswordIcon className="show-icon" /> : <HidePasswordIcon className="hide-icon" />}
            </button>
          </div>

          {/* Botón Restablecer contraseña */}
          <button
            type="submit"
            className={`passwordreset-submit-button ${isFormValid ? 'enabled' : 'disabled'}`}
            disabled={!isFormValid}
          >
            Restablecer contraseña
          </button>
        </form>

        {/* Enlace Crea tu cuenta */}
        <div className="passwordreset-footer">
          <span>¿No tienes una cuenta?</span>
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

export default PasswordReset;