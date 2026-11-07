import React from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import DarkModeSwitcher from './DarkModeSwitcher';
import LanguageSelector from '../LanguageSelector';
import Badge from '../common/Badge';
import { formatBandwidth } from '../../utils/formatters';
import { FiMenu, FiActivity, FiTv } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { t } = useTranslation();
  const { status, metrics, error } = useWebSocket();

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

        {/* Lado derecho: Idioma y Modo Oscuro */}
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <div className="h-6 w-px bg-stroke dark:bg-strokedark" />
          <DarkModeSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;
