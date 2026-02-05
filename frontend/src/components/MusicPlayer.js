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
  // Obtener el estado y funciones del reproductor desde el contexto
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

  const [isShuffled, setIsShuffled] = useState(false); // Controla si el modo aleatorio está activado
  const [showLyric, setShowLyric] = useState(false); // Controla si se muestra la letra de la canción
  const [showQueue, setShowQueue] = useState(false); // Controla si se muestra la cola de reproducción
  const [isDraggingVolume, setIsDraggingVolume] = useState(false); // Indica si el usuario está arrastrando el control de volumen
  const [isDraggingProgress, setIsDraggingProgress] = useState(false); // Indica si el usuario está arrastrando la barra de progreso
  
  const volumeBarRef = useRef(null); // Referencia a la barra de volumen
  const progressBarRef = useRef(null); // Referencia a la barra de progreso

  // Función para formatear el tiempo
  const formatTime = useCallback((seconds) => {
    // Convierte segundos a formato minutos:segundos
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  // Función para activar/desactivar el modo aleatorio
  const toggleShuffle = useCallback(() => {
    setIsShuffled(prevIsShuffled => !prevIsShuffled);
  }, [isShuffled]);

  // Función para mostrar/ocultar la letra
  const toggleLyric = useCallback(() => {
    setShowLyric(prev => !prev);
  }, []);

  // Función para mostrar/ocultar la cola de reproducción
  const toggleQueue = useCallback(() => {
    setShowQueue(prev => !prev);
  }, []);

  // Función para obtener el ícono de repetición según el modo
  const getRepeatIcon = useCallback(() => {
    switch (repeatMode) {
      case 'repeat-all': 
        return <RepeatIcon className="repeat-icon" />;
      case 'repeat-once': 
        return <RepeatOnceIcon className="repeat-once-icon" />;
      default: 
        return <RepeatIcon className="repeat-icon" />;
    }
  }, [repeatMode]);

  // Función para obtener el ícono de volumen según el nivel
  const getVolumeIcon = useCallback(() => {
    if (isMuted || volume === 0) 
      return <VolumeMuteIcon className="volume-icon" />;
    if (volume >= 76) 
      return <VolumeHighIcon className="volume-icon" />;
    if (volume >= 26) 
      return <VolumeMediumIcon className="volume-icon" />;
    return <VolumeLowIcon className="volume-icon" />;
  }, [volume, isMuted]);

  // Función para obtener el ícono de play/pause
  const getPlayPauseIcon = useCallback(() => {
    return isPlaying ? 
      <PauseIcon className="pause-icon" /> : 
      <PlayIcon className="play-icon" />;
  }, [isPlaying]);

  // Función para actualizar el volumen al arrastrar
  const updateVolume = useCallback((clientX) => {
    // Calcula el nuevo volumen basado en la posición horizontal del mouse
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    let newVolume = ((clientX - rect.left) / rect.width) * 100;
    newVolume = Math.max(0, Math.min(100, newVolume)); // Limita el valor entre 0 y 100
    changeVolume(newVolume);
  }, [changeVolume]);

  // Función para manejar el inicio del arrastre del volumen
  const handleVolumeMouseDown = useCallback((e) => {
    setIsDraggingVolume(true);
    updateVolume(e.clientX);
  }, [updateVolume]);

  // Función para actualizar el progreso al arrastrar
  const updateProgress = useCallback((clientX) => {
    // Calcula el nuevo tiempo de reproducción basado en la posición horizontal del mouse
    if (!progressBarRef.current || !audioRef) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    let newProgress = ((clientX - rect.left) / rect.width) * duration;
    newProgress = Math.max(0, Math.min(duration, newProgress)); // Limita el valor entre 0 y la duración total
    seekTo(newProgress);
  }, [duration, seekTo, audioRef]);

  // Función para manejar el inicio del arrastre del progreso
  const handleProgressMouseDown = useCallback((e) => {
    setIsDraggingProgress(true);
    updateProgress(e.clientX);
  }, [updateProgress]);

  // Función para manejar el movimiento del mouse durante el arrastre
  const handleMouseMove = useCallback((e) => {
    if (isDraggingVolume) {
      updateVolume(e.clientX);
    }
    
    if (isDraggingProgress) {
      updateProgress(e.clientX);
    }
  }, [isDraggingVolume, isDraggingProgress, updateVolume, updateProgress]);

  // Función para manejar la finalización del arrastre
  const handleMouseUp = useCallback(() => {
    setIsDraggingVolume(false);
    setIsDraggingProgress(false);
  }, []);

  // Efecto para manejar el shortcut de teclado
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Si están en un campo de texto, textarea o elemento editable, se ignora el shortcut
      if (event.target.matches('input, textarea, [contenteditable="true"]')) {
        return;
      }

      // Shortcut para activar/desactivar aleatorio (Shift + S)
      if (event.shiftKey && event.code === 'KeyS') {
        event.preventDefault(); // Evita el comportamiento por defecto del navegador
        event.stopPropagation();
        toggleShuffle();
        return;
      }

      // Shortcut para cambiar modo de repetición (Shift + R)
      if (event.shiftKey && event.code === 'KeyR') {
        event.preventDefault();
        event.stopPropagation();
        toggleRepeatMode();
        return;
      }

      // Manejo de otras teclas de acceso rápido
      switch (event.code) {
      // Al presionar 'Space'
        case 'Space':
          event.preventDefault(); // Evita el comportamiento por defecto del navegador
          togglePlayPause(); // Pausa/Reanuda la canción
          break;
        // Al presionar 'M' (mayúscula o minúscula)
        case 'KeyM':
          event.preventDefault();
          toggleMute(); // Silencia/No silencia la canción
          break;
        // Al presionar 'L' (mayúscula o minúscula)
        case 'KeyL':
          event.preventDefault();
          toggleCurrentSongLike(); // Marca/Desmarca el Me gusta.
          break;
        // Al presionar '0'
        case 'Digit0':
        case 'Numpad0':
          event.preventDefault();
          if (currentSong && duration > 0) {
            seekTo(0); // Reinicia la canción
          }
          break;
        // Al presionar '⬅'
        case 'ArrowLeft':
          event.preventDefault();
          if (currentSong && currentTime > 0) {
            const newTime = Math.max(0, currentTime - 5); // Retrocede 5 segundos
            seekTo(newTime);
          }
          break;
        // Al presionar '⮕'
        case 'ArrowRight':
          event.preventDefault();
          if (currentSong && currentTime < duration) {
            const newTime = Math.min(duration, currentTime + 5); // Avanza 5 segundos
            seekTo(newTime);
          }
          break;
        // Al presionar '⬆'
        case 'ArrowUp':
          event.preventDefault();
          if (volume < 100) {
            const newVolume = Math.min(100, volume + 5); // Aumenta 5% de volumen
            changeVolume(newVolume);
          }
          break;
        // Al presionar '⬇'
        case 'ArrowDown':
          event.preventDefault();
          if (volume > 0) {
            const newVolume = Math.max(0, volume - 5); // Disminuye 5% de volumen
            changeVolume(newVolume);
          }
          break;
        
        default:
          break;
      }
    };
    // Agrega el event listener cuando el componente se monta
    document.addEventListener('keydown', handleKeyPress);

    // Limpia el event listener cuando el componente se desmonta
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [
    togglePlayPause, 
    toggleMute, 
    toggleCurrentSongLike, 
    toggleShuffle, 
    toggleRepeatMode,
    seekTo, 
    currentSong, 
    duration, 
    currentTime, 
    volume, 
    changeVolume
  ]);

  // Efecto para manejar el arrastre del mouse en la barra de volumen y progreso
  useEffect(() => {
    if (isDraggingVolume || isDraggingProgress) {
      // Agrega event listeners para el movimiento y fin del arrastre
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        // Limpia los event listeners cuando el efecto se desmonta
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingVolume, isDraggingProgress, handleMouseMove, handleMouseUp]);

  // Si el reproductor no está visible, no renderiza nada
  if (!playerVisible) {
    return null;
  }

  // Si no hay canción actual, muestra el reproductor en estado vacío
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
            {/* Botón de play/pause deshabilitado cuando no hay canción */}
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
            {/* Botón de volumen deshabilitado cuando no hay canción */}
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
          {/* Botones de letra y cola deshabilitados cuando no hay canción */}
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

  // Verifica si la canción actual está marcada como "me gusta"
  const currentSongIsLiked = isSongLiked(currentSong.id);

  // Función para obtener el texto del tooltip del botón de repetición
  const getRepeatTooltip = () => {
    switch (repeatMode) {
      case 'repeat-all': 
        return `Repetir todo (Shift+R)`;
      case 'repeat-once': 
        return `Repetir una (Shift+R)`;
      default: 
        return `No repetir (Shift+R)`;
    }
  };

  return (
    <div className="musicplayer">
      {/* Sección izquierda del reproductor */}
      <div className="left-section">
        {/* Imagen de la canción */}
        <div 
          className="song-image"
          style={{
            backgroundImage: currentSong.imageUrl ? `url(${currentSong.imageUrl.startsWith('http') ? currentSong.imageUrl : `http://localhost:5000${currentSong.imageUrl}`})` : 'none',
            backgroundColor: currentSong.imageUrl ? 'transparent' : '#2c2c2c',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>

        {/* Detalles de la canción */}
        <div className="song-details">
          {/* Título de la canción */}
          <div className="song-title">{currentSong.title || 'Sin título'}</div>

          {/* Artista de la canción */}
          <div className="song-artist">{currentSong.artist || 'Artista desconocido'}</div>
        </div>

        {/* Botón Me gusta con ícono */}
        <button 
          className={`like-button ${currentSongIsLiked ? 'active' : ''}`}
          onClick={toggleCurrentSongLike}
          data-tooltip={currentSongIsLiked ? "No me gusta (L)" : "Me gusta (L)"}
        >
          <LikeIcon className="like-icon" />
        </button>
      </div>

      {/* Sección central del reproductor */}
      <div className="center-section">
        <div className="control-buttons">
          {/* Botón Aleatorio con ícono */}
          <button 
            className={`shuffle-button ${isShuffled ? 'active' : ''}`}
            onClick={toggleShuffle}
            data-tooltip={isShuffled ? "Desactivar aleatorio (Shift+S)" : "Activar aleatorio (Shift+S)"}
          >
            <ShuffleIcon className="shuffle-icon" />
          </button>

          {/* Botón Anterior con ícono */}
          <button className="previous-button" data-tooltip="Anterior" disabled>
            <PreviousIcon className="previous-icon" />
          </button>

          {/* Botón Reproducir/Pausar con ícono */}
          <button 
            className="play-pause-button" 
            onClick={togglePlayPause}
            data-tooltip={isPlaying ? "Pausar (Space)" : "Reproducir (Space)"}
          >
            {getPlayPauseIcon()}
          </button>

          {/* Botón Siguiente con ícono */}
          <button className="next-button" data-tooltip="Siguiente" disabled>
            <NextIcon className="next-icon" />
          </button>

          {/* Botón Repetir con ícono */}
          <button 
            className={`repeat-button ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={toggleRepeatMode}
            data-tooltip={getRepeatTooltip()}
          >
            {getRepeatIcon()}
          </button>
        </div>

        {/* Sección de la línea de tiempo */}
        <div className="progress-container">
          {/* Tiempo transcurrido */}
          <div className="elapsed-time">{formatTime(currentTime)}</div>
          {/* Barra de progreso - Se puede arrastrar */}
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
          {/* Duración total */}
          <div className="total-duration">{formatTime(duration)}</div>
        </div>
      </div>

      {/* Sección derecha del reproductor */}
      <div className="right-section">
        <div className="volume-control">
          {/* Botón Silenciar con ícono */}
          <button 
            className={`volume-button ${isMuted ? 'active' : ''}`}
            onClick={toggleMute}
            data-tooltip={isMuted ? "No silenciar (M)" : "Silenciar (M)"}
          >
            {getVolumeIcon()}
          </button>

          {/* Barra de volumen - Se puede arrastrar */}
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

        {/* Botón Letra con ícono */}
        <button 
          className={`lyric-button ${showLyric ? 'active' : ''}`}
          onClick={toggleLyric}
          data-tooltip="Letra"
        >
          <LyricIcon className="lyric-icon" />
        </button>

        {/* Botón Cola con ícono */}
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