import React, { useState, useRef, useEffect } from 'react';
import './EditProfileModal.css';

// Importar ícono como componentes React
import { ReactComponent as CloseIcon } from '../../../icons/CloseIcon.svg';

function EditProfileModal({ isOpen, onClose, onSave, currentUser }) {
  const [displayName, setDisplayName] = useState(currentUser?.username || ''); // Nombre de usuario mostrado
  const [profileUrl, setProfileUrl] = useState(currentUser?.profileUrl || 'artista'); // URL personalizada del perfil
  const [realName, setRealName] = useState(currentUser?.realName || ''); // Nombre real del usuario
  const [bio, setBio] = useState(currentUser?.bio || ''); // Biografía del usuario
  const [profilePicture, setProfilePicture] = useState(null); // Foto de perfil seleccionada
  const [picturePreview, setPicturePreview] = useState(null); // Vista previa de la foto
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
      setProfilePicture(null); // Esto se mantiene para nueva foto
      
      // Cargar la foto de perfil actual si existe
      if (currentUser?.profile_picture_url) {
        // Si es una URL completa, usarla directamente
        if (currentUser.profile_picture_url.startsWith('http')) {
          setPicturePreview(currentUser.profile_picture_url);
        } else {
          // Si es una ruta relativa, construir la URL completa
          setPicturePreview(`http://localhost:5000${currentUser.profile_picture_url}`);
        }
      } else {
        setPicturePreview(null);
      }
    }
  }, [isOpen, currentUser]);

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

  // Función para verificar si hay cambios en el formulario
  const hasChanges = () => {
    const originalUser = currentUser || {};
    return (
      displayName.trim() !== (originalUser.username || '') ||
      profileUrl.trim() !== (originalUser.profileUrl || 'artista') ||
      realName.trim() !== (originalUser.realName || '') ||
      bio.trim() !== (originalUser.bio || '') ||
      profilePicture !== null
    );
  };

  // Determina si el formulario completo es válido
  const isFormValid = isValidUsername(displayName) && isValidProfileUrl(profileUrl);

  // El botón se habilita solo cuando hay cambios válidos
  const enableSaveButton = isFormValid && hasChanges();

  // Maneja la subida de la foto de perfil
  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verifica que sea una imagen
    if (!file.type.startsWith('image/')) return;

    setProfilePicture(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPicturePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Simula clic en el input de archivo oculto cuando se presiona el botón de foto
  const handlePictureButtonClick = () => {
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
  const handleSave = async () => {
    if (!enableSaveButton) return;

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No se encontró token de autenticación');
        return;
      }

      // Subir foto de perfil si hay una nueva
      let uploadedPictureUrl = null;
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profile_picture', profilePicture);

        const uploadResponse = await fetch('http://localhost:5000/api/profile/upload-picture', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const uploadData = await uploadResponse.json();

        if (uploadResponse.ok) {
          uploadedPictureUrl = uploadData.profile_picture_url;
          console.log('Foto de perfil subida exitosamente:', uploadedPictureUrl);
        } else {
          console.error('Error al subir foto de perfil:', uploadData.error);
          // Continuar con la actualización de perfil incluso si falla la subida de foto
        }
      }

      // Preparar datos del perfil (sin incluir la foto)
      const userData = {
        username: displayName.trim(),
        profile_url: profileUrl.trim(),
        real_name: realName.trim(),
        bio: bio.trim()
      };

      // Actualizar perfil
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar localStorage con los nuevos datos del usuario
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const updatedUser = {
          ...storedUser,
          username: data.profile.username,
          real_name: data.profile.real_name,
          bio: data.profile.bio,
          profile_url: data.profile.profile_url
        };

        // Si se subió una nueva foto, actualizar la URL en localStorage
        if (uploadedPictureUrl) {
          updatedUser.profile_picture_url = uploadedPictureUrl;
        }

        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Llamar a onSave con los nuevos datos
        onSave({
          displayName: data.profile.username,
          profileUrl: data.profile.profile_url,
          realName: data.profile.real_name,
          bio: data.profile.bio,
          profilePicture: uploadedPictureUrl || null
        });
        
        onClose();
      } else {
        console.error('Error al actualizar perfil:', data.error);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
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

        {/* Sección de foto del perfil */}
        <div className="edit-profile-picture-section">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePictureUpload}
            accept="image/*" // Acepta cualquier tipo de foto
            className="edit-profile-file-input"
          />
          <div className="edit-profile-picture-container">
            {/* Foto de perfil */}
            <div 
              className="edit-profile-picture-circle"
              style={picturePreview ? { backgroundImage: `url(${picturePreview})` } : {}}
            ></div>
            <button 
              className="edit-profile-picture-button"
              onClick={handlePictureButtonClick}
            >
              {profilePicture || picturePreview ? 'Sustituir foto' : 'Subir foto'}
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

          {/* Botón Guardar cambios - Se habilita solo cuando hay cambios válidos */}
          <button 
            className="edit-profile-save-button"
            onClick={handleSave}
            disabled={!enableSaveButton}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;