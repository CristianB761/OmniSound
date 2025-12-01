import React, { useEffect } from 'react';
import './Upload.css';

// Importar iconos como componentes React
import { ReactComponent as UploadCloud } from '../icons/UploadCloudIcon.svg';

function Upload() {  
  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    document.title = "OmniSound - Subir";
  }, []); // Array vacío significa que solo se ejecuta una vez

  return (
    <div className="upload-container">
      
      {/* Título de la sección */}
      <h2 className="upload-title">Subir</h2>
      {/* Contenido de subida */}
      <div className="upload-content">

        {/* Área de arrastrar y soltar */}
        <div className="upload-dropzone">
          {/* Ícono UploadCloud encima del texto */}
          <UploadCloud className="upload-cloud-icon" />
          <p className="upload-dropzone-text">Arrastra y suelta archivos de audio para empezar.</p>
          <button className="upload-choose-button">Elegir archivos</button>
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