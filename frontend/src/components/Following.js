import React, { useEffect } from 'react';
import './Following.css';

function Following() {  
  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    document.title = "OmniSound - Siguiendo";
  }, []); // Array vacío significa que solo se ejecuta una vez

  return (
    <div className="following-container">

      {/* Título de la sección */}
      <h2 className="following-title">Siguiendo</h2>
    </div>
  );
}

export default Following;