import React from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MusicPlayer from './components/MusicPlayer';

function App() {
  return (
    <div>
      {/* Barra lateral izquierda */}
      <Sidebar />

      {/* Contenido principal */}
      <MainContent />

      {/* Reproductor de música (oculto por ahora) */}
      <div style={{display: 'none'}}>
        <MusicPlayer />
      </div>
    </div>
  );
}

export default App;