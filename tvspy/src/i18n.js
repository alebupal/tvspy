import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';

// Configura i18next
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
    lng: 'es', // Idioma por defecto
    fallbackLng: 'en', // Idioma de reserva
    interpolation: {
      escapeValue: false // React ya hace escape de valores
    }
  });

export default i18n;
