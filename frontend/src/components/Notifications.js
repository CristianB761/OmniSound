import React, { useEffect } from 'react';
import './Notifications.css';

function Notifications() {  
  // Cambia el título de la pestaña del navegador cuando el componente se monta
  useEffect(() => {
    document.title = "OmniSound - Notificaciones";
  }, []); // Array vacío significa que solo se ejecuta una vez

  return (
    <div className="notifications-container">

      {/* Título de la sección */}
      <h2 className="notifications-title">Notificaciones</h2>
    </div>
  );
}

export default Notifications;