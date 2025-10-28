import React from 'react';
import './Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      {/* Título de la aplicación */}
      <h1 className="sidebar-title">OmniSound</h1>
      
      {/* Barra de búsqueda */}
      <input 
        type="text" 
        className="sidebar-search" 
        placeholder="Buscar"
      />

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
        <button className="sidebar-button">Inicia sesión</button>
        <button className="sidebar-button sidebar-button-secondary">Crea tu cuenta</button>
      </div>
    </div>
  );
}

export default Sidebar;