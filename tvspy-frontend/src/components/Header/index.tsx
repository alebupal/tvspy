import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import DarkModeSwitcher from './DarkModeSwitcher';
import LanguageSelector from '../LanguageSelector';
import Badge from '../common/Badge';
import { formatBandwidth } from '../../utils/formatters';
import { FiMenu, FiActivity, FiTv, FiAlertCircle, FiMaximize, FiMinimize } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { systemApi } from '../../api';
import { UpdateCheckResult } from '../../types';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { t } = useTranslation();
  const { status, metrics, error } = useWebSocket();
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen not supported or blocked:', e);
    }
  };

  useEffect(() => {
    systemApi
      .checkUpdate()
      .then((res) => {
        if (res && res.hasUpdate) {
          setUpdateInfo(res);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 flex w-full border-b border-stroke bg-white/80 backdrop-blur-md dark:border-strokedark dark:bg-boxdark/80">
      <div className="flex flex-grow items-center justify-between px-4 py-3 md:px-6 2xl:px-10">
        {/* Lado izquierdo: Botón menú móvil y estado de TVHeadend */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg border border-stroke p-2 text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4 lg:hidden"
            aria-label="Abrir menú"
          >
            <FiMenu className="text-xl" />
          </button>

          {/* Badge de estado en tiempo real */}
          <div className="flex items-center gap-2">
            {status === 'connected' ? (
              <Badge variant="success" pulse>
                <span className="hidden sm:inline">TVHeadend:</span> {t('Connected')}
              </Badge>
            ) : status === 'connecting' ? (
              <Badge variant="warning" pulse>
                <span className="hidden sm:inline">TVHeadend:</span> {t('Connecting')}...
              </Badge>
            ) : (
              <Badge variant="danger">
                <span className="hidden sm:inline">TVHeadend:</span> {t('Disconnected')}
              </Badge>
            )}

            {/* Pill de streams activos y ancho de banda en vivo */}
            {status === 'connected' && metrics.count > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary dark:text-secondary text-xs font-semibold">
                <span className="flex items-center gap-1">
                  <FiTv className="text-xs" />
                  {metrics.count} {metrics.count === 1 ? 'stream' : 'streams'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <FiActivity className="text-xs" />
                  {formatBandwidth(metrics.totalBandwidth)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Lado derecho: Alerta actualización, Idioma y Modo Oscuro */}
        <div className="flex items-center gap-3">
          {updateInfo && updateInfo.hasUpdate && (
            <a
              href={updateInfo.releaseUrl || 'https://github.com/alebupal/tvspy/releases'}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition shadow-sm animate-pulse"
              title={t('Update available')}
            >
              <FiAlertCircle className="text-sm" />
              <span>{t('New version available')}: <b>v{updateInfo.latestVersion}</b></span>
            </a>
          )}

          <LanguageSelector />
          <div className="h-6 w-px bg-stroke dark:bg-strokedark" />
          <DarkModeSwitcher />
          <div className="h-6 w-px bg-stroke dark:bg-strokedark" />

          {/* Botón Pantalla Completa / Modo Kiosco */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? t('Exit Fullscreen') : t('Fullscreen / Kiosk Mode')}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:hover:text-primary transition text-sm"
            aria-label="Pantalla completa"
          >
            {isFullscreen ? <FiMinimize /> : <FiMaximize />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
