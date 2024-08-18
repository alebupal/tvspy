import React, { useEffect, useState } from 'react';

// URL de tu WebSocket, incluyendo autenticación básica si es necesario
const WS_SERVER_URL = 'ws://alebupal:alejandro5@192.168.5.5:9981/comet/ws';

function WebSocketClient() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Crear una nueva conexión WebSocket
    const socket = new WebSocket(WS_SERVER_URL, ['tvheadend-comet']);

    // Evento de conexión abierta
    socket.onopen = () => {
      console.log('WebSocket - Conectado al servidor');
    };

    // Evento para manejar mensajes recibidos
    socket.onmessage = (event) => {
      try {
        // Aquí asumimos que los mensajes vienen en formato JSON
        const data = JSON.parse(event.data);
        // Agregar el mensaje al estado
        setMessages((prevMessages) => [...prevMessages, data]);
      } catch (error) {
        console.error('WebSocket - Error al analizar el mensaje:', error);
      }
    };

    // Evento para manejar errores
    socket.onerror = (error) => {
      console.error('WebSocket - Error:', error);
      setError(error);
    };

    // Evento para manejar el cierre de la conexión
    socket.onclose = () => {
      console.log('WebSocket - Conexión cerrada');
    };

    // Función de limpieza para cerrar la conexión al desmontar el componente
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return (
    <div>
      <h2>Mensajes del WebSocket</h2>
      {error && <p>Error: {error.message}</p>}
      <ul>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <li key={index}>{JSON.stringify(msg)}</li>
          ))
        ) : (
          <li>No se han recibido mensajes</li>
        )}
      </ul>
    </div>
  );
}

export default WebSocketClient;
