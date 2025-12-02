import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

// Importar iconos como componentes React
import { ReactComponent as ShareIcon } from '../icons/ShareIcon.svg';

function Profile() {
  const [activeSection, setActiveSection] = useState('Pistas'); // Sección activa del perfil
  const [activeFilter, setActiveFilter] = useState('Más recientes'); // Filtro activo para la sección "Pistas"
  const navigate = useNavigate(); // Hook para navegación entre rutas

  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    document.title = "OmniSound - Perfil";
  }, []); // Array vacío significa que solo se ejecuta una vez

  // Secciones disponibles en el perfil
  const profileSections = ['Pistas', 'Álbumes', 'Listas', 'Reposts', 'Likes', 'Historial'];

  // Filtros disponibles para la sección "Pistas"
  const contentFilters = ['Más recientes', 'Populares', 'Más antiguos'];

  // Función para redirigir a la sección "Subir" del SideBar
  const handleUploadRedirect = () => {
    navigate('/upload');
  };

  // Función para manejar el clic en el botón "Crea tu lista"
  const handleCreateList = () => {
    console.log('Botón "Crea tu lista" clickeado');
    // Aquí iría la lógica futura para crear una lista
  };

  return (
    <div className="profile-container">

      {/* Sección de información del perfil */}
      <div className="profile-header">
        {/* Imagen del perfil */}
        <div className="profile-image-circle"></div>

        {/* Contenedor de información del artista */}
        <div className="profile-info">
          {/* Nombre del artista */}
          <h1 className="profile-artist-name">Artista</h1>

          {/* Botones de perfil */}
          <div className="profile-action-buttons">
            {/* Botón Editar perfil */}
            <button className="profile-edit-button">Editar perfil</button>
            
            {/* Botón Compartir perfil */}
            <button className="profile-share-button">
              <ShareIcon className="profile-share-icon" />
            </button>
          </div>

          {/* Estadísticas del perfil */}
          <div className="profile-stats">
            {/* Texto Publicaciones */}
            <span className="profile-stat-text">0 Publicaciones</span>
            
            {/* Enlace Siguiendo */}
            <a href="#!" className="profile-stat-link">0 Siguiendo</a>
            
            {/* Enlace Seguidores */}
            <a href="#!" className="profile-stat-link">0 Seguidores</a>
            
            {/* Texto Me gustas */}
            <span className="profile-stat-text">0 Me gustas</span>
          </div>

          {/* Biografía del artista */}
          <p className="profile-bio">Biografía del artista.</p>
        </div>
      </div>

      {/* Contenedor para secciones */}
      <div className="profile-sections-container">
        {/* Secciones del perfil */}
        <div className="profile-sections-nav">
          {profileSections.map((section) => (
            <button
              key={section}
              className={`profile-section-button ${activeSection === section ? 'active' : ''}`}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </div>

        {/* Contenedor para botones de acción */}
        <div className="profile-section-actions">
          {/* Filtros de contenido - Se muestran solo en la sección "Pistas" */}
          {activeSection === 'Pistas' && (
            <div className="profile-content-filters">
              {contentFilters.map((filter) => (
                <button
                  key={filter}
                  className={`profile-filter-button ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}

          {/* Botón Subir - Se muestra solo en la sección "Álbumes" */}
          {activeSection === 'Álbumes' && (
            <button 
              className="profile-upload-button"
              onClick={handleUploadRedirect}
            >
              Subir
            </button>
          )}

          {/* Botón Crea tu lista - Se muestra solo en la sección "Listas" */}
          {activeSection === 'Listas' && (
            <button 
              className="profile-create-list-button"
              onClick={handleCreateList}
            >
              Crea tu lista
            </button>
          )}
        </div>
      </div>

      {/* Contenedor para el contenido de las pistas/álbumes/etc */}
      <div className="profile-content">
        {/* Mensaje temporal hasta que se implemente el contenido real */}
        <p className="profile-empty-state">
          Contenido de {activeSection} {activeSection === 'Pistas' ? `(${activeFilter})` : ''} aparecerá aquí
        </p>
      </div>
    </div>
  );
}

export default Profile;