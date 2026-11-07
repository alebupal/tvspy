import React, { useState, useEffect, useMemo } from 'react';
import { SubscriptionMessage, CurrentEpgEvent } from '../../types';
import Badge from '../common/Badge';
import { formatBandwidth, formatBytes } from '../../utils/formatters';
import { useTranslation } from 'react-i18next';
import { systemApi, tvheadendApi } from '../../api';
import { checkIpAuthorized } from '../../utils/ipUtils';
import toast from 'react-hot-toast';
import {
  FiTv,
  FiUser,
  FiMonitor,
  FiHardDrive,
  FiActivity,
  FiShield,
  FiAlertTriangle,
  FiPower,
  FiRefreshCw,
  FiFilm,
} from 'react-icons/fi';

interface LiveStreamCardProps {
  subscription: SubscriptionMessage;
  allowedIps?: string;
  channelLogo?: string;
  epgEvent?: CurrentEpgEvent;
}

export const LiveStreamCard: React.FC<LiveStreamCardProps> = ({
  subscription,
  allowedIps = '',
  channelLogo,
  epgEvent,
}) => {
  const { t } = useTranslation();
  const [cancelling, setCancelling] = useState(false);
  const [geoInfo, setGeoInfo] = useState<{ flag?: string; country?: string; city?: string } | null>(null);
  const [imgError, setImgError] = useState(false);

  const isDvr = subscription.title && subscription.title.includes('DVR:');
  const isIpAllowed = checkIpAuthorized(subscription.hostname, allowedIps);

  // Resolver logo del canal desde prop, suscripción o caché de sesión
  const resolvedLogo = useMemo(() => {
    if (channelLogo) return channelLogo;
    if ((subscription as any).icon_public_url) return (subscription as any).icon_public_url;
    if ((subscription as any).icon) return (subscription as any).icon;
    try {
      const cached = sessionStorage.getItem('tvspy_channel_logos');
      if (cached && subscription.channel) {
        const map = JSON.parse(cached);
        if (map[subscription.channel]) return map[subscription.channel];
      }
    } catch {}
    return null;
  }, [channelLogo, subscription.channel, (subscription as any).icon_public_url, (subscription as any).icon]);

  // Consulta ligera de GeoIP para la IP de la conexión
  useEffect(() => {
    if (subscription.hostname) {
      systemApi
        .getGeoIp(subscription.hostname)
        .then((res) => {
          if (res) setGeoInfo(res);
        })
        .catch(() => {});
    }
  }, [subscription.hostname]);

  // Cancelar stream
  const handleKillStream = async () => {
    const userLabel = subscription.username || t('No user');
    const chanLabel = subscription.channel || t('Unknown channel');
    if (!window.confirm(t('Disconnect stream confirm', { username: userLabel, channel: chanLabel }))) {
      return;
    }

    setCancelling(true);
    try {
      await tvheadendApi.cancelSubscription(subscription.id || subscription.start);
      toast.success(t('Stream disconnected successfully'));
    } catch (err: any) {
      toast.error(err.response?.data?.details || err.message || t('Error disconnecting stream'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-strokedark dark:bg-boxdark relative overflow-hidden group">
      {/* Barra superior de acento */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isDvr ? 'bg-purple-500' : 'bg-primary'
        }`}
      />

      {/* Cabecera: Canal y Badges */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Logo del canal con fallback a icono estilizado */}
          <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center p-1 bg-white rounded-xl shadow-sm border border-stroke/80 dark:border-strokedark/80 dark:bg-meta-4 overflow-hidden">
            {resolvedLogo && !imgError ? (
              <img
                src={resolvedLogo}
                alt={subscription.channel || 'Canal'}
                className="max-h-full max-w-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className={`h-full w-full flex items-center justify-center rounded-lg text-white font-bold shadow-sm ${
                  isDvr
                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-500'
                    : 'bg-gradient-to-tr from-primary to-blue-500'
                }`}
              >
                {isDvr ? <FiHardDrive className="text-lg" /> : <FiTv className="text-lg" />}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className="font-semibold text-black dark:text-white truncate text-base"
              title={subscription.channel || t('Unknown channel')}
            >
              {subscription.channel || t('Unknown channel')}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-body dark:text-bodydark flex items-center gap-1 truncate">
                <FiUser className="text-xs flex-shrink-0" />
                <span className="truncate">{subscription.username || t('No user')}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {subscription.errors !== undefined && subscription.errors > 0 && (
            <span
              title={`${subscription.errors} errores de transporte de señal / paquetes discontinuos`}
              className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20 cursor-help"
            >
              <FiAlertTriangle className="text-xs" />
              <span>{subscription.errors} {t('Errors').toLowerCase()}</span>
            </span>
          )}

          {isDvr ? (
            <Badge variant="dvr" pulse>
              DVR
            </Badge>
          ) : (
            <Badge variant="success" pulse>
              {t('Live')}
            </Badge>
          )}

          {/* Botón Kill Stream */}
          <button
            onClick={handleKillStream}
            disabled={cancelling}
            title={t('Disconnect stream')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white transition opacity-80 group-hover:opacity-100 disabled:opacity-40"
          >
            {cancelling ? (
              <FiRefreshCw className="animate-spin text-xs" />
            ) : (
              <FiPower className="text-xs" />
            )}
          </button>
        </div>
      </div>

      {/* Programa actual en EPG */}
      {epgEvent && !isDvr && (
        <div
          className="mb-3 p-2.5 rounded-lg bg-gray-50/90 dark:bg-meta-4/30 border border-stroke/70 dark:border-strokedark/70 cursor-help"
          title={epgEvent.summary ? `${epgEvent.title}\n\n${epgEvent.summary}` : epgEvent.title}
        >
          <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <FiFilm className="text-primary dark:text-secondary flex-shrink-0 text-xs" />
              <span className="font-semibold text-black dark:text-white truncate">
                {epgEvent.title}
              </span>
            </div>
            <span className="text-[11px] text-body dark:text-bodydark flex-shrink-0 font-medium">
              {epgEvent.remainingMinutes > 0
                ? `${epgEvent.remainingMinutes}m ${t('remaining') || 'rest.'}`
                : t('Live')}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-meta-4 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(3, epgEvent.progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Detalles del stream */}
      <div className="space-y-2.5 pt-2 border-t border-stroke/70 dark:border-strokedark/70 text-xs">
        {/* Cliente / Reproductor */}
        <div className="flex items-center justify-between text-body dark:text-bodydark">
          <span className="flex items-center gap-1.5">
            <FiMonitor className="text-sm" />
            {t('Client')}:
          </span>
          <span className="font-medium text-black dark:text-white truncate max-w-[160px]">
            {subscription.client || 'N/A'}
          </span>
        </div>

        {/* IP / Hostname & Geolocalización */}
        <div className="flex items-center justify-between text-body dark:text-bodydark">
          <span className="flex items-center gap-1.5">
            {isIpAllowed ? (
              <FiShield className="text-sm text-emerald-500" />
            ) : (
              <FiAlertTriangle className="text-sm text-rose-500" />
            )}
            {t('Hostname')}:
          </span>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {geoInfo?.flag && (
              <span title={`${geoInfo.country || ''} - ${geoInfo.city || ''}`} className="cursor-help">
                {geoInfo.flag}
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded ${
                isIpAllowed
                  ? 'bg-gray-100 text-black dark:bg-meta-4 dark:text-white'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
              }`}
            >
              {subscription.hostname || 'N/A'}
            </span>
          </div>
        </div>

        {/* Servicio / Profile */}
        {subscription.service && (
          <div className="flex items-center justify-between text-body dark:text-bodydark">
            <span className="flex items-center gap-1.5">
              <FiActivity className="text-sm" />
              {t('Service')}:
            </span>
            <span className="font-medium text-black dark:text-white truncate max-w-[160px]">
              {subscription.service}
            </span>
          </div>
        )}
      </div>

      {/* Métricas de ancho de banda */}
      <div className="mt-4 pt-3 border-t border-stroke/70 dark:border-strokedark/70 grid grid-cols-2 gap-2 bg-gray-50/70 dark:bg-meta-4/30 p-2.5 rounded-lg">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-body dark:text-bodydark font-semibold">
            {t('Bandwidth')}
          </span>
          <p className="text-sm font-bold text-primary dark:text-secondary">
            {formatBandwidth(subscription.in)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-body dark:text-bodydark font-semibold">
            {t('Total consumed')}
          </span>
          <p className="text-sm font-bold text-black dark:text-white">
            {formatBytes(subscription.total_in)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamCard;
