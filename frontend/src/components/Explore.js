import React, { useRef, useState, useEffect } from 'react';
import './Explore.css';

function Explore() {
  const genreListRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Lista ampliada de géneros musicales
  const genres = [
    'Todo', 'Electrónica', 'Pop', 'Rock', 'R&B & soul', 'Hip-hop', 
    'Drum & Bass', 'Jazz', 'Clásica', 'Reggae', 'Country', 'Funk',
    'Metal', 'Blues', 'Salsa', 'Cumbia', 'Reggaetón', 'Trap'
  ];

  // Función para verificar si se puede hacer scroll
  const checkScroll = () => {
    if (genreListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = genreListRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Función para desplazar los géneros hacia la derecha
  const scrollRight = () => {
    if (genreListRef.current) {
      genreListRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  // Función para desplazar los géneros hacia la izquierda
  const scrollLeft = () => {
    if (genreListRef.current) {
      genreListRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  // Verificar el scroll al cargar y cuando cambie el tamaño de la ventana
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    
    // Verificar también cuando termine la transición de scroll
    const handleScrollEnd = () => {
      setTimeout(checkScroll, 100);
    };
    
    if (genreListRef.current) {
      genreListRef.current.addEventListener('scroll', handleScrollEnd);
    }
    
    return () => {
      window.removeEventListener('resize', checkScroll);
      if (genreListRef.current) {
        genreListRef.current.removeEventListener('scroll', handleScrollEnd);
      }
    };
  }, []);

  return (
    <div className="explore-container">
      {/* Título de la sección */}
      <h2 className="explore-title">Explorar</h2>

      {/* Contenedor de géneros con flechas */}
      <div className="genre-section">
        {/* Lista de géneros */}
        <div className="genre-list" ref={genreListRef} onScroll={checkScroll}>
          {genres.map((genre, index) => (
            <button key={index} className="genre-tag">
              {genre}
            </button>
          ))}
        </div>
        
        {/* Contenedor visible para las flechas */}
        <div className="genre-arrows-container">
          {/* Flecha izquierda - retroceder */}
          <button 
            className={`genre-arrow tooltip-container ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={scrollLeft}
            data-tooltip="Retroceder"
            aria-label="Retroceder"
            disabled={!canScrollLeft}
          >
            ＜
          </button>
          
          {/* Flecha derecha - avanzar */}
          <button 
            className={`genre-arrow tooltip-container ${!canScrollRight ? 'disabled' : ''}`}
            onClick={scrollRight}
            data-tooltip="Avanzar"
            aria-label="Avanzar"
            disabled={!canScrollRight}
          >
            ＞
          </button>
        </div>
      </div>
    </div>
  );
}

export default Explore;