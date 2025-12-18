import React, { useState, useRef, useEffect } from 'react';
import './EditProfileModal.css';

// Importar ícono como componentes React
import { ReactComponent as CloseIcon } from '../../../icons/CloseIcon.svg';

function EditProfileModal({ isOpen, onClose, onSave, currentUser }) {
  const [displayName, setDisplayName] = useState(currentUser?.username || ''); // Nombre de usuario mostrado
  const [profileUrl, setProfileUrl] = useState(currentUser?.profileUrl || 'artista'); // URL personalizada del perfil
  const [realName, setRealName] = useState(currentUser?.realName || ''); // Nombre real del usuario
  const [bio, setBio] = useState(currentUser?.bio || ''); // Biografía del usuario

  const [profileImage, setProfileImage] = useState(null); // Imagen de perfil seleccionada
  const [imagePreview, setImagePreview] = useState(null); // Vista previa de la imagen

  const [originalProfileUrl, setOriginalProfileUrl] = useState(currentUser?.profileUrl || 'artista'); // URL original para detectar cambios
  const [showUrlWarning, setShowUrlWarning] = useState(false); // Controla la visibilidad de la advertencia de URL

  const fileInputRef = useRef(null); // Referencia al input de archivo oculto

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

  // Efecto para resetear los estados cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentUser?.username || '');
      setProfileUrl(currentUser?.profileUrl || 'artista');
      setRealName(currentUser?.realName || '');
      setBio(currentUser?.bio || '');
      setOriginalProfileUrl(currentUser?.profileUrl || 'artista');
      setProfileImage(null);
      setImagePreview(null);
    }
  }, [isOpen, currentUser]);

 // Efecto para mostrar advertencia cuando se cambia la URL original
  useEffect(() => {
    if (profileUrl !== originalProfileUrl && profileUrl.trim() !== '') {
      setShowUrlWarning(true);
    } else {
      setShowUrlWarning(false);
    }
  }, [profileUrl, originalProfileUrl]);

  // Valida que el nombre de usuario tenga al menos 3 caracteres
  const isValidUsername = (username) => {
    return username.trim().length >= 3;
  };

  // Valida que la URL tenga al menos 3 caracteres
  const isValidProfileUrl = (url) => {
    if (url.trim().length < 3) return false;
    const urlRegex = /^[a-z0-9-_]+$/; // Solo letras minúsculas, números, guiones y guiones bajos
    return urlRegex.test(url);
  };

  // Determina si el formulario completo es válido
  const isFormValid = isValidUsername(displayName) && isValidProfileUrl(profileUrl);

  // Maneja la subida de la imagen de perfil
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verifica que sea una imagen
    if (!file.type.startsWith('image/')) return;

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Simula clic en el input de archivo oculto cuando se presiona el botón de imagen
  const handleImageButtonClick = () => {
    fileInputRef.current.click();
  };

  // Filtra la URL
  const handleProfileUrlChange = (e) => {
    const filteredValue = e.target.value
      .toLowerCase() // Convierte todo a minúsculas
      .replace(/[^a-z0-9-_]/g, ''); // Elimina caracteres no permitidos
    setProfileUrl(filteredValue);
  };

  // Prepara los datos y llama a la función onSave del componente padre
  const handleSave = () => {
    const userData = {
      displayName,
      profileUrl,
      realName,
      bio,
      profileImage
    };
    onSave(userData);
    onClose();
  };

  // Si el modal no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    <div className="edit-profile-modal-overlay">
      <div className="edit-profile-modal">

        {/* Botón Cerrar modal con ícono */}
        <button 
          className="edit-profile-close-button" 
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="edit-profile-close-icon" />
        </button>

        {/* Encabezado del modal con título */}
        <div className="edit-profile-header">
          <h2 className="edit-profile-title">Editar perfil</h2>
        </div>

        {/* Sección de imagen del perfil */}
        <div className="edit-profile-image-section">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*" // Acepta cualquier tipo de imagen
            className="edit-profile-file-input"
          />
          <div className="edit-profile-image-container">
            {/* Imagen del perfil */}
            <div 
              className="edit-profile-image-circle"
              style={imagePreview ? { backgroundImage: `url(${imagePreview})` } : {}}
            ></div>
            <button 
              className="edit-profile-image-button"
              onClick={handleImageButtonClick}
            >
              {profileImage || imagePreview ? 'Sustituir imagen' : 'Subir imagen'}
            </button>
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="edit-profile-form">
          {/* Input Nombre de usuario (obligatorio) */}
          <div className="edit-profile-field">
            <label className="edit-profile-label">
              Nombre de usuario<span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              className="edit-profile-input"
              placeholder="Nombre de usuario"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {/* Input URL del perfil (obligatorio) */}
          <div className="edit-profile-field">
            <label className="edit-profile-label">
              URL del perfil<span className="required-asterisk">*</span>
            </label>
            {/* Prefijo fijo que no se puede editar */}
            <div className="edit-profile-url-container">
              <span className="edit-profile-url-prefix">omnisound.com/</span>
              <input
                type="text"
                className="edit-profile-input edit-profile-url-input"
                placeholder=" " // Placeholder
                value={profileUrl}
                onChange={handleProfileUrlChange}
              />
            </div>
          </div>

          {/* Input Nombre real (opcional) */}
          <div className="edit-profile-field">
            <label className="edit-profile-label">Nombre</label>
            <input
              type="text"
              className="edit-profile-input"
              placeholder="Nombre"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
            />
          </div>

          {/* Input Biografía (opcional) */}
          <div className="edit-profile-field">
            <label className="edit-profile-label">Biografía</label>
            <div className="edit-profile-bio-container">
              <textarea
                className="edit-profile-textarea"
                placeholder="Descripción breve"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160} // Máximo de caracteres
                rows={4} // Limite de líneas
              />
              {/* Contador de caracteres */}
              <div className="edit-profile-char-count">
                {bio.length}/160
              </div>
            </div>
          </div>
        </div>

        {/* Advertencia del cambio de URL */}
        {showUrlWarning && (
          <div className="edit-profile-url-warning">
            Aviso: Estás a punto de cambiar tu antigua URL.<br />
            Los enlaces que compartiste en otros sitios dejarán de funcionar.
          </div>
        )}

        {/* Línea divisoria */}
        <hr className="edit-profile-divider" />

        {/* Botones de acción */}
        <div className="edit-profile-buttons">
          {/* Botón Cancelar */}
          <button 
            className="edit-profile-cancel-button"
            onClick={onClose}
          >
            Cancelar
          </button>
          {/* Botón Guardar cambios - Se habilita solo cuando es válido */}
          <button 
            className="edit-profile-save-button"
            onClick={handleSave}
            disabled={!isFormValid}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;