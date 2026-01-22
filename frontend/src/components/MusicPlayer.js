import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MusicPlayer.css';
import { usePlayer } from '../context/PlayerContext';

// Importar iconos como componentes React
import { ReactComponent as LikeIcon } from '../icons/LikeIcon.svg';
import { ReactComponent as ShuffleIcon } from '../icons/ShuffleIcon.svg';
import { ReactComponent as PreviousIcon } from '../icons/PreviousIcon.svg';
import { ReactComponent as NextIcon } from '../icons/NextIcon.svg';
import { ReactComponent as RepeatIcon } from '../icons/RepeatIcon.svg';
import { ReactComponent as RepeatOnceIcon } from '../icons/RepeatOnceIcon.svg';
import { ReactComponent as PlayIcon } from '../icons/PlayIcon.svg';
import { ReactComponent as PauseIcon } from '../icons/PauseIcon.svg';
import { ReactComponent as VolumeHighIcon } from '../icons/SpeakerHighIcon.svg';
import { ReactComponent as VolumeMediumIcon } from '../icons/SpeakerMediumIcon.svg';
import { ReactComponent as VolumeLowIcon } from '../icons/SpeakerLowIcon.svg';
import { ReactComponent as VolumeMuteIcon } from '../icons/MutedSpeakerIcon.svg';
import { ReactComponent as LyricIcon } from '../icons/LyricIcon.svg';
import { ReactComponent as QueueIcon } from '../icons/QueueIcon.svg';

