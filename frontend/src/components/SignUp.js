import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignUp.css';

function SignUp() {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const navigate = useNavigate();

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para crear cuenta aquí
    console.log('Creando cuenta...');
    // Redirigir al login después del registro
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

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Validar si el formulario completo está listo para enviar
  const isFormValid = day && month && year && email && password.length >= 6 && code.length === 6 && isCodeVerified;

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Botón de cerrar */}
        <button 
          className="signup-close-btn tooltip-container"
          onClick={handleClose}
          aria-label="Cerrar"
          data-tooltip="Cerrar"
        >
          ×
        </button>

        {/* Título principal */}
        <h1 className="signup-title">Crea tu cuenta</h1>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="signup-form" noValidate>
          {/* Sección de fecha de nacimiento */}
          <div className="birthday-section">
            <div className="birthday-header">
              <label className="input-label">
                ¿Cuál es tu fecha de nacimiento?
              </label>
            </div>
            
            <div className="birthday-inputs">
              {/* Campo Mes */}
              <div className="birthday-group">
                <select
                  id="month"
                  className="birthday-select"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="">Mes</option>
                  <option value="01">Enero</option>
                  <option value="02">Febrero</option>
                  <option value="03">Marzo</option>
                  <option value="04">Abril</option>
                  <option value="05">Mayo</option>
                  <option value="06">Junio</option>
                  <option value="07">Julio</option>
                  <option value="08">Agosto</option>
                  <option value="09">Septiembre</option>
                  <option value="10">Octubre</option>
                  <option value="11">Noviembre</option>
                  <option value="12">Diciembre</option>
                </select>
              </div>

              {/* Campo Día */}
              <div className="birthday-group">
                <select
                  id="day"
                  className="birthday-select"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                >
                  <option value="">Día</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo Año */}
              <div className="birthday-group">
                <select
                  id="year"
                  className="birthday-select"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="">Año</option>
                  {Array.from({ length: 100 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Mensaje informativo */}
            <p className="birthday-info">
              Tu fecha de nacimiento no se mostrará públicamente.
            </p>
          </div>

          {/* Sección de correo electrónico */}
          <div className="email-section">
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Correo electrónico:
              </label>
              <div className="email-input-wrapper">
                <input
                  id="email"
                  type="email"
                  className="signup-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  disabled={isCodeSent}
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
          </div>

          {/* Campo de código */}
          <div className="input-group">
            <div className="code-input-wrapper">
              <input
                id="code"
                type="text"
                className="signup-input"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Ingresa el código de 6 dígitos"
                maxLength="6"
                disabled={!isCodeSent || isCodeVerified}
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

          {/* Sección de contraseña */}
          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Contraseña:
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="signup-input password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                minLength="6"
              />
              {/* Botón mostrar/ocultar contraseña */}
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {/* Botón de envío principal */}
          <button
            type="submit"
            className={`signup-submit-btn ${isFormValid ? 'active' : 'disabled'}`}
            disabled={!isFormValid}
          >
            Crear cuenta
          </button>
        </form>

        {/* Enlace a login */}
        <div className="signup-footer">
          <span>¿Ya tienes una cuenta?</span>
          <Link to="/login" className="login-link">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;