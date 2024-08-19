import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';
import { API_ENDPOINTS } from './config/apiConfig';
import axios from 'axios';

// Configura i18next
const initI18n = async () => {
  try {
    // Obtén el idioma por defecto de la API
    const response = await axios.get(API_ENDPOINTS.CONFIG_LANGUAJE);
    const defaultLanguage = response.data.value;

    // Inicializa i18next con el idioma obtenido
    i18n
      .use(initReactI18next) // Pasa i18n al inicializador de react-i18next
      .init({
        resources: {
          en: {
            translation: enTranslation
          },
          es: {
            translation: esTranslation
          }
        },
        lng: defaultLanguage || 'es', // Idioma por defecto
        fallbackLng: 'en', // Idioma de reserva
        interpolation: {
          escapeValue: false // React ya hace escape de valores
        }
      });
  } catch (error) {
    console.error('Error al obtener el idioma por defecto:', error);
    // En caso de error, usar 'es' como idioma por defecto
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
        lng: 'es', // Idioma por defecto en caso de error
        fallbackLng: 'en', // Idioma de reserva
        interpolation: {
          escapeValue: false // React ya hace escape de valores
        }
      });
  }
};

initI18n();

export default i18n;