function MusicPlayer() { 
  const [isShuffled, setIsShuffled] = useState(false);
  const [showLyric, setShowLyric] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

  const volumeBarRef = useRef(null);
  const progressBarRef = useRef(null);

  // Usar el contexto del reproductor
  const { 
    currentSong, 
    isPlaying, 
    volume, 
    repeatMode,
    isMuted,
    currentTime,
    duration,
    playerVisible,
    togglePlayPause, 
    changeVolume,
    toggleMute,
    toggleRepeatMode,
    toggleCurrentSongLike,
    isSongLiked,
    seekTo,
    audioRef
  } = usePlayer();

  // Función para formatear el tiempo
  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  // Función para alternar el modo aleatorio
  const toggleShuffle = useCallback(() => {
    setIsShuffled(prevIsShuffled => !prevIsShuffled);
  }, []);

  // Función para alternar la visualización de la letra
  const toggleLyric = useCallback(() => {
    setShowLyric(prev => !prev);
  }, []);

  // Función para alternar la visualización de la cola
  const toggleQueue = useCallback(() => {
    setShowQueue(prev => !prev);
  }, []);

  // Función para obtener el icono de repetir según el modo
  const getRepeatIcon = useCallback(() => {
    switch (repeatMode) {
      case 'repeat-all': return <RepeatIcon className="repeat-icon" />;
      case 'repeat-once': return <RepeatOnceIcon className="repeat-once-icon" />;
      default: return <RepeatIcon className="repeat-icon" />;
    }
  }, [repeatMode]);

  // Función para obtener el icono de volumen según el nivel
  const getVolumeIcon = useCallback(() => {
    if (isMuted || volume === 0) return <VolumeMuteIcon className="volume-icon" />;
    if (volume >= 76) return <VolumeHighIcon className="volume-icon" />;
    if (volume >= 26) return <VolumeMediumIcon className="volume-icon" />;
    return <VolumeLowIcon className="volume-icon" />;
  }, [volume, isMuted]);

  // Función para obtener el icono de reproducir/pausar
  const getPlayPauseIcon = useCallback(() => {
    return isPlaying ? 
      <PauseIcon className="pause-icon" /> : 
      <PlayIcon className="play-icon" />;
  }, [isPlaying]);

  // ==================== FUNCIONES PARA LA BARRA DE VOLUMEN ====================
  // Función para actualizar el volumen basado en la posición del click/arrastre
  const updateVolume = useCallback((clientX) => {
    if (!volumeBarRef.current) return;

    const rect = volumeBarRef.current.getBoundingClientRect();
    let newVolume = ((clientX - rect.left) / rect.width) * 100;
    newVolume = Math.max(0, Math.min(100, newVolume));

    changeVolume(newVolume);
  }, [changeVolume]);

  const handleVolumeMouseDown = useCallback((e) => {
    setIsDraggingVolume(true);
    updateVolume(e.clientX);
  }, [updateVolume]);

  // ==================== FUNCIONES PARA LA BARRA DE PROGRESO ====================
  // Función para actualizar el progreso de la canción
  const updateProgress = useCallback((clientX) => {
    if (!progressBarRef.current || !audioRef) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    let newProgress = ((clientX - rect.left) / rect.width) * duration;
    newProgress = Math.max(0, Math.min(duration, newProgress));

    seekTo(newProgress);
  }, [duration, seekTo, audioRef]);

  const handleProgressMouseDown = useCallback((e) => {
    setIsDraggingProgress(true);
    updateProgress(e.clientX);
  }, [updateProgress]);

  // ==================== MANEJADORES GLOBALES DE MOUSE ====================
  const handleMouseMove = useCallback((e) => {
    if (isDraggingVolume) {
      updateVolume(e.clientX);
    }
    if (isDraggingProgress) {
      updateProgress(e.clientX);
    }
  }, [isDraggingVolume, isDraggingProgress, updateVolume, updateProgress]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingVolume(false);
    setIsDraggingProgress(false);
  }, []);

  // ==================== MANEJAR ATAJOS DE TECLADO ====================
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ignora si el usuario está escribiendo en un input de texto
      if (event.target.matches('input, textarea, [contenteditable="true"]')) {
        return;
      }

      // Shortcuts de teclado:
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          togglePlayPause();
          break;

        case 'KeyM':
          event.preventDefault();
          toggleMute();
          break;

        case 'KeyL':
          event.preventDefault();
          toggleCurrentSongLike();
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [togglePlayPause, toggleMute, toggleCurrentSongLike]);

  // ==================== EFECTOS PARA ARRASTRE GLOBAL ====================
  useEffect(() => {
    if (isDraggingVolume || isDraggingProgress) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingVolume, isDraggingProgress, handleMouseMove, handleMouseUp]);

  // Si el reproductor no está visible, no renderizar nada
  if (!playerVisible) {
    return null;
  }

  // Si no hay canción, mostrar reproductor básico (sin información de canción)
  if (!currentSong) {
    return (
      <div className="musicplayer">
        <div className="left-section">
          <div className="song-image"></div>
          <div className="song-details">
            <div className="song-title">Selecciona una canción</div>
            <div className="song-artist">OmniSound</div>
          </div>
        </div>

        <div className="center-section">
          <div className="control-buttons">
            <button className="play-pause-button" disabled>
              <PlayIcon className="play-icon" />
            </button>
          </div>
          <div className="progress-container">
            <div className="elapsed-time">0:00</div>
            <div 
              className="progress-bar"
              ref={progressBarRef}
            >
              <div className="progress" style={{ width: '0%' }}>
                <div className="progress-thumb"></div>
              </div>
            </div>
            <div className="total-duration">0:00</div>
          </div>
        </div>

        <div className="right-section">
          <div className="volume-control">
            <button className="volume-button" disabled>
              <VolumeHighIcon className="volume-icon" />
            </button>
            <div 
              className="volume-bar"
              ref={volumeBarRef}
            >
              <div className="volume-level" style={{ width: '100%' }}>
                <div className="volume-thumb"></div>
              </div>
            </div>
          </div>
          <button className="lyric-button" disabled>
            <LyricIcon className="lyric-icon" />
          </button>
          <button className="queue-button" disabled>
            <QueueIcon className="queue-icon" />
          </button>
        </div>
      </div>
    );
  }

  // Verificar si la canción actual tiene like
  const currentSongIsLiked = isSongLiked(currentSong.id);

  return (
    <div className="musicplayer">

      {/* Sección izquierda */}
      <div className="left-section">
        <div 
          className="song-image"
          style={{
            backgroundImage: currentSong.imageUrl ? `url(${currentSong.imageUrl.startsWith('http') ? currentSong.imageUrl : `http://localhost:5000${currentSong.imageUrl}`})` : 'none',
            backgroundColor: currentSong.imageUrl ? 'transparent' : '#2c2c2c',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="song-details">
          <div className="song-title">{currentSong.title || 'Sin título'}</div>
          <div className="song-artist">{currentSong.artist || 'Artista desconocido'}</div>
        </div>
        {/* Botón Like */}
        <button 
          className={`like-button ${currentSongIsLiked ? 'active' : ''}`}
          onClick={toggleCurrentSongLike}
          data-tooltip={currentSongIsLiked ? "No me gusta" : "Me gusta"}
        >
          <LikeIcon className="like-icon" />
        </button>
      </div>

      {/* Sección central */}
      <div className="center-section">
        <div className="control-buttons">
          {/* Botón Aleatorio */}
          <button 
            className={`shuffle-button ${isShuffled ? 'active' : ''}`}
            onClick={toggleShuffle}
            data-tooltip={isShuffled ? "Desactivar aleatorio" : "Activar aleatorio"}
          >
            <ShuffleIcon className="shuffle-icon" />
          </button>

          {/* Botón Anterior - Por ahora sin funcionalidad */}
          <button className="previous-button" data-tooltip="Anterior" disabled>
            <PreviousIcon className="previous-icon" />
          </button>

          {/* Botón Play/Pause */}
          <button 
            className="play-pause-button" 
            onClick={togglePlayPause}
            data-tooltip={isPlaying ? "Pausar" : "Reproducir"}
          >
            {getPlayPauseIcon()}
          </button>

          {/* Botón Siguiente - Por ahora sin funcionalidad */}
          <button className="next-button" data-tooltip="Siguiente" disabled>
            <NextIcon className="next-icon" />
          </button>

          {/* Botón Repetir - Por ahora el Repetir una*/}
          <button 
            className={`repeat-button ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={toggleRepeatMode}
            data-tooltip={
              repeatMode === 'repeat-all' ? "Repetir todo" : 
              repeatMode === 'repeat-once' ? "Repetir una" : 
              "No repetir"
            }
          >
            {getRepeatIcon()}
          </button>
        </div>

        {/* Barra de progreso de la canción */}
        <div className="progress-container">
          <div className="elapsed-time">{formatTime(currentTime)}</div>
          <div 
            className="progress-bar"
            ref={progressBarRef}
            onMouseDown={handleProgressMouseDown}
          >
            <div 
              className="progress" 
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            >
              <div className="progress-thumb"></div>
            </div>
          </div>
          <div className="total-duration">{formatTime(duration)}</div>
        </div>
      </div>

      {/* Sección derecha */}
      <div className="right-section">
        <div className="volume-control">
          {/* Botón Silenciar */}
          <button 
            className={`volume-button ${isMuted ? 'active' : ''}`}
            onClick={toggleMute}
            data-tooltip={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {getVolumeIcon()}
          </button>

          {/* Barra de volumen interactiva */}
          <div 
            className="volume-bar"
            ref={volumeBarRef}
            onMouseDown={handleVolumeMouseDown}
          >
            <div 
              className="volume-level" 
              style={{ width: `${isMuted ? 0 : volume}%` }}
            >
              <div className="volume-thumb"></div>
            </div>
          </div>
        </div>

        {/* Botón Letra - Por ahora sin funcionalidad */}
        <button 
          className={`lyric-button ${showLyric ? 'active' : ''}`}
          onClick={toggleLyric}
          data-tooltip="Letra"
        >
          <LyricIcon className="lyric-icon" />
        </button>

        {/* Botón Cola - Por ahora sin funcionalidad */}
        <button 
          className={`queue-button ${showQueue ? 'active' : ''}`}
          onClick={toggleQueue}
          data-tooltip="Cola"
        >
          <QueueIcon className="queue-icon" />
        </button>
      </div>
    </div>
  );
}

export default MusicPlayer;