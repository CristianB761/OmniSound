import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Función para manejar el envío del formulario
  const handleSubmit = (event) => {
    event.preventDefault();
    // Lógica de autenticación aquí
    console.log('Iniciando sesión...');
  };

  // Función para validar si el botón debe estar habilitado
  const isFormValid = email.length > 0 && password.length > 0;

  // Efecto para manejar la tecla "esc"
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        navigate(-1);
      }
    };

    // Agregar event listener
    document.addEventListener('keydown', handleKeyDown);

    // Limpiar event listener al desmontar
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Botón de cerrar con tooltip */}
        <button 
          className="login-close-btn tooltip-container"
          onClick={() => navigate(-1)}
          aria-label="Cerrar"
          data-tooltip="Cerrar"
        >
          ×
        </button>

        {/* Título principal */}
        <h1 className="login-title">Inicia sesión</h1>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Campo Correo electrónico */}
          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Correo electrónico:
            </label>
            <input
              id="email"
              type="text"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
            />
          </div>

          {/* Campo Contraseña */}
          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Contraseña:
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="login-input password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
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

          {/* Enlace de contraseña olvidada */}
          <div className="forgot-password-container">
            <Link to="/forgot-password" className="forgot-password-link">
              ¿Olvidaste la contraseña?
            </Link>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            className={`login-submit-btn ${isFormValid ? 'active' : 'disabled'}`}
            disabled={!isFormValid}
          >
            Inicia sesión
          </button>
        </form>

        {/* Enlace a registro */}
        <div className="login-footer">
          <span>¿No tienes una cuenta?</span>
          <Link to="/signup" className="signup-link">Crea tu cuenta</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;