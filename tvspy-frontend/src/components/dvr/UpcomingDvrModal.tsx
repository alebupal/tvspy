import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tvheadendApi } from '../../api';
import { DvrEntry } from '../../types';
import { FiHardDrive, FiCalendar, FiClock, FiX, FiRefreshCw, FiCheckCircle, FiPlay } from 'react-icons/fi';
import { formatSeconds } from '../../utils/formatters';

interface UpcomingDvrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpcomingDvrModal: React.FC<UpcomingDvrModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<DvrEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDvr = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tvheadendApi.getDvrUpcoming();
      setEntries(res.entries || []);
    } catch (err: any) {
      setError(err.response?.data?.details || err.message || t('Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDvr();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTitle = (entry: DvrEntry): string => {
    if (entry.disp_title) return entry.disp_title;
    if (typeof entry.title === 'string') return entry.title;
    if (entry.title && typeof entry.title === 'object') {
      const lang = i18n.language || 'es';
      return entry.title[lang] || entry.title['default'] || Object.values(entry.title)[0] || 'Grabación';
    }
    return 'Grabación programada';
  };

  const formatScheduleTime = (startEpoch: number, stopEpoch: number) => {
    if (!startEpoch) return '-';
    const startDate = new Date(startEpoch * 1000);
    const stopDate = stopEpoch ? new Date(stopEpoch * 1000) : null;
    const now = Date.now();
    const diffSec = Math.floor((startDate.getTime() - now) / 1000);

    const dateStr = startDate.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const startTimeStr = startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const stopTimeStr = stopDate
      ? stopDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      : '';

    let relativeStr = '';
    if (diffSec < 0 && stopEpoch * 1000 > now) {
      relativeStr = t('Recording now') || 'Grabando ahora';
    } else if (diffSec > 0 && diffSec < 3600 * 24) {
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      relativeStr = hours > 0 ? `En ${hours}h ${minutes}m` : `En ${minutes}m`;
    }

    return {
      dateStr,
      timeRange: stopTimeStr ? `${startTimeStr} - ${stopTimeStr}` : startTimeStr,
      relativeStr,
      isLiveRecording: diffSec < 0 && stopEpoch * 1000 > now,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-stroke bg-white shadow-2xl dark:border-strokedark dark:bg-boxdark overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between p-5 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FiHardDrive className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black dark:text-white">
                  {t('Upcoming DVR Recordings') || 'Próximas grabaciones DVR'}
                </h3>
                <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                  {entries.length}
                </span>
              </div>
              <p className="text-xs text-body dark:text-bodydark">
                {t('Scheduled timers and automated series recordings in TVHeadend') || 'Grabaciones y temporizadores programados en TVHeadend'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDvr}
              disabled={loading}
              title={t('Refresh')}
              className="p-2 rounded-lg text-body hover:bg-gray-100 hover:text-black dark:text-bodydark dark:hover:bg-meta-4 dark:hover:text-white transition disabled:opacity-50"
            >
              <FiRefreshCw className={`text-base ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              title={t('Close') || 'Cerrar'}
              className="p-2 rounded-lg text-body hover:bg-gray-100 hover:text-black dark:text-bodydark dark:hover:bg-meta-4 dark:hover:text-white transition"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Contenido / Lista */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading && entries.length === 0 ? (
            <div className="py-16 text-center text-body dark:text-bodydark">
              <FiRefreshCw className="inline-block animate-spin text-2xl text-primary mb-2" />
              <p className="text-xs">{t('Loading...')}</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center text-body dark:text-bodydark">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-meta-4 text-body dark:text-bodydark mb-3">
                <FiHardDrive className="text-2xl" />
              </div>
              <p className="text-sm font-semibold text-black dark:text-white">
                {t('No upcoming recordings scheduled') || 'No hay grabaciones programadas'}
              </p>
              <p className="text-xs text-body dark:text-bodydark mt-1 max-w-sm mx-auto">
                {t('When a recording timer or series schedule is created in TVHeadend, it will appear here.') || 'Cuando programes un temporizador o grabación en TVHeadend aparecerá listado aquí.'}
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const timing = formatScheduleTime(entry.start, entry.stop);
              const durationSec = entry.duration || (entry.stop && entry.start ? entry.stop - entry.start : 0);
              const durationFormatted = durationSec > 0 ? formatSeconds(durationSec) : '';

              return (
                <div
                  key={entry.uuid || `${entry.start}-${entry.channelname}`}
                  className="rounded-xl border border-stroke/80 bg-gray-50/60 p-4 transition hover:bg-gray-50 dark:border-strokedark/80 dark:bg-meta-4/20 dark:hover:bg-meta-4/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-black dark:text-white truncate">
                          {getTitle(entry)}
                        </span>
                        {timing.isLiveRecording ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                            <FiPlay className="text-[10px]" />
                            {timing.relativeStr}
                          </span>
                        ) : timing.relativeStr ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {timing.relativeStr}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-body dark:text-bodydark">
                        {entry.channelname && (
                          <span className="font-medium text-black dark:text-white">
                            {entry.channelname}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FiCalendar className="text-xs" />
                          {timing.dateStr}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="text-xs" />
                          {timing.timeRange}
                        </span>
                        {durationFormatted && (
                          <span className="rounded bg-gray-200/60 dark:bg-meta-4 px-1.5 py-0.2 text-[10px]">
                            {durationFormatted}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          timing.isLiveRecording
                            ? 'bg-rose-500 text-white'
                            : entry.sched_status === 'scheduled'
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {timing.isLiveRecording ? 'Grabando' : entry.sched_status || 'Programada'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie */}
        <div className="flex items-center justify-end p-4 border-t border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-meta-4/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 text-black text-xs font-semibold hover:bg-gray-300 dark:bg-meta-4 dark:text-white dark:hover:bg-meta-4/80 transition"
          >
            {t('Close') || 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingDvrModal;

