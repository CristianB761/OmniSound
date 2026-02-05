import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignIn.css';

// Importar iconos como componentes React
import { ReactComponent as CloseIcon } from '../icons/CloseIcon.svg';
import { ReactComponent as ShowPasswordIcon } from '../icons/ShowPasswordIcon.svg';
import { ReactComponent as HidePasswordIcon } from '../icons/HidePasswordIcon.svg';

function SignIn() {
  const [email, setEmail] = useState(''); // Almacena el email ingresado
  const [password, setPassword] = useState(''); // Almacena la contraseña ingresada
  const [showPassword, setShowPassword] = useState(false); // Controla visibilidad de contraseña

  const navigate = useNavigate(); // Hook para navegación entre rutas

  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    document.title = "OmniSound - Inicia sesión";

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

  // Cierra formulario y redirige a la página principal
  const handleClose = () => {
    navigate('/foryou');
  };

  // Alterna entre mostrar y ocultar la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Maneja cambios en el campo de email
  const handleEmailChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    setEmail(value);
  };

  // Maneja cambios en el campo de contraseña
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Valida formato de email usando expresión regular
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Valida longitud mínima de contraseña
  const isValidPassword = (password) => {
    return password.length >= 8;
  };

  // Maneja el envío del formulario de inicio de sesión
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    try {
      // Envía credenciales al servidor para autenticación
      const response = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Almacena token y datos de usuario en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/foryou');
      } else {
        console.error('Error al iniciar sesión:', data.error);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  // Verifica si todo el formulario es válido
  const isFormValid = isValidEmail(email) && isValidPassword(password);

  return (
    <div className="signin-page">
      <div className="signin-container">
        {/* Botón Cerrar con ícono */}
        <button 
          className="signin-close-button" 
          onClick={handleClose}
          type="button"
          data-tooltip="Cerrar"
        >
          <CloseIcon className="close-icon" />
        </button>

        {/* Título del formulario */}
        <h1 className="signin-title">Inicia sesión</h1>
        <form onSubmit={handleSubmit} className="signin-form">

          {/* Grupo para email */}
          <div className="signin-input-group">
            <span className="signin-input-label">
              Correo electrónico:
            </span>
            {/* Input email */}
            <input
              type="text"
              className="signin-input"
              value={email}
              onChange={handleEmailChange}
              placeholder="Ingrese su correo electrónico"
            />
          </div>

          {/* Grupo para contraseña */}
          <div className="signin-input-group">
            <span className="signin-input-label">
              Contraseña:
            </span>
            {/* Input contraseña */}
            <input
              type={showPassword ? "text" : "password"}
              className="signin-input"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Ingrese su contraseña"
            />

            {/* Botón Mostrar/Ocultar contraseña */}
            <button
              type="button"
              className="signin-visibility-button"
              onClick={togglePasswordVisibility}
              disabled={false}
              data-tooltip={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? <ShowPasswordIcon className="show-icon" /> : <HidePasswordIcon className="hide-icon" />}
            </button>
          </div>

        {/* Enlace Restablecer contraseña */}
          <Link 
            to="/passwordreset" 
            className="passwordreset-link"
          >
            ¿Olvidaste la contraseña?
          </Link>

          {/* Botón Inicia sesión */}
          <button
            type="submit"
            className={`signin-submit-button ${isFormValid ? 'enabled' : 'disabled'}`}
            disabled={!isFormValid}
          >
            Inicia sesión
          </button>
        </form>

        {/* Enlace Crea tu cuenta */}
        <div className="signin-footer">
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

export default SignIn;