import React, { useState, useEffect } from 'react';
import SongCard from './SongCard';
import './ForYou.css';

function ForYou() {  
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    document.title = "OmniSound - Para ti";

    // Función para cargar canciones desde el backend
    const fetchSongs = async () => {
      try {
        setLoading(true);
        console.log('Cargando canciones desde backend...');

        // Hacer petición al endpoint de canciones
        const response = await fetch('http://localhost:5000/api/songs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Respuesta del backend:', data);

        if (data.success && data.songs) {
          console.log(`Se encontraron ${data.songs.length} canciones`);
          setSongs(data.songs);
        } else {
          console.log('No hay canciones disponibles');
          setSongs([]);
        }
      } catch (error) {
        console.error('Error al cargar canciones:', error);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  return (
    <div className="foryou-container">
      {/* Título de la sección */}
      <h2 className="foryou-title">Para ti</h2>

      {/* Contenedor de las canciones */}
      <div className="songs-list">
        {loading ? (
          <p style={{ color: 'lightgray', textAlign: 'center', padding: '20px' }}>
            Cargando canciones...
          </p>
        ) : songs.length > 0 ? (
          songs.map((song) => (
            <SongCard 
              key={song.id}
              song={song}
            />
          ))
        ) : (
          <p style={{ color: 'dimgray', textAlign: 'center', padding: '20px' }}>
            No hay canciones disponibles
          </p>
        )}
      </div>
    </div>
  );
}

export default ForYou;