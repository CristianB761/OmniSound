import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MusicPlayer.css';

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
  const [isPlaying, setIsPlaying] = useState(false); // Indica si la música está reproduciéndose
  const [isMuted, setIsMuted] = useState(false); // Indica si el audio está silenciado
  const [isLiked, setIsLiked] = useState(false); // Indica si la canción actual tiene me gusta
  const [isShuffled, setIsShuffled] = useState(false); // Modo aleatorio
  const [repeatMode, setRepeatMode] = useState('off'); // Modo repetir: 'off', 'repeat-all', 'repeat-once'
  const [volume, setVolume] = useState(100); // Nivel de volumen de 0 a 100
  const [isDragging, setIsDragging] = useState(false); // Para arrastrar la barra de volumen
  const [showLyric, setShowLyric] = useState(false); // Controla la visualización de la letra
  const [showQueue, setShowQueue] = useState(false); // Controla la visualización de la cola

  const volumeBarRef = useRef(null); // Referencia para la barra de volumen

  // Función para alternar entre play y pause
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prevIsPlaying => !prevIsPlaying);
  }, []);

  // Función para alternar el silencio del volumen
  const toggleMute = useCallback(() => {
    if (isMuted) {
      // Al des-silenciar, si el volumen está en 0%, lo ponemos en 1% para evitar silencio total
      setIsMuted(false);
      if (volume === 0) {
        setVolume(1);
      }
    } else {
      // Al silenciar, guardamos el volumen actual
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // Función para alternar el estado de me gusta
  const toggleLike = useCallback(() => {
    setIsLiked(prevIsLiked => !prevIsLiked);
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

  // Función para cambiar el modo repetir: off -> repeat-all -> repeat-once -> off
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prevMode => {
      if (prevMode === 'off') return 'repeat-all';
      if (prevMode === 'repeat-all') return 'repeat-once';
      return 'off';
    });
  }, []);

  // Función para obtener el icono de repetir según el modo
  const getRepeatIcon = useCallback(() => {
    switch (repeatMode) {
      case 'repeat-all': return <RepeatIcon className="repeat-icon" />;
      case 'repeat-once': return <RepeatOnceIcon className="repeat-once-icon" />;
      default: return <RepeatIcon className="repeat-icon" />;
    }
  }, [repeatMode]); // Depende del modo repetir

  // Función para obtener el icono de volumen según el nivel y estado de silencio
  const getVolumeIcon = useCallback(() => {
    if (isMuted || volume === 0) return <VolumeMuteIcon className="volume-icon" />;
    if (volume >= 76) return <VolumeHighIcon className="volume-icon" />;
    if (volume >= 26) return <VolumeMediumIcon className="volume-icon" />;
    return <VolumeLowIcon className="volume-icon" />;
  }, [isMuted, volume]); // Depende del nivel de volumen y estado de silencio

  // Función para obtener el icono de reproducir/pausar
  const getPlayPauseIcon = useCallback(() => {
    return isPlaying ? 
      <PauseIcon className="pause-icon" /> : 
      <PlayIcon className="play-icon" />;
  }, [isPlaying]); // Depende del estado de reproducción

  // Función para actualizar el volumen basado en la posición del click/arrastre
  const updateVolume = useCallback((clientX) => {
    if (!volumeBarRef.current) return;

    // Calcula la nueva posición del volumen basada en la posición del ratón
    const rect = volumeBarRef.current.getBoundingClientRect();
    let newVolume = ((clientX - rect.left) / rect.width) * 100;
    newVolume = Math.max(0, Math.min(100, newVolume)); // Limita entre 0 y 100

    setVolume(newVolume);

    // Silencia automáticamente cuando llega a 0, des-silencia si sube de 0
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  }, [isMuted]);

  // Manejadores de eventos del ratón para el control de volumen por arrastre
  const handleVolumeMouseDown = useCallback((e) => {
    setIsDragging(true);
    updateVolume(e.clientX);
  }, [updateVolume]);

  const handleVolumeMouseMove = useCallback((e) => {
    if (isDragging) {
      updateVolume(e.clientX);
    }
  }, [isDragging, updateVolume]);

  const handleVolumeMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Efecto para manejar los shortcuts de teclado
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ignora si el usuario está escribiendo en un input de texto
      if (event.target.matches('input, textarea, [contenteditable="true"]')) {
        return;
      }

      // Shortcuts de teclado:
      if (event.code === 'Space') {
        event.preventDefault(); // Evita el comportamiento por defecto del navegador
        togglePlayPause(); // Espacio: Reproducir/Pausar
      }
      else if (event.code === 'KeyM') {
        event.preventDefault();
        toggleMute(); // M: Silenciar/No silenciar
      }
      else if (event.code === 'KeyL') {
        event.preventDefault();
        toggleLike(); // L: Me gusta/No me gusta
      }
    };
    // Agrega el event listener cuando el componente se monta
    document.addEventListener('keydown', handleKeyPress);
    // Limpia el event listener cuando el componente se desmonta
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [togglePlayPause, toggleMute, toggleLike]);

  // Efecto para manejar el arrastre global del volumen
  useEffect(() => {
    if (isDragging) {
      // Agrega los event listeners globales cuando se está arrastrando
      document.addEventListener('mousemove', handleVolumeMouseMove);
      document.addEventListener('mouseup', handleVolumeMouseUp);
      // Limpia los event listeners globales cuando se deja de arrastrar
      return () => {
        document.removeEventListener('mousemove', handleVolumeMouseMove);
        document.removeEventListener('mouseup', handleVolumeMouseUp);
      };
    }
  }, [isDragging, handleVolumeMouseMove, handleVolumeMouseUp]);

  return (
    <div className="musicplayer">

      {/* Sección izquierda */}
      <div className="left-section">
        <div className="song-image"></div> {/* Imagen de la canción */}
        <div className="song-details">
          <div className="song-title">GATA ONLY ft. Cris MJ</div> {/* Título de la canción */}
          <div className="song-artist">FloyyMenor</div> {/* Artista de la canción */}
        </div>
        {/* Botón Like - Cambia de ícono según el estado */}
        <button 
          className={`like-button ${isLiked ? 'active' : ''}`}
          onClick={toggleLike}
          data-tooltip={isLiked ? "No me gusta" : "Me gusta"}
        >
          <LikeIcon className="like-icon" />
        </button>
      </div>

      {/* Sección central */}
      <div className="center-section">
        <div className="control-buttons">
          {/* Botón Aleatorio - Cambia de ícono según el modo */}
          <button 
            className={`shuffle-button ${isShuffled ? 'active' : ''}`}
            onClick={toggleShuffle}
            data-tooltip={isShuffled ? "Desactivar aleatorio" : "Activar aleatorio"}
          >
            <ShuffleIcon className="shuffle-icon" />
          </button>

          {/* Botón Anterior - Cambia a la canción anterior */}
          <button className="previous-button" data-tooltip="Anterior">
            <PreviousIcon className="previous-icon" />
          </button>

          {/* Botón Play/Pause - Cambia de ícono según el estado */}
          <button 
            className="play-pause-button" 
            onClick={togglePlayPause}
          >
            {getPlayPauseIcon()}
          </button>

          {/* Botón Siguiente - Cambia a la siguiente canción */}
          <button className="next-button" data-tooltip="Siguiente">
            <NextIcon className="next-icon" />
          </button>

          {/* Botón Repetir - Cambia de ícono según el modo */}
          <button 
            className={`repeat-button ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={toggleRepeat}
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
          <div className="elapsed-time">0:18</div> {/* Tiempo transcurrido */}
          <div className="progress-bar">
            <div className="progress"></div> {/* Progreso actual */}
          </div>
          <div className="total-duration">3:36</div> {/* Duración total */}
        </div>
      </div>

      {/* Sección derecha */}
      <div className="right-section">
        <div className="volume-control">
          {/* Botón Silenciar - Cambia de ícono según el estado */}
          <button 
            className={`volume-button ${isMuted ? 'active' : ''}`} 
            onClick={toggleMute}
            data-tooltip={isMuted ? "No Silenciar" : "Silenciar"}
          >
            {getVolumeIcon()}
          </button>

          {/* Barra de volumen interactiva - Se puede arrastrar */}
          <div 
            className="volume-bar"
            ref={volumeBarRef}
            onMouseDown={handleVolumeMouseDown}
          >
            <div 
              className="volume-level" 
              style={{ width: `${isMuted ? 0 : volume}%` }} // Ancho basado en volumen actual
            >
              <div className="volume-thumb"></div> {/* Control deslizante */}
            </div>
          </div>
        </div>

        {/* Botón Letra - Muestra/oculta la letra de la canción */}
        <button 
          className={`lyric-button ${showLyric ? 'active' : ''}`}
          onClick={toggleLyric}
          data-tooltip="Letra"
        >
          <LyricIcon className="lyric-icon" />
        </button>

        {/* Botón Cola - Muestra/oculta la cola de reproducción */}
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