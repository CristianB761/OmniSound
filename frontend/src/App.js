import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SideBar from './components/SideBar';
import ForYou from './components/ForYou';
import MusicPlayer from './components/MusicPlayer';
import SignIn from './components/SignIn';
import ForgotPassword from './components/ForgotPassword';
import SignUp from './components/SignUp';
import Explore from './components/Explore';
import './App.css';

// Layout para páginas con sidebar y musicplayer
const MainLayout = ({ children }) => {
  return (
    <>
      <SideBar />
      {children}
      <MusicPlayer />
    </>
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

          {/* ===== AUTHLAYOUT ===== */}
          {/* Ruta para Sign In */}
          <Route path="/signin" element={
            <AuthLayout>
              <SignIn />
            </AuthLayout>
          } />

          {/* Ruta para Forgot Password */}
          <Route path="/forgotpassword" element={
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          } />

           {/* Ruta para Sign Up */}
          <Route path="/signup" element={
            <AuthLayout>
              <SignUp />
            </AuthLayout>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;