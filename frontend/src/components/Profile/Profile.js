import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import EditProfileModal from './ProfileModals/EditProfileModal';
import ShareProfileModal from './ProfileModals/ShareProfileModal';
import ProfileStatsModal from './ProfileModals/ProfileStatsModal';
import CreatePlaylistModal from './ProfileModals/CreatePlaylistModal';

// Importar ícono como componentes React
import { ReactComponent as ShareIcon } from '../../icons/ShareIcon.svg';

function Profile() {
  const [activeSection, setActiveSection] = useState('Pistas'); // Sección activa del perfil
  const [activeFilter, setActiveFilter] = useState('Más recientes'); // Filtro activo para la sección "Pistas"
  const [profileImage, setProfileImage] = useState(null); // Estado para la imagen del perfil
  const [showEditModal, setShowEditModal] = useState(false); // Estado para el modal editar perfil
  const [showShareModal, setShowShareModal] = useState(false); // Estado para el modal compartir perfil
  const [showStatsModal, setShowStatsModal] = useState(false); // Estado para el modal siguiendo/seguidores
  const [followModalTab, setFollowModalTab] = useState('Siguiendo');
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false); // Estado para el modal crea tu playlist
  const navigate = useNavigate(); // Hook para navegación entre rutas

  // Datos del usuario (simulados)
  const [userData, setUserData] = useState({
    username: 'Artista',
    realName: 'Nombre',
    bio: 'Biografía del artista.',
    profileUrl: 'artista'
  });

  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    document.title = "OmniSound - Perfil";
  }, []); // Array vacío significa que solo se ejecuta una vez

  // Secciones disponibles en el perfil
  const profileSections = ['Pistas', 'Álbumes', 'Playlists', 'Reposts', 'Likes', 'Historial'];

  // Filtros disponibles para la sección "Pistas"
  const contentFilters = ['Más recientes', 'Populares', 'Más antiguos'];

  // Función para redirigir a la sección "Subir" del SideBar
  const handleUploadRedirect = () => {
    navigate('/upload');
  };


  // Función para manejar el clic en el botón "Crea tu playlist"
  const handleCreatePlaylist = () => {
    setShowCreatePlaylistModal(true);
  };

  // Función para manejar la creación de playlist
  const handleSavePlaylist = (playlistData) => {
    console.log('Playlist creada:', playlistData);
    // Aquí iría la lógica futura para guardar la playlist
  };

  // Función para guardar los cambios del perfil
  const handleSaveProfile = (newData) => {
    setUserData(prev => ({
      ...prev,
      username: newData.displayName || prev.username,
      realName: newData.realName || prev.realName,
      bio: newData.bio || prev.bio,
      profileUrl: newData.profileUrl || prev.profileUrl
    }));

    // Si hay una nueva imagen, actualiza el estado
    if (newData.profileImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result); // Guarda la imagen como data URL
      };
      reader.readAsDataURL(newData.profileImage);
    }

    console.log('Perfil actualizado:', newData);
  };

  return (
    <div className="profile-container">
      {/* Modal Editar perfil */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
        currentUser={userData}
      />

      {/* Modal Compartir perfil */}
      <ShareProfileModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profileUrl={userData.profileUrl}
      />

      {/* Modal Siguiendo/Seguidores */}
      <ProfileStatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        profileUrl={userData.profileUrl}
        initialTab={followModalTab}
        username={userData.username}
      />

      {/* Modal Crea tu playlist */}
      <CreatePlaylistModal
        isOpen={showCreatePlaylistModal}
        onClose={() => setShowCreatePlaylistModal(false)}
        onSave={handleSavePlaylist}
      />

      {/* Sección de información del perfil */}
      <div className="profile-header">
        {/* Imagen del perfil */}
        <div 
          className="profile-image-circle"
          style={profileImage ? { backgroundImage: `url(${profileImage})` } : {}}
        ></div>

        {/* Contenedor de información del artista */}
        <div className="profile-info">
          {/* Contenedor de nombres */}
          <div className="profile-name-container">
            {/* Nombre de usuario del artista */}
            <h1 className="profile-user-name">{userData.username}</h1>
            {/* Nombre real del artista */}
            <span className="profile-real-name">{userData.realName}</span>
          </div>

          {/* Botones de perfil */}
          <div className="profile-action-buttons">
            {/* Botón Editar perfil */}
            <button 
              className="profile-edit-button"
              onClick={() => setShowEditModal(true)}
            >
              Editar perfil
            </button>

            {/* Botón Compartir perfil */}
            <button 
              className="profile-share-button"
              onClick={() => setShowShareModal(true)}
            >
              <ShareIcon className="profile-share-icon" />
            </button>
          </div>

          {/* Estadísticas del perfil */}
          <div className="profile-stats">
             {/* Texto Publicaciones */}
            <span className="profile-stat-text">0 Publicaciones</span>

            {/* Enlace Siguiendo */}
            <button 
              className="profile-stat-link"
              onClick={() => {
                setFollowModalTab('Siguiendo');
                setShowStatsModal(true);
              }}
            >
              0 Siguiendo
            </button>

            {/* Enlace Seguidores */}
            <button 
              className="profile-stat-link"
              onClick={() => {
                setFollowModalTab('Seguidores');
                setShowStatsModal(true);
              }}
            >
              0 Seguidores
            </button>

            {/* Texto Me gustas */}
            <span className="profile-stat-text">0 Me gustas</span>
          </div>

          {/* Biografía del artista */}
          <p className="profile-bio">{userData.bio}</p>
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

          {/* Botón Crea tu playlist - Se muestra solo en la sección "Playlists" */}
          {activeSection === 'Playlists' && (
            <button 
              className="profile-create-playlist-button"
              onClick={handleCreatePlaylist}
            >
              Crea tu playlist
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