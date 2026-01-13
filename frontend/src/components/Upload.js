import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Upload.css';

// Importar iconos como componentes React
import { ReactComponent as UploadCloud } from '../icons/UploadCloudIcon.svg';

function Upload() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación del usuario
  const [loading, setLoading] = useState(true); // Estado de carga para verificar autenticación

  const navigate = useNavigate(); // Hook para navegar entre páginas

  // Cambia el título de la pestaña del navegador cuando el componente se monta
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
          const data = await response.json();
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

  // Función para manejar el clic en el botón Elegir archivos
  const handleChooseFileClick = () => {
    if (!isAuthenticated) {
      // Redirigir a la página de Inicia sesión si no está autenticado
      navigate('/signin');
    } else {
      console.log('Usuario autenticado - Implementar selección de archivos');
    }
  };

  // Función para manejar el arrastre de archivos sobre el dropzone
  const handleDragOver = (event) => {
    event.preventDefault(); // Previene el comportamiento por defecto
  };

  // Función para manejar la caída de archivos en el dropzone
  const handleDrop = (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      // Redirigir a la página de Inicia sesión si no está autenticado
      navigate('/signin');
    } else {
      const files = event.dataTransfer.files;
      console.log('Usuario autenticado - Archivos arrastrados:', files);
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

        {/* Área de arrastrar y soltar */}
        <div 
          className="upload-dropzone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Ícono UploadCloud encima del texto */}
          <UploadCloud className="upload-cloud-icon" />
          <p className="upload-dropzone-text">Arrastra y suelta archivos de audio para empezar.</p>

          {/* Botón Elegir archivos - Redirige a signin si no está autenticado */}
          <button 
            className="upload-choose-button"
            onClick={handleChooseFileClick}
          >
            Elegir archivos
          </button>
        </div>

        {/* Contenedor para las secciones de información */}
        <div className="upload-info-sections-row">
          {/* Información de tamaño y duración */}
          <div className="upload-info-section">
            <h3 className="upload-info-title">Tamaño y duración</h3>
            <p className="upload-info-text">Tamaño máximo: 4 GB y duración del audio: 60 minutos.</p>
          </div>

          {/* Información de formatos de archivo */}
          <div className="upload-info-section">
            <h3 className="upload-info-title">Formatos de archivo</h3>
            <p className="upload-info-text">Recomendación: FLAC. Se admiten otros formatos principales.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;