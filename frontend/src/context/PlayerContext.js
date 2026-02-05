import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';

// Este contexto permitirá compartir el estado y funciones del reproductor en toda la aplicación
const PlayerContext = createContext();

// Este componente manejará todo el estado y lógica del reproductor
export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null); // Canción actualmente seleccionada para reproducir
  const [isPlaying, setIsPlaying] = useState(false); // Indica si la canción está reproduciéndose en este momento
  const [volume, setVolume] = useState(100); // Volumen actual (0 a 100)
  const [repeatMode, setRepeatMode] = useState('off'); // Modo de repetición: 'off', 'repeat-all', 'repeat-once'
  const [isMuted, setIsMuted] = useState(false); // Indica si el audio está silenciado
  const [lastVolume, setLastVolume] = useState(100); // Guarda el volumen anterior antes de silenciar para restaurarlo después
  const [currentTime, setCurrentTime] = useState(0); // Tiempo actual de reproducción de la canción (en segundos)
  const [duration, setDuration] = useState(0); // Duración total de la canción actual (en segundos)
  const [likedSongs, setLikedSongs] = useState({}); // Objeto que almacena qué canciones han sido marcadas como "me gusta"
  const [playerVisible, setPlayerVisible] = useState(false); // Controla si el reproductor debe mostrarse en la interfaz

  const audioRef = useRef(null); // Referencia al elemento de audio HTML5 que maneja la reproducción real

  // Función que maneja qué hacer cuando una canción termina de reproducirse
  const handleSongEnded = useCallback(() => {
    // Modo: Repetir una
    if (repeatMode === 'repeat-once') {
      if (audioRef.current) {
        // Reinicia la canción al principio
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        
        // Vuelve a reproducirla
        audioRef.current.play()
          .then(() => {})
          .catch(error => {
            console.error('Error al repetir canción:', error);
            setIsPlaying(false);
          });
      }
    } 
    // Modo: Repetir todo
    else if (repeatMode === 'repeat-all') {
      // Pausa y reinicia la canción al principio (Sin función)
      setIsPlaying(false);
      setCurrentTime(0);
    } 
    // Modo: No repetir
    else {
      // Pausa y reinicia la canción al principio
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [repeatMode]); // Esta función se recrea solo cuando cambia el modo de repetición

  // Función para reproducir una nueva canción.
  const playSong = (song) => {
    // Si la canción que se quiere reproducir es la misma que la actual, solo pausa o reanuda
    if (currentSong && currentSong.id === song.id) {
      togglePlayPause();
    } 
    // Si es una canción diferente
    else {
      setCurrentSong(song); // Establece la nueva canción como la actual
      setCurrentTime(0); // Reinicia el tiempo de reproducción
      setPlayerVisible(true); // Muestra el reproductor

      // Se construye la URL del audio. Si no empieza con 'http', asume que es una ruta local
      const audioSrc = song.audioUrl.startsWith('http') 
        ? song.audioUrl 
        : `http://localhost:5000${song.audioUrl}`;

      // Verifica que la referencia al audio esté disponible
      if (audioRef.current) {
        audioRef.current.pause(); // Pausa cualquier canción que se esté reproduciendo
        audioRef.current.currentTime = 0; // Reinicia al principio
        audioRef.current.src = audioSrc; // Establece la nueva fuente de audio
        
        // Intenta reproducir la nueva canción
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true); // Si tiene éxito, actualiza el estado a "reproduciendo"
          })
          .catch(error => {
            console.error('Error al reproducir audio:', error);
            setIsPlaying(false); // Si hay error, asegura que el estado sea "pausado"
          });
      } 
      // Si no hay referencia al audio, muestra un error
      else {
        console.error('audioRef no está disponible');
      }
    }
  };

  // Función para pausar o reanudar la canción actual
  const togglePlayPause = () => {
    // Si no hay canción cargada o no hay referencia de audio, no se hace nada.
    if (!currentSong || !audioRef.current) {
      return;
    }

    // Si está reproduciéndose, pausa
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } 
    // Si está pausada, reanuda
    else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('Error al reanudar audio:', error);
          setIsPlaying(false);
        });
    }
  };

  // Función para cambiar el volumen
  const changeVolume = (newVolume) => {
    setVolume(newVolume); // Se actualiza el estado del volumen

    // Se aplica el volumen al elemento de audio HTML
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100; // El volumen en HTML va de 0 a 1
    }

    // Si el audio estaba silenciado y se sube el volumen, desactiva el silencio
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  // Función para alternar entre silenciado y no silenciado
  const toggleMute = () => {
    // Si actualmente está silenciado
    if (isMuted) {
      changeVolume(lastVolume); // Restaura el volumen al valor anterior
      setIsMuted(false);
    } 
    // Si no está silenciado
    else {
      setLastVolume(volume); //Guarda el volumen actual para poder restaurarlo después
      changeVolume(0); // Establece el volumen a 0 (silencio)
      setIsMuted(true);
    }
  };

  // Función para cambiar entre los diferentes modos de repetición
  const toggleRepeatMode = () => {
    const modes = ['off', 'repeat-all', 'repeat-once']; // Lista de modos disponibles en orden cíclico
    const currentIndex = modes.indexOf(repeatMode); // Encuentra el índice del modo actual
    const nextIndex = (currentIndex + 1) % modes.length; // Calcula el siguiente índice (vuelve al principio si llega al final)
    const newMode = modes[nextIndex]; // Obtiene el nuevo modo
    setRepeatMode(newMode); // Actualiza el estado
  };

  // Función para marcar/desmarcar una canción como "me gusta"
  const toggleLike = (songId) => {
    // Si no hay ID, no se hace nada
    if (!songId) 
      return;
    
    // Actualiza el estado de canciones gustadas
    setLikedSongs(prev => ({
      ...prev, // Mantiene todas las demás canciones
      [songId]: !prev[songId] // Invierte el estado de "me gusta" para esta canción
    }));
  };

  // Función para verificar si una canción específica está marcada como "me gusta"
  const isSongLiked = (songId) => {
    return !!likedSongs[songId]; // Convierte el valor a booleano (true si existe y es verdadero)
  };

  // Función para marcar/desmarcar la canción actual como "me gusta"
  const toggleCurrentSongLike = () => {
    // Si no hay canción actual, no se hace nada
    if (!currentSong) 
      return;
    
    toggleLike(currentSong.id); // Usa la función toggleLike con el ID de la canción actual
  };

  // Función para saltar a un tiempo específico dentro de la canción actual
  const seekTo = (time) => {
    // Se verifica que haya un elemento de audio y una canción cargada
    if (audioRef.current && currentSong) {
      audioRef.current.currentTime = time; // Establece el tiempo actual de reproducción
      setCurrentTime(time); // Actualiza el estado para reflejar el cambio
    }
  };

  // Efecto para inicializar el elemento de audio cuando el componente se monta
  useEffect(() => {
    // Si no existe el elemento de audio, lo crea
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto'; // Precarga automática del audio
      audioRef.current.volume = volume / 100; // Establece el volumen inicial
    }
  }, []); // El array vacío asegura que solo se ejecute una vez

  // Efecto que carga datos guardados en localStorage cuando el componente se monta
  useEffect(() => {
    // Carga las canciones marcadas como "me gusta"
    const savedLikes = localStorage.getItem('omnisound_liked_songs');
    if (savedLikes) {
      try {
        setLikedSongs(JSON.parse(savedLikes));
      } catch (error) {
        console.error('Error al cargar likes:', error);
      }
    }

    // Carga la última canción que se estaba reproduciendo
    const savedSong = localStorage.getItem('omnisound_last_song');
    if (savedSong) {
      try {
        const parsedSong = JSON.parse(savedSong);
        setCurrentSong(parsedSong);
        setPlayerVisible(true); // Muestra el reproductor

        // Si hay una URL de audio, carga la canción
        if (audioRef.current && parsedSong.audioUrl) {
          const audioSrc = parsedSong.audioUrl.startsWith('http') 
            ? parsedSong.audioUrl 
            : `http://localhost:5000${parsedSong.audioUrl}`;
          
          audioRef.current.src = audioSrc;
          audioRef.current.load(); // Carga el audio
        }
      } catch (error) {
        console.error('Error al cargar última canción:', error);
      }
    }

    // Carga el volumen guardado
    const savedVolume = localStorage.getItem('omnisound_volume');
    if (savedVolume) {
      const vol = parseInt(savedVolume, 10);
      setVolume(vol);

      // Aplica el volumen al elemento de audio
      if (audioRef.current) {
        audioRef.current.volume = vol / 100;
      }
    }

    // Carga el modo de repetición guardado
    const savedRepeatMode = localStorage.getItem('omnisound_repeat_mode');
    if (savedRepeatMode) {
      setRepeatMode(savedRepeatMode);
    }
  }, []); // Se ejecuta solo una vez al montar el componente

  // Efecto para agregar event listeners al elemento de audio
  useEffect(() => {
    const audioElement = audioRef.current;

    // Si no hay elemento de audio, no hace nada
    if (!audioElement) return;

    // Función que se ejecuta cuando el tiempo de reproducción se actualiza
    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
    };

    // Función que se ejecuta cuando se cargan los metadatos del audio, incluyendo la duración
    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
    };

    // Función que se ejecuta cuando el audio termina
    const handleEnded = () => {
      handleSongEnded(); // Se llama a la función que maneja el fin de la canción
    };

    // Función que se ejecuta si ocurre un error en la reproducción
    const handleError = (e) => {
      console.error('Error en audio:', e);
      setIsPlaying(false); // Se asegura que el estado sea "pausado"
    };

    // Agrega los event listeners al elemento de audio
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);

    // Función de limpieza que se ejecuta al desmontar el componente o cuando las dependencias cambian
    return () => {
      // Elimina todos los event listeners
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
    };
  }, [handleSongEnded]); // Se ejecuta cuando handleSongEnded cambia

  // Efecto que guarda la canción actual en localStorage cada vez que cambia
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('omnisound_last_song', JSON.stringify(currentSong));
      setPlayerVisible(true);
    }
  }, [currentSong]); // Se ejecuta cada vez que currentSong cambia

  // Efecto que guarda las canciones "me gusta" en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem('omnisound_liked_songs', JSON.stringify(likedSongs));
  }, [likedSongs]); // Se ejecuta cada vez que likedSongs cambia

  // Efecto que guarda el volumen en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem('omnisound_volume', volume.toString());

    // También se actualiza el volumen en el elemento de audio
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]); // Se ejecuta cada vez que volume cambia

  // Efecto que guarda el modo de repetición en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem('omnisound_repeat_mode', repeatMode);
  }, [repeatMode]); // Se ejecuta cada vez que repeatMode cambia

  // Devuelve el proveedor del contexto con todos los valores y funciones
  return (
    <PlayerContext.Provider value={{
      // Estados
      currentSong,
      isPlaying,
      volume,
      repeatMode,
      isMuted,
      likedSongs,
      currentTime,
      duration,
      playerVisible,
      
      // Funciones
      playSong,
      togglePlayPause,
      changeVolume,
      toggleMute,
      toggleRepeatMode,
      toggleLike,
      toggleCurrentSongLike,
      isSongLiked,
      seekTo,
      
      // Referencia al elemento de audio (solo lectura)
      audioRef: audioRef.current
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

// Este hook facilita el acceso al contexto desde cualquier componente
export const usePlayer = () => {
  const context = useContext(PlayerContext);

  // Si se usa fuera del proveedor, se lanza un error para alertar al desarrollador
  if (!context) {
    throw new Error('usePlayer debe usarse dentro de PlayerProvider');
  }
  return context;
};