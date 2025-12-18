import React, { useState, useRef, useEffect } from 'react';
import './ShareProfileModal.css';

// Importar ícono como componentes React
import { ReactComponent as CloseIcon } from '../../../icons/CloseIcon.svg';

function ShareProfileModal({ isOpen, onClose, profileUrl = "artista" }) {
  const [isCopied, setIsCopied] = useState(false); // Controla si se ha copiado el enlace
  const inputRef = useRef(null); // Referencia al input del enlace

  // Construye la URL completa usando la URL del perfil
  const fullProfileUrl = `http://omnisound.com/${profileUrl}`;

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

   // Función para copiar la URL al portapapeles del usuario
  const handleCopy = () => {
    if (inputRef.current) {
      // Selecciona todo el texto del input
      inputRef.current.select();
      // Copia al portapapeles (método antiguo pero funciona)
      document.execCommand('copy');

      // Activa el estado de "copiado"
      setIsCopied(true);

      // Restablece el estado después de 2 segundos
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  // Si el modal no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    <div className="share-profile-modal-overlay">
      <div className="share-profile-modal">

        {/* Botón Cerrar modal con ícono */}
        <button 
          className="share-profile-close-button" 
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="share-profile-close-icon" />
        </button>

        {/* Encabezado del modal con título */}
        <div className="share-profile-header">
          <h2 className="share-profile-title">Compartir</h2>
        </div>

        {/* Contenido del modal */}
        <div className="share-profile-content">
          {/* Input URL del perfil */}
          <div className="share-profile-url-container">
            <input
              ref={inputRef}
              type="text"
              value={fullProfileUrl}
              readOnly
              className="share-profile-url-input"
              onClick={(e) => e.target.select()}
            />
            {/* Mensaje de confirmación */}
            {isCopied && (
              <span className="share-profile-copied-message">¡Copiado!</span>
            )}
          </div>

          {/* Línea divisoria */}
          <hr className="share-profile-separator" />

          {/* Botón Copiar */}
          <div className="share-profile-actions">
            <button 
              className={`share-profile-copy-button ${isCopied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {isCopied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareProfileModal;