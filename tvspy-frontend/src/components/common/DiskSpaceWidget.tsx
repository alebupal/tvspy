import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tvheadendApi } from '../../api';
import { DiskSpaceInfo } from '../../types';
import { formatBytes } from '../../utils/formatters';
import { FiHardDrive, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

interface DiskSpaceWidgetProps {
  onOpenDvrModal?: () => void;
  upcomingCount?: number;
}

export const DiskSpaceWidget: React.FC<DiskSpaceWidgetProps> = ({ onOpenDvrModal, upcomingCount = 0 }) => {
  const { t } = useTranslation();
  const [disk, setDisk] = useState<DiskSpaceInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDiskSpace = async () => {
    setLoading(true);
    try {
      const data = await tvheadendApi.getDiskSpace();
      if (data && data.total > 0) {
        setDisk(data);
      }
    } catch {
      // Si el TVHeadend no soporta diskspace o falla, se oculta silenciosamente
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiskSpace();
    const interval = setInterval(fetchDiskSpace, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!disk || disk.total === 0) return null;

  const barColor = disk.isLowSpace
    ? 'bg-rose-500'
    : disk.usedPercentage > 80
    ? 'bg-amber-500'
    : 'bg-primary';

  return (
    <div className="rounded-xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              disk.isLowSpace
                ? 'bg-rose-500/10 text-rose-500'
                : 'bg-primary/10 text-primary dark:text-secondary'
            }`}
          >
            <FiHardDrive className="text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-black dark:text-white">
                {t('TVHeadend Storage') || 'Almacenamiento TVHeadend'}
              </h4>
              {disk.isLowSpace && (
                <span className="flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <FiAlertTriangle className="text-xs" />
                  {t('Low disk space') || 'Espacio bajo'}
                </span>
              )}
            </div>
            <p className="text-xs text-body dark:text-bodydark">
              {formatBytes(disk.used)} {t('used of') || 'usados de'} {formatBytes(disk.total)} ({disk.usedPercentage}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {onOpenDvrModal && (
            <button
              onClick={onOpenDvrModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold hover:bg-purple-500/20 transition border border-purple-500/20"
            >
              <FiHardDrive className="text-xs" />
              <span>{t('Upcoming recordings') || 'Grabaciones'}</span>
              {upcomingCount > 0 && (
                <span className="rounded-full bg-purple-600 text-white px-1.5 py-0.2 text-[10px] font-bold">
                  {upcomingCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={fetchDiskSpace}
            disabled={loading}
            title={t('Refresh')}
            className="p-1.5 rounded-lg text-body hover:bg-gray-100 hover:text-black dark:text-bodydark dark:hover:bg-meta-4 dark:hover:text-white transition disabled:opacity-50"
          >
            <FiRefreshCw className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-100 dark:bg-meta-4 rounded-full h-2 overflow-hidden mb-2">
        <div
          className={`${barColor} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(1, disk.usedPercentage))}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-body dark:text-bodydark">
        <span>{formatBytes(disk.free)} {t('available') || 'disponibles'}</span>
        <span className="font-medium">{disk.freePercentage}% {t('free') || 'libre'}</span>
      </div>
    </div>
  );
};

export default DiskSpaceWidget;

