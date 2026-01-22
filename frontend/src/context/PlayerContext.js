import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';

// Crear el contexto
const PlayerContext = createContext();

// Proveedor del contexto
export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [repeatMode, setRepeatMode] = useState('off');
  const [isMuted, setIsMuted] = useState(false);
  const [lastVolume, setLastVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [likedSongs, setLikedSongs] = useState({});
  const [playerVisible, setPlayerVisible] = useState(false);
  
  // Referencia para el elemento de audio
  const audioRef = useRef(null);

  // Inicializar elemento de audio
  useEffect(() => {
    // Crear elemento de audio si no existe
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
      audioRef.current.volume = volume / 100;
    }
  }, []);

  // Cargar datos persistentes al iniciar
  useEffect(() => {
    // Cargar likes desde localStorage
    const savedLikes = localStorage.getItem('omnisound_liked_songs');
    if (savedLikes) {
      try {
        setLikedSongs(JSON.parse(savedLikes));
      } catch (error) {
        console.error('Error al cargar likes:', error);
      }
    }

    // Cargar última canción desde localStorage
    const savedSong = localStorage.getItem('omnisound_last_song');
    if (savedSong) {
      try {
        const parsedSong = JSON.parse(savedSong);
        setCurrentSong(parsedSong);
        setPlayerVisible(true);

        // Cargar el audio de la última canción (pero no reproducir)
        if (audioRef.current && parsedSong.audioUrl) {
          const audioSrc = parsedSong.audioUrl.startsWith('http') 
            ? parsedSong.audioUrl 
            : `http://localhost:5000${parsedSong.audioUrl}`;
          
          audioRef.current.src = audioSrc;
          audioRef.current.load();
        }
      } catch (error) {
        console.error('Error al cargar última canción:', error);
      }
    }

    // Cargar volumen desde localStorage
    const savedVolume = localStorage.getItem('omnisound_volume');
    if (savedVolume) {
      const vol = parseInt(savedVolume, 10);
      setVolume(vol);
      if (audioRef.current) {
        audioRef.current.volume = vol / 100;
      }
    }

    // Cargar modo de repetición desde localStorage
    const savedRepeatMode = localStorage.getItem('omnisound_repeat_mode');
    if (savedRepeatMode) {
      setRepeatMode(savedRepeatMode);
    }
  }, []);

  // ==================== FUNCIÓN PARA MANEJAR FIN DE CANCIÓN ====================
  const handleSongEnded = useCallback(() => {
    console.log('Canción terminada. Modo de repetición:', repeatMode);

    if (repeatMode === 'repeat-once') {
      console.log('Repitiendo misma canción...');
      if (audioRef.current) {
        // Resetear el tiempo y volver a reproducir
        audioRef.current.currentTime = 0;
        setCurrentTime(0);

        audioRef.current.play()
          .then(() => {
            console.log('Canción reiniciada y reproduciéndose');
          })
          .catch(error => {
            console.error('Error al repetir canción:', error);
            setIsPlaying(false);
          });
      }
    } else if (repeatMode === 'repeat-all') {
      // Por ahora, para "repeat-all" solo detenemos (igual que 'off')
      console.log('Modo "repeat-all" - terminando reproducción');
      setIsPlaying(false);
      setCurrentTime(0);
    } else {
      // Modo 'off' - simplemente detener
      console.log('Modo "off" - terminando reproducción');
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [repeatMode]);

  // ==================== CONFIGURAR EVENTOS DEL AUDIO ====================
  useEffect(() => {
    const audioElement = audioRef.current;

    if (!audioElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
    };

    const handleEnded = () => {
      handleSongEnded();
    };

    const handleError = (e) => {
      console.error('Error en audio:', e);
      setIsPlaying(false);
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
    };
  }, [handleSongEnded]);

  // Guardar última canción en localStorage
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('omnisound_last_song', JSON.stringify(currentSong));
      setPlayerVisible(true);
    }
  }, [currentSong]);

  // Guardar likes en localStorage
  useEffect(() => {
    localStorage.setItem('omnisound_liked_songs', JSON.stringify(likedSongs));
  }, [likedSongs]);

  // Guardar volumen en localStorage
  useEffect(() => {
    localStorage.setItem('omnisound_volume', volume.toString());
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Guardar modo de repetición en localStorage
  useEffect(() => {
    localStorage.setItem('omnisound_repeat_mode', repeatMode);
  }, [repeatMode]);

  // Función para reproducir una canción
  const playSong = (song) => {
    console.log('Reproduciendo canción:', song.title);

    // Si es la misma canción, solo alternar play/pause
    if (currentSong && currentSong.id === song.id) {
      console.log('Misma canción, alternando play/pause');
      togglePlayPause();
    } else {
      // Nueva canción - resetear estado
      console.log('Nueva canción, cargando...');
      setCurrentSong(song);
      setCurrentTime(0);
      setPlayerVisible(true);

      // Obtener URL del audio
      const audioSrc = song.audioUrl.startsWith('http') 
        ? song.audioUrl 
        : `http://localhost:5000${song.audioUrl}`;

      console.log('Audio source:', audioSrc);

      // Si hay audioRef, cargar y reproducir
      if (audioRef.current) {
        // Pausar y resetear si ya hay algo reproduciéndose
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        // Establecer nueva fuente
        audioRef.current.src = audioSrc;

        // Intentar reproducir
        audioRef.current.play()
          .then(() => {
            console.log('Audio reproduciéndose correctamente');
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('Error al reproducir audio:', error);
            setIsPlaying(false);
          });
      } else {
        console.error('audioRef no está disponible');
      }
    }
  };

  // Función para alternar play/pause
  const togglePlayPause = () => {
    if (!currentSong || !audioRef.current) {
      console.log('No hay canción o audioRef');
      return;
    }

    console.log('Alternando play/pause. Estado actual:', isPlaying);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('Audio pausado');
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          console.log('Audio reanudado');
        })
        .catch(error => {
          console.error('Error al reanudar audio:', error);
          setIsPlaying(false);
        });
    }
  };

  // Función para cambiar volumen
  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  // Función para alternar mute/unmute
  const toggleMute = () => {
    if (isMuted) {
      changeVolume(lastVolume);
      setIsMuted(false);
    } else {
      setLastVolume(volume);
      changeVolume(0);
      setIsMuted(true);
    }
  };

  // ==================== FUNCIÓN PARA ALTERNAR MODO REPETIR ====================
  const toggleRepeatMode = () => {
    const modes = ['off', 'repeat-all', 'repeat-once'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];

    console.log(`Cambiando modo de repetición: ${repeatMode} → ${newMode}`);
    setRepeatMode(newMode);
  };

  // Función para dar/quitar like a una canción específica
  const toggleLike = (songId) => {
    if (!songId) return;

    setLikedSongs(prev => ({
      ...prev,
      [songId]: !prev[songId]
    }));

    console.log(`Canción ${songId} ${!likedSongs[songId] ? 'liked' : 'unliked'}`);
  };

  // Función para verificar si una canción tiene like
  const isSongLiked = (songId) => {
    return !!likedSongs[songId];
  };

  // Función para dar/quitar like a la canción actual
  const toggleCurrentSongLike = () => {
    if (!currentSong) return;
    toggleLike(currentSong.id);
  };

  // Función para buscar en la canción
  const seekTo = (time) => {
    if (audioRef.current && currentSong) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <PlayerContext.Provider value={{
      currentSong,
      isPlaying,
      volume,
      repeatMode,
      isMuted,
      likedSongs,
      currentTime,
      duration,
      playerVisible,
      playSong,
      togglePlayPause,
      changeVolume,
      toggleMute,
      toggleRepeatMode,
      toggleLike,
      toggleCurrentSongLike,
      isSongLiked,
      seekTo,
      audioRef: audioRef.current
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer debe usarse dentro de PlayerProvider');
  }
  return context;
};