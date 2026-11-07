import axios from 'axios';

// Usar ruta relativa para que funcione automáticamente con Nginx o Vite Proxy
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;

