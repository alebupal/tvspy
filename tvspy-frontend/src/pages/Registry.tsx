import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { registriesApi } from '../api';
import { RegistryItem } from '../types';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { formatBytes } from '../utils/formatters';
import {
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiTv,
  FiUser,
  FiMonitor,
} from 'react-icons/fi';

const Registry: React.FC = () => {
  const { t } = useTranslation();

  const [registries, setRegistries] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await registriesApi.list({
        page,
        limit,
        search: debouncedSearch,
      });
      setRegistries(data.items);
      setTotalPages(data.pagination.pages || 1);
      setTotalRecords(data.pagination.total || 0);
    } catch (err) {
      console.error('Error cargando registros:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Exportar a CSV
  const handleExportCSV = async () => {
    try {
      const allRows = await registriesApi.getAllRaw();
      const headers = ['ID', 'Usuario', 'Canal', 'Cliente', 'IP', 'Servicio', 'Titulo', 'Errores', 'Total Consumido', 'Inicio', 'Fin'];
      const csvRows = [
        headers.join(','),
        ...allRows.map((r) =>
          [
            r.id,
            `"${r.username || ''}"`,
            `"${r.channel || ''}"`,
            `"${r.client || ''}"`,
            `"${r.hostname || ''}"`,
            `"${r.service || ''}"`,
            `"${(r.title || '').replace(/"/g, '""')}"`,
            r.errors || 0,
            r.total_in || 0,
            `"${r.start || ''}"`,
            `"${r.end || ''}"`,
          ].join(',')
        ),
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `tvspy_registros_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error al exportar CSV:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black dark:text-white">
            {t('Registry')}
          </h2>
          <p className="text-xs text-body dark:text-bodydark mt-0.5">
            {t('Detailed history of all playbacks and recordings')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stroke bg-white text-xs font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4 transition shadow-sm"
          >
            <FiRefreshCw className={`text-xs ${loading ? 'animate-spin' : ''}`} />
            {t('Refresh')}
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-xs font-semibold text-white hover:bg-primary/90 transition shadow-sm"
          >
            <FiDownload className="text-xs" />
            {t('Export CSV')}
          </button>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body dark:text-bodydark" />
            <input
              type="text"
              placeholder={t('Filter by channel, user, client, IP...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent pl-9 pr-4 py-2 text-xs text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-body dark:text-bodydark">
            <span>{t('Rows per page')}:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              aria-label={t('Rows per page')}
              className="rounded border border-stroke bg-transparent px-2 py-1 outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Tabla Nativa Tailwind */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stroke bg-gray-50/70 dark:border-strokedark dark:bg-meta-4/30">
                <th className="py-3 px-3 font-semibold text-black dark:text-white">Estado</th>
                <th className="py-3 px-3 font-semibold text-black dark:text-white">{t('Username')}</th>
                <th className="py-3 px-3 font-semibold text-black dark:text-white">{t('Channel')}</th>
                <th className="py-3 px-3 font-semibold text-black dark:text-white">{t('Client')}</th>
                <th className="py-3 px-3 font-semibold text-black dark:text-white">{t('Hostname')}</th>
                <th className="py-3 px-3 font-semibold text-black dark:text-white">{t('Total in')}</th>
                <th className="py-3 px-3 font-semibold text-black dark:text-white">{t('Start')}</th>
                <th className="py-3 px-3 font-semibold text-black dark:text-white">{t('End')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-body dark:text-bodydark">
                    <FiRefreshCw className="inline-block animate-spin text-lg mb-2" />
                    <div>{t('Loading...')}</div>
                  </td>
                </tr>
              ) : registries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-body dark:text-bodydark">
                    {t('No data available')}
                  </td>
                </tr>
              ) : (
                registries.map((row) => {
                  const isActive = !row.end;
                  const isDvr = row.title && row.title.includes('DVR:');
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-meta-4/20 transition-colors"
                    >
                      {/* Estado */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isActive ? (
                          <Badge variant="success" pulse>
                            {isDvr ? 'DVR Activo' : 'En Vivo'}
                          </Badge>
                        ) : (
                          <Badge variant="default">Finalizado</Badge>
                        )}
                      </td>

                      {/* Usuario */}
                      <td className="py-3 px-3 font-medium text-black dark:text-white whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <FiUser className="text-body" />
                          {row.username || 'No user'}
                        </span>
                      </td>

                      {/* Canal */}
                      <td className="py-3 px-3 font-medium text-primary dark:text-secondary whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <FiTv className="text-xs" />
                          {row.channel || 'N/A'}
                        </span>
                      </td>

                      {/* Cliente */}
                      <td className="py-3 px-3 text-body dark:text-bodydark whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <FiMonitor className="text-xs" />
                          {row.client || '-'}
                        </span>
                      </td>

                      {/* Hostname / IP */}
                      <td className="py-3 px-3 font-mono text-body dark:text-bodydark whitespace-nowrap">
                        {row.hostname || '-'}
                      </td>

                      {/* Consumo */}
                      <td className="py-3 px-3 font-mono text-black dark:text-white whitespace-nowrap">
                        {formatBytes(row.total_in)}
                      </td>

                      {/* Inicio */}
                      <td className="py-3 px-3 text-body dark:text-bodydark whitespace-nowrap">
                        {row.formattedStart || row.start || '-'}
                      </td>

                      {/* Fin */}
                      <td className="py-3 px-3 text-body dark:text-bodydark whitespace-nowrap">
                        {row.formattedEnd || row.end || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-stroke dark:border-strokedark text-xs text-body dark:text-bodydark">
          <div>
            Mostrando <b>{registries.length}</b> de <b>{totalRecords}</b> registros
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 rounded-lg border border-stroke px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-strokedark dark:hover:bg-meta-4 transition"
            >
              <FiChevronLeft /> Anterior
            </button>
            <span className="px-2 font-medium text-black dark:text-white">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 rounded-lg border border-stroke px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-strokedark dark:hover:bg-meta-4 transition"
            >
              Siguiente <FiChevronRight />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Registry;
