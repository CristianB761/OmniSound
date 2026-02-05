import React, { useState, useEffect } from 'react';
import SongCard from './SongCard';
import './ForYou.css';

function ForYou() {  
  const [songs, setSongs] = useState([]); // Estado para almacenar la lista de canciones
  const [loading, setLoading] = useState(true); // Estado para controlar si se están cargando las canciones

  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    document.title = "OmniSound - Para ti";

    // Función asíncrona para obtener las canciones desde el backend
    const fetchSongs = async () => {
      try {
        setLoading(true); // Activa el estado de carga

        // Realiza la petición GET al endpoint de canciones
        const response = await fetch('http://localhost:5000/api/songs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Verifica si la respuesta del servidor es exitosa
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        // Convierte la respuesta a formato JSON
        const data = await response.json();

        // Verifica si la respuesta contiene canciones y fue exitosa
        if (data.success && data.songs) {
          setSongs(data.songs); // Almacena las canciones en el estado
        } else {
          // Si no hay canciones, establece un array vacío
          setSongs([]);
        }
      } catch (error) {
        // Maneja cualquier error que ocurra durante la petición
        console.error('Error al cargar canciones:', error);
        setSongs([]); // En caso de error, establece un array vacío
      } finally {
        // Este bloque siempre se ejecuta, haya o no error
        setLoading(false); // Desactiva el estado de carga
      }
    };

    fetchSongs();
  }, []); // Array vacío significa que solo se ejecuta una vez

  return (
    <div className="foryou-container">
      {/* Título de la sección */}
      <h2 className="foryou-title">Para ti</h2>

      {/* Contenedor de la lista de canciones */}
      <div className="songs-list">
        {loading ? (
          // Muestra mensaje de carga mientras se obtienen las canciones
          <p style={{ color: 'lightgray', textAlign: 'center', padding: '20px' }}>
            Cargando canciones...
          </p>
        ) : songs.length > 0 ? (
          // Si hay canciones, las mapea en componentes SongCard
          songs.map((song) => (
            <SongCard 
              key={song.id} // Clave única para cada canción
              song={song} // Pasa el objeto de la canción como prop
            />
          ))
        ) : (
          // Muestra mensaje si no hay canciones disponibles
          <p style={{ color: 'dimgray', textAlign: 'center', padding: '20px' }}>
            No hay canciones disponibles
          </p>
        )}
      </div>
    </div>
  );
}

export default ForYou;