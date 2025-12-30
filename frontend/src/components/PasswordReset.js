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

  // Función para enviar código de verificación
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
          console.log('Código de restablecimiento enviado.');
        } else {
          const data = await response.json();
          console.error('Error al enviar código:', data.error);
        }
      } catch (error) {
        console.error('Error de red:', error);
      }
    }
  };

  // Función para manejar cambios en el email
  const handleEmailChange = (e) => {
    const value = e.target.value.replace(/\s/g, ''); // Elimina espacios
    setEmail(value);
    // Si se modifica el email, vuelve al estado de "Enviar código"
    if (isCodeSent) {
      setIsCodeSent(false);
    }
  };

  // Función para manejar cambios en el código
  const handleCodeChange = (e) => {
    const value = e.target.value
      .replace(/\s/g, '') // Elimina espacios
      .replace(/\D/g, '') // Solo números
      .slice(0, 6); // Máximo 6 dígitos
    setCode(value);
    // Si se modifica el código, vuelve al estado de "Validar código"
    if (isCodeValid !== null) {
      setIsCodeValid(null);
    }
  };

  // Función para manejar cambios en la nueva contraseña
  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  // Función para validar código de verificación
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
          console.log('Código válido');
        } else {
          setIsCodeValid(false);
          console.log('Código no válido:', data.error);
        }
      } catch (error) {
        console.error('Error de red:', error);
        setIsCodeValid(false);
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

  // Función para restablecer contraseña
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
        console.log('Contraseña restablecida');
        // Redirigir a Inicia sesión
        navigate('/signin');
      } else {
        console.error('Error al restablecer contraseña:', data.error);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  // Determina si el formulario completo es válido
  const isFormValid = isValidEmail(email) && 
                      isValidCode(code) && 
                      isValidPassword(newPassword) && 
                      isCodeValid === true; // Código debe estar validado como verdadero

  return (
    <div className="passwordreset-page">
      <div className="passwordreset-container">

        {/* Botón Volver a signin con ícono */}
        <button 
          className="passwordreset-back-button"
          onClick={handleBack}
          type="button"
          data-tooltip="Volver"
        >
          <BackIcon className="back-icon" />
        </button>

        {/* Botón Cerrar formulario con ícono */}
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
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="passwordreset-form" noValidate>

          {/* Grupo de input para el email */}
          <div className="passwordreset-input-group">
            <span className="passwordreset-input-label">
              Correo electrónico:
            </span>
            <input
              type="text"
              className="passwordreset-input"
              value={email}
              onChange={handleEmailChange}
              placeholder="Ingrese su correo electrónico"
            />

            {/* Botón Enviar código - Cambia de ícono según el estado */}
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

          {/* Grupo de input para el código de verificación */}
          <div className="passwordreset-input-group">
            <span className="passwordreset-input-label">
              Código de verificación:
            </span>
            <input
              type="text"
              className={`passwordreset-input ${isCodeValid === false ? 'invalid-code' : ''}`}
              value={code}
              onChange={handleCodeChange}
              placeholder="Ingrese los 6 dígitos"
              maxLength="6"
            />

            {/* Botón de Validación - Cambia de ícono según el resultado */}
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

          {/* Grupo de input para la contraseña */}
          <div className="passwordreset-input-group">
            <span className="passwordreset-input-label">
              Nueva contraseña:
            </span>
            <input
              type={showPassword ? "text" : "password"} // Cambia el tipo según la visibilidad
              className="passwordreset-input"
              value={newPassword}
              onChange={handleNewPasswordChange}
              placeholder="Ingrese su nueva contraseña"
            />

            {/* Botón de visibilidad */}
            <button
              type="button" // Para que no envíe el formulario
              className="passwordreset-visibility-button"
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
            className={`passwordreset-submit-button ${isFormValid ? 'enabled' : 'disabled'}`}
            disabled={!isFormValid} // Deshabilitado cuando el formulario no es válido
          >
            Restablecer contraseña
          </button>
        </form>

        {/* Pie de página */}
        <div className="passwordreset-footer">
          <span>¿No tienes una cuenta?</span>
          {/* Link de Crea tu cuenta */}
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