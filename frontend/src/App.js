// En: src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SideBar from './components/SideBar';
import ForYou from './components/ForYou';
import MusicPlayer from './components/MusicPlayer';
import SignIn from './components/SignIn';
import PasswordReset from './components/PasswordReset';
import SignUp from './components/SignUp';
import Explore from './components/Explore';
import Following from './components/Following';
import Notifications from './components/Notifications';
import Upload from './components/Upload';
import Profile from './components/Profile/Profile';
import Metadata from './components/Metadata';
import './App.css';
import { PlayerProvider } from './context/PlayerContext';

// Layout para páginas con sidebar y musicplayer
const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <SideBar />
      {children}
      <MusicPlayer />
    </div>
  );
};

// Layout para páginas solo con sidebar
const UploadLayout = ({ children }) => {
  return (
    <div className="upload-layout">
      <SideBar />
      {children}
    </div>
  );
};

// Layout para páginas sin sidebar y musicplayer
const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      {children}
    </div>
  );
};

function App() {
  return (
    <PlayerProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Ruta For You como Ruta Inicial */}
            <Route path="/" element={<Navigate to="/foryou" replace />} />

            {/* ===== AUTHLAYOUT ===== */}
            <Route path="/signin" element={<AuthLayout><SignIn /></AuthLayout>} />
            <Route path="/passwordreset" element={<AuthLayout><PasswordReset /></AuthLayout>} />
            <Route path="/signup" element={<AuthLayout><SignUp /></AuthLayout>} />

            {/* ===== MAINLAYOUT ===== */}
            <Route path="/foryou" element={<MainLayout><ForYou /></MainLayout>} />
            <Route path="/explore" element={<MainLayout><Explore /></MainLayout>} />
            <Route path="/following" element={<MainLayout><Following /></MainLayout>} />
            <Route path="/notifications" element={<MainLayout><Notifications /></MainLayout>} />

            {/* ===== UPLOADLAYOUT ===== */}
            <Route path="/upload" element={<UploadLayout><Upload /></UploadLayout>} />
            <Route path="/metadata" element={<AuthLayout><Metadata /></AuthLayout>} />

            {/* ===== RUTAS DE PERFIL ===== */}
            <Route path="/:username" element={<MainLayout><Profile /></MainLayout>} />
            <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
          </Routes>
        </div>
      </Router>
    </PlayerProvider>
  );
}

export default App;