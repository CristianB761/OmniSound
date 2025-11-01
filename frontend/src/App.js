import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MusicPlayer from './components/MusicPlayer';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import SignUp from './components/SignUp';
import Explore from './components/Explore';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Ruta para login (sin sidebar) */}
          <Route path="/login" element={<Login />} />

          {/* Ruta para restablecer contraseña (sin sidebar) */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Ruta para registro (sin sidebar) */}
          <Route path="/signup" element={<SignUp />} />

          {/* Ruta principal (con sidebar) */}
          <Route path="/" element={
            <>
              <Sidebar />
              <MainContent />
              <MusicPlayer />
            </>
          } />
          
          {/* Nueva ruta para "Explorar" */}
          <Route path="/explore" element={
            <>
              <Sidebar />
              <Explore />
              <MusicPlayer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;