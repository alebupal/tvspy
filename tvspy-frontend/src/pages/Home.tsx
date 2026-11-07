import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '../context/WebSocketContext';
import { configApi, statisticsApi } from '../api';
import { StatisticsData } from '../types';
import StatCard from '../components/common/StatCard';
import LiveSparkline from '../components/common/LiveSparkline';
import LiveStreamCard from '../components/live/LiveStreamCard';
import Card from '../components/common/Card';
import { formatBandwidth, formatBytes, formatSeconds } from '../utils/formatters';
import {
  FiActivity,
  FiHardDrive,
  FiTv,
  FiUsers,
  FiCalendar,
  FiBarChart2,
  FiClock,
  FiRefreshCw,
  FiWifiOff,
} from 'react-icons/fi';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { status, error: wsError, subscriptions, metrics, reconnect } = useWebSocket();

  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [statsType, setStatsType] = useState<'time' | 'uses'>('time');
  const [daysAgo, setDaysAgo] = useState<number>(30);
  const [allowedIps, setAllowedIps] = useState<string>('');

  // Cargar IPs autorizadas de la configuración
  useEffect(() => {
    configApi.getAll().then((configs) => {
      const ipConfig = configs.find((c) => c.name === 'ip_allowed');
      if (ipConfig) setAllowedIps(ipConfig.value);
    }).catch(() => {});
  }, []);

  // Cargar estadísticas según filtros
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await statisticsApi.getGeneral({
        type: statsType,
        daysAgo,
        limit: 8,
      });
      setStatistics(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [statsType, daysAgo]);

  // Filtrar escaneos internos de muxes/EPG/listas m3u que no son reproducciones de usuarios
  const subs = useMemo(() => {
    const raw = Array.isArray(subscriptions) ? subscriptions : [];
    return raw.filter((s: any) => {
      if (s.title && s.title.includes('DVR:')) return true;
      const title = (s.title || '').toLowerCase().trim();
      const client = (s.client || '').toLowerCase().trim();
      const channel = (s.channel || '').trim();
      const hostname = (s.hostname || '').trim();
      const username = (s.username || '').toLowerCase().trim();

      const scanKeywords = ['scan', 'epggrab', 'epg', 'service mapper', 'probe', 'mux scan'];
      if (scanKeywords.some((kw) => title.includes(kw) || client.includes(kw))) {
        return false;
      }

      const hasChannel = channel.length > 0;
      const hasUser = username.length > 0 && username !== 'no user' && username !== 'sin usuario';
      const hasClient = client.length > 0 && client !== 'n/a';
      const hasHostname = hostname.length > 0 && hostname !== 'n/a' && hostname !== '127.0.0.1' && hostname !== '::1';

      if (!hasChannel && !hasUser && !hasClient && !hasHostname) return false;
      if (!hasChannel && (!hasClient || !hasHostname)) return false;

      return true;
    });
  }, [subscriptions]);

  const bw = useMemo(() => {
    return subs.reduce((sum, s) => sum + (s.in || 0), 0);
  }, [subs]);

  const consumed = useMemo(() => {
    return subs.reduce((sum, s) => sum + (s.total_in || 0), 0);
  }, [subs]);

  const dvrCount = subs.filter((s) => s.title && s.title.includes('DVR:')).length;

  // Contar usuarios únicos en vivo
  const uniqueUsersCount = useMemo(() => {
    const users = new Set(subs.map((s) => s.username).filter(Boolean));
    return users.size;
  }, [subs]);

  return (
    <div className="space-y-6">
      {/* Aviso si la conexión a TVHeadend falló */}
      {status === 'error' && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiWifiOff className="text-lg flex-shrink-0" />
            <span>
              <b>{t('Error')}:</b> {wsError || t('Missing one or more values required to connect with TVHeadend')}
            </span>
          </div>
          <button
            onClick={reconnect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition"
          >
            <FiRefreshCw className="text-xs" />
            {t('Retry')}
          </button>
        </div>
      )}

      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('Bandwidth')}
          value={formatBandwidth(bw)}
          subtitle={t('Total bandwidth')}
          color="primary"
          sparkline={<LiveSparkline currentValue={bw} />}
          icon={<FiActivity className="text-2xl" />}
        />

        <StatCard
          title={t('Total consumed')}
          value={formatBytes(consumed)}
          subtitle={t('Consumed across active sessions')}
          color="success"
          icon={<FiHardDrive className="text-2xl" />}
        />

        <StatCard
          title={t('Active streams')}
          value={subs.length}
          subtitle={`${dvrCount} ${t('DVR recordings')}`}
          color="warning"
          icon={<FiTv className="text-2xl" />}
        />

        <StatCard
          title={t('Users')}
          value={uniqueUsersCount}
          subtitle={t('Connected clients right now')}
          color="info"
          icon={<FiUsers className="text-2xl" />}
        />
      </div>

      {/* Sección Transmisiones en Vivo */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-black dark:text-white">
              {t('Live Transmissions')}
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary dark:text-secondary">
              {subs.length}
            </span>
          </div>
        </div>

        {subs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {subs.map((sub) => (
              <LiveStreamCard
                key={sub.id || sub.start}
                subscription={sub}
                allowedIps={allowedIps}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-stroke bg-white p-12 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-meta-4 text-body dark:text-bodydark mb-3">
              <FiTv className="text-3xl" />
            </div>
            <h3 className="text-base font-semibold text-black dark:text-white">
              {t('No active plays')}
            </h3>
            <p className="text-xs text-body dark:text-bodydark mt-1 max-w-sm mx-auto">
              {t('No active streams description')}
            </p>
          </div>
        )}
      </div>

      {/* Sección Analítica & Estadísticas */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
              <FiBarChart2 className="text-primary dark:text-secondary" />
              {t('Statistics')}
            </h2>
            <p className="text-xs text-body dark:text-bodydark">
              {t('Detailed history of all playbacks and recordings')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector Tipo: Tiempo o Usos */}
            <div className="inline-flex rounded-lg border border-stroke bg-gray-100 p-1 dark:border-strokedark dark:bg-meta-4">
              <button
                onClick={() => setStatsType('time')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  statsType === 'time'
                    ? 'bg-white text-black shadow-sm dark:bg-boxdark dark:text-white'
                    : 'text-body hover:text-black dark:text-bodydark dark:hover:text-white'
                }`}
              >
                {t('Time')}
              </button>
              <button
                onClick={() => setStatsType('uses')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  statsType === 'uses'
                    ? 'bg-white text-black shadow-sm dark:bg-boxdark dark:text-white'
                    : 'text-body hover:text-black dark:text-bodydark dark:hover:text-white'
                }`}
              >
                {t('Use')}
              </button>
            </div>

            {/* Selector Días */}
            <select
              value={daysAgo}
              onChange={(e) => setDaysAgo(Number(e.target.value))}
              aria-label={t('Days ago')}
              className="rounded-lg border border-stroke bg-white px-3 py-1.5 text-xs font-medium text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
            >
              <option value={7}>{t('Last 7 days')}</option>
              <option value={30}>{t('Last 30 days')}</option>
              <option value={90}>{t('Last 90 days')}</option>
            </select>
          </div>
        </div>

        {/* Paneles de Estadísticas */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Top Canales */}
          <Card title={t('Top channels')} subtitle={`${t('Top channels')} - ${statsType === 'time' ? t('Time') : t('reproductions')}`}>
            {statsLoading ? (
              <div className="py-8 text-center text-xs text-body">{t('Loading...')}</div>
            ) : statistics?.topChannels && statistics.topChannels.length > 0 ? (
              <ul className="divide-y divide-stroke dark:divide-strokedark">
                {statistics.topChannels.map((item, idx) => (
                  <li key={item.channel + idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[180px]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-black dark:text-white truncate">
                        {item.channel}
                      </span>
                    </div>
                    <span className="font-mono text-body dark:text-bodydark">
                      {statsType === 'time' ? formatSeconds(item.total_time_seconds) : `${item.count} ${t('reproductions')}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-xs text-body dark:text-bodydark">
                {t('No statistics available')}
              </p>
            )}
          </Card>

          {/* Top Clientes */}
          <Card title={t('Top clients')} subtitle={t('Most used players')}>
            {statsLoading ? (
              <div className="py-8 text-center text-xs text-body">{t('Loading...')}</div>
            ) : statistics?.topClients && statistics.topClients.length > 0 ? (
              <ul className="divide-y divide-stroke dark:divide-strokedark">
                {statistics.topClients.map((item, idx) => (
                  <li key={(item.client || 'na') + idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[180px]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-black dark:text-white truncate">
                        {item.client || 'N/A'}
                      </span>
                    </div>
                    <span className="font-mono text-body dark:text-bodydark">
                      {statsType === 'time' ? formatSeconds(item.total_time_seconds) : `${item.count} ${t('reproductions')}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-xs text-body dark:text-bodydark">
                {t('No statistics available')}
              </p>
            )}
          </Card>

          {/* Top Usuarios */}
          <Card title={t('Top users')} subtitle={t('Users with highest activity')}>
            {statsLoading ? (
              <div className="py-8 text-center text-xs text-body">{t('Loading...')}</div>
            ) : statistics?.topUsers && statistics.topUsers.length > 0 ? (
              <ul className="divide-y divide-stroke dark:divide-strokedark">
                {statistics.topUsers.map((item, idx) => (
                  <li key={(item.username || 'na') + idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[180px]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-black dark:text-white truncate">
                        {item.username}
                      </span>
                    </div>
                    <span className="font-mono text-body dark:text-bodydark">
                      {statsType === 'time' ? formatSeconds(item.total_time_seconds) : `${item.count} ${t('reproductions')}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-xs text-body dark:text-bodydark">
                {t('No statistics available')}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
