import { useTranslation } from 'react-i18next';

export const formatBytes = (bytes: number | undefined | null, decimals = 2): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0) return '0 B';
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatBandwidth = (bytesPerSec: number | undefined | null): string => {
  if (!bytesPerSec || bytesPerSec === 0) return '0 KB/s';
  return `${formatBytes(bytesPerSec)}/s`;
};

export const formatSeconds = (totalSeconds: number | undefined | null): string => {
  if (!totalSeconds || totalSeconds <= 0) return '0s';
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);
  const days = Math.floor(hours / 24);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0 || seconds > 0) parts.push(`${seconds}s`);

  return parts.slice(0, 2).join(' ');
};

export const useFormatter = () => {
  const { t } = useTranslation();

  const formatTime = (totalSeconds: number): string => {
    return formatSeconds(totalSeconds);
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleString();
    } catch {
      return dateString;
    }
  };

  return {
    formatBytes,
    formatBandwidth,
    formatTime,
    formatDate,
  };
};
