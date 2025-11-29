import React, { useEffect } from 'react';
import './ForYou.css';

function ForYou() {  
  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    document.title = "OmniSound - Para ti";
  }, []); // Array vacío significa que solo se ejecuta una vez

  return (
    <div className="foryou-container">

      {/* Título de la sección */}
      <h2 className="foryou-title">Para ti</h2>
    </div>
  );
}

export default ForYou;