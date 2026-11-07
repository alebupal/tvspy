import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const currentLang = i18n.language?.startsWith('es') ? 'es' : 'en';

  return (
    <div className="relative inline-flex items-center">
      <FiGlobe className="pointer-events-none absolute left-2.5 text-xs text-body dark:text-bodydark" />
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        aria-label="Seleccionar idioma"
        className="appearance-none rounded-lg border border-stroke bg-white/70 dark:bg-meta-4/40 py-1.5 pl-7 pr-7 text-xs font-semibold text-black dark:border-strokedark dark:text-white outline-none transition hover:bg-gray-50 focus:border-primary dark:hover:bg-meta-4 cursor-pointer shadow-sm"
      >
        <option value="es" className="text-black dark:text-white dark:bg-boxdark">
          Español
        </option>
        <option value="en" className="text-black dark:text-white dark:bg-boxdark">
          English
        </option>
      </select>
      <span className="pointer-events-none absolute right-2.5 text-[10px] text-body dark:text-bodydark">
        ▼
      </span>
    </div>
  );
};

export default LanguageSelector;
