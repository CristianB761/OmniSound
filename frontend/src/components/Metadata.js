import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Metadata.css';

// Importar íconos como componentes React
import { ReactComponent as BackIcon } from '../icons/BackIcon.svg';
import { ReactComponent as ImageIcon } from '../icons/ImageIcon.svg';
import { ReactComponent as CloseIcon } from '../icons/CloseIcon.svg';

function Metadata() {
  const location = useLocation();
  const navigate = useNavigate();

  // Referencias para los inputs de etiquetas y portada del álbum
  const tagInputRef = useRef(null);
  const albumCoverInputRef = useRef(null);

  // Estados para el archivo de audio y su información
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // Estados para los metadatos de la canción
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');

  // Estados para las etiquetas (tags)
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  // Estados para la privacidad y contenido explícito
  const [privacy, setPrivacy] = useState('public');

  // Estados para la portada del álbum
  const [albumCover, setAlbumCover] = useState(null);
  const [albumCoverPreview, setAlbumCoverPreview] = useState(null);

  // Estados para la subida y errores
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "OmniSound - Metadatos";

    // Verificar si hay archivo de audio en el estado de navegación
    if (!location.state || !location.state.audioFile) {
      navigate('/upload');
      return;
    }

    // Establecer el archivo de audio y su URL de vista previa
    setAudioFile(location.state.audioFile);
    setAudioUrl(location.state.audioUrl);

    // Cargar audio para obtener duración
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setArtist(userData.username); // Establecer artista como username
    }

    // Intentar extraer metadatos del nombre del archivo
    const fileName = location.state.audioFile.name.replace(/\.[^/.]+$/, "");
    setTitle(fileName);

    // Si el nombre tiene formato "Artista - Título", separarlos
    if (location.state.audioUrl) {
      const audio = new Audio(location.state.audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
        setAudioLoaded(true);
      });
    }
  }, [location, navigate]);

  /* Formatea la duración de segundos a minutos:segundos */
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /* Convierte un texto a formato URL amigable (slug) */
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');
  };

  /** Navega de vuelta a la página de subida */
  const handleBack = () => {
    navigate('/upload');
  };

  /* Maneja el cambio en el campo de título */
  const handleTitleChange = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^a-zA-Z0-9\s-]/g, '');
    setTitle(filteredValue);
  };

  /* Maneja el cambio en el input de etiquetas */
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  /* Maneja las teclas presionadas en el input de etiquetas */
  const handleTagInputKeyDown = (e) => {
    // Agrega etiqueta al presionar Enter, coma o espacio
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  /* Agrega una nueva etiqueta a la lista */
  const addTag = (tag) => {
    if (tag && !tags.includes(tag) && tags.length < 10) {
      const formattedTag = tag.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, '');
      if (formattedTag) {
        setTags([...tags, formattedTag]);
        setTagInput('');
      }
    }
  };

  /* Elimina una etiqueta de la lista */
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  /* Maneja la subida de la portada del álbum */
  const handleAlbumCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    setAlbumCover(file);

    // Crear vista previa de la imagen
    const reader = new FileReader();
    reader.onloadend = () => {
      setAlbumCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  /* Simula clic en el input de archivo oculto para subir portada */
  const handleAlbumCoverButtonClick = () => {
    albumCoverInputRef.current.click();
  };

  /* Maneja el envío del formulario */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!artist.trim()) {
      setError('El artista es requerido');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      // Preparar datos para enviar al servidor
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('title', title.trim());
      formData.append('artist', artist.trim());
      formData.append('genre', genre);
      formData.append('tags', tags.join(','));
      formData.append('description', description.trim());
      formData.append('privacy', privacy);
      formData.append('duration', Math.round(audioDuration));

      if (albumCover) {
        formData.append('image', albumCover);
      }

      console.log('Enviando datos:', {
        title: title.trim(),
        artist: artist.trim(),
        genre,
        tags: tags.join(','),
        description: description.trim(),
        privacy,
        duration: Math.round(audioDuration),
        hasImage: !!albumCover
      });

      // Enviar datos al servidor
      const response = await fetch('http://localhost:5000/api/songs/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert('¡Canción subida exitosamente!');
        navigate('/foryou');
      } else {
        setError(data.error || 'Error al subir la canción');
      }
    } catch (error) {
      console.error('Error de red:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="metadata-container">
      {/* Encabezado con botón de volver */}
      <div className="metadata-header">
        <button 
          className="metadata-back-button"
          onClick={handleBack}
        >
          <BackIcon className="back-icon" />
        </button>
        <h1 className="metadata-title">Información de la canción</h1>
      </div>

      {/* Contenido principal en dos columnas */}
      <div className="metadata-content">

        {/* ===== PANEL IZQUIERDO: SUBIR IMAGEN E INFORMACIÓN DEL AUDIO ===== */}
        <div className="metadata-left-panel">
          {/* Sección para subir imagen de portada */}
          <div className="upload-image-section">
            <div className="image-upload-container">
              {/* Input oculto para subir archivo */}
              <input
                type="file"
                ref={albumCoverInputRef}
                onChange={handleAlbumCoverUpload}
                accept="image/*"
                className="album-cover-input"
                disabled={uploading}
              />

              {/* Cuadrado para mostrar la portada del álbum */}
              <div 
                className={`album-cover-square ${albumCoverPreview ? 'has-image' : ''}`}
                style={albumCoverPreview ? { 
                  backgroundImage: `url(${albumCoverPreview})` 
                } : {}}
              >
                {/* Placeholder cuando no hay imagen */}
                {!albumCoverPreview && (
                  <div className="album-cover-placeholder">
                    <ImageIcon />
                  </div>
                )}
              </div>

              {/* Botón para subir o sustituir imagen */}
              <button
                type="button"
                className="upload-image-button"
                onClick={handleAlbumCoverButtonClick}
                disabled={uploading}
              >
                {albumCoverPreview ? 'Sustituir imagen' : 'Subir imagen'}
              </button>
            </div>
          </div>

          {/* Sección de información del archivo de audio */}
          <div className="file-info-section">
            <h3 className="file-info-title">Información del archivo</h3>
            <div className="audio-info-details">
              <div className="audio-info-detail">
                <span className="audio-info-label">Nombre:</span>
                <span className="audio-info-value">
                  {audioFile ? audioFile.name : 'N/A'}
                </span>
              </div>

              <div className="audio-info-detail">
                <span className="audio-info-label">Tamaño:</span>
                <span className="audio-info-value">
                  {audioFile ? (audioFile.size / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'}
                </span>
              </div>

              <div className="audio-info-detail">
                <span className="audio-info-label">Duración:</span>
                <span className="audio-info-value">
                  {audioLoaded ? formatDuration(audioDuration) : 'Cargando...'}
                </span>
              </div>

              <div className="audio-info-detail">
                <span className="audio-info-label">Formato:</span>
                <span className="audio-info-value">
                  {audioFile ? audioFile.type.split('/')[1]?.toUpperCase() || 'Audio' : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Sección del reproductor de vista previa */}
          <div className="audio-player-section">
            <h3 className="audio-player-title">Vista previa</h3>
            {audioUrl && (
              <audio 
                controls 
                className="metadata-audio-player"
                src={audioUrl}
              >
                Tu navegador no soporta el elemento de audio.
              </audio>
            )}
          </div>
        </div>

        {/* ===== PANEL DERECHO: FORMULARIO DE METADATOS ===== */}
        <div className="metadata-right-panel">
          <form onSubmit={handleSubmit} className="metadata-form">
            {/* Mensaje de error */}
            {error && (
              <div className="metadata-error">
                {error}
              </div>
            )}

            {/* Título de la sección */}
            <h2 className="section-title">Metadatos</h2>

            {/* Campo: Título de la canción */}
            <div className="metadata-form-group">
              <label className="metadata-label">
                Título <span>*</span>
              </label>
              <input
                type="text"
                className="metadata-input"
                value={title}
                onChange={handleTitleChange}
                placeholder="Título"
                required
                disabled={uploading}
                pattern="[a-zA-Z0-9\s-]+"
              />
              {/* Ejemplo de URL generada */}
              <div className="url-example">
                omnisound.com/{artist ? generateSlug(artist) : 'artista'}/{title ? generateSlug(title) : 'título'}
              </div>
            </div>

            {/* Campo: Género */}
            <div className="metadata-form-group">
              <label className="metadata-label">Género</label>
              <div className="genre-select-container">
                <select
                  className="genre-select"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  disabled={uploading}
                >
                  <option value="">Ninguno</option>
                  <option value="rock">Rock</option>
                  <option value="pop">Pop</option>
                  <option value="electronic">Electronic</option>
                  <option value="hip-hop">Hip Hop</option>
                  <option value="jazz">Jazz</option>
                  <option value="classical">Classical</option>
                  <option value="lofi">Lo-fi</option>
                </select>
              </div>
            </div>

            {/* Campo: Etiquetas (tags) */}
            <div className="metadata-form-group">
              <label className="metadata-label">Etiquetas</label>
              <div className="tags-input-container">
                {/* Lista de etiquetas agregadas */}
                {tags.map((tag, index) => (
                  <span className="tag" key={index}>
                    #{tag}
                    <button 
                      type="button" 
                      className="tag-remove"
                      onClick={() => removeTag(tag)}
                      disabled={uploading}
                    >
                      <CloseIcon />
                    </button>
                  </span>
                ))}

                {/* Input para agregar nuevas etiquetas */}
                <input
                  type="text"
                  ref={tagInputRef}
                  className="tags-input"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder={tags.length === 0 ? "Añade etiquetas para describir el género y el estilo de tu canción" : "Añadir otra etiqueta..."}
                  disabled={uploading || tags.length >= 10}
                  maxLength={20}
                />
              </div>
              {/* Contador de etiquetas */}
              <div className="tags-counter">
                {tags.length}/10
              </div>
            </div>

            {/* Campo: Descripción */}
            <div className="metadata-form-group">
              <label className="metadata-label">Descripción</label>
              <div className="description-container">
                <textarea
                  className="metadata-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe tu canción"
                  rows="4"
                  disabled={uploading}
                  maxLength="2000"
                />
                {/* Contador de caracteres */}
                <div className="char-counter">
                  {description.length}/2000
                </div>
              </div>
            </div>

            {/* Sección: Privacidad */}
            <div className="privacy-section">
              <div className="privacy-group">
                <span className="privacy-label">Privacidad:</span>
                <div className="privacy-options">
                  {/* Opción Público */}
                  <label className="privacy-option">
                    <input
                      type="radio"
                      name="privacy"
                      value="public"
                      checked={privacy === 'public'}
                      onChange={(e) => setPrivacy(e.target.value)}
                      disabled={uploading}
                    />
                    <div className="privacy-text">
                      <span className="privacy-option-label">Público</span>
                    </div>
                  </label>

                  {/* Opción Privado */}
                  <label className="privacy-option">
                    <input
                      type="radio"
                      name="privacy"
                      value="private"
                      checked={privacy === 'private'}
                      onChange={(e) => setPrivacy(e.target.value)}
                      disabled={uploading}
                    />
                    <div className="privacy-text">
                      <span className="privacy-option-label">Privado</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="metadata-form-actions">
              {/* Botón Cancelar */}
              <button
                type="button"
                className="metadata-cancel-button"
                onClick={handleBack}
                disabled={uploading}
              >
                Cancelar
              </button>

              {/* Botón Publicar */}
              <button
                type="submit"
                className="metadata-submit-button"
                disabled={uploading || !title.trim()}
              >
                {uploading ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Metadata;