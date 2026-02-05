import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Upload.css';
import { usePlayer } from '../context/PlayerContext';

// Importar iconos como componentes React
import { ReactComponent as UploadCloud } from '../icons/UploadCloudIcon.svg';
import { ReactComponent as AudioFileIcon } from '../icons/AudioFileIcon.svg';

function Upload() {
  const { isPlaying, togglePlayPause, currentSong, playerVisible } = usePlayer(); // Obtener estado y funciones del reproductor desde el contexto

  const [isAuthenticated, setIsAuthenticated] = useState(false); // Indica si el usuario está autenticado
  const [loading, setLoading] = useState(true); // Estado de carga durante la verificación de autenticación
  const [selectedFile, setSelectedFile] = useState(null); // Archivo de audio seleccionado
  const [previewAudio, setPreviewAudio] = useState(null); // URL temporal para previsualizar el audio
  const [fileError, setFileError] = useState(''); // Mensaje de error si el archivo no es válido

  const fileInputRef = useRef(null); // Referencia al input de tipo file para abrir el selector de archivos
  const navigate = useNavigate(); // Hook para navegar entre páginas

  // Función que verifica si el usuario tiene una sesión activa
  const checkAuthentication = async () => {
    const token = localStorage.getItem('token'); // Obtiene el token de autenticación
    const storedUser = localStorage.getItem('user'); // Obtiene los datos del usuario

    if (token && storedUser) {
      try {
        // Realiza una petición al servidor para validar el token
        const response = await fetch('http://localhost:5000/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (response.ok) {
          // Si la respuesta es OK, el usuario está autenticado
          setIsAuthenticated(true);
        } else {
          // Si la respuesta no es OK, elimina los datos y establece como no autenticado
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Si hay error en la petición, elimina los datos y establece como no autenticado
        console.error('Error al verificar autenticación:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    } else {
      // Si no hay token o datos de usuario, establece como no autenticado
      setIsAuthenticated(false);
    }

    setLoading(false); // Finaliza el estado de carga
  };

  // Función que valida si un archivo de audio cumple con los requisitos
  const validateAudioFile = (file) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac', 'audio/x-m4a']; // Tipos MIME válidos
    const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac']; // Extensiones de archivo válidas
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase(); // Obtiene la extensión del archivo

    // Verifica si el tipo MIME o la extensión son válidos
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      return 'Formato de archivo no soportado. Usa MP3, WAV, OGG, M4A o FLAC.';
    }

    // Verifica que el tamaño del archivo no exceda 50MB
    if (file.size > 50 * 1024 * 1024) {
      return 'El archivo es muy grande (máximo 50MB)';
    }

    // Retorna null si no hay errores
    return null;
  };

  // Función para manejar la selección de un archivo
  const handleFileSelect = (file) => {
    const error = validateAudioFile(file); // Valida el archivo seleccionado

    if (error) {
      // Si hay error, actualiza el estado con el mensaje y limpia la selección
      setFileError(error);
      setSelectedFile(null);
      setPreviewAudio(null);
      return;
    }

    setFileError(''); // Limpia cualquier error previo
    setSelectedFile(file); // Almacena el archivo seleccionado

    const audioUrl = URL.createObjectURL(file); // Crea una URL temporal para el archivo
    setPreviewAudio(audioUrl); // Almacena la URL para previsualización

    // Si el usuario está autenticado, navega a la página de metadatos
    if (isAuthenticated) {
      navigate('/metadata', { 
        state: { 
          audioFile: file,
          audioUrl: audioUrl
        } 
      });
    }
  };

  // Función para manejar el cambio en el input de archivo
  const handleFileInputChange = (e) => {
    const file = e.target.files[0]; // Obtiene el primer archivo seleccionado

    if (file) {
      handleFileSelect(file); // Llama a la función de manejo de selección
    }
  };

  // Función para manejar el clic en el botón de elegir archivos
  const handleChooseFileClick = () => {
    // Si no está autenticado, redirige a la página de inicio de sesión
    if (!isAuthenticated) {
      navigate('/signin');
    } else {
      // Si está autenticado, activa el input de archivo oculto
      fileInputRef.current.click();
    }
  };

  // Función para manejar el evento de arrastrar sobre la zona de drop
  const handleDragOver = (event) => {
    event.preventDefault(); // Previene el comportamiento por defecto
    event.currentTarget.classList.add('drag-over'); // Añade clase para feedback visual
  };

  // Función para manejar el evento de salida del arrastre de la zona de drop
  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over'); // Remueve la clase de feedback visual
  };

  // Función para manejar el evento de soltar archivos en la zona de drop
  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    // Si no está autenticado, redirige a la página de inicio de sesión
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    const files = event.dataTransfer.files; // Obtiene los archivos soltados

    // Si hay archivos, procesa el primero
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    document.title = "OmniSound - Subir"; // Establece el título de la pestaña

    checkAuthentication(); // Verifica la autenticación al montar el componente

    // Si hay una canción reproduciéndose, la pausa automáticamente
    if (playerVisible && currentSong && isPlaying) {
      togglePlayPause();
    }

    // Función de limpieza para revocar la URL temporal cuando el componente se desmonte
    return () => {
      if (previewAudio) {
        URL.revokeObjectURL(previewAudio);
      }
    };
  }, []); // Array vacío significa que solo se ejecuta una vez

  // Muestra un estado de carga mientras se verifica la autenticación
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

      <div className="upload-content">
        {/* Input oculto para seleccionar archivos */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".mp3,.wav,.ogg,.m4a,.flac,audio/*" // Formatos aceptados
          style={{ display: 'none' }} // Oculto visualmente
        />

        {/* Zona de arrastrar y soltar archivos */}
        <div 
          className="upload-dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Ícono Subir archivo */}
          <UploadCloud className="upload-cloud-icon" />
          <p className="upload-dropzone-text">Arrastra y suelta archivos de audio para empezar.</p>

          {/* Botón Elegir archivos */}
          <button 
            className="upload-choose-button"
            onClick={handleChooseFileClick}
          >
            Elegir archivos
          </button>

          {/* Muestra mensaje de error si hay un problema con el archivo */}
          {fileError && (
            <div className="upload-error-message">
              {fileError}
            </div>
          )}

          {/* Muestra información del archivo seleccionado si no hay errores */}
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

        {/* Sección de información sobre los límites y formatos */}
        <div className="upload-info-sections-row">
          <div className="upload-info-section">
            <h3 className="upload-info-title">Tamaño y duración</h3>
            <p className="upload-info-text">Tamaño máximo: 50 MB y duración del audio: 60 minutos.</p>
          </div>

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