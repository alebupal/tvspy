import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';
import { API_ENDPOINTS } from './config/apiConfig';
import axios from 'axios';

// Configuración inicial de i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      es: {
        translation: esTranslation
      }
    },
    lng: 'es', // Idioma por defecto temporal
    fallbackLng: 'en', // Idioma de reserva
    interpolation: {
      escapeValue: false // React ya hace escape de valores
    }
  });

// Función para actualizar el idioma basado en la respuesta de la API
const updateLanguageFromAPI = async () => {
  try {
    // Verifica si ya existe un idioma guardado en localStorage
    const savedLanguage = localStorage.getItem('language');
    
    // Si no hay idioma guardado, realiza la solicitud a la API
    if (!savedLanguage) {
      const response = await axios.get(API_ENDPOINTS.CONFIG_LANGUAJE);
      const defaultLanguage = response.data.value;
      
      // Si se obtiene un idioma válido, actualiza i18n y lo guarda en localStorage
      if (defaultLanguage) {
        localStorage.setItem('language', defaultLanguage);
        i18n.changeLanguage(defaultLanguage);
      }
    } else {
      // Si ya hay un idioma guardado en localStorage, actualiza i18n con él
      i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error('Error al obtener el idioma desde la API:', error);
  }
};

// Llama a la función para actualizar el idioma
updateLanguageFromAPI();

export default i18n;
