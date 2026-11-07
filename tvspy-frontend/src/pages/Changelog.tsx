import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { docsApi } from '../api';
import Card from '../components/common/Card';
import Tabs, { TabItem } from '../components/common/Tabs';
import {
  FiBookOpen,
  FiList,
  FiHeart,
  FiRefreshCw,
  FiExternalLink,
  FiCheck,
  FiTag,
  FiGift,
} from 'react-icons/fi';

const PAYPAL_URL = 'https://www.paypal.me/alebupal';

const Changelog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('changelog');
  const [content, setContent] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'es';

  const loadDocumentation = async () => {
    setLoading(true);
    setError(null);
    try {
      const type = activeTab === 'readme' ? 'readme' : 'changelog';
      const data = await docsApi.getDoc(type, currentLang);
      setContent(data.content);
      setFilename(data.filename);
    } catch (err: any) {
      // Fallback a GitHub Raw si el backend no lo encuentra localmente
      try {
        const file = activeTab === 'readme'
          ? (currentLang === 'en' ? 'README.MD' : 'README_ES.MD')
          : (currentLang === 'en' ? 'CHANGELOG.MD' : 'CHANGELOG_ES.MD');
        const fallbackUrl = `https://raw.githubusercontent.com/alebupal/tvspy/main/${file}`;
        const res = await fetch(fallbackUrl);
        if (!res.ok) throw new Error('No se pudo cargar el archivo');
        const text = await res.text();
        setContent(text);
        setFilename(file);
      } catch (fallbackErr: any) {
        setError(err.message || 'Error al cargar el documento');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentation();
  }, [activeTab, currentLang]);

  const tabs: TabItem[] = [
    { id: 'changelog', label: 'Changelog / Versiones', icon: <FiList /> },
    { id: 'readme', label: 'README / Documentación', icon: <FiBookOpen /> },
  ];

  // Parser simple de Markdown para mostrar el texto estilizado
  const renderMarkdownContent = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // H1
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-2xl font-bold text-black dark:text-white mt-6 mb-3 pb-2 border-b border-stroke dark:border-strokedark">
            {line.replace('# ', '')}
          </h1>
        );
      }
      // H2 - Version header
      if (line.startsWith('## ')) {
        const title = line.replace('## ', '');
        return (
          <div key={idx} className="mt-6 mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FiTag className="text-sm" />
            </span>
            <h2 className="text-lg font-bold text-black dark:text-white">
              {title}
            </h2>
          </div>
        );
      }
      // H3
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-semibold text-primary dark:text-secondary mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      // List items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().replace(/^[-*]\s+/, '');
        return (
          <div key={idx} className="flex items-start gap-2 py-1 text-xs text-body dark:text-bodydark pl-2">
            <FiCheck className="text-emerald-500 mt-0.5 flex-shrink-0 text-xs" />
            <span className="leading-relaxed">
              {itemText.split('**').map((part, i) =>
                i % 2 === 1 ? <b key={i} className="text-black dark:text-white">{part}</b> : part
              )}
            </span>
          </div>
        );
      }
      // Code blocks
      if (line.startsWith('```')) {
        return null;
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Regular paragraph
      return (
        <p key={idx} className="text-xs text-body dark:text-bodydark py-0.5 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
            <FiBookOpen className="text-primary" />
            Documentación & Changelog
          </h2>
          <p className="text-xs text-body dark:text-bodydark mt-0.5">
            Lee directamente los archivos oficiales del repositorio
          </p>
        </div>
      </div>

      {/* Banner de Donación y Agradecimiento */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4.5 text-xs text-black dark:text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow">
            <FiGift className="text-xl" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-black dark:text-white">
              ¿Te resulta útil TVSPY?
            </h4>
            <p className="text-xs text-body dark:text-bodydark mt-0.5">
              Este proyecto es de código abierto y mantenido con dedicación. Si deseas apoyar su desarrollo continuo, puedes invitarme a un café.
            </p>
          </div>
        </div>

        <a
          href={PAYPAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition whitespace-nowrap"
        >
          <FiHeart className="text-sm fill-white" />
          Donar en PayPal
        </a>
      </div>

      {/* Navegación por pestañas */}
      <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-1">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        {filename && (
          <span className="text-[11px] font-mono text-body dark:text-bodydark hidden sm:inline">
            Archivo: {filename}
          </span>
        )}
      </div>

      {/* Visor de Documentación */}
      <Card>
        {loading ? (
          <div className="py-20 text-center text-body dark:text-bodydark">
            <FiRefreshCw className="inline-block animate-spin text-2xl mb-2 text-primary" />
            <div className="text-xs">{t('Loading...')}</div>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-danger text-sm">
            {t('Error')}: {error}
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none divide-y divide-stroke dark:divide-strokedark">
            {renderMarkdownContent(content)}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Changelog;

