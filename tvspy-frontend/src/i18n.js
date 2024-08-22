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
    // Obtén el idioma por defecto de la API
    const response = await axios.get(API_ENDPOINTS.CONFIG_LANGUAJE);
    const defaultLanguage = response.data.value;
    
    // Actualiza el idioma de i18next
    i18n.changeLanguage(defaultLanguage);
  } catch (error) {
    console.error('Error al obtener el idioma por defecto:', error);
  }
};

// Llama a la función para actualizar el idioma
updateLanguageFromAPI();

export default i18n;
