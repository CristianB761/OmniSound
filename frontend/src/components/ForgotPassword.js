import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const navigate = useNavigate();

  // Función para manejar el envío del formulario completo
  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para restablecer contraseña aquí
    console.log('Contraseña restablecida');
    // Redirigir al login después del restablecimiento
    navigate('/login');
  };

  // Función para enviar el código de verificación
  const handleSendCode = (e) => {
    e.preventDefault();
    if (email) {
      // Lógica para enviar código aquí
      console.log('Código enviado a:', email);
      setIsCodeSent(true);
    }
  };

  // Función para verificar el código
  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (code.length === 6) {
      // Lógica para verificar código aquí
      console.log('Código verificado');
      setIsCodeVerified(true);
    }
  };

  // Función para cerrar y volver a la sección "Para ti"
  const handleClose = () => {
    navigate('/'); // Redirige a la página principal (sección "Para ti")
  };

  // Efecto para manejar la tecla "esc"
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    // Agregar event listener
    document.addEventListener('keydown', handleKeyDown);

    // Limpiar event listener al desmontar
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Validar si el formulario completo está listo para enviar
  const isFormValid = email && code.length === 6 && newPassword.length >= 6;

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        {/* Botón de cerrar */}
        <button 
          className="forgot-close-btn tooltip-container"
          onClick={handleClose}
          aria-label="Cerrar"
          data-tooltip="Cerrar"
        >
          ×
        </button>

        {/* Título principal */}
        <h1 className="forgot-title">Restablecer contraseña</h1>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="forgot-form" noValidate>
          {/* Campo Email */}
          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Correo electrónico:
            </label>
            <div className="email-input-wrapper">
              <input
                id="email"
                type="email"
                className="forgot-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                disabled={isCodeSent} // Deshabilitar después de enviar código
              />
              <button
                type="button"
                className="send-code-btn"
                onClick={handleSendCode}
                disabled={!email || isCodeSent}
              >
                {isCodeSent ? 'Código enviado' : 'Enviar código'}
              </button>
            </div>
          </div>

          {/* Campo Código */}
          <div className="input-group">
            <label htmlFor="code" className="input-label">
              Ingresa el código de 6 dígitos:
            </label>
            <div className="code-input-wrapper">
              <input
                id="code"
                type="text"
                className="forgot-input"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} // Solo números, max 6
                placeholder="Ingresa el código de 6 dígitos"
                maxLength="6"
                disabled={!isCodeSent || isCodeVerified} // Deshabilitar si no se envió el código o ya está verificado
              />
              <button
                type="button"
                className="verify-code-btn"
                onClick={handleVerifyCode}
                disabled={code.length !== 6 || isCodeVerified}
              >
                {isCodeVerified ? 'Verificado' : 'Validar'}
              </button>
            </div>
          </div>

          {/* Campo Nueva contraseña */}
          <div className="input-group">
            <label htmlFor="newPassword" className="input-label">
              Nueva contraseña:
            </label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                className="forgot-input password-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña"
                minLength="6"
                disabled={!isCodeVerified} // Deshabilitar hasta que el código esté verificado
              />
              {/* Botón mostrar/ocultar contraseña */}
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={!isCodeVerified} // Deshabilitar el botón si el campo está deshabilitado
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {/* Botón de envío principal */}
          <button
            type="submit"
            className={`forgot-submit-btn ${isFormValid ? 'active' : 'disabled'}`}
            disabled={!isFormValid}
          >
            Restablecer mi contraseña
          </button>
        </form>

        {/* Enlace a registro */}
        <div className="forgot-footer">
          <span>¿No tienes una cuenta?</span>
          <Link to="/signup" className="signup-link">
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;