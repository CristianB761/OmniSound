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
  const searchInputRef = useRef(null); // Referencia para acceder al input de búsqueda directamente
  const location = useLocation(); // Hook para obtener la ruta actual
  const [searchValue, setSearchValue] = useState(''); // Controla el texto del input
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación del usuario
  const [userData, setUserData] = useState(null); // Datos del usuario autenticado
  const [loading, setLoading] = useState(true); // Estado de carga para verificar autenticación

  const navigate = useNavigate(); // Hook para navegar entre páginas

  // Efecto para manejar el shortcut de teclado y verificar autenticación
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Si se presiona 'S' (mayúscula o minúscula) y no están en un campo de texto,
      if ((event.key === 's' || event.key === 'S') && 
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

    // Verificar autenticación al cargar el componente
    checkAuthentication();

    // Limpia el event listener cuando el componente se desmonta
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []); // Array vacío significa que solo se ejecuta una vez

  // Función para verificar autenticación con el backend
  const checkAuthentication = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        // Intentar obtener el perfil del usuario autenticado desde el backend
        const response = await fetch('http://localhost:5000/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUserData(data.profile); // Actualizar con los datos del perfil desde el backend
        } else {
          // Si el token no es válido, limpiar el localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUserData(null);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUserData(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserData(null);
    }
    setLoading(false);
  };

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

  // Función para cerrar sesión
  const handleSignOut = () => {
    // Eliminar datos de autenticación del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Actualizar estado de autenticación
    setIsAuthenticated(false);
    setUserData(null);

    // Redirigir a la página principal
    navigate('/foryou');

    // Recargar la página para actualizar el estado de la aplicación
    window.location.reload();
  };

  // Si está cargando, no mostrar el sidebar o mostrar un estado de carga
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

        {/* Botón para limpiar input - Se muestra solo cuando hay texto */}
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

          {/* Botón Siguiendo con ícono - Solo se muestra si el usuario está autenticado */}
          {isAuthenticated && (
            <button 
              className={`sidebar-following-button ${isActive('/following') ? 'active' : ''}`}
              onClick={() => handleNavigation('/following')}
            >
              <FollowingIcon className="sidebar-following-icon" />
              <span>Siguiendo</span>
            </button>
          )}

          {/* Botón Notificaciones con ícono - Solo se muestra si el usuario está autenticado */}
          {isAuthenticated && (
            <button 
              className={`sidebar-notifications-button ${isActive('/notifications') ? 'active' : ''}`}
              onClick={() => handleNavigation('/notifications')}
            >
              <NotificationsIcon className="sidebar-notifications-icon" />
              <span>Notificaciones</span>
            </button>
          )}

          {/* Botón Subir con ícono */}
          <button 
            className={`sidebar-upload-button ${isActive('/upload') ? 'active' : ''}`}
            onClick={() => handleNavigation('/upload')}
          >
            <UploadIcon className="sidebar-upload-icon" />
            <span>Subir</span>
          </button>

          {/* Botón Perfil con ícono */}
          <button 
            className={`sidebar-profile-button ${isActive('/profile') || (userData && isActive(`/${userData.username}`)) ? 'active' : ''}`}
            onClick={() => {
              if (isAuthenticated && userData) {
                // Navegar al perfil del usuario autenticado
                handleNavigation(`/${userData.username}`);
              } else {
                // Navegar a la página de perfil general
                handleNavigation('/profile');
              }
            }}
          >
            <ProfileIcon className="sidebar-profile-icon" />
            <span>Perfil</span>
          </button>

          {/* Botón Cerrar sesión con ícono - Solo se muestra si el usuario está autenticado */}
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

      {/* Botones de autenticación - Solo se muestran si el usuario no está autenticado */}
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