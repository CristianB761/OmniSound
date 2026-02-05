import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Profile.css';
import EditProfileModal from './ProfileModals/EditProfileModal';
import ShareProfileModal from './ProfileModals/ShareProfileModal';
import ProfileStatsModal from './ProfileModals/ProfileStatsModal';
import CreatePlaylistModal from './ProfileModals/CreatePlaylistModal';
import SongCard from '../SongCard';

// Importar ícono como componente React
import { ReactComponent as ShareIcon } from '../../icons/ShareIcon.svg';

function Profile() {
  const [activeSection, setActiveSection] = useState('Pistas'); // Sección activa del perfil
  const [activeFilter, setActiveFilter] = useState('Más recientes'); // Filtro activo para contenido

  const [profilePicture, setProfilePicture] = useState(null); // URL de la foto de perfil
  const [userData, setUserData] = useState({
    username: '', // Nombre de usuario
    realName: '', // Nombre real
    bio: '', // Biografía del usuario
    profileUrl: '', // URL personalizada del perfil
    stats: {
      posts: 0, // Número de publicaciones
      followers: 0, // Número de seguidores
      following: 0, // Número de usuarios seguidos
      likes: 0 // Número de likes recibidos
    }
  });

  const [showEditModal, setShowEditModal] = useState(false); // Controla visibilidad del modal de edición
  const [showShareModal, setShowShareModal] = useState(false); // Controla visibilidad del modal de compartir
  const [showStatsModal, setShowStatsModal] = useState(false); // Controla visibilidad del modal de estadísticas
  const [followModalTab, setFollowModalTab] = useState('Siguiendo'); // Pestaña activa en el modal de estadísticas
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false); // Controla visibilidad del modal de crear playlist

  const [isOwnProfile, setIsOwnProfile] = useState(false); // Indica si es el perfil del usuario actual
  const [loading, setLoading] = useState(true); // Estado de carga del perfil
  const [userSongs, setUserSongs] = useState([]); // Lista de canciones del usuario
  const [loadingSongs, setLoadingSongs] = useState(false); // Estado de carga de canciones
  const [isFollowing, setIsFollowing] = useState(false); // Indica si el usuario actual sigue a este perfil
  const [followLoading, setFollowLoading] = useState(false); // Estado de carga al seguir/dejar de seguir

  const { username } = useParams(); // Obtiene el nombre de usuario de la URL
  const navigate = useNavigate(); // Hook para navegación

  // Lista de secciones disponibles en el perfil
  const profileSections = ['Pistas', 'Álbumes', 'Playlists', 'Reposts', 'Likes', 'Historial'];
  
  // Filtros disponibles para el contenido
  const contentFilters = ['Más recientes', 'Populares', 'Más antiguos'];

  // Verifica si el usuario actual sigue al usuario del perfil
  const checkIfFollowing = async (targetUserId) => {
    const token = localStorage.getItem('token');

    if (!token || !targetUserId) return;

    try {
      const followingList = JSON.parse(localStorage.getItem('omnisound_following') || '[]');
      setIsFollowing(followingList.includes(targetUserId));
    } catch (error) {
      console.error('Error al verificar seguimiento:', error);
    }
  };

  // Maneja seguir o dejar de seguir a un usuario
  const handleFollowToggle = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/signin');
      return;
    }

    if (!userData.id) return;

    setFollowLoading(true);
    try {
      const followingList = JSON.parse(localStorage.getItem('omnisound_following') || '[]');

      if (isFollowing) {
        // Dejar de seguir: remueve el ID de la lista
        const newList = followingList.filter(id => id !== userData.id);
        localStorage.setItem('omnisound_following', JSON.stringify(newList));
        setIsFollowing(false);

        // Actualiza estadísticas localmente
        setUserData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: Math.max(0, prev.stats.followers - 1)
          }
        }));
      } else {
        // Seguir: agrega el ID a la lista
        followingList.push(userData.id);
        localStorage.setItem('omnisound_following', JSON.stringify(followingList));
        setIsFollowing(true);

        // Actualiza estadísticas localmente
        setUserData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: prev.stats.followers + 1
          }
        }));
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  // Carga las canciones del usuario desde la API
  const loadUserSongs = async (userId) => {
    if (!userId) return;

    setLoadingSongs(true);
    try {
      const response = await fetch(`http://localhost:5000/api/songs/user/${userId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          setUserSongs(data.songs);
        }
      }
    } catch (error) {
      console.error('Error al cargar canciones del usuario:', error);
    } finally {
      setLoadingSongs(false);
    }
  };

  // Redirige a la página de subida de contenido
  const handleUploadRedirect = () => {
    navigate('/upload');
  };

  // Abre el modal para crear una nueva playlist
  const handleCreatePlaylist = () => {
    setShowCreatePlaylistModal(true);
  };

  // Maneja la creación de una nueva playlist (función vacía por implementar)
  const handleSavePlaylist = (playlistData) => {};

  // Actualiza los datos del perfil después de editar
  const handleSaveProfile = (newData) => {
    setUserData(prev => ({
      ...prev,
      username: newData.displayName || prev.username,
      realName: newData.realName || prev.realName,
      bio: newData.bio || prev.bio,
      profileUrl: newData.profileUrl || prev.profileUrl
    }));

    // Actualiza la foto de perfil si se proporciona una nueva
    if (newData.profilePicture) {
      if (newData.profilePicture.startsWith('http')) {
        setProfilePicture(newData.profilePicture);
      } else {
        setProfilePicture(`http://localhost:5000${newData.profilePicture}`);
      }
    }
  };

  // Efecto para cargar los datos del perfil cuando cambia el username
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('user'));

        // Redirige al login si no hay token ni username
        if (!token && !username) {
          navigate('/signin');
          return;
        }

        // Redirige al perfil propio si no hay username especificado
        if (token && currentUser && !username) {
          navigate(`/${currentUser.username}`);
          return;
        }

        let profileUsername = username;

        // Solicita los datos del perfil a la API
        const response = await fetch(`http://localhost:5000/api/profile/${profileUsername}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();

          // Determina si es el perfil del usuario actual
          if (currentUser && currentUser.username === data.profile.username) {
            setIsOwnProfile(true);
          } else {
            setIsOwnProfile(false);
            checkIfFollowing(data.profile.id);
          }

          // Actualiza los datos del perfil con la respuesta de la API
          setUserData({
            id: data.profile.id,
            username: data.profile.username,
            realName: data.profile.real_name || '',
            bio: data.profile.bio || '',
            profileUrl: data.profile.profile_url || '',
            stats: data.profile.stats
          });

          // Carga la foto de perfil si está disponible
          if (data.profile.profile_picture_url) {
            setProfilePicture(`http://localhost:5000${data.profile.profile_picture_url}`);
          }

          // Carga las canciones del usuario
          if (data.profile.id) {
            loadUserSongs(data.profile.id);
          }
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

  // Muestra estado de carga mientras se obtienen los datos del perfil
  if (loading) {
    return <div className="profile-container">Cargando perfil...</div>;
  }

  return (
    <div className="profile-container">
      {/* Modal para editar perfil */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
          currentUser={userData}
        />
      )}

      {/* Modal para compartir perfil */}
      <ShareProfileModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profileUrl={userData.profileUrl || userData.username}
      />

      {/* Modal para estadísticas del perfil */}
      <ProfileStatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        profileUrl={userData.profileUrl || userData.username}
        initialTab={followModalTab}
        username={userData.username}
      />

      {/* Modal para crear playlist */}
      {isOwnProfile && (
        <CreatePlaylistModal
          isOpen={showCreatePlaylistModal}
          onClose={() => setShowCreatePlaylistModal(false)}
          onSave={handleSavePlaylist}
        />
      )}

      {/* Encabezado del perfil */}
      <div className="profile-header">
        {/* Foto de perfil del artista */}
        <div
          className="profile-picture-circle"
          style={profilePicture ? { backgroundImage: `url(${profilePicture})` } : {}}
        ></div>

        {/* Información del artista */}
        <div className="profile-info">
          <div className="profile-name-container">
            {/* Nombre de usuario del artista */}
            <h1 className="profile-user-name">{userData.username || 'Usuario'}</h1>

            {/* Nombre real del artista */}
            {userData.realName && (
              <span className="profile-real-name">{userData.realName}</span>
            )}
          </div>

          {/* Botones de acción del perfil */}
          <div className="profile-action-buttons">
            {isOwnProfile ? (
              // Botón Editar perfil
              <button
                className="profile-edit-button"
                onClick={() => setShowEditModal(true)}
              >
                Editar perfil
              </button>
            ) : (
              // Botón Seguir/Siguiendo
              <button
                className={`profile-follow-button ${isFollowing ? 'following' : ''}`}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? 'Cargando...' : (isFollowing ? 'Siguiendo' : 'Seguir')}
              </button>
            )}

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
            <span className="profile-stat-text">{userData.stats.posts || 0} Publicaciones</span>

            {/* Enlace Siguiendo */}
            <button
              className="profile-stat-link"
              onClick={() => {
                setFollowModalTab('Siguiendo');
                setShowStatsModal(true);
              }}
            >
              {userData.stats.following || 0} Siguiendo
            </button>

            {/* Enlace Seguidores */}
            <button
              className="profile-stat-link"
              onClick={() => {
                setFollowModalTab('Seguidores');
                setShowStatsModal(true);
              }}
            >
              {userData.stats.followers || 0} Seguidores
            </button>

            {/* Texto Me gustas */}
            <span className="profile-stat-text">{userData.stats.likes || 0} Me gustas</span>
          </div>

          {/* Biografía del artista */}
          {userData.bio && <p className="profile-bio">{userData.bio}</p>}
        </div>
      </div>

      {/* Navegación entre secciones del perfil */}
      <div className="profile-sections-container">
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

        {/* Grupo de acciones por sección */}
        {isOwnProfile && (
          <div className="profile-section-actions">
            {/* Filtros de contenido - Se muestran en la sección "Pistas" */}
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

            {/* Botón Subir - Se muestra en la sección "Álbumes" */}
            {activeSection === 'Álbumes' && (
              <button
                className="profile-upload-button"
                onClick={handleUploadRedirect}
              >
                Subir
              </button>
            )}

            {/* Botón Crea tu playlist - Se muestra en la sección "Playlists" */}
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

      {/* Contenido de la sección activa */}
      {activeSection === 'Pistas' && (
        loadingSongs ? (
          <p className="profile-empty-state">Cargando canciones...</p>
        ) : userSongs.length > 0 ? (
          <div className="profile-songs-container">
            {userSongs.map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <p className="profile-empty-state">
            {isOwnProfile ? 'Aún no has subido ninguna canción' : 'Este usuario no ha subido canciones'}
          </p>
        )
      )}
    </div>
  );
}

export default Profile;