import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReactApexChart from 'react-apexcharts';
import { statisticsApi } from '../api';
import { StatisticsData } from '../types';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import { formatBytes, formatSeconds } from '../utils/formatters';
import {
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiClock,
  FiTv,
  FiUsers,
  FiHardDrive,
  FiRefreshCw,
  FiCalendar,
  FiMonitor,
} from 'react-icons/fi';

const Statistics: React.FC = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<StatisticsData | null>(null);
  const [metricType, setMetricType] = useState<'time' | 'uses'>('time');
  const [daysAgo, setDaysAgo] = useState<number>(30);
  const [chartType, setChartType] = useState<'timeline' | 'channels' | 'clients' | 'hours'>('timeline');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await statisticsApi.getGeneral({
        type: metricType,
        daysAgo,
        limit: 12,
      });
      setData(res);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [metricType, daysAgo]);

  // Configuración 1: Gráfico de Evolución Temporal (Area Chart)
  const timelineChartOptions: ApexCharts.ApexOptions = useMemo(() => {
    const dates = (data?.activityByDay || []).map((d) => d.date);
    return {
      chart: {
        type: 'area',
        height: 320,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'inherit',
      },
      colors: ['#3C50E0', '#10B981'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [20, 100],
        },
      },
      xaxis: {
        categories: dates,
        labels: {
          style: { colors: '#64748B', fontSize: '11px' },
        },
      },
      yaxis: {
        labels: {
          style: { colors: '#64748B', fontSize: '11px' },
          formatter: (val) => Math.round(val).toString(),
        },
      },
      grid: {
        borderColor: '#E2E8F0',
        strokeDashArray: 4,
      },
      tooltip: {
        theme: 'dark',
      },
    };
  }, [data]);

  const timelineSeries = useMemo(() => {
    return [
      {
        name: metricType === 'time' ? 'Horas reproducidas' : 'Reproducciones',
        data: (data?.activityByDay || []).map((d) =>
          metricType === 'time'
            ? Math.round((d.total_seconds / 3600) * 10) / 10
            : d.reproductions
        ),
      },
    ];
  }, [data, metricType]);

  // Configuración 2: Gráfico de Canales (Bar Chart)
  const channelsChartOptions: ApexCharts.ApexOptions = useMemo(() => {
    const channels = (data?.topChannels || []).slice(0, 10).map((c) => c.channel);
    return {
      chart: {
        type: 'bar',
        height: 320,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      colors: ['#3C50E0'],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '55%',
          distributed: false,
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: channels,
        labels: {
          style: { colors: '#64748B', fontSize: '11px' },
          rotate: -45,
          trim: true,
        },
      },
      yaxis: {
        labels: {
          style: { colors: '#64748B', fontSize: '11px' },
          formatter: (val) =>
            metricType === 'time' ? formatSeconds(val) : Math.round(val).toString(),
        },
      },
      grid: {
        borderColor: '#E2E8F0',
        strokeDashArray: 4,
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) =>
            metricType === 'time' ? formatSeconds(val) : `${val} reproducciones`,
        },
      },
    };
  }, [data, metricType]);

  const channelsSeries = useMemo(() => {
    return [
      {
        name: metricType === 'time' ? 'Duración' : 'Reproducciones',
        data: (data?.topChannels || []).slice(0, 10).map((c) =>
          metricType === 'time' ? c.total_time_seconds : c.count
        ),
      },
    ];
  }, [data, metricType]);

  // Configuración 3: Gráfico de Clientes (Donut Chart)
  const clientsChartOptions: ApexCharts.ApexOptions = useMemo(() => {
    const labels = (data?.topClients || []).map((c) => c.client || 'N/A');
    return {
      chart: {
        type: 'donut',
        height: 320,
        fontFamily: 'inherit',
      },
      colors: ['#3C50E0', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#38BDF8'],
      labels,
      legend: {
        position: 'bottom',
        fontSize: '12px',
        labels: { colors: '#64748B' },
      },
      dataLabels: { enabled: true },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) =>
            metricType === 'time' ? formatSeconds(val) : `${val} reproducciones`,
        },
      },
    };
  }, [data, metricType]);

  const clientsSeries = useMemo(() => {
    return (data?.topClients || []).map((c) =>
      metricType === 'time' ? c.total_time_seconds : c.count
    );
  }, [data, metricType]);

  // Configuración 4: Franjas Horarias (Column Chart 24h)
  const hoursChartOptions: ApexCharts.ApexOptions = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    return {
      chart: {
        type: 'bar',
        height: 320,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      colors: ['#8B5CF6'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '60%',
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: hours,
        labels: {
          style: { colors: '#64748B', fontSize: '10px' },
        },
      },
      yaxis: {
        labels: {
          style: { colors: '#64748B', fontSize: '11px' },
        },
      },
      grid: {
        borderColor: '#E2E8F0',
        strokeDashArray: 4,
      },
      tooltip: {
        theme: 'dark',
      },
    };
  }, []);

  const hoursSeries = useMemo(() => {
    const hourMap: Record<string, number> = {};
    (data?.activityByHour || []).forEach((h) => {
      hourMap[h.hour] = h.count;
    });
    const fullHours = Array.from({ length: 24 }, (_, i) => {
      const key = String(i).padStart(2, '0');
      return hourMap[key] || 0;
    });

    return [
      {
        name: 'Reproducciones activadas',
        data: fullHours,
      },
    ];
  }, [data]);

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      {/* Cabecera y Filtros Globales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
            <FiBarChart2 className="text-primary" />
            {t('Statistics')} Avanzadas
          </h2>
          <p className="text-xs text-body dark:text-bodydark mt-0.5">
            Analítica detallada de visualización, canales, dispositivos y patrones de uso
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Métrica: Tiempo vs Usos */}
          <div className="inline-flex rounded-lg border border-stroke bg-gray-100 p-1 dark:border-strokedark dark:bg-meta-4">
            <button
              onClick={() => setMetricType('time')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                metricType === 'time'
                  ? 'bg-white text-primary shadow-sm dark:bg-boxdark dark:text-secondary'
                  : 'text-body hover:text-black dark:text-bodydark dark:hover:text-white'
              }`}
            >
              {t('Time')}
            </button>
            <button
              onClick={() => setMetricType('uses')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                metricType === 'uses'
                  ? 'bg-white text-primary shadow-sm dark:bg-boxdark dark:text-secondary'
                  : 'text-body hover:text-black dark:text-bodydark dark:hover:text-white'
              }`}
            >
              {t('Use')}
            </button>
          </div>

          {/* Rango de Días */}
          <select
            value={daysAgo}
            onChange={(e) => setDaysAgo(Number(e.target.value))}
            aria-label="Periodo de tiempo"
            className="rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-medium text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
          >
            <option value={7}>{t('Last 7 days')}</option>
            <option value={14}>14 {t('days')}</option>
            <option value={30}>{t('Last 30 days')}</option>
            <option value={90}>{t('Last 90 days')}</option>
            <option value={365}>{t('Last year')}</option>
          </select>

          <button
            onClick={fetchStats}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stroke bg-white text-xs font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4 transition shadow-sm"
          >
            <FiRefreshCw className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title={t('Total Reproductions')}
          value={summary?.total_reproductions || 0}
          subtitle={`${t('In the last')} ${daysAgo} ${t('days')}`}
          color="primary"
          icon={<FiTrendingUp className="text-xl" />}
        />
        <StatCard
          title={t('Accumulated Time')}
          value={formatSeconds(summary?.total_duration_seconds)}
          subtitle={t('Hours in screen')}
          color="success"
          icon={<FiClock className="text-xl" />}
        />
        <StatCard
          title={t('Downloaded Traffic')}
          value={formatBytes(summary?.total_consumed_bytes)}
          subtitle={t('Bandwidth consumption')}
          color="info"
          icon={<FiHardDrive className="text-xl" />}
        />
        <StatCard
          title={t('Watched Channels')}
          value={summary?.unique_channels || 0}
          subtitle={t('Different channels played')}
          color="warning"
          icon={<FiTv className="text-xl" />}
        />
        <StatCard
          title={t('Active Users')}
          value={summary?.unique_users || 0}
          subtitle={t('Registered viewers')}
          color="primary"
          icon={<FiUsers className="text-xl" />}
        />
      </div>

      {/* Selector de Tipo de Gráfico */}
      <div className="flex flex-wrap gap-2 border-b border-stroke dark:border-strokedark pb-2">
        <button
          onClick={() => setChartType('timeline')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            chartType === 'timeline'
              ? 'bg-primary text-white shadow-sm'
              : 'text-body hover:bg-gray-100 dark:text-bodydark dark:hover:bg-meta-4'
          }`}
        >
          <FiTrendingUp className="text-sm" />
          {t('Daily Evolution')}
        </button>
        <button
          onClick={() => setChartType('channels')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            chartType === 'channels'
              ? 'bg-primary text-white shadow-sm'
              : 'text-body hover:bg-gray-100 dark:text-bodydark dark:hover:bg-meta-4'
          }`}
        >
          <FiTv className="text-sm" />
          {t('Top channels')}
        </button>
        <button
          onClick={() => setChartType('clients')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            chartType === 'clients'
              ? 'bg-primary text-white shadow-sm'
              : 'text-body hover:bg-gray-100 dark:text-bodydark dark:hover:bg-meta-4'
          }`}
        >
          <FiPieChart className="text-sm" />
          {t('Top clients')}
        </button>
        <button
          onClick={() => setChartType('hours')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            chartType === 'hours'
              ? 'bg-primary text-white shadow-sm'
              : 'text-body hover:bg-gray-100 dark:text-bodydark dark:hover:bg-meta-4'
          }`}
        >
          <FiClock className="text-sm" />
          {t('Peak Hours (24h)')}
        </button>
      </div>

      {/* Gráfico Principal Interactivo */}
      <Card
        title={
          chartType === 'timeline'
            ? 'Evolución Temporal del Consumo'
            : chartType === 'channels'
            ? 'Canales más Vistos'
            : chartType === 'clients'
            ? 'Distribución por Clientes / Reproductores'
            : 'Actividad por Hora del Día (00:00 - 23:00)'
        }
        subtitle={`Datos analizados para los últimos ${daysAgo} días`}
      >
        {loading ? (
          <div className="py-24 text-center text-body dark:text-bodydark">
            <FiRefreshCw className="inline-block animate-spin text-2xl mb-2 text-primary" />
            <div className="text-xs">{t('Loading...')}</div>
          </div>
        ) : (
          <div className="pt-2">
            {chartType === 'timeline' && (
              <ReactApexChart
                options={timelineChartOptions}
                series={timelineSeries}
                type="area"
                height={320}
              />
            )}
            {chartType === 'channels' && (
              <ReactApexChart
                options={channelsChartOptions}
                series={channelsSeries}
                type="bar"
                height={320}
              />
            )}
            {chartType === 'clients' && (
              <ReactApexChart
                options={clientsChartOptions}
                series={clientsSeries}
                type="donut"
                height={320}
              />
            )}
            {chartType === 'hours' && (
              <ReactApexChart
                options={hoursChartOptions}
                series={hoursSeries}
                type="bar"
                height={320}
              />
            )}
          </div>
        )}
      </Card>

      {/* Paneles Inferiores: Top Usuarios y Últimas Reproducciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Usuarios */}
        <Card title={t('Top users')} subtitle="Usuarios con mayor actividad acumulada">
          {loading ? (
            <div className="py-8 text-center text-xs text-body">Cargando...</div>
          ) : data?.topUsers && data.topUsers.length > 0 ? (
            <ul className="divide-y divide-stroke dark:divide-strokedark">
              {data.topUsers.slice(0, 8).map((user, idx) => (
                <li key={user.username + idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate max-w-[200px]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-black dark:text-white truncate">
                      {user.username}
                    </span>
                  </div>
                  <span className="font-mono text-body dark:text-bodydark">
                    {metricType === 'time'
                      ? formatSeconds(user.total_time_seconds)
                      : `${user.count} reproducciones`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-xs text-body">{t('No data available')}</p>
          )}
        </Card>

        {/* Últimas Reproducciones Registradas */}
        <Card title={t('Last reproductions')} subtitle="Historial reciente de emisiones">
          {loading ? (
            <div className="py-8 text-center text-xs text-body">Cargando...</div>
          ) : data?.lastReproductions && data.lastReproductions.length > 0 ? (
            <ul className="divide-y divide-stroke dark:divide-strokedark">
              {data.lastReproductions.slice(0, 8).map((item, idx) => (
                <li key={item.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[220px]">
                    <div className="font-semibold text-black dark:text-white truncate">
                      {item.channel || 'Canal desconocido'}
                    </div>
                    <div className="text-[11px] text-body dark:text-bodydark flex items-center gap-2">
                      <span>{item.username || 'No user'}</span>
                      <span>•</span>
                      <span>{item.client || 'N/A'}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-body dark:text-bodydark whitespace-nowrap">
                    {item.start ? new Date(item.start).toLocaleDateString() : '-'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-xs text-body">{t('No data available')}</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Statistics;

