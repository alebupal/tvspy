import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';
import { API_ENDPOINTS } from './config/apiConfig';
import axios from 'axios';

const initI18n = () => {
  return new Promise(async (resolve, reject) => {
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
            escapeValue: false
          }
        }, (err, t) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
    } catch (error) {
      console.error('Error al obtener el idioma por defecto:', error);
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
            escapeValue: false
          }
        }, (err, t) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
    }
  });
};

export default initI18n;
