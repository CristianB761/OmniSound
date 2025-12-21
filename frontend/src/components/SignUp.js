import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignUp.css';

// Importar iconos como componentes React
import { ReactComponent as CloseIcon } from '../icons/CloseIcon.svg';
import { ReactComponent as ShowPasswordIcon } from '../icons/ShowPasswordIcon.svg';
import { ReactComponent as HidePasswordIcon } from '../icons/HidePasswordIcon.svg';
import { ReactComponent as SendIcon } from '../icons/SendIcon.svg';
import { ReactComponent as SentIcon } from '../icons/SentIcon.svg';
import { ReactComponent as ValidateIcon } from '../icons/ValidateIcon.svg';
import { ReactComponent as ValidIcon } from '../icons/ValidIcon.svg';
import { ReactComponent as InvalidIcon } from '../icons/InvalidIcon.svg';

function SignUp() {
  const [day, setDay] = useState(''); // Almacena el día ingresado
  const [month, setMonth] = useState(''); // Almacena el mes ingresado
  const [year, setYear] = useState(''); // Almacena el año ingresado
  const [email, setEmail] = useState(''); // Almacena el email ingresado
  const [password, setPassword] = useState(''); // Almacena la contraseña ingresada
  const [code, setCode] = useState(''); // Almacena el código de verificación ingresado
  const [showPassword, setShowPassword] = useState(false); // Indica si se muestra la contraseña
  const [isCodeSent, setIsCodeSent] = useState(false); // Indica si el código fue enviado
  const [isCodeValid, setIsCodeValid] = useState(null); //Estado de validación: null = validar, true = válido, false = no válido

  const navigate = useNavigate(); // Hook para navegar entre rutas

  // Efecto para manejar el título de la pestaña y el shortcut de teclado
  useEffect(() => {
    // Cambia el título de la pestaña del navegador cuando el componente se monta
    document.title = "OmniSound - Crea tu cuenta";
    
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

  // Valida que la contraseña tenga al menos 8 caracteres
  const isValidPassword = (password) => {
    return password.length >= 8;
  };

  // Valida que el código tenga exactamente 6 dígitos
  const isValidCode = (code) => {
    return code.length === 6;
  };

  // Valida y limita el día de nacimiento (1-31)
  const handleDayChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 2); // Solo números, máximo 2
    if (value) {
      const dayNum = parseInt(value, 10);
      if (dayNum < 1) value = '1';
      if (dayNum > 31) value = '31';
    }
    setDay(value);
  };

  // Valida y limita el mes de nacimiento (1-12)
  const handleMonthChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (value) {
      const monthNum = parseInt(value, 10);
      if (monthNum < 1) value = '1';
      if (monthNum > 12) value = '12';
    }
    setMonth(value);
  };

  // Valida y limita el año de nacimiento (1955-2025)
  const handleYearChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4); // Solo números, máximo 4
    if (value.length === 4) {
      const yearNum = parseInt(value, 10);
      if (yearNum < 1955) value = '1955';
      if (yearNum > 2025) value = '2025';
    }
    setYear(value);
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

  // Función para enviar código de verificación
  const handleSendCode = async () => {
    if (email && isValidEmail(email) && !isCodeSent) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (response.ok) {
          setIsCodeSent(true);
          console.log('Código enviado.');
        } else {
          const data = await response.json();
          console.error('Error al enviar código:', data.error);
        }
      } catch (error) {
        console.error('Error de red:', error);
      }
    }
  };

  // Función para validar código
  const handleVerifyCode = async () => {
    if (isValidCode(code)) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/verify-code', {
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

  // Función para redirigir a la página principal
  const handleClose = () => {
    navigate('/foryou');
  };

  // Función para crear cuenta
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          day,
          month,
          year,
          code
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Cuenta creada exitosamente:', data);
        // Redirigir al login
        navigate('/signin');
      } else {
        console.error('Error al crear cuenta:', data.error);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  // Determina si el formulario completo es válido
  const isFormValid = day && month && year && 
                      isValidEmail(email) && 
                      isValidPassword(password) && 
                      isValidCode(code) && 
                      isCodeValid === true; // Código debe estar validado como verdadero

  return (
    <div className="signup-page">
      <div className="signup-container">

        {/* Botón Cerrar formulario con ícono */}
        <button 
          className="signup-close-button" 
          onClick={handleClose}
          type="button"
          data-tooltip="Cerrar"
        >
          <CloseIcon className="close-icon" />
        </button>

        {/* Título del formulario */}
        <h1 className="signup-title">Crea tu cuenta</h1>
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="signup-form" noValidate>

          {/* Sección de fecha de nacimiento */}
          <div className="birthday-section">
            <div className="birthday-header">
              <label className="signup-input-label">
                ¿Cuál es tu fecha de nacimiento?
              </label>
            </div>

            {/* Inputs separados para día, mes y año */}
            <div className="birthday-inputs">
              <div className="birthday-group">
                <input
                  id="day"
                  type="text"
                  className="birthday-input"
                  value={day}
                  onChange={handleDayChange}
                  placeholder="Día"
                />
              </div>
              <div className="birthday-group">
                <input
                  id="month"
                  type="text"
                  className="birthday-input"
                  value={month}
                  onChange={handleMonthChange}
                  placeholder="Mes"
                />
              </div>
              <div className="birthday-group">
                <input
                  id="year"
                  type="text"
                  className="birthday-input"
                  value={year}
                  onChange={handleYearChange}
                  placeholder="Año"
                />
              </div>
            </div>

            {/* Texto informativo */}
            <p className="birthday-info">
              Tu fecha de nacimiento no se mostrará públicamente.
            </p>
          </div>

          {/* Grupo de input para el email */}
          <div className="signup-input-group">
            <span className="signup-input-label">
              Correo electrónico:
            </span>
            <input
              type="text"
              className="signup-input"
              value={email}
              onChange={handleEmailChange}
              placeholder="Ingrese su correo electrónico"
            />

            {/* Botón Enviar código - Cambia de ícono según el estado */}
            <button
              type="button"
              className="signup-send-button"
              onClick={handleSendCode}
              disabled={!email || !isValidEmail(email) || isCodeSent}
              data-tooltip={isCodeSent ? "Código enviado" : "Enviar código"}
            >
              {isCodeSent ? <SentIcon className="sent-icon" /> : <SendIcon className="send-icon" />}
            </button>
          </div>

          {/* Grupo de input para el código de verificación */}
          <div className="signup-input-group">
            <span className="signup-input-label">
              Código de verificación:
            </span>
            <input
              type="text"
              className={`signup-input ${isCodeValid === false ? 'invalid-code' : ''}`}
              value={code}
              onChange={handleCodeChange}
              placeholder="Ingrese los 6 dígitos"
              maxLength="6"
            />

            {/* Botón Validar código - Cambia de ícono según el resultado */}
            <button
              type="button"
              className="signup-verify-button"
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
          <div className="signup-input-group">
            <span className="signup-input-label">
              Contraseña:
            </span>
            <input
              type={showPassword ? "text" : "password"}
              className="signup-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
            />

            {/* Botón de visibilidad */}
            <button
              type="button" // Para que no envíe el formulario
              className="signup-visibility-button"
              onClick={togglePasswordVisibility}
              disabled={false}
              data-tooltip={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? <ShowPasswordIcon className="show-icon" /> : <HidePasswordIcon className="hide-icon" />}
            </button>
          </div>

          {/* Botón Crea tu cuenta - Se habilita solo cuando es válido */}
          <button
            type="submit"
            className={`signup-submit-button ${isFormValid ? 'enabled' : 'disabled'}`}
            disabled={!isFormValid}
          >
            Crea tu cuenta
          </button>
        </form>

        {/* Pie de pagina */}
        <div className="signup-footer">
          <span>¿Ya tienes una cuenta?</span>
          {/* Link de Inicia sesión */}
          <Link 
            to="/signin" 
            className="signin-link">
              Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;