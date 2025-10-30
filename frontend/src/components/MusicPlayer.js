import React from 'react';
import './MusicPlayer.css';

function MusicPlayer() {
  return (
    <div className="music-player">
      {/* Sección izquierda - Información de la canción */}
      <div className="song-info-section">
        <div className="album-image"></div>
        <div className="song-details">
          <div className="song-title">GATA ONLY ft. Cris MJ</div>
          <div className="song-artist">FloyyMenor</div>
        </div>
        <div className="heart-icon tooltip-container" data-tooltip="Me gusta">❤</div>
      </div>

      {/* Sección central - Controles de reproducción */}
      <div className="playback-controls">
        <div className="control-buttons">
          <button className="control-button control-button-shuffle-repeat tooltip-container" data-tooltip="Aleatorio">🔀</button> {/* Aleatorio */}
          <button className="control-button control-button-prev-next tooltip-container" data-tooltip="Anterior">⏮️</button> {/* Anterior */}
          <button className="play-pause-button">⏸</button> {/* Play/Pause */}
          <button className="control-button control-button-prev-next tooltip-container" data-tooltip="Siguiente">⏭️</button> {/* Siguiente */}
          <button className="control-button control-button-shuffle-repeat tooltip-container" data-tooltip="Repetir">🔁</button> {/* Repetir */}
        </div>
        
        <div className="progress-container">
          <div className="time-display">0:00</div>
          <div className="progress-bar">
            <div className="progress"></div>
          </div>
          <div className="time-display">3:45</div>
        </div>
      </div>

      {/* Sección derecha - Controles adicionales */}
      <div className="additional-controls">
        <div className="volume-control">
          <button className="control-icon tooltip-container" data-tooltip="Volumen">🔊</button>
          <div className="volume-bar">
            <div className="volume-level"></div>
          </div>
        </div>
        <button className="control-icon tooltip-container" data-tooltip="Letra">🎤</button> {/* Letra */}
        <button className="control-icon tooltip-container" data-tooltip="Cola">📋</button> {/* Cola */}
      </div>
    </div>
  );
}

export default MusicPlayer;