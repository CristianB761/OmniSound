import React, { useEffect, useRef, useState } from 'react';
import './SongCard.css';
import WaveSurfer from 'wavesurfer.js';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';

// Importar iconos como componentes React
import { ReactComponent as PlayIcon } from '../icons/PlayIcon.svg';
import { ReactComponent as PauseIcon } from '../icons/PauseIcon.svg';
import { ReactComponent as LikeIcon } from '../icons/LikeIcon.svg';
import { ReactComponent as RepeatIcon } from '../icons/RepeatIcon.svg';
import { ReactComponent as AddIcon } from '../icons/AddIcon.svg';
import { ReactComponent as CopyIcon } from '../icons/CopyIcon.svg';
import { ReactComponent as ReportIcon } from '../icons/ReportIcon.svg';
import { ReactComponent as CommentIcon } from '../icons/CommentIcon.svg';
import { ReactComponent as MusicIcon } from '../icons/MusicIcon.svg';

function SongCard({ song = null }) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  
  const [isHovering, setIsHovering] = useState(false);
  const [isReposted, setIsReposted] = useState(false); // Estado para reposts
  const [repostCount, setRepostCount] = useState(song?.reposts || 0); // Contador de reposts
  const [imageError, setImageError] = useState(false);
  const [waveformReady, setWaveformReady] = useState(false);

  // Usar el contexto del reproductor
  const { 
    currentSong, 
    isPlaying, 
    currentTime, 
    duration,
    playSong,
    seekTo,
    toggleLike,
    isSongLiked
  } = usePlayer();

  // Hook para navegación
  const navigate = useNavigate();

  // Determinar si esta canción es la que se está reproduciendo
  const isCurrentSong = currentSong && currentSong.id === song.id;
  
  // Determinar si esta canción tiene like
  const songIsLiked = song ? isSongLiked(song.id) : false;

  // ==================== VERIFICAR REPOST AL CARGAR ====================
  useEffect(() => {
    const checkUserRepost = async () => {
      const token = localStorage.getItem('token');
      if (!token || !song?.id) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/songs/${song.id}/repost`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsReposted(data.reposted);
          }
        }
      } catch (error) {
        console.error('Error al verificar repost:', error);
      }
    };
    
    checkUserRepost();
  }, [song?.id]);

  // ==================== INICIALIZAR WAVESURFER (SOLO VISUAL) ====================
  useEffect(() => {
    if (!song?.audioUrl || !waveformRef.current || wavesurfer.current) {
      return;
    }

    console.log('Inicializando WaveSurfer para:', song.title);

    try {
      // Crear instancia de WaveSurfer SIN reproducir
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#696969',
        progressColor: isCurrentSong ? '#20B2AA' : '#696969',
        cursorColor: 'transparent',
        barWidth: 3,
        barRadius: 3,
        barGap: 1,
        height: 50,
        responsive: true,
        backend: 'MediaElement',
        normalize: false,
        barHeight: 1,
        cursorWidth: 0,
        interact: false
      });

      // Obtener URL del audio
      const audioUrl = song.audioUrl.startsWith('http') 
        ? song.audioUrl 
        : `http://localhost:5000${song.audioUrl}`;

      // Cargar el audio (solo para visualización)
      wavesurfer.current.load(audioUrl);

      // Eventos de WaveSurfer
      wavesurfer.current.on('ready', () => {
        console.log('WaveSurfer listo para:', song.title);
        setWaveformReady(true);
      });

      wavesurfer.current.on('error', (error) => {
        console.error('Error en WaveSurfer:', error);
      });

    } catch (error) {
      console.error('Error al inicializar WaveSurfer:', error);
    }

    // Limpieza
    return () => {
      if (wavesurfer.current) {
        console.log('Limpiando WaveSurfer para:', song.title);
        try {
          wavesurfer.current.destroy();
        } catch (error) {
          console.error('Error al destruir WaveSurfer:', error);
        }
        wavesurfer.current = null;
      }
    };
  }, [song?.audioUrl, song?.title, isCurrentSong]);

  // ==================== SINCRONIZAR WAVESURFER CON TIEMPO REAL ====================
  useEffect(() => {
    if (wavesurfer.current && waveformReady) {
      if (isCurrentSong && duration > 0) {
        // Sincronizar WaveSurfer con el tiempo real
        const progress = currentTime / duration;
        wavesurfer.current.seekTo(progress);
      } else {
        // Si no es la canción actual, resetear
        wavesurfer.current.seekTo(0);
      }
    }
  }, [isCurrentSong, currentTime, duration, waveformReady]);

  // ==================== MANEJAR REPRODUCCIÓN ====================
  const togglePlayPause = () => {
    playSong(song);
  };

  const handleImageClick = () => {
    togglePlayPause();
  };

  // ==================== NUEVA FUNCIÓN: Navegar al perfil del artista ====================
  const handleArtistClick = () => {
    if (!song?.artist) return;
    
    // Navegar al perfil del artista (usando el nombre de usuario)
    // El perfil está en la ruta: /{username}
    navigate(`/${song.artist}`);
  };

  const handleWaveformClick = (e) => {
    if (!wavesurfer.current || !waveformRef.current || !isCurrentSong) return;

    try {
      const rect = waveformRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      
      if (width === 0) return;
      
      const percentage = x / width;
      const seekTime = percentage * duration;
      
      // Buscar en la canción real (usando la función del contexto)
      seekTo(seekTime);
      
    } catch (error) {
      console.error('Error en click de waveform:', error);
    }
  };

  // ==================== MANEJADORES DE INTERACCIÓN ====================
  const handleLike = () => {
    if (!song || !song.id) return;
    toggleLike(song.id);
  };

  const handleRepost = async () => {
    if (!song || !song.id) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Debes iniciar sesión para repostear');
      // Opcional: redirigir a login
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/songs/${song.id}/repost`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsReposted(data.reposted);
          // Actualizar contador
          if (data.reposted) {
            setRepostCount(prev => prev + 1);
          } else {
            setRepostCount(prev => Math.max(0, prev - 1));
          }
          
          console.log(`Canción ${song.id} ${data.reposted ? 'reposteada' : 'no reposteada'}`);
        }
      } else {
        console.error('Error al hacer repost');
      }
    } catch (error) {
      console.error('Error al hacer repost:', error);
    }
  };

  const handleAddToPlaylist = () => {
    console.log('Añadir a playlist');
  };

  const handleCopyLink = () => {
    if (!song) return;
    
    const artistSlug = song.artist?.toLowerCase().replace(/\s+/g, '-') || 'artista';
    const titleSlug = song.title?.toLowerCase().replace(/\s+/g, '-') || 'cancion';
    const link = `omnisound.com/${artistSlug}/${titleSlug}`;
    
    navigator.clipboard.writeText(link)
      .then(() => console.log('Enlace copiado:', link))
      .catch(err => console.error('Error copiando enlace:', err));
  };

  const handleReport = () => {
    console.log('Reportar');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Si no hay canción, no renderizar
  if (!song) {
    return null;
  }

  return (
    <div className="songcard">
      {/* Contenedor de la imagen de la canción */}
      <div 
        className="songcard-image-container"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleImageClick}
      >
        {song.imageUrl && !imageError ? (
          <img 
            src={song.imageUrl.startsWith('http') ? song.imageUrl : `http://localhost:5000${song.imageUrl}`}
            alt={song.title}
            className="songcard-image"
            onError={handleImageError}
          />
        ) : (
          <div className="songcard-image-placeholder"></div>
        )}
        {isHovering && (
          <div className="songcard-play-overlay">
            <button 
              className="songcard-play-pause-button" 
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
            >
              {isCurrentSong && isPlaying ? (
                <PauseIcon className="songcard-pause-icon" />
              ) : (
                <PlayIcon className="songcard-play-icon" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Contenido principal de la tarjeta */}
      <div className="songcard-content">
        {/* Fila superior: Artista y tiempo transcurrido */}
        <div className="songcard-header">
          {/* Artista ahora es clickable */}
          <button 
            className="songcard-artist-button"
            onClick={handleArtistClick}
          >
            {song.artist}
          </button>
          <div className="songcard-time-ago">{song.timeAgo}</div>
        </div>

        {/* Fila media: Título y género musical */}
        <div className="songcard-info-row">
          <div className="songcard-title">{song.title}</div>
          {song.genre && song.genre.trim() !== '' && (
            <div className="songcard-genre">{song.genre}</div>
          )}
        </div>

        {/* Waveform de WaveSurfer (sincronizado y limpio) */}
        <div className="songcard-waveform-container">
          <div className="songcard-duration">
            {song.duration}
          </div>
          <div 
            className="songcard-waveform" 
            ref={waveformRef}
            onClick={handleWaveformClick}
            style={{ cursor: isCurrentSong ? 'pointer' : 'default' }}
          >
            {/* WaveSurfer maneja internamente el progreso */}
          </div>
        </div>

        {/* Fila inferior: Acciones y estadísticas */}
        <div className="songcard-footer">
          <div className="songcard-actions">
            {/* Botón Like - Ahora sincronizado con el contexto */}
            <button 
              className={`songcard-action-button songcard-like-button ${songIsLiked ? 'active' : ''}`}
              onClick={handleLike}
            >
              <LikeIcon className="songcard-action-icon" />
              <span className={`songcard-action-count ${songIsLiked ? 'active' : ''}`}>
                {songIsLiked ? (song.likes + 1) : song.likes}
              </span>
            </button>

            {/* Botón Repost - ACTUALIZADO con funcionalidad real */}
            <button 
              className={`songcard-action-button songcard-repost-button ${isReposted ? 'active' : ''}`}
              onClick={handleRepost}
            >
              <RepeatIcon className="songcard-action-icon" />
              <span className={`songcard-action-count ${isReposted ? 'active' : ''}`}>
                {repostCount}
              </span>
            </button>

            <button 
              className="songcard-action-button songcard-playlist-button"
              onClick={handleAddToPlaylist}
            >
              <AddIcon className="songcard-action-icon" />
            </button>

            <button 
              className="songcard-action-button songcard-copy-button"
              onClick={handleCopyLink}
            >
              <CopyIcon className="songcard-action-icon" />
            </button>

            <button 
              className="songcard-action-button songcard-report-button"
              onClick={handleReport}
            >
              <ReportIcon className="songcard-action-icon" />
            </button>
          </div>

          <div className="songcard-stats">
            <div className="songcard-stat-item">
              <MusicIcon className="songcard-stat-icon" />
              <span className="songcard-stat-value">{song.plays}</span>
            </div>

            <div className="songcard-stat-item">
              <CommentIcon className="songcard-stat-icon" />
              <span className="songcard-stat-value">{song.comments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SongCard;