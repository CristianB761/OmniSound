import React, { useState, useRef, useEffect } from 'react';
import './EditProfileModal.css';

// Importar ícono como componente React
import { ReactComponent as CloseIcon } from '../../../icons/CloseIcon.svg';

function EditProfileModal({ isOpen, onClose, onSave, currentUser }) {
  const [displayName, setDisplayName] = useState(currentUser?.username || ''); // Nombre de usuario visible
  const [profileUrl, setProfileUrl] = useState(currentUser?.profileUrl || 'artista'); // URL personalizada del perfil
  const [realName, setRealName] = useState(currentUser?.realName || ''); // Nombre real del usuario
  const [bio, setBio] = useState(currentUser?.bio || ''); // Biografía del usuario

  const [profilePicture, setProfilePicture] = useState(null); // Archivo de imagen seleccionado
  const [picturePreview, setPicturePreview] = useState(null); // Vista previa de la imagen

  const [originalProfileUrl, setOriginalProfileUrl] = useState(currentUser?.profileUrl || 'artista'); // URL original para comparar cambios
  const [showUrlWarning, setShowUrlWarning] = useState(false); // Muestra advertencia si se cambia la URL

  const fileInputRef = useRef(null); // Referencia al input de archivo oculto

  useEffect(() => {
    // Configurar tecla ESC para cerrar
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
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

  // Efecto para inicializar los campos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentUser?.username || '');
      setProfileUrl(currentUser?.profileUrl || 'artista');
      setRealName(currentUser?.realName || '');
      setBio(currentUser?.bio || '');
      setOriginalProfileUrl(currentUser?.profileUrl || 'artista');
      setProfilePicture(null);
      
      // Cargar vista previa de la foto de perfil actual si existe
      if (currentUser?.profile_picture_url) {
        if (currentUser.profile_picture_url.startsWith('http')) {
          setPicturePreview(currentUser.profile_picture_url);
        } else {
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

  // Valida que la URL del perfil solo contenga caracteres permitidos
  const isValidProfileUrl = (url) => {
    if (url.trim().length < 3) return false;
    const urlRegex = /^[a-z0-9-_]+$/;
    return urlRegex.test(url);
  };

  // Verifica si hubo cambios en los campos del formulario
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

  const isFormValid = isValidUsername(displayName) && isValidProfileUrl(profileUrl);
  const enableSaveButton = isFormValid && hasChanges(); // Habilita botón solo si hay cambios válidos

  // Maneja la selección de archivo para la foto de perfil
  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    setProfilePicture(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPicturePreview(reader.result); // Crea vista previa como URL base64
    };
    reader.readAsDataURL(file);
  };

  // Simula clic en el input de archivo oculto
  const handlePictureButtonClick = () => {
    fileInputRef.current.click();
  };

  // Filtra caracteres no permitidos en la URL del perfil
  const handleProfileUrlChange = (e) => {
    const filteredValue = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
    setProfileUrl(filteredValue);
  };

  // Envía los datos del formulario al servidor
  const handleSave = async () => {
    if (!enableSaveButton) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No se encontró token de autenticación');
        return;
      }

      let uploadedPictureUrl = null;
      // Sube la nueva foto de perfil si se seleccionó una
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
        } else {
          console.error('Error al subir foto de perfil:', uploadData.error);
        }
      }

      // Prepara los datos del usuario para actualizar
      const userData = {
        username: displayName.trim(),
        profile_url: profileUrl.trim(),
        real_name: realName.trim(),
        bio: bio.trim()
      };

      // Envía la solicitud para actualizar el perfil
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
        // Actualiza los datos del usuario en localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const updatedUser = {
          ...storedUser,
          username: data.profile.username,
          real_name: data.profile.real_name,
          bio: data.profile.bio,
          profile_url: data.profile.profile_url
        };

        if (uploadedPictureUrl) {
          updatedUser.profile_picture_url = uploadedPictureUrl;
        }

        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Notifica al componente padre sobre los cambios guardados
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
        {/* Botón Cerrar con ícono */}
        <button 
          className="edit-profile-close-button" 
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="edit-profile-close-icon" />
        </button>

        {/* Encabezado del modal */}
        <div className="edit-profile-header">
          {/* Título del modal */}
          <h2 className="edit-profile-title">Editar perfil</h2>
        </div>

        {/* Sección para subir foto de perfil */}
        <div className="edit-profile-picture-section">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePictureUpload}
            accept="image/*"
            className="edit-profile-file-input"
          />
          {/* Foto de perfil */}
          <div className="edit-profile-picture-container">
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

        {/* Formulario de edición de perfil */}
        <div className="edit-profile-form">
          {/* Input nombre de usuario (obligatorio) */}
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
            {/* Prefijo no editable */}
            <div className="edit-profile-url-container">
              <span className="edit-profile-url-prefix">omnisound.com/</span>
              <input
                type="text"
                className="edit-profile-input edit-profile-url-input"
                placeholder=" "
                value={profileUrl}
                onChange={handleProfileUrlChange}
              />
            </div>
          </div>

          {/* Input nombre real (opcional) */}
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

          {/* Input biografía (opcional) */}
          <div className="edit-profile-field">
            <label className="edit-profile-label">Biografía</label>
            <div className="edit-profile-bio-container">
              <textarea
                className="edit-profile-textarea"
                placeholder="Descripción breve"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                rows={4}
              />
              {/* Contador de caracteres */}
              <div className="edit-profile-char-count">
                {bio.length}/160
              </div>
            </div>
          </div>
        </div>

        {/* Advertencia sobre cambio de URL */}
        {showUrlWarning && (
          <div className="edit-profile-url-warning">
            Aviso: Estás a punto de cambiar tu antigua URL.<br />
            Los enlaces que compartiste en otros sitios dejarán de funcionar.
          </div>
        )}

        {/* Línea divisoria visual */}
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

          {/* Botón Guardar cambios */}
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