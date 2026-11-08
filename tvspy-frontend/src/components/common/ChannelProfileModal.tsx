import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registriesApi } from '../../api';
import { ChannelItem } from '../../types';
import { formatBytes, formatSeconds } from '../../utils/formatters';
import imgNotFound from '../../images/notfound.png';
import {
  FiX,
  FiTv,
  FiUser,
  FiClock,
  FiHardDrive,
  FiActivity,
  FiRefreshCw,
  FiUsers,
} from 'react-icons/fi';

interface ChannelProfileModalProps {
  channel: ChannelItem;
  onClose: () => void;
}

export const ChannelProfileModal: React.FC<ChannelProfileModalProps> = ({ channel, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    registriesApi
      .getChannelSummary(channel.name)
      .then((res) => setData(res))
      .catch((err) => console.error('Error fetching channel summary:', err))
      .finally(() => setLoading(false));
  }, [channel.name]);

  const summary = data?.summary;

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

        {/* Cabecera del Canal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex items-center justify-center p-1.5 bg-white rounded-xl shadow-sm border border-stroke dark:border-strokedark dark:bg-meta-4 flex-shrink-0">
              <img
                src={channel.icon_public_url || channel.icon || imgNotFound}
                alt={channel.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = imgNotFound;
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-black dark:text-white">
                  {channel.name}
                </h3>
                {channel.number !== undefined && channel.number > 0 && (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary dark:text-secondary">
                    CH {channel.number}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-body dark:text-bodydark">
                {channel.network_name ? (
                  <span className="font-medium text-black dark:text-white flex items-center gap-1">
                    <span className="text-primary dark:text-secondary">📡</span>
                    <span>{channel.network_name}</span>
                  </span>
                ) : (
                  <span>Canal TVHeadend</span>
                )}
                {channel.services_details && channel.services_details.length > 0 && (
                  <span className="opacity-75">
                    • {channel.services_details.length} servicio(s)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Categorías / Tags */}
          {channel.tags_names && channel.tags_names.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:justify-end">
              {channel.tags_names.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-body dark:text-bodydark">
            <FiRefreshCw className="inline-block animate-spin text-2xl mb-2 text-primary" />
            <div className="text-xs">{t('Loading...')}</div>
          </div>
        ) : (
          <div className="space-y-6 pt-5">
            {/* Métricas Principales del Canal */}
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
                  {t('Active Users')}
                </span>
                <p className="text-lg font-bold text-amber-500 mt-1">
                  {summary?.unique_users || 0}
                </p>
              </div>
            </div>

            {/* Top Espectadores / Usuarios más activos en este canal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-body dark:text-bodydark mb-2.5 flex items-center gap-1.5">
                <FiUsers className="text-primary text-sm" />
                {t('Top users')} en este canal
              </h4>
              {data?.topUsers && data.topUsers.length > 0 ? (
                <div className="divide-y divide-stroke dark:divide-strokedark border border-stroke dark:border-strokedark rounded-xl overflow-hidden bg-white dark:bg-boxdark">
                  {data.topUsers.map((u: any, idx: number) => (
                    <div key={idx} className="p-2.5 px-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-black dark:text-white">
                          {u.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] text-body dark:text-bodydark">
                        <span>{u.count} {t('reproductions')}</span>
                        <span>•</span>
                        <span className="text-black dark:text-white font-semibold">{formatSeconds(u.total_seconds)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-body dark:text-bodydark py-3 text-center">
                  Sin emisiones registradas
                </p>
              )}
            </div>

            {/* Histórico Reciente de Emisiones del Canal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-body dark:text-bodydark mb-2.5 flex items-center gap-1.5">
                <FiActivity className="text-primary text-sm" />
                {t('Last reproductions')} en este canal
              </h4>
              {data?.recentPlays && data.recentPlays.length > 0 ? (
                <div className="divide-y divide-stroke dark:divide-strokedark border border-stroke dark:border-strokedark rounded-xl overflow-hidden bg-white dark:bg-boxdark text-xs">
                  {data.recentPlays.map((r: any, idx: number) => (
                    <div key={idx} className="p-2.5 px-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-black dark:text-white">
                          <FiUser className="text-xs text-body" />
                          <span>{r.username || t('No user')}</span>
                        </div>
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

export default ChannelProfileModal;

