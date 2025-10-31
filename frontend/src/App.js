import React from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MusicPlayer from './components/MusicPlayer';
import './App.css';

function App() {
  return (
    <div className="app">
      {/* Barra lateral izquierda */}
      <Sidebar />
      
      {/* Contenido principal */}
      <MainContent />
      
      {/* Reproductor de música */}
        <MusicPlayer />
      </div>
  );
}

export default App;