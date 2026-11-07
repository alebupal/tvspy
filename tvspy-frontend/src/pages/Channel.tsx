import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { tvheadendApi } from '../api';
import { ChannelItem } from '../types';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ChannelProfileModal from '../components/common/ChannelProfileModal';
import imgNotFound from '../images/notfound.png';
import {
  FiSearch,
  FiTv,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiList,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

const Channel: React.FC = () => {
  const { t } = useTranslation();

  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<ChannelItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('tvspy_channel_view') as 'grid' | 'list') || 'grid';
  });
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(viewMode === 'grid' ? 24 : 20);

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    setLimit(mode === 'grid' ? 24 : 20);
    setPage(1);
    localStorage.setItem('tvspy_channel_view', mode);
  };

  const fetchChannels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tvheadendApi.getChannels();
      setChannels(data?.entries || []);
    } catch (err: any) {
      setError(err?.message || 'Error al obtener la lista de canales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  // Filtrado en memoria
  const filteredChannels = useMemo(() => {
    if (!search.trim()) return channels;
    const q = search.toLowerCase();
    return channels.filter((c) => c.name?.toLowerCase().includes(q));
  }, [channels, search]);

  const totalPages = Math.ceil(filteredChannels.length / limit) || 1;
  const paginatedChannels = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredChannels.slice(start, start + limit);
  }, [filteredChannels, page, limit]);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
            <FiTv className="text-primary" />
            {t('Channels')}
          </h2>
          <p className="text-xs text-body dark:text-bodydark mt-0.5">
            {t('Channels configured in your TVHeadend server')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de tipo de vista: Grid vs List */}
          <div className="inline-flex rounded-lg border border-stroke bg-gray-100 p-1 dark:border-strokedark dark:bg-meta-4">
            <button
              onClick={() => handleViewChange('grid')}
              title={t('Grid view')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                viewMode === 'grid'
                  ? 'bg-white text-primary shadow-sm dark:bg-boxdark dark:text-secondary'
                  : 'text-body hover:text-black dark:text-bodydark dark:hover:text-white'
              }`}
            >
              <FiGrid className="text-sm" />
              <span className="hidden sm:inline">{t('Grid')}</span>
            </button>
            <button
              onClick={() => handleViewChange('list')}
              title={t('List view')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-sm dark:bg-boxdark dark:text-secondary'
                  : 'text-body hover:text-black dark:text-bodydark dark:hover:text-white'
              }`}
            >
              <FiList className="text-sm" />
              <span className="hidden sm:inline">{t('List')}</span>
            </button>
          </div>

          <button
            onClick={fetchChannels}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stroke bg-white text-xs font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4 transition shadow-sm w-fit"
          >
            <FiRefreshCw className={`text-xs ${loading ? 'animate-spin' : ''}`} />
            {t('Refresh')}
          </button>
        </div>
      </div>

      {/* Controles y Visualización */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body dark:text-bodydark" />
            <input
              type="text"
              placeholder={t('Filter channels...')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-stroke bg-transparent pl-9 pr-4 py-2 text-xs text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          </div>

          <div className="text-xs text-body dark:text-bodydark font-medium">
            {t('Total')}: <b>{filteredChannels.length}</b> {t('Channels').toLowerCase()}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-body dark:text-bodydark">
            <FiRefreshCw className="inline-block animate-spin text-2xl mb-2 text-primary" />
            <div className="text-sm">{t('Loading...')}</div>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-danger text-sm">
            {t('Error')}: {error}
          </div>
        ) : paginatedChannels.length === 0 ? (
          <div className="py-16 text-center text-body dark:text-bodydark text-sm">
            {t('No data available')}
          </div>
        ) : viewMode === 'grid' ? (
          /* VISTA 1: CUADRÍCULA (GRID) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paginatedChannels.map((channel, idx) => (
              <div
                key={channel.uuid || idx}
                onClick={() => setSelectedChannel(channel)}
                className="group flex flex-col items-center text-center p-4 rounded-xl border border-stroke bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-primary/50 transition-all duration-200 dark:border-strokedark dark:bg-meta-4/20 dark:hover:bg-boxdark cursor-pointer"
              >
                <div className="h-16 w-16 mb-3 flex items-center justify-center p-1 bg-white rounded-lg shadow-sm border border-stroke/60 dark:border-strokedark/60 dark:bg-meta-4 group-hover:scale-105 transition-transform">
                  <img
                    src={channel.icon_public_url || channel.icon || imgNotFound}
                    alt={channel.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = imgNotFound;
                    }}
                  />
                </div>
                <h4 className="text-xs font-semibold text-black dark:text-white line-clamp-2 group-hover:text-primary transition">
                  {channel.name}
                </h4>
                {channel.number !== undefined && channel.number > 0 && (
                  <span className="mt-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-gray-200 text-black dark:bg-meta-4 dark:text-bodydark">
                    CH {channel.number}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* VISTA 2: LISTA / TABLA COMPACTA DETALLADA */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stroke bg-gray-50/70 dark:border-strokedark dark:bg-meta-4/30">
                  <th className="py-3 px-3 font-semibold text-black dark:text-white w-16">CH #</th>
                  <th className="py-3 px-3 font-semibold text-black dark:text-white w-20">{t('Logo')}</th>
                  <th className="py-3 px-3 font-semibold text-black dark:text-white">{t('Name')}</th>
                  <th className="py-3 px-3 font-semibold text-black dark:text-white">{t('Status')}</th>
                  <th className="py-3 px-3 font-semibold text-black dark:text-white">{t('Services')}</th>
                  <th className="py-3 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {paginatedChannels.map((channel, idx) => (
                  <tr
                    key={channel.uuid || idx}
                    onClick={() => setSelectedChannel(channel)}
                    className="hover:bg-gray-50/70 dark:hover:bg-meta-4/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-primary dark:text-secondary">
                      {channel.number !== undefined && channel.number > 0 ? channel.number : '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="h-9 w-12 flex items-center justify-center p-0.5 bg-white rounded border border-stroke dark:border-strokedark dark:bg-meta-4 group-hover:scale-105 transition-transform">
                        <img
                          src={channel.icon_public_url || channel.icon || imgNotFound}
                          alt={channel.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = imgNotFound;
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-black dark:text-white group-hover:text-primary transition">
                      {channel.name}
                    </td>
                    <td className="py-2.5 px-3">
                      {channel.enabled !== false ? (
                        <Badge variant="success">
                          <FiCheckCircle className="text-xs flex-shrink-0" />
                          <span>{t('Enabled')}</span>
                        </Badge>
                      ) : (
                        <Badge variant="default">
                          <FiXCircle className="text-xs flex-shrink-0" />
                          <span>{t('Disabled')}</span>
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-body dark:text-bodydark font-mono text-[11px]">
                      {channel.services && channel.services.length > 0
                        ? `${channel.services.length} servicio(s)`
                        : 'Default'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <FiChevronRight className="text-body dark:text-bodydark group-hover:text-primary group-hover:translate-x-0.5 transition" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-stroke dark:border-strokedark text-xs text-body dark:text-bodydark">
            <div>
              Página <b>{page}</b> de <b>{totalPages}</b>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-stroke px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-strokedark dark:hover:bg-meta-4 transition"
              >
                <FiChevronLeft /> Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 rounded-lg border border-stroke px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-strokedark dark:hover:bg-meta-4 transition"
              >
                Siguiente <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de Estadísticas del Canal */}
      {selectedChannel && (
        <ChannelProfileModal
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
        />
      )}
    </div>
  );
};

export default Channel;
