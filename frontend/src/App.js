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
import './App.css';

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
    <Router>
      <div className="app">
        <Routes>

          {/* Ruta For You como Ruta Inicial */}
          <Route path="/" element={<Navigate to="/foryou" replace />} />

          {/* ===== AUTHLAYOUT ===== */}
          {/* Ruta para Sign In */}
          <Route path="/signin" element={
            <AuthLayout>
              <SignIn />
            </AuthLayout>
          } />

          {/* Ruta para Password Reset */}
          <Route path="/passwordreset" element={
            <AuthLayout>
              <PasswordReset />
            </AuthLayout>
          } />

           {/* Ruta para Sign Up */}
          <Route path="/signup" element={
            <AuthLayout>
              <SignUp />
            </AuthLayout>
          } />

          {/* ===== MAINLAYOUT ===== */}
          {/* Ruta para For You */}
          <Route path="/foryou" element={
            <MainLayout>
              <ForYou />
            </MainLayout>
          } />

          {/* Ruta para Explore */}
          <Route path="/explore" element={
            <MainLayout>
              <Explore />
            </MainLayout>
          } />

          {/* Ruta para Siguiendo */}
          <Route path="/following" element={
            <MainLayout>
              <Following />
            </MainLayout>
          } />

          {/* Ruta para Notificaciones */}
          <Route path="/notifications" element={
            <MainLayout>
              <Notifications />
            </MainLayout>
          } />

          {/* ===== UPLOADLAYOUT ===== */}
          {/* Ruta para Subir */}
          <Route path="/upload" element={
            <UploadLayout>
              <Upload />
            </UploadLayout>
          } />


          {/* ===== RUTAS DE PERFIL ===== */}
          {/* Ruta dinámica para Perfil */}
          <Route path="/:username" element={
            <MainLayout>
              <Profile />
            </MainLayout>
          } />

          {/* Ruta para Perfil */}
          <Route path="/profile" element={
            <MainLayout>
              <Profile />
            </MainLayout>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;