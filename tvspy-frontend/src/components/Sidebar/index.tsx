import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../../images/logo/logo.svg';
import pkg from '../../../package.json';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '../../context/WebSocketContext';
import { systemApi } from '../../api';
import {
  FiGrid,
  FiList,
  FiTv,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiFileText,
  FiHeart,
  FiX,
  FiAlertCircle,
  FiExternalLink,
} from 'react-icons/fi';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const DEFAULT_VERSION = pkg.version || '3.2.3';
const PAYPAL_URL = 'https://www.paypal.me/alebupal';

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { pathname } = location;
  const { subscriptions } = useWebSocket();

  const trigger = useRef<HTMLButtonElement | null>(null);
  const sidebar = useRef<HTMLElement | null>(null);

  const [currentVersion, setCurrentVersion] = useState<string>(DEFAULT_VERSION);
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);
  const [releaseUrl, setReleaseUrl] = useState<string>('https://github.com/alebupal/tvspy/releases');
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false);

  // Cerrar al pulsar Esc
  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (!sidebarOpen || key !== 'Escape') return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen, setSidebarOpen]);

  // Cerrar automáticamente al cambiar de ruta
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // Bloquear scroll de la página de fondo cuando el menú móvil está abierto
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Comprobar versión remota mediante el backend
  useEffect(() => {
    systemApi
      .checkUpdate()
      .then((info) => {
        if (info) {
          if (info.currentVersion) setCurrentVersion(info.currentVersion);
          setRemoteVersion(info.latestVersion);
          setIsNewVersionAvailable(info.hasUpdate);
          if (info.releaseUrl) setReleaseUrl(info.releaseUrl);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    {
      to: '/',
      label: t('Home'),
      icon: <FiGrid className="text-xl" />,
      badge: subscriptions.length > 0 ? subscriptions.length : undefined,
    },
    {
      to: '/registry',
      label: t('Registry'),
      icon: <FiList className="text-xl" />,
    },
    {
      to: '/channels',
      label: t('Channels'),
      icon: <FiTv className="text-xl" />,
    },
    {
      to: '/users',
      label: t('Users'),
      icon: <FiUsers className="text-xl" />,
    },
    {
      to: '/statistics',
      label: t('Statistics'),
      icon: <FiBarChart2 className="text-xl" />,
    },
    {
      to: '/settings',
      label: t('Settings'),
      icon: <FiSettings className="text-xl" />,
    },
    {
      to: '/changelog',
      label: t('Changelog & Docs'),
      icon: <FiFileText className="text-xl" />,
    },
  ];

  return (
    <>
      {/* Backdrop overlay para móviles */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        ref={sidebar}
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col justify-between overflow-y-auto border-r border-stroke bg-white duration-300 ease-in-out dark:border-strokedark dark:bg-boxdark lg:static lg:z-auto lg:h-screen lg:w-64 lg:max-w-none lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header del Sidebar con Logo */}
          <div className="flex items-center justify-between px-6 py-5.5 border-b border-stroke dark:border-strokedark">
            <NavLink to="/" className="flex items-center gap-3">
              <img src={Logo} alt="TVSPY Logo" className="h-8 w-auto" />
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary dark:text-secondary">
                v{currentVersion}
              </span>
            </NavLink>

            <button
              ref={trigger}
              onClick={() => setSidebarOpen(false)}
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              className="block text-body hover:text-black dark:text-bodydark dark:hover:text-white lg:hidden"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Navegación */}
          <div className="px-4 py-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-body dark:text-bodydark mb-3">
            {t('Main Menu')}
          </p>

          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-body hover:bg-gray-100 hover:text-black dark:text-bodydark dark:hover:bg-meta-4 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-body dark:text-bodydark group-hover:text-primary dark:group-hover:text-secondary'}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </div>

                  {link.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-secondary'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer del Sidebar con Donación PayPal y Enlaces */}
      <div className="p-4 border-t border-stroke dark:border-strokedark space-y-3">
        {/* Botón de Donación de PayPal (estilo sutil y discreto) */}
        <a
          href={PAYPAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-stroke/80 bg-gray-50/60 p-2 text-xs font-medium text-body hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-600 dark:border-strokedark/80 dark:bg-meta-4/20 dark:text-bodydark dark:hover:border-amber-400/40 dark:hover:bg-amber-400/10 dark:hover:text-amber-400 transition"
        >
          <FiHeart className="text-xs text-rose-500/80 dark:text-rose-400/80" />
          <span>{t('Donate with PayPal')}</span>
        </a>

        {isNewVersionAvailable && (
          <a
            href={releaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-2.5 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition"
          >
            <FiAlertCircle className="text-base flex-shrink-0" />
            <div className="flex-1 truncate">
              <span className="font-bold">{t('New version available')}:</span> v{remoteVersion}
            </div>
            <FiExternalLink className="text-xs flex-shrink-0" />
          </a>
        )}

        <div className="flex items-center justify-between text-[11px] text-body dark:text-bodydark px-1">
          <a
            href="https://github.com/alebupal/tvspy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary dark:hover:text-white transition"
          >
            GitHub
          </a>
          <span>•</span>
          <a
            href="https://hub.docker.com/r/alebupal/tvspy/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary dark:hover:text-white transition"
          >
            Docker
          </a>
          <span>•</span>
          <a
            href={PAYPAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-500 dark:hover:text-amber-400 font-semibold transition"
          >
            PayPal
          </a>
        </div>
      </div>
    </aside>
  </>
  );
};

export default Sidebar;
