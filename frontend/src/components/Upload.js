import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Upload.css';

// Importar iconos como componentes React
import { ReactComponent as UploadCloud } from '../icons/UploadCloudIcon.svg';
import { ReactComponent as AudioFileIcon } from '../icons/AudioFileIcon.svg';

function Upload() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [fileError, setFileError] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "OmniSound - Subir";

    // Verificar autenticación al cargar el componente
    checkAuthentication();
  }, []); // Array vacío significa que solo se ejecuta una vez

  // Función para verificar autenticación con el backend
  const checkAuthentication = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        // Intentar obtener el perfil del usuario autenticado desde el backend
        const response = await fetch('http://localhost:5000/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Si el token no es válido, limpiar el localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  // Validar archivo de audio
  const validateAudioFile = (file) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac', 'audio/x-m4a'];
    const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];

    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      return 'Formato de archivo no soportado. Usa MP3, WAV, OGG, M4A o FLAC.';
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      return 'El archivo es muy grande (máximo 50MB)';
    }

    return null;
  };

  const handleFileSelect = (file) => {
    const error = validateAudioFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
      setPreviewAudio(null);
      return;
    }

    setFileError('');
    setSelectedFile(file);

    // Crear preview del audio
    const audioUrl = URL.createObjectURL(file);
    setPreviewAudio(audioUrl);

    // Si está autenticado, redirigir a metadata
    if (isAuthenticated) {
      navigate('/metadata', { 
        state: { 
          audioFile: file,
          audioUrl: audioUrl
        } 
      });
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleChooseFileClick = () => {
    if (!isAuthenticated) {
      // Redirigir a la página de Inicia sesión si no está autenticado
      navigate('/signin');
    } else {
      fileInputRef.current.click();
    }
  };

  // Función para manejar el arrastre de archivos sobre el dropzone
  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    if (!isAuthenticated) {
      // Redirigir a la página de Inicia sesión si no está autenticado
      navigate('/signin');
      return;
    }

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Si está cargando, mostrar un estado de carga simple
  if (loading) {
    return (
      <div className="upload-container">
        <h2 className="upload-title">Subir</h2>
        <div className="upload-content">
          <div className="upload-dropzone">
            <div>Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container">

      {/* Título de la sección */}
      <h2 className="upload-title">Subir</h2>

      {/* Contenido de subida */}
      <div className="upload-content">
        {/* Input oculto para archivos */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".mp3,.wav,.ogg,.m4a,.flac,audio/*"
          style={{ display: 'none' }}
        />

        {/* Área de arrastrar y soltar */}
        <div 
          className="upload-dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Ícono UploadCloud encima del texto */}
          <UploadCloud className="upload-cloud-icon" />
          <p className="upload-dropzone-text">Arrastra y suelta archivos de audio para empezar.</p>

          {/* Botón Elegir archivos - Redirige a SignIn si no está autenticado */}
          <button 
            className="upload-choose-button"
            onClick={handleChooseFileClick}
          >
            Elegir archivos
          </button>

          {fileError && (
            <div className="upload-error-message">
              {fileError}
            </div>
          )}

          {selectedFile && !fileError && (
            <div className="upload-file-preview">
              <AudioFileIcon className="audio-file-icon" />
              <div className="upload-file-info">
                <div className="upload-file-name">{selectedFile.name}</div>
                <div className="upload-file-size">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
                <div className="upload-file-status">
                  Archivo listo. Redirigiendo a metadatos...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenedor para las secciones de información */}
        <div className="upload-info-sections-row">
          {/* Información de tamaño y duración */}
          <div className="upload-info-section">
            <h3 className="upload-info-title">Tamaño y duración</h3>
            <p className="upload-info-text">Tamaño máximo: 50 MB y duración del audio: 60 minutos.</p>
          </div>

          {/* Información de formatos de archivo */}
          <div className="upload-info-section">
            <h3 className="upload-info-title">Formatos de archivo</h3>
            <p className="upload-info-text">Formatos soportados: MP3, WAV, OGG, M4A, FLAC.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;