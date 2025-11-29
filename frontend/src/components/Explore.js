import React, { useRef, useState, useEffect } from 'react';
import './Explore.css';

// Importamos iconos como componente React
import { ReactComponent as BackIcon } from '../icons/BackIcon.svg';
import { ReactComponent as ForwardIcon } from '../icons/ForwardIcon.svg';

function Explore() {
  const genreListRef = useRef(null); // Referencia al contenedor de la lista de géneros
  const [selectedGenre, setSelectedGenre] = useState('Todo'); // Género musical actualmente seleccionado
  const [canScrollLeft, setCanScrollLeft] = useState(false); // Estado para controlar visibilidad del scroll izquierdo
  const [canScrollRight, setCanScrollRight] = useState(true); // Estado para controlar visibilidad del scroll derecho

  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    document.title = "OmniSound - Explorar";
  }, []); // Array vacío significa que solo se ejecuta una vez

  // Lista de todos los géneros musicales disponibles
  const genres = [
    'Todo', 'Blues', 'Clásica', 'Country', 'Cumbia', 'Drum & Bass', 
    'Electrónica', 'Funk', 'Hip-hop', 'Jazz', 'Metal', 'Pop', 
    'R&B & soul', 'Reggae', 'Reggaetón', 'Rock', 'Salsa', 'Trap'
  ];

  // Maneja la selección de un género y asegura que sea visible en la lista
  const handleGenreSelect = (genre, index) => {
    setSelectedGenre(genre);
    if (genreListRef.current) {
      const genreElement = genreListRef.current.children[index];
      const container = genreListRef.current;
      const genreRect = genreElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Scroll si el género seleccionado está fuera de vista a la izquierda
      if (genreRect.left < containerRect.left) {
        container.scrollBy({
          left: genreRect.left - containerRect.left - 10, // Ajuste para margen
          behavior: 'smooth'
        });
      }
      // Scroll si el género seleccionado está fuera de vista a la derecha
      else if (genreRect.right > containerRect.right) {
        container.scrollBy({
          left: genreRect.right - containerRect.right + 10,
          behavior: 'smooth'
        });
      }
    }
  };

  // Verifica la posición del scroll para mostrar/ocultar botones
  const checkScroll = () => {
    if (genreListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = genreListRef.current;
      setCanScrollLeft(scrollLeft > 0); // Hay contenido a la izquierda si es > 0
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // Hay contenido a la derecha
    }
  };

  // Desplaza la lista de géneros hacia la derecha
  const scrollRight = () => {
    if (genreListRef.current) {
      genreListRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(checkScroll, 300); // Revisa el estado del scroll después de la animación
    }
  };

  // Desplaza la lista de géneros hacia la izquierda
  const scrollLeft = () => {
    if (genreListRef.current) {
      genreListRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="explore-container">

      {/* Título de la sección */}
      <h2 className="explore-title">Explorar</h2>
      {/* Sección de géneros musicales */}
      <div className="genre-section">

        {/* Lista scrollable de géneros musicales */}
        <div 
          className="genre-list" 
          ref={genreListRef} 
          onScroll={checkScroll} // Verifica el scroll al desplazar
        >

          {/* Mapea cada género a un botón */}
          {genres.map((genre, index) => (
            <button 
              key={index} 
              className={`genre-tag ${selectedGenre === genre ? 'selected' : ''}`}
              onClick={() => handleGenreSelect(genre, index)}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Efectos de desvanecimiento visual */}
        {canScrollLeft && <div className="fade-left"></div>}
        {canScrollRight && <div className="fade-right"></div>}

        {/* Contenedor de botones de navegación */}
        <div className="nav-arrows-container">

          {/* Botón Retroceder - Se deshabilita cuando no hay scroll izquierdo */}
          <button 
            className={`nav-arrow ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={scrollLeft}
            aria-label="Retroceder"
            disabled={!canScrollLeft}
            data-tooltip="Retroceder"
          >
            <BackIcon />
          </button>

          {/* Botón Avanzar - Se deshabilita cuando no hay scroll derecho */}
          <button 
            className={`nav-arrow ${!canScrollRight ? 'disabled' : ''}`}
            onClick={scrollRight}
            aria-label="Avanzar"
            disabled={!canScrollRight}
            data-tooltip="Avanzar"
          >
            <ForwardIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Explore;