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
  const [day, setDay] = useState(''); // Almacena el día de nacimiento
  const [month, setMonth] = useState(''); // Almacena el mes de nacimiento
  const [year, setYear] = useState(''); // Almacena el año de nacimiento

  const [email, setEmail] = useState(''); // Almacena el email ingresado
  const [password, setPassword] = useState(''); // Almacena la contraseña ingresada
  const [code, setCode] = useState(''); // Almacena el código de verificación

  const [showPassword, setShowPassword] = useState(false); // Controla visibilidad de contraseña
  const [isCodeSent, setIsCodeSent] = useState(false); // Indica si el código fue enviado
  const [isCodeValid, setIsCodeValid] = useState(null); // Estado de validación del código

  const navigate = useNavigate(); // Hook para navegación entre rutas

  // Valida formato de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Valida longitud mínima de contraseña
  const isValidPassword = (password) => {
    return password.length >= 8;
  };

  // Valida longitud del código
  const isValidCode = (code) => {
    return code.length === 6;
  };

  // Determina si un año es bisiesto
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // Calcula días máximos en un mes considerando años bisiestos
  const getMaxDaysInMonth = (month, year) => {
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(monthNum)) return 31;

    // Meses con 30 días
    if ([4, 6, 9, 11].includes(monthNum)) {
      return 30;
    }

    // Febrero con manejo de año bisiesto
    if (monthNum === 2) {
      if (!year || isNaN(yearNum) || year.length !== 4) {
        return 28;
      }
      return isLeapYear(yearNum) ? 29 : 28;
    }

    // Meses con 31 días
    return 31;
  };

  // Maneja cambios en el día con validación
  const handleDayChange = (e) => {
    let value = e.target.value
      .replace(/\s/g, '')
      .replace(/\D/g, '')
      .slice(0, 2);

    if (value) {
      const dayNum = parseInt(value, 10);

      if (dayNum < 1) {
        value = '1';
      } else {
        const maxDays = getMaxDaysInMonth(month, year);

        if (dayNum > maxDays) {
          value = maxDays.toString();
        }
      }
    }
    setDay(value);
  };

  // Maneja cambios en el mes con validación
  const handleMonthChange = (e) => {
    let value = e.target.value
      .replace(/\s/g, '')
      .replace(/\D/g, '')
      .slice(0, 2);

    if (value) {
      const monthNum = parseInt(value, 10);

      if (monthNum < 1) value = '1';

      if (monthNum > 12) value = '12';

      // Ajusta día si excede máximo del nuevo mes
      if (day) {
        const dayNum = parseInt(day, 10);
        const maxDays = getMaxDaysInMonth(value, year);

        if (dayNum > maxDays) {
          setDay(maxDays.toString());
        }
      }
    }
    setMonth(value);
  };

  // Maneja cambios en el año con validación
  const handleYearChange = (e) => {
    let value = e.target.value
      .replace(/\s/g, '')
      .replace(/\D/g, '')
      .slice(0, 4);

    if (value.length === 4) {
      const yearNum = parseInt(value, 10);

      // Validar rango de años permitido
      if (yearNum < 1955) value = '1955';

      if (yearNum > 2025) value = '2025';

      // Ajusta día si es febrero y cambia el año
      if (month && day && parseInt(month, 10) === 2) {
        const dayNum = parseInt(day, 10);
        const maxDays = getMaxDaysInMonth(month, value);

        if (dayNum > maxDays) {
          setDay(maxDays.toString());
        }
      }
    }
    setYear(value);
  };

  // Maneja cambios en el email
  const handleEmailChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    setEmail(value);

    // Resetea estado de código si email cambia
    if (isCodeSent) {
      setIsCodeSent(false);
    }
  };

  // Maneja cambios en el código de verificación
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

  // Maneja cambios en la contraseña
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Envía código de verificación al servidor
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
        const response = await fetch('http://localhost:5000/api/auth/verify-code', {
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

  // Alterna visibilidad de contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Cierra formulario y redirige
  const handleClose = () => {
    navigate('/foryou');
  };

  // Envía formulario de registro
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
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
        navigate('/signin');
      } else {
        console.error('Error al crear cuenta:', data.error);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    document.title = "OmniSound - Crea tu cuenta";
    
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

  // Verifica si todo el formulario es válido
  const isFormValid = day && month && year && 
                      isValidEmail(email) && 
                      isValidPassword(password) && 
                      isValidCode(code) && 
                      isCodeValid === true;

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Botón Cerrar con ícono */}
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
        <form onSubmit={handleSubmit} className="signup-form" noValidate>
          {/* Sección de fecha de nacimiento */}
          <div className="birthday-section">
            <div className="birthday-header">
              <label className="signup-input-label">
                ¿Cuál es tu fecha de nacimiento?
              </label>
            </div>

            {/* Grupo para fecha de nacimiento */}
            <div className="birthday-inputs">
              <div className="birthday-group">
                {/* Input Día */}
                <input
                  id="day"
                  type="text"
                  className="birthday-input"
                  value={day}
                  onChange={handleDayChange}
                  placeholder="Día"
                />
              </div>
              {/* Input Mes */}
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
              {/* Input Año */}
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

          {/* Grupo para email */}
          <div className="signup-input-group">
            <span className="signup-input-label">
              Correo electrónico:
            </span>
            {/* Input email */}
            <input
              type="text"
              className="signup-input"
              value={email}
              onChange={handleEmailChange}
              placeholder="Ingrese su correo electrónico"
            />

            {/* Botón Enviar código */}
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

          {/* Grupo para código de verificación */}
          <div className="signup-input-group">
            <span className="signup-input-label">
              Código de verificación:
            </span>
            {/* Input código de verificación */}
            <input
              type="text"
              className={`signup-input ${isCodeValid === false ? 'invalid-code' : ''}`}
              value={code}
              onChange={handleCodeChange}
              placeholder="Ingrese los 6 dígitos"
              maxLength="6"
            />

            {/* Botón Validar código */}
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

          {/* Grupo para contraseña */}
          <div className="signup-input-group">
            <span className="signup-input-label">
              Contraseña:
            </span>
            {/* Input contraseña */}
            <input
              type={showPassword ? "text" : "password"}
              className="signup-input"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Ingrese su contraseña"
            />

            {/* Botón Mostrar/Ocultar contraseña */}
            <button
              type="button"
              className="signup-visibility-button"
              onClick={togglePasswordVisibility}
              disabled={false}
              data-tooltip={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? <ShowPasswordIcon className="show-icon" /> : <HidePasswordIcon className="hide-icon" />}
            </button>
          </div>

          {/* Botón Crea tu cuenta */}
          <button
            type="submit"
            className={`signup-submit-button ${isFormValid ? 'enabled' : 'disabled'}`}
            disabled={!isFormValid}
          >
            Crea tu cuenta
          </button>
        </form>

        {/* Enlace Inicia sesión */}
        <div className="signup-footer">
          <span>¿Ya tienes una cuenta?</span>
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