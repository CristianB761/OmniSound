import React from 'react';

function App() {
  return (
    <div>
      {/* Barra lateral izquierda */}
      <div>
        <h1>OmniSound</h1>
        <div>Buscar</div>
        <nav>
          <div>Para ti</div>
          <div>Explorar</div>
          <div>Siguiendo</div>
          <div>Subir</div>
          <div>Perfil</div>
        </nav>
        <div>Inicia sesión</div>
        <div>Crea tu cuenta</div>
      </div>

      {/* Contenido principal */}
      <div>
        <h2>Para ti</h2>
      </div>

      {/* Reproductor de música (oculto por ahora) */}
      <div style={{display: 'none'}}>
      </div>
    </div>
  );
}

export default App;