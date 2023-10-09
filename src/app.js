import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

function App() {
    const [data, setData] = useState({});


  useEffect(() => {
    // URL de la API que deseas consultar
    const apiUrl = '/api/users';

    // Realiza la solicitud GET a la API usando Axios
    axios.get(apiUrl)
      .then((response) => {
        // Almacena la respuesta de la API en el estado 'data'
        setData(response.data.entries);
        console.log(response.data.entries);
      })
      .catch((error) => {
        console.error('Error al hacer la solicitud a la API:', error);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        {data.length > 0 ? (
          <div>
            <h2>Elementos de la API:</h2>
            <ul>
              {data.map((item) => (
                <li key={item.uuid}>
                  {item.username}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>Cargando datos de la API...</p>
        )}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
