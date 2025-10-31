import React, { useState, useEffect, useCallback } from 'react';
import './MusicPlayer.css';

function MusicPlayer() {
  // Estado para controlar si está reproduciendo o en pausa
  const [isPlaying, setIsPlaying] = useState(false);
  // Estado para controlar si el volumen está muteado
  const [isMuted, setIsMuted] = useState(false);
  // Estado para controlar si la canción tiene "me gusta"
  const [isLiked, setIsLiked] = useState(false);

  // Función para alternar entre play y pause
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prevIsPlaying => !prevIsPlaying);
  }, []);

  // Función para alternar entre mute y sonido
  const toggleMute = useCallback(() => {
    setIsMuted(prevIsMuted => !prevIsMuted);
  }, []);

  // Función para alternar entre me gusta y no me gusta
  const toggleLike = useCallback(() => {
    setIsLiked(prevIsLiked => !prevIsLiked);
  }, []);

  // Efecto para manejar las teclas de atajo
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Verificamos si la tecla presionada es la barra espaciadora
      if (event.code === 'Space') {
        // Prevenimos el comportamiento por defecto (scroll de página)
        event.preventDefault();
        // Alternamos entre play y pause
        togglePlayPause();
      }
      // Verificamos si la tecla presionada es 'm' o 'M'
      else if (event.code === 'KeyM') {
        // Prevenimos el comportamiento por defecto
        event.preventDefault();
        // Alternamos entre mute y no mute
        toggleMute();
      }
      // Verificamos si la tecla presionada es 'l' o 'L'
      else if (event.code === 'KeyL') {
        // Prevenimos el comportamiento por defecto
        event.preventDefault();
        // Alternamos entre me gusta y no me gusta
        toggleLike();
      }
    };

    // Agregar event listener
    document.addEventListener('keydown', handleKeyPress);

    // Limpiar event listener al desmontar
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [togglePlayPause, toggleMute, toggleLike]);

  return (
    <div className="music-player">
      {/* Sección izquierda - Información de la canción */}
      <div className="song-info-section">
        <div className="album-image"></div>
        <div className="song-details">
          <div className="song-title">GATA ONLY ft. Cris MJ</div>
          <div className="song-artist">FloyyMenor</div>
        </div>
        {/* Cambiamos el icono y tooltip según el estado */}
        <button 
          className={`heart-icon tooltip-container ${isLiked ? 'liked' : ''}`}
          data-tooltip={isLiked ? "No me gusta" : "Me gusta"}
          onClick={toggleLike}
        >
          {isLiked ? "❤" : "❤"}
        </button>
      </div>

      {/* Sección central - Controles de reproducción */}
      <div className="playback-controls">
        <div className="control-buttons">
          <button className="control-button control-button-shuffle-repeat tooltip-container" data-tooltip="Aleatorio">🔀</button> {/* Aleatorio */}
          <button className="control-button control-button-prev-next tooltip-container" data-tooltip="Anterior">⏮️</button> {/* Anterior */}
          {/* Botón de play/pause que cambia dinámicamente */}
          <button 
            className="play-pause-button tooltip-container" 
            data-tooltip={isPlaying ? "Pausar" : "Reproducir"}
            onClick={togglePlayPause}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button className="control-button control-button-prev-next tooltip-container" data-tooltip="Siguiente">⏭️</button> {/* Siguiente */}
          <button className="control-button control-button-shuffle-repeat tooltip-container" data-tooltip="Repetir">🔁</button> {/* Repetir */}
        </div>

        <div className="progress-container">
          <div className="time-display">0:18</div>
          <div className="progress-bar">
            <div className="progress"></div>
          </div>
          <div className="time-display">3:36</div>
        </div>
      </div>

      {/* Sección derecha - Controles adicionales */}
      <div className="additional-controls">
        <div className="volume-control">
          {/* Cambiamos el icono y tooltip según el estado */}
          <button 
            className="control-icon tooltip-container" 
            data-tooltip={isMuted ? "No silenciar" : "Silenciar"}
            onClick={toggleMute}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <div className="volume-bar">
            <div className="volume-level"></div>
          </div>
        </div>

        {/* Grupo de iconos de letra y cola */}
        <div className="lyrics-queue-group">
          <button className="control-icon tooltip-container" data-tooltip="Letra">🎤</button> {/* Letra */}
          <button className="control-icon tooltip-container" data-tooltip="Cola">📋</button> {/* Cola */}
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;