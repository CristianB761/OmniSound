import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MusicPlayer from './components/MusicPlayer';
import Login from './components/Login';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Ruta para login (sin sidebar) */}
          <Route path="/login" element={<Login />} />
          
          {/* Ruta principal (con sidebar) */}
          <Route path="/" element={
            <>
              {/* Barra lateral izquierda */}
              <Sidebar />

              {/* Contenido principal */}
              <MainContent />

              {/* Reproductor de música */}
              <MusicPlayer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;