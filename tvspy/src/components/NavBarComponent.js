import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSelector from './LanguageSelectorComponent';
import { useTranslation } from 'react-i18next';

function NavBarComponent() {
  const { t } = useTranslation();

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">{t('Home')}</Link></li>
        <li><Link to="/registry">{t('Registry')}</Link></li>
        <li><Link to="/channels">{t('Channels')}</Link></li>
        <li><Link to="/users">{t('Users')}</Link></li>
        <li><Link to="/configuration">{t('Configuration')}</Link></li>
      </ul>
      <LanguageSelector />
    </nav>
  );
}

export default NavBarComponent;
