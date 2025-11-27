import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SideBar.css';

// Importar iconos como componentes React
import { ReactComponent as SearchIcon } from '../icons/SearchIcon.svg';
import { ReactComponent as ForYouIcon } from '../icons/ForYouIcon.svg';
import { ReactComponent as ExploreIcon } from '../icons/ExploreIcon.svg';
import { ReactComponent as FollowingIcon } from '../icons/FollowingIcon.svg';
import { ReactComponent as UploadIcon } from '../icons/UploadIcon.svg';
import { ReactComponent as ProfileIcon } from '../icons/ProfileIcon.svg';

function SideBar() {
  const searchInputRef = useRef(null); // Referencia para acceder al input de búsqueda directamente
  const location = useLocation(); // Hook para obtener la ruta actual
  const navigate = useNavigate(); // Hook para navegar entre páginas

  // Efecto para manejar el shortcut de teclado
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
    // Limpia el event listener cuando el componente se desmonta
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []); // Array vacío significa que solo se ejecuta una vez

  // Verifica si la ruta actual coincide con el path proporcionado
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Función para botones que aún no tienen funcionalidad completa
  const handleButtonClick = (buttonName) => {
    console.log(`Clic en ${buttonName}`);
  };

  // Función para navegar a una ruta específica usando React Router
  const handleNavigation = (path) => {
    navigate(path);
  };

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
        />
        <SearchIcon className="sidebar-search-icon" />
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

          {/* Botón Siguiendo con ícono */}
          <button 
            className="sidebar-following-button"
            onClick={() => handleButtonClick('Siguiendo')}
          >
            <FollowingIcon className="sidebar-following-icon" />
            <span>Siguiendo</span>
          </button>

          {/* Botón Subir con ícono */}
          <button 
            className="sidebar-upload-button"
            onClick={() => handleButtonClick('Subir')}
          >
            <UploadIcon className="sidebar-upload-icon" />
            <span>Subir</span>
          </button>

          {/* Botón Perfil con ícono */}
          <button 
            className="sidebar-profile-button"
            onClick={() => handleButtonClick('Perfil')}
          >
            <ProfileIcon className="sidebar-profile-icon" />
            <span>Perfil</span>
          </button>
        </div>
      </nav>

      {/* Línea divisoria visual */}
      <hr className="sidebar-divider" />

      {/* Botones de autenticación */}
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
    </div>
  );
}

export default SideBar;