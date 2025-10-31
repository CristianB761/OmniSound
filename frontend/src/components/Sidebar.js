import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const searchInputRef = useRef(null);

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
          <li className="sidebar-menu-item active">Para ti</li>
          <li className="sidebar-menu-item">Explorar</li>
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
        <button className="sidebar-button sidebar-button-secondary">Crea tu cuenta</button>
      </div>
    </div>
  );
}

export default Sidebar;