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
  const [showPassword, setShowPassword] = useState(false); // Indica si se muestra la contraseña

  const navigate = useNavigate(); // Hook para navegar entre rutas

  // Efecto para manejar el título de la pestaña y el shortcut de teclado
  useEffect(() => {
    // Cambia el título de la pestaña del navegador cuando el componente se monta
    document.title = "OmniSound - Inicia sesión";

    // Efecto para el shortcut de teclado
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

  // Función para redirigir a la página principal
  const handleClose = () => {
    navigate('/foryou');
  };

  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Maneja el envío del formulario
  const handleSubmit = (event) => {
    event.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    // Valida que el formulario sea válido antes de enviar
    if (!isFormValid) {
      return;
    }

    console.log('Iniciando sesión...');
    // Aquí iría la lógica real de autenticación con el backend
    // Por ahora solo redirige a la página principal
    navigate('/foryou');
  };

  // Valida el formato del email usando una expresión regular
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Valida que la contraseña tenga al menos 8 caracteres
  const isValidPassword = (password) => {
    return password.length >= 8;
  };

  // Determina si el formulario completo es válido
  const isFormValid = isValidEmail(email) && isValidPassword(password);

  return (
    <div className="signin-page">
      <div className="signin-container">

        {/* Botón Cerrar formulario con ícono */}
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
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="signin-form">

          {/* Grupo de input para el email */}
          <div className="signin-input-group">
            <span className="signin-input-label">
              Correo electrónico:
            </span>
            <input
              type="text"
              className="signin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Actualiza el estado con cada tecla
              placeholder="Ingrese su correo electrónico"
            />
          </div>

          {/* Grupo de input para la contraseña */}
          <div className="signin-input-group">
            <span className="signin-input-label">
              Contraseña:
            </span>
            <input
              type={showPassword ? "text" : "password"} // Cambia el tipo según la visibilidad
              className="signin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
            />

            {/* Botón de visibilidad */}
            <button
              type="button" // Para que no envíe el formulario
              className="signin-visibility-button"
              onClick={togglePasswordVisibility}
              disabled={false}
              data-tooltip={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? <ShowPasswordIcon className="show-icon" /> : <HidePasswordIcon className="hide-icon" />}
            </button>
          </div>

          {/* Link de Recuperar contraseña */}
          <Link 
            to="/forgotpassword" 
            className="forgotpassword-link"
          >
            ¿Olvidaste la contraseña?
          </Link>

          {/* Botón Inicia sesión - Se habilita solo cuando es válido */}
          <button
            type="submit"
            className={`signin-submit-button ${isFormValid ? 'enabled' : 'disabled'}`}
            disabled={!isFormValid} // Deshabilitado cuando el formulario no es válido
          >
            Inicia sesión
          </button>
        </form>

        {/* Pie de página */}
        <div className="signin-footer">
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

export default SignIn;