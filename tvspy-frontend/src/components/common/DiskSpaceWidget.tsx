import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tvheadendApi } from '../../api';
import { DiskSpaceInfo } from '../../types';
import { formatBytes } from '../../utils/formatters';
import { FiHardDrive, FiAlertTriangle, FiRefreshCw, FiInfo } from 'react-icons/fi';

interface DiskSpaceWidgetProps {
  onOpenDvrModal?: () => void;
  upcomingCount?: number;
}

export const DiskSpaceWidget: React.FC<DiskSpaceWidgetProps> = ({ onOpenDvrModal, upcomingCount = 0 }) => {
  const { t } = useTranslation();
  const [disk, setDisk] = useState<DiskSpaceInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const fetchDiskSpace = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const data = await tvheadendApi.getDiskSpace();
      if (data) {
        setDisk(data);
      }
    } catch {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiskSpace();
    const interval = setInterval(fetchDiskSpace, 60000);
    return () => clearInterval(interval);
  }, []);

  const hasStorageData = disk && disk.total > 0;

  const barColor = disk?.isLowSpace
    ? 'bg-rose-500'
    : (disk?.usedPercentage || 0) > 80
    ? 'bg-amber-500'
    : 'bg-primary';

  return (
    <div className="rounded-xl border border-stroke bg-white px-3.5 py-2.5 shadow-xs dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
              disk?.isLowSpace
                ? 'bg-rose-500/10 text-rose-500'
                : 'bg-primary/10 text-primary dark:text-secondary'
            }`}
          >
            <FiHardDrive className="text-sm" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="font-semibold text-black dark:text-white truncate">
                  {t('TVHeadend Storage')}
                </span>
                {hasStorageData && (
                  <span className="text-body dark:text-bodydark font-normal">
                    {formatBytes(disk.used)} / {formatBytes(disk.total)} ({disk.usedPercentage}%)
                  </span>
                )}
                {disk?.isLowSpace && (
                  <span className="flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.2 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    <FiAlertTriangle className="text-xs" />
                    {t('Low disk space')}
                  </span>
                )}
              </div>

              {hasStorageData && (
                <div className="text-[11px] text-body dark:text-bodydark shrink-0">
                  <span>{formatBytes(disk.free)} {t('available')}</span>
                  {disk.usedByTvh !== undefined && (
                    <span className="opacity-75 ml-1.5 hidden md:inline">
                      • {t('DVR usage')}: {formatBytes(disk.usedByTvh)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {hasStorageData ? (
              <div className="w-full bg-gray-100 dark:bg-meta-4 rounded-full h-1.5 overflow-hidden mt-1.5">
                <div
                  className={`${barColor} h-1.5 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(1, disk.usedPercentage))}%` }}
                />
              </div>
            ) : (
              <p className="text-[11px] text-body dark:text-bodydark mt-0.5">
                {loading
                  ? t('Checking storage...')
                  : hasError
                  ? t('Could not query TVHeadend disk space API')
                  : t('No storage paths reported by TVHeadend')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          {onOpenDvrModal && (
            <button
              onClick={onOpenDvrModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold hover:bg-purple-500/20 transition border border-purple-500/20"
            >
              <FiHardDrive className="text-xs" />
              <span>{t('Upcoming recordings')}</span>
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
            className="p-1 rounded-lg text-body hover:bg-gray-100 hover:text-black dark:text-bodydark dark:hover:bg-meta-4 dark:hover:text-white transition disabled:opacity-50"
          >
            <FiRefreshCw className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiskSpaceWidget;

