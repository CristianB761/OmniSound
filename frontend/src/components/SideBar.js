import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './SideBar.css';

function SideBar() {
  const searchInputRef = useRef(null);
  const location = useLocation(); // Para detectar la ruta actual

  // Efecto para manejar la tecla "s"
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Verificar si se presionó "s" (sin importar mayúsculas/minúsculas)
      // Y que no esté en un campo de entrada para evitar conflictos
      if ((event.key === 's' || event.key === 'S') && 
          !event.target.matches('input, textarea, [contenteditable="true"]')) {
        event.preventDefault();
        
        // Enfocar el campo de búsqueda
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };

    // Agregar event listener
    document.addEventListener('keydown', handleKeyPress);

    // Limpiar event listener al desmontar
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Función para verificar si un item está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="sidebar">
      {/* Título de la aplicación */}
      <h1 className="sidebar-title">OmniSound</h1>
      
      {/* Barra de búsqueda */}
      <div className="sidebar-search-container">
        <input 
          ref={searchInputRef}
          type="text" 
          className="sidebar-search" 
          placeholder="Buscar"
        />
        {/* Icono temporal de buscar */}
        <div className="sidebar-search-icon">•</div>
      </div>

      {/* Menú de navegación */}
      <nav>
        <ul className="sidebar-menu">
          {/* Item "Para ti" con Link */}
          <li className={`sidebar-menu-item ${isActive('/') ? 'active' : ''}`}>
            <Link to="/">Para ti</Link>
          </li>
          
          {/* Item "Explorar" con Link */}
          <li className={`sidebar-menu-item ${isActive('/explore') ? 'active' : ''}`}>
            <Link to="/explore">Explorar</Link>
          </li>
          
          <li className="sidebar-menu-item">Siguiendo</li>
          <li className="sidebar-menu-item">Subir</li>
          <li className="sidebar-menu-item">Perfil</li>
        </ul>
      </nav>
      
      {/* Línea divisoria */}
      <hr className="sidebar-divider" />
      
      {/* Botones de autenticación */}
      <div className="sidebar-buttons">
        <Link to="/login" className="sidebar-button">Inicia sesión</Link>
        <Link to="/signup" className="sidebar-button sidebar-button-secondary">Crea tu cuenta</Link>
      </div>
    </div>
  );
}

export default SideBar;