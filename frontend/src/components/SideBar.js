import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SideBar.css';

// Importar iconos como componentes React
import { ReactComponent as SearchIcon } from '../icons/SearchIcon.svg';
import { ReactComponent as CleanInputIcon } from '../icons/CleanInputIcon.svg';
import { ReactComponent as ForYouIcon } from '../icons/ForYouIcon.svg';
import { ReactComponent as ExploreIcon } from '../icons/ExploreIcon.svg';
import { ReactComponent as FollowingIcon } from '../icons/FollowingIcon.svg';
import { ReactComponent as NotificationsIcon } from '../icons/NotificationsIcon.svg';
import { ReactComponent as UploadIcon } from '../icons/UploadIcon.svg';
import { ReactComponent as ProfileIcon } from '../icons/ProfileIcon.svg';
import { ReactComponent as SignOutIconIcon } from '../icons/SignOutIcon.svg';

function SideBar() {
  const [searchValue, setSearchValue] = useState(''); // Almacena el valor del campo de búsqueda
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Indica si el usuario está autenticado
  const [userData, setUserData] = useState(null); // Datos del usuario autenticado
  const [loading, setLoading] = useState(true); // Estado de carga mientras se verifica la autenticación

  const searchInputRef = useRef(null); // Referencia para acceder al input de búsqueda directamente
  const location = useLocation(); // Hook para obtener la ruta actual
  const navigate = useNavigate(); // Hook para navegar entre páginas

  // Función que verifica si el usuario tiene una sesión activa
  const checkAuthentication = async () => {
    // Obtiene el token y datos del usuario desde el almacenamiento local
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        // Realiza una petición al servidor para validar el token
        const response = await fetch('http://localhost:5000/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        // Si la respuesta es OK, actualiza los datos del usuario
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUserData(data.profile);
        } else {
          // Si la respuesta no es OK, elimina los datos y establece como no autenticado
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUserData(null);
        }
      } catch (error) {
        // Si hay error en la petición, elimina los datos y establece como no autenticado
        console.error('Error al verificar autenticación:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUserData(null);
      }
    } else {
      // Si no hay token o datos de usuario, establece como no autenticado
      setIsAuthenticated(false);
      setUserData(null);
    }
    setLoading(false); // Finaliza el estado de carga
  };

  // Efecto para manejar el shortcut de teclado
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Si se presiona 'S' (mayúscula o minúscula) y no están en un campo de texto,
      if ((event.key === 's' || event.key === 'S') && 
          !event.shiftKey &&
          !event.target.matches('input, textarea, [contenteditable="true"]')) {
        event.preventDefault(); // Evita el comportamiento por defecto del navegador
        // Enfoca el campo de búsqueda
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    // Agrega el event listener cuando el componente se monta
    document.addEventListener('keydown', handleKeyPress);

    checkAuthentication(); // Verifica la autenticación al montar el componente

    // Limpia el event listener cuando el componente se desmonta
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []); // Array vacío significa que solo se ejecuta una vez

  // Verifica si la ruta actual coincide con el path proporcionado
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Función para navegar a una ruta específica usando React Router
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Función para manejar cambios en el input de búsqueda
  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  // Función para limpiar el input de búsqueda
  const handleCleanInputIcon = () => {
    setSearchValue(''); // Reinicia el estado de búsqueda
    if (searchInputRef.current) {
      searchInputRef.current.focus(); // Mantiene el foco en el input después de limpiar
    }
  };

  // Función para cerrar la sesión del usuario
  const handleSignOut = () => {
    // Elimina los datos de autenticación del almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Actualiza el estado a no autenticado
    setIsAuthenticated(false);
    setUserData(null);

    // Navega a la página principal
    navigate('/foryou');

    // Recarga la página para limpiar cualquier estado residual
    window.location.reload();
  };

  // Estado de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="sidebar">
        <h1 className="sidebar-title">OmniSound</h1>
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      {/* Título de la web site */}
      <h1 className="sidebar-title">OmniSound</h1>
      {/* Sección de búsqueda con input e ícono */}
      <div className="sidebar-search-container">
        <input 
          ref={searchInputRef} // Referencia para acceder directamente al input
          type="text" 
          className="sidebar-search" 
          placeholder="Buscar"
          value={searchValue} // Texto actual del input
          onChange={handleSearchChange} // Maneja cambios en el input
        />
        <SearchIcon className="sidebar-search-icon" />

        {/* Botón Limpiar input con ícono - Se muestra si hay texto */}
        {searchValue && (
          <button 
            className="sidebar-clean-input-button"
            onClick={handleCleanInputIcon} // Ejecuta la función de limpiar input
            type="button"
          >
            <CleanInputIcon className="sidebar-clean-input-icon" />
          </button>
        )}
      </div>

      {/* Menú de navegación */}
      <nav>
        <div className="sidebar-menu-buttons">
          {/* Botón Para ti con ícono */}
          <button 
            className={`sidebar-foryou-button ${isActive('/foryou') ? 'active' : ''}`}
            onClick={() => handleNavigation('/foryou')}
          >
            <ForYouIcon className="sidebar-foryou-icon" />
            <span>Para ti</span>
          </button>

          {/* Botón Explorar con ícono */}
          <button 
            className={`sidebar-explore-button ${isActive('/explore') ? 'active' : ''}`}
            onClick={() => handleNavigation('/explore')}
          >
            <ExploreIcon className="sidebar-explore-icon" />
            <span>Explorar</span>
          </button>

          {/* Botón Siguiendo con ícono - Se muestra si el usuario está autenticado */}
          {isAuthenticated && (
            <button 
              className={`sidebar-following-button ${isActive('/following') ? 'active' : ''}`}
              onClick={() => handleNavigation('/following')}
            >
              <FollowingIcon className="sidebar-following-icon" />
              <span>Siguiendo</span>
            </button>
          )}

          {/* Botón Notificaciones con ícono - Se muestra si el usuario está autenticado */}
          {isAuthenticated && (
            <button 
              className={`sidebar-notifications-button ${isActive('/notifications') ? 'active' : ''}`}
              onClick={() => handleNavigation('/notifications')}
            >
              <NotificationsIcon className="sidebar-notifications-icon" />
              <span>Notificaciones</span>
            </button>
          )}

          {/* Botón Subir con ícono - Sin autenticación, te envia a Iniciar sesión */}
          <button 
            className={`sidebar-upload-button ${isActive('/upload') ? 'active' : ''}`}
            onClick={() => handleNavigation('/upload')}
          >
            <UploadIcon className="sidebar-upload-icon" />
            <span>Subir</span>
          </button>

          {/* Botón Perfil con ícono - Sin autenticación, te envia a Iniciar sesión */}
          <button 
            className={`sidebar-profile-button ${isActive('/profile') || (userData && isActive(`/${userData.username}`)) ? 'active' : ''}`}
            onClick={() => {
              if (isAuthenticated && userData) {
                handleNavigation(`/${userData.username}`);
              } else {
                handleNavigation('/profile');
              }
            }}
          >
            <ProfileIcon className="sidebar-profile-icon" />
            <span>Perfil</span>
          </button>

          {/* Botón Cerrar sesión con ícono - Se muestra si el usuario está autenticado */}
          {isAuthenticated && (
            <button 
              className="sidebar-signout-button"
              onClick={handleSignOut}
            >
              <SignOutIconIcon className="sidebar-signout-icon" />
              <span>Cerrar sesión</span>
            </button>
          )}
        </div>
      </nav>

      {/* Línea divisoria visual */}
      <hr className="sidebar-divider" />

      {/* Botones de autenticación - Se muestran si el usuario no está autenticado*/}
      {!isAuthenticated && (
        <div className="sidebar-authn-buttons">
          {/* Botón Crea tu cuenta */}
          <button 
            className="sidebar-signup-button"
            onClick={() => handleNavigation('/signup')}
          >
            Crea tu cuenta
          </button>

          {/* Botón Inicia sesión */}
          <button 
            className="sidebar-signin-button"
            onClick={() => handleNavigation('/signin')}
          >
            Inicia sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default SideBar;