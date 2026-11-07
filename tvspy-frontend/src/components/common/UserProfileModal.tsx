import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registriesApi } from '../../api';
import { UserItem } from '../../types';
import Badge from './Badge';
import { formatBytes, formatSeconds } from '../../utils/formatters';
import {
  FiX,
  FiUser,
  FiClock,
  FiTv,
  FiHardDrive,
  FiActivity,
  FiMonitor,
  FiShield,
  FiRefreshCw,
  FiUserCheck,
  FiUserX,
} from 'react-icons/fi';

interface UserProfileModalProps {
  user: UserItem;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    registriesApi
      .getUserSummary(user.username)
      .then((res) => setData(res))
      .catch((err) => console.error('Error fetching user summary:', err))
      .finally(() => setLoading(false));
  }, [user.username]);

  const summary = data?.summary;
  const isEnabled = user.enabled !== false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-stroke bg-white p-6 shadow-2xl dark:border-strokedark dark:bg-boxdark max-h-[90vh] overflow-y-auto">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-body hover:bg-gray-100 hover:text-black dark:text-bodydark dark:hover:bg-meta-4 dark:hover:text-white transition"
          aria-label="Cerrar"
        >
          <FiX className="text-lg" />
        </button>

        {/* Cabecera del Usuario */}
        <div className="flex items-center gap-4 pb-4 border-b border-stroke dark:border-strokedark">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-sm ${
              isEnabled
                ? 'bg-gradient-to-tr from-primary to-blue-500'
                : 'bg-gray-400'
            }`}
          >
            {user.username ? user.username.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-black dark:text-white">
                {user.username}
              </h3>
              {isEnabled ? (
                <Badge variant="success">
                  <FiUserCheck className="text-xs" /> {t('Active') || 'Activo'}
                </Badge>
              ) : (
                <Badge variant="default">
                  <FiUserX className="text-xs" /> {t('Disabled') || 'Deshabilitado'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-body dark:text-bodydark mt-0.5">
              {user.comment || 'Usuario configurado en TVHeadend'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-body dark:text-bodydark">
            <FiRefreshCw className="inline-block animate-spin text-2xl mb-2 text-primary" />
            <div className="text-xs">{t('Loading...')}</div>
          </div>
        ) : (
          <div className="space-y-6 pt-5">
            {/* Métricas Principales del Usuario */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-meta-4/20 border border-stroke dark:border-strokedark">
                <span className="text-[11px] font-semibold text-body dark:text-bodydark block">
                  {t('Total Reproductions')}
                </span>
                <p className="text-lg font-bold text-black dark:text-white mt-1">
                  {summary?.total_plays || 0}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-meta-4/20 border border-stroke dark:border-strokedark">
                <span className="text-[11px] font-semibold text-body dark:text-bodydark block">
                  {t('Accumulated Time')}
                </span>
                <p className="text-lg font-bold text-emerald-500 mt-1">
                  {formatSeconds(summary?.total_duration_seconds)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-meta-4/20 border border-stroke dark:border-strokedark">
                <span className="text-[11px] font-semibold text-body dark:text-bodydark block">
                  {t('Downloaded Traffic')}
                </span>
                <p className="text-lg font-bold text-primary dark:text-secondary mt-1">
                  {formatBytes(summary?.total_consumed_bytes)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-meta-4/20 border border-stroke dark:border-strokedark">
                <span className="text-[11px] font-semibold text-body dark:text-bodydark block">
                  {t('Watched Channels')}
                </span>
                <p className="text-lg font-bold text-amber-500 mt-1">
                  {summary?.unique_channels || 0}
                </p>
              </div>
            </div>

            {/* Último Dispositivo / IP conocida */}
            {data?.lastKnown && (
              <div className="p-3.5 rounded-xl bg-gray-50/70 border border-stroke dark:border-strokedark dark:bg-meta-4/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-body dark:text-bodydark">
                  <FiMonitor className="text-sm text-primary" />
                  <span>Último reproductor:</span>
                  <b className="text-black dark:text-white font-mono">{data.lastKnown.client || 'N/A'}</b>
                </div>
                <div className="flex items-center gap-2 text-body dark:text-bodydark">
                  <FiShield className="text-sm text-emerald-500" />
                  <span>Última IP:</span>
                  <b className="text-black dark:text-white font-mono">{data.lastKnown.hostname || 'N/A'}</b>
                </div>
              </div>
            )}

            {/* Canales Favoritos del Usuario */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-body dark:text-bodydark mb-2.5 flex items-center gap-1.5">
                <FiTv className="text-primary text-sm" />
                {t('Top channels')} del usuario
              </h4>
              {data?.topChannels && data.topChannels.length > 0 ? (
                <div className="divide-y divide-stroke dark:divide-strokedark border border-stroke dark:border-strokedark rounded-xl overflow-hidden bg-white dark:bg-boxdark">
                  {data.topChannels.map((c: any, idx: number) => (
                    <div key={idx} className="p-2.5 px-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-black dark:text-white truncate max-w-[200px]">
                          {c.channel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] text-body dark:text-bodydark">
                        <span>{c.count} {t('reproductions')}</span>
                        <span>•</span>
                        <span className="text-black dark:text-white font-semibold">{formatSeconds(c.total_seconds)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-body dark:text-bodydark py-3 text-center">
                  Sin canales registrados
                </p>
              )}
            </div>

            {/* Histórico Reciente de Reproducciones */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-body dark:text-bodydark mb-2.5 flex items-center gap-1.5">
                <FiActivity className="text-primary text-sm" />
                {t('Last reproductions')}
              </h4>
              {data?.recentPlays && data.recentPlays.length > 0 ? (
                <div className="divide-y divide-stroke dark:divide-strokedark border border-stroke dark:border-strokedark rounded-xl overflow-hidden bg-white dark:bg-boxdark text-xs">
                  {data.recentPlays.map((r: any, idx: number) => (
                    <div key={idx} className="p-2.5 px-3 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-black dark:text-white">
                          {r.channel}
                        </span>
                        <div className="text-[11px] text-body dark:text-bodydark flex items-center gap-2 mt-0.5 font-mono">
                          <span>{r.client || 'N/A'}</span>
                          <span>•</span>
                          <span>{r.hostname}</span>
                        </div>
                      </div>
                      <div className="text-right text-[11px] font-mono text-body dark:text-bodydark">
                        <div>{r.start ? r.start.slice(0, 16).replace('T', ' ') : ''}</div>
                        {r.errors > 0 && (
                          <span className="text-amber-500 font-bold text-[10px]">
                            {r.errors} errores
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-body dark:text-bodydark py-3 text-center">
                  Sin actividad reciente
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;

