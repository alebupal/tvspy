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
  FiX,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';

type ChannelSortField = 'number' | 'name' | 'tags' | 'network' | 'enabled';
type SortDirection = 'asc' | 'desc';

const isRawUuid = (str?: string): boolean => {
  if (!str) return true;
  const clean = str.replace(/[-_]/g, '');
  return clean.length >= 20 && /^[0-9a-fA-F]+$/.test(clean);
};

const Channel: React.FC = () => {
  const { t } = useTranslation();

  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
  const [sortField, setSortField] = useState<ChannelSortField>('number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
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

  // Listas de categorías (tags) y redes disponibles
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((c) => {
      (c.tags_names || []).forEach((t) => {
        if (t && t.trim() && !t.startsWith('·')) set.add(t.trim());
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [channels]);

  const availableNetworks = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((c) => {
      (c.networks || []).forEach((n) => {
        if (n && n.trim()) set.add(n.trim());
      });
      if (c.network_name && c.network_name.trim()) {
        c.network_name.split(',').forEach((n) => {
          const trimmed = n.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [channels]);

  // Manejador de ordenación por columna
  const handleSort = (field: ChannelSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: ChannelSortField) => {
    if (sortField !== field) {
      return <FiArrowDown className="inline-block ml-1 opacity-25 text-[10px]" />;
    }
    return sortDirection === 'asc' ? (
      <FiArrowUp className="inline-block ml-1 text-primary dark:text-secondary text-xs" />
    ) : (
      <FiArrowDown className="inline-block ml-1 text-primary dark:text-secondary text-xs" />
    );
  };

  // Filtrado en memoria
  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      // 1. Búsqueda por texto (nombre, número, categorías, red o servicios)
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesNumber = String(c.number || '').includes(q);
        const matchesTags = (c.tags_names || []).some((t) => t.toLowerCase().includes(q));
        const matchesNetwork =
          (c.networks || []).some((n) => n.toLowerCase().includes(q)) ||
          c.network_name?.toLowerCase().includes(q);
        const matchesServices = (c.services_details || []).some((s) =>
          s.name?.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesNumber && !matchesTags && !matchesNetwork && !matchesServices) {
          return false;
        }
      }

      // 2. Filtro por categoría seleccionada
      if (selectedTag !== 'all') {
        const hasTag = (c.tags_names || []).includes(selectedTag);
        if (!hasTag) return false;
      }

      // 3. Filtro por red seleccionada
      if (selectedNetwork !== 'all') {
        const inNetworks = (c.networks || []).includes(selectedNetwork);
        const inNetworkName = c.network_name?.includes(selectedNetwork);
        const inServices = (c.services_details || []).some(
          (s) => s.network === selectedNetwork || s.name === selectedNetwork
        );
        if (!inNetworks && !inNetworkName && !inServices) return false;
      }

      return true;
    });
  }, [channels, search, selectedTag, selectedNetwork]);

  // Ordenación de la lista filtrada
  const sortedChannels = useMemo(() => {
    const list = [...filteredChannels];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'number': {
          const numA = a.number !== undefined && a.number > 0 ? a.number : 999999;
          const numB = b.number !== undefined && b.number > 0 ? b.number : 999999;
          comparison = numA - numB;
          if (comparison === 0) {
            comparison = (a.name || '').localeCompare(b.name || '');
          }
          break;
        }
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'tags': {
          const tagA = (a.tags_names || []).join(', ');
          const tagB = (b.tags_names || []).join(', ');
          comparison = tagA.localeCompare(tagB);
          break;
        }
        case 'network': {
          const netA = a.network_name || (a.networks || []).join(', ');
          const netB = b.network_name || (b.networks || []).join(', ');
          comparison = netA.localeCompare(netB);
          break;
        }
        case 'enabled': {
          const enA = a.enabled !== false ? 1 : 0;
          const enB = b.enabled !== false ? 1 : 0;
          comparison = enB - enA;
          break;
        }
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredChannels, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedChannels.length / limit) || 1;
  const paginatedChannels = useMemo(() => {
    const start = (page - 1) * limit;
    return sortedChannels.slice(start, start + limit);
  }, [sortedChannels, page, limit]);

  const isFiltered = search.trim() !== '' || selectedTag !== 'all' || selectedNetwork !== 'all';

  // Renderizadores auxiliares legibles para Red y Servicio
  const renderNetworkCell = (channel: ChannelItem) => {
    if (channel.network_name && channel.network_name.trim()) {
      return (
        <div className="font-semibold text-black dark:text-white flex items-center gap-1.5">
          <span className="text-primary dark:text-secondary text-xs">📡</span>
          <span>{channel.network_name}</span>
        </div>
      );
    }
    return (
      <div className="font-medium text-body dark:text-bodydark flex items-center gap-1.5">
        <span className="opacity-60 text-xs">📺</span>
        <span>TVHeadend</span>
      </div>
    );
  };

  const renderServiceCell = (channel: ChannelItem) => {
    const readableNames = (channel.services_details || [])
      .map((s) => s.name)
      .filter((n) => n && n.trim() && !isRawUuid(n));

    if (readableNames.length > 0) {
      return (
        <div className="text-[10px] text-body dark:text-bodydark truncate max-w-xs" title={readableNames.join(', ')}>
          {readableNames.join(', ')}
        </div>
      );
    }

    const count = channel.services_details?.length || channel.services?.length || 0;
    if (count > 0) {
      return (
        <div className="text-[10px] text-body/80 dark:text-bodydark/80">
          {count} {count === 1 ? t('service linked') : t('services linked')}
        </div>
      );
    }

    return (
      <div className="text-[10px] text-body/50 dark:text-bodydark/50 italic">
        {t('Default service')}
      </div>
    );
  };

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
        {/* Barra de Filtros */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Buscador de texto */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
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

            {/* Selector de Categoría / Tag */}
            {availableTags.length > 0 && (
              <div className="relative min-w-[150px]">
                <select
                  value={selectedTag}
                  onChange={(e) => {
                    setSelectedTag(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-xs text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white cursor-pointer"
                >
                  <option value="all">{t('All categories')}</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selector de Red / Servicio */}
            {availableNetworks.length > 0 && (
              <div className="relative min-w-[150px]">
                <select
                  value={selectedNetwork}
                  onChange={(e) => {
                    setSelectedNetwork(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-xs text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white cursor-pointer"
                >
                  <option value="all">{t('All networks')}</option>
                  {availableNetworks.map((net) => (
                    <option key={net} value={net}>
                      {net}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Botón limpiar filtros */}
            {isFiltered && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedTag('all');
                  setSelectedNetwork('all');
                  setPage(1);
                }}
                className="flex items-center gap-1 rounded-lg border border-stroke px-2.5 py-1.5 text-xs text-body hover:bg-gray-100 hover:text-black dark:border-strokedark dark:text-bodydark dark:hover:bg-meta-4 dark:hover:text-white transition"
                title={t('Clear filters')}
              >
                <FiX className="text-xs" />
                <span>{t('Clear filters')}</span>
              </button>
            )}
          </div>

          {/* Contador de Canales */}
          <div className="text-xs text-body dark:text-bodydark font-medium self-end md:self-center">
            {t('Total')}: <b>{sortedChannels.length}</b> {t('Channels').toLowerCase()}
            {sortedChannels.length !== channels.length && (
              <span className="opacity-75"> ({t('of')} {channels.length})</span>
            )}
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
          /* VISTA 1: CUADRÍCULA (GRID) CON DISEÑO LIMPIO SIN SOLAPAR */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paginatedChannels.map((channel, idx) => {
              const displayTags = (channel.tags_names || []).filter(
                (tag) => !tag.startsWith('·') && tag.toLowerCase() !== channel.network_name?.toLowerCase()
              );

              return (
                <div
                  key={channel.uuid || idx}
                  onClick={() => setSelectedChannel(channel)}
                  className="group flex flex-col items-center text-center p-3 rounded-xl border border-stroke bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-primary/50 transition-all duration-200 dark:border-strokedark dark:bg-meta-4/20 dark:hover:bg-boxdark cursor-pointer"
                >
                  {/* Fila superior para número de canal y estado (sin pisar el logo) */}
                  <div className="w-full flex items-center justify-between mb-1 h-5">
                    {channel.number !== undefined && channel.number > 0 ? (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:text-secondary">
                        CH {channel.number}
                      </span>
                    ) : (
                      <span className="inline-block" />
                    )}
                    {channel.enabled === false && (
                      <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 px-1 py-0.2 rounded border border-rose-500/20">
                        OFF
                      </span>
                    )}
                  </div>

                  {/* Logo del Canal */}
                  <div className="h-16 w-16 mb-2 flex items-center justify-center p-1 bg-white rounded-lg shadow-xs border border-stroke/60 dark:border-strokedark/60 dark:bg-meta-4 group-hover:scale-105 transition-transform shrink-0">
                    <img
                      src={channel.icon_public_url || channel.icon || imgNotFound}
                      alt={channel.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = imgNotFound;
                      }}
                    />
                  </div>

                  {/* Nombre de Canal */}
                  <h4
                    className="text-xs font-semibold text-black dark:text-white line-clamp-1 group-hover:text-primary transition w-full"
                    title={channel.name}
                  >
                    {channel.name}
                  </h4>

                  {/* Red o Proveedor */}
                  <p
                    className="mt-1 text-[10px] text-body dark:text-bodydark truncate max-w-full font-medium"
                    title={channel.network_name || 'TVHeadend'}
                  >
                    📡 {channel.network_name || 'TVHeadend'}
                  </p>

                  {/* Categorías / Tags */}
                  <div className="mt-1.5 flex flex-wrap justify-center gap-1 min-h-[18px]">
                    {displayTags.length > 0 ? (
                      displayTags.slice(0, 2).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded px-1.5 py-0.2 text-[9px] font-medium bg-gray-200 text-black dark:bg-meta-4 dark:text-bodydark truncate max-w-[80px]"
                          title={tag}
                        >
                          {tag}
                        </span>
                      ))
                    ) : null}
                    {displayTags.length > 2 && (
                      <span className="text-[9px] text-body dark:text-bodydark font-semibold">
                        +{displayTags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VISTA 2: LISTA / TABLA COMPACTA DETALLADA CON ORDENACIÓN */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stroke bg-gray-50/70 dark:border-strokedark dark:bg-meta-4/30">
                  <th
                    onClick={() => handleSort('number')}
                    className="py-3 px-3 font-semibold text-black dark:text-white w-20 cursor-pointer select-none hover:text-primary transition"
                  >
                    CH # {renderSortIcon('number')}
                  </th>
                  <th className="py-3 px-3 font-semibold text-black dark:text-white w-16">{t('Logo')}</th>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-3 font-semibold text-black dark:text-white cursor-pointer select-none hover:text-primary transition"
                  >
                    {t('Name')} {renderSortIcon('name')}
                  </th>
                  <th
                    onClick={() => handleSort('tags')}
                    className="py-3 px-3 font-semibold text-black dark:text-white cursor-pointer select-none hover:text-primary transition"
                  >
                    {t('Categories')} {renderSortIcon('tags')}
                  </th>
                  <th
                    onClick={() => handleSort('network')}
                    className="py-3 px-3 font-semibold text-black dark:text-white cursor-pointer select-none hover:text-primary transition"
                  >
                    {t('Network / Service')} {renderSortIcon('network')}
                  </th>
                  <th
                    onClick={() => handleSort('enabled')}
                    className="py-3 px-3 font-semibold text-black dark:text-white cursor-pointer select-none hover:text-primary transition"
                  >
                    {t('Status')} {renderSortIcon('enabled')}
                  </th>
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
                    {/* CH # */}
                    <td className="py-2.5 px-3 font-mono font-bold text-primary dark:text-secondary">
                      {channel.number !== undefined && channel.number > 0 ? channel.number : '-'}
                    </td>

                    {/* Logo */}
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

                    {/* Nombre */}
                    <td className="py-2.5 px-3 font-semibold text-black dark:text-white group-hover:text-primary transition">
                      {channel.name}
                    </td>

                    {/* Categorías / Tags */}
                    <td className="py-2.5 px-3">
                      {channel.tags_names && channel.tags_names.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {channel.tags_names
                            .filter((tag) => !tag.startsWith('·'))
                            .map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-secondary"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-body/50 dark:text-bodydark/50 italic">
                          {t('No categories')}
                        </span>
                      )}
                    </td>

                    {/* Red / Servicio Legible */}
                    <td className="py-2.5 px-3">
                      <div className="text-[11px] space-y-0.5">
                        {renderNetworkCell(channel)}
                        {renderServiceCell(channel)}
                      </div>
                    </td>

                    {/* Estado */}
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

                    {/* Flecha */}
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
