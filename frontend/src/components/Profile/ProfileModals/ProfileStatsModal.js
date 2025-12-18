import React, { useState, useEffect } from 'react';
import './ProfileStatsModal.css';

// Importar iconos como componentes React
import { ReactComponent as CloseIcon } from '../../../icons/CloseIcon.svg';
import { ReactComponent as SearchIcon } from '../../../icons/SearchIcon.svg';
import { ReactComponent as CleanInputIcon } from '../../../icons/CleanInputIcon.svg';

function ProfileStatsModal({ isOpen, onClose, initialTab = 'Siguiendo', username = 'Artista' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // Controla la pestaña activa
  const [searchTerm, setSearchTerm] = useState(''); // Almacena el texto de búsqueda
  
  // Configuración de secciones disponibles en el modal
  const statsSections = ['Siguiendo', 'Seguidores'];
  
  // Estructura de datos para cada sección (actualmente vacíos)
  const statsData = {
    'Siguiendo': [],  // Datos de usuarios que el perfil sigue
    'Seguidores': []  // Datos de usuarios que siguen al perfil
  };

  // Efecto para actualizar la pestaña activa cuando se abre el modal
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Efecto para limpiar el input de búsqueda al cambiar de pestaña
  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  // Efecto para el shortcut de teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose(); // ESC: Cierra el modal
    };

    // Agrega el event listener cuando el componente se monta
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Limpia el event listener cuando el componente se desmonta
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Función para limpiar el input de búsqueda
  const handleCleanInputIcon = () => {
    setSearchTerm('');
  };

  // Filtrar datos según la pestaña activa y el input de búsqueda
  const filteredData = statsData[activeTab].filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Si el modal no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    <div className="profile-stats-modal-overlay">
      {/* Contenedor principal del modal */}
      <div className="profile-stats-modal" onClick={(e) => e.stopPropagation()}>
        {/* Botón Cerrar modal con ícono */}
        <button 
          className="profile-stats-close-button" 
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="profile-stats-close-icon" />
        </button>

        {/* Encabezado con nombre de usuario */}
        <div className="profile-stats-header">
          <h2 className="profile-stats-title">{username}</h2>
        </div>

        {/* Pestañas Siguiendo/Seguidores */}
        <div className="profile-stats-tabs">
          {statsSections.map((section) => (
            <button
              key={section}
              className={`profile-stats-tab ${activeTab === section ? 'active' : ''}`}
              onClick={() => setActiveTab(section)}
            >
              {section}
            </button>
          ))}
        </div>

        {/* Input de búsqueda con ícono */}
        <div className="profile-stats-search-container">
          <input 
            type="text" 
            className="profile-stats-search" 
            placeholder={`Buscar en ${activeTab}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className="profile-stats-search-icon" />

          {/* Botón para limpiar input - Se muestra solo cuando hay texto */}
          {searchTerm && (
            <button 
              className="profile-stats-clean-input-button"
              onClick={handleCleanInputIcon}
              type="button"
            >
              <CleanInputIcon className="profile-stats-clean-input-icon" />
            </button>
          )}
        </div>

        {/* Contenido del modal */}
        <div className="profile-stats-content">
          <div className="profile-stats-list">
            {/* Render condicional: mostrar lista o mensajes de estado vacío */}
            {filteredData.length > 0 ? (
              // Mapeo de usuarios filtrados
              filteredData.map((user, index) => (
                <div key={index} className="profile-stats-list-item"></div>
              ))
            ) : (
              // Mensajes cuando no hay datos
              <p className="profile-stats-empty-state">
                {searchTerm 
                  ? 'No se encontraron resultados' 
                  : activeTab === 'Siguiendo' 
                    ? 'No estás siguiendo a nadie todavía' 
                    : 'Nadie te sigue todavía'
                }
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileStatsModal;