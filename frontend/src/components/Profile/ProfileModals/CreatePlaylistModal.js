import React, { useState, useEffect } from 'react';
import './CreatePlaylistModal.css';

// Importar ícono como componentes React
import { ReactComponent as CloseIcon } from '../../../icons/CloseIcon.svg';

function CreatePlaylistModal({ isOpen, onClose, onSave }) {
  const [playlistName, setPlaylistName] = useState(''); // Guarda el nombre de la playlist
  const [privacy, setPrivacy] = useState('Público');    // Guarda la opción de privacidad seleccionada

  // Efecto para el shortcut de teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose(); // ESC: Cierra el modal
    };

    // Agrega el event listener cuando el componente se monta
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Limpia el event listener cuando el componente se desmonta
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Función que valida y guarda los datos de la nueva playlist
  const handleSave = () => {
    // Verifica que el nombre no esté vacío
    if (!playlistName.trim()) {
      alert('Por favor, ingresa un nombre para la playlist');
      return;
    }

    // Estructura de datos que se enviará al componente padre
    const playlistData = {
      name: playlistName,
      privacy: privacy,
      createdAt: new Date().toISOString()
    };

    // Envía los datos al componente padre
    onSave(playlistData);

    //  Resetea el formulario después de guardar
    setPlaylistName('');
    setPrivacy('Público');
    onClose();
  };

  // Si el modal no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    <div className="create-playlist-modal-overlay">
      <div className="create-playlist-modal">

        {/* Botón Cerrar modal con ícono */}
        <button 
          className="create-playlist-close-button" 
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="create-playlist-close-icon" />
        </button>

        {/* Encabezado del modal con título */}
        <div className="create-playlist-header">
          <h2 className="create-playlist-title">Crea tu Playlist</h2>
        </div>

        {/* Formulario */}
        <div className="create-playlist-form">
          {/* Input título del playlist */}
          <div className="create-playlist-field">
            <label className="create-playlist-label" htmlFor="playlist-name">
              Título<span className="required-asterisk">*</span>
            </label>
            <input
              id="playlist-name"
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Elige un título"
              className="create-playlist-input"
              autoFocus
            />
          </div>

          {/* Opciones de privacidad */}
          <div className="create-playlist-field">
            <div className="privacy-group">
              <span className="privacy-label">Privacidad:</span>
              <div className="create-playlist-privacy-options">
                {/* Opción Público */}
                <label className="create-playlist-privacy-option">
                  <input
                    type="radio"
                    name="privacy"
                    value="Público"
                    checked={privacy === 'Público'}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="create-playlist-privacy-radio"
                  />
                  <span className="create-playlist-privacy-text">Público</span>
                </label>

                {/* Opción Privado */}
                <label className="create-playlist-privacy-option">
                  <input
                    type="radio"
                    name="privacy"
                    value="Privado"
                    checked={privacy === 'Privado'}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="create-playlist-privacy-radio"
                  />
                  <span className="create-playlist-privacy-text">Privado</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <hr className="create-playlist-divider" />

        {/* Botones de acción */}
        <div className="create-playlist-buttons">
          {/* Botón Cancelar */}
          <button 
            className="create-playlist-cancel-button"
            onClick={onClose}
          >
            Cancelar
          </button>

          {/* Botón Guardar - Se habilita solo cuando es válido */}
          <button 
            className="create-playlist-save-button"
            onClick={handleSave}
            disabled={!playlistName.trim()}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePlaylistModal;