import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [profilePicture, setProfilePicture] = useState(null); // Estado para la foto del perfil
  const [showEditModal, setShowEditModal] = useState(false); // Estado para el modal editar perfil
  const [showShareModal, setShowShareModal] = useState(false); // Estado para el modal compartir perfil
  const [showStatsModal, setShowStatsModal] = useState(false); // Estado para el modal siguiendo/seguidores
  const [followModalTab, setFollowModalTab] = useState('Siguiendo');
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false); // Estado para el modal crea tu playlist
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const { username } = useParams();
  const navigate = useNavigate(); // Hook para navegación entre rutas

  // Datos del perfil con valores por defecto
  const [userData, setUserData] = useState({
    username: '',
    realName: '',
    bio: '',
    profileUrl: '',
    stats: {
      posts: 0,
      followers: 0,
      following: 0,
      likes: 0
    }
  });

  // Secciones disponibles en el perfil
  const profileSections = ['Pistas', 'Álbumes', 'Playlists', 'Reposts', 'Likes', 'Historial'];

  // Filtros disponibles para la sección "Pistas"
  const contentFilters = ['Más recientes', 'Populares', 'Más antiguos'];

  // Efecto para verificar autenticación y cargar perfil
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('user'));

        // Caso 1: Sin sesión en /profile → Redirigir a Iniciar sesión
        if (!token && !username) {
          console.log('No autenticado - Redirigiendo a SignIn');
          navigate('/signin');
          return;
        }

        // Caso 2: Con sesión en /profile → Redirigir a Perfil
        if (token && currentUser && !username) {
          console.log(`Autenticado - Redirigiendo a Profile: /${currentUser.username}`);
          navigate(`/${currentUser.username}`);
          return;
        }

        // Caso 3: Pefil público (con username en URL)
        let profileUsername = username;
        let endpoint = '';
        let headers = {};
        
        if (profileUsername) {
          endpoint = `http://localhost:5000/api/profile/${profileUsername}`;

          // Verificar si es el perfil propio
          if (currentUser && currentUser.username === profileUsername) {
            setIsOwnProfile(true);
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
          }
        }

        // Hacer la petición al backend
        const response = await fetch(`http://localhost:5000/api/profile/${profileUsername}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData({
            username: data.profile.username,
            realName: data.profile.real_name || '',
            bio: data.profile.bio || '',
            profileUrl: data.profile.profile_url || '',
            stats: data.profile.stats
          });

          // Cargar la foto de perfil desde el backend
          if (data.profile.profile_picture_url) {
            setProfilePicture(`http://localhost:5000${data.profile.profile_picture_url}`);
          }

          console.log(`Perfil cargado: ${data.profile.username}`);
        } else {
          console.error('Error al cargar perfil');
          setUserData({
            username: profileUsername || '',
            realName: '',
            bio: '',
            profileUrl: '',
            stats: { posts: 0, followers: 0, following: 0, likes: 0 }
          });
        }
      } catch (error) {
        console.error('Error de red:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, navigate]);

  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    if (userData.username) {
      document.title = `OmniSound - ${userData.username}`;
    } else {
      document.title = "OmniSound - Perfil";
    }
  }, [userData.username]);

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

    // Si hay una nueva foto, actualizar el estado con la URL completa
    if (newData.profilePicture) {
      // Si newData.profilePicture ya es una URL completa, usarla directamente
      if (newData.profilePicture.startsWith('http')) {
        setProfilePicture(newData.profilePicture);
      } else {
        // Si es una ruta relativa, construir la URL completa
        setProfilePicture(`http://localhost:5000${newData.profilePicture}`);
      }
    }

    console.log('Perfil actualizado:', newData);
  };

  // Si está cargando, mostrar mensaje simple
  if (loading) {
    return <div className="profile-container">Cargando perfil...</div>;
  }

  return (
    <div className="profile-container">
      {/* Modal Editar perfil */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
          currentUser={userData}
        />
      )}

      {/* Modal Compartir perfil */}
      <ShareProfileModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profileUrl={userData.profileUrl || userData.username}
      />

      {/* Modal Siguiendo/Seguidores */}
      <ProfileStatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        profileUrl={userData.profileUrl || userData.username}
        initialTab={followModalTab}
        username={userData.username}
      />

      {/* Modal Crea tu playlist */}
      {isOwnProfile && (
        <CreatePlaylistModal
          isOpen={showCreatePlaylistModal}
          onClose={() => setShowCreatePlaylistModal(false)}
          onSave={handleSavePlaylist}
        />
      )}

      {/* Sección de información del perfil */}
      <div className="profile-header">
        {/* Foto de perfil - Vacía por defecto */}
        <div 
          className="profile-picture-circle"
          style={profilePicture ? { backgroundImage: `url(${profilePicture})` } : {}}
        ></div>

        {/* Contenedor de información del artista */}
        <div className="profile-info">
          {/* Contenedor de nombres */}
          <div className="profile-name-container">
            {/* Nombre de usuario del artista */}
            <h1 className="profile-user-name">{userData.username || 'Usuario'}</h1>
            {/* Nombre real del artista - Vacío por defecto */}
            {userData.realName && (
              <span className="profile-real-name">{userData.realName}</span>
            )}
          </div>

          {/* Botones de perfil - Solo para perfil propio */}
          {isOwnProfile && (
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
          )}

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

          {/* Biografía del artista - Vacía por defecto */}
          {userData.bio && <p className="profile-bio">{userData.bio}</p>}
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

        {/* Contenedor para botones de acción - Solo para perfil propio */}
        {isOwnProfile && (
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
        )}
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