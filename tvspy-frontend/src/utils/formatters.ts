import { useTranslation } from 'react-i18next';

export const useFormatter = () => {
    const { t } = useTranslation();

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 2; // Decimales
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).replace(',', ''); // Quitar la coma entre la fecha y la hora
    };

    const formatTime = (seconds: number): string => {
        if (seconds < 0) return t('0 seconds');

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        const parts: string[] = [];

        if (hours > 0) {
            parts.push(`${hours} ${t(hours === 1 ? 'hour' : 'hours')}`);
        }
        if (minutes > 0) {
            parts.push(`${minutes} ${t(minutes === 1 ? 'minute' : 'minutes')}`);
        }
        if (secs > 0 || parts.length === 0) {
            parts.push(`${secs} ${t(secs === 1 ? 'second' : 'seconds')}`);
        }

        return parts.join(', ');
    };

    return {
        formatBytes,
        formatDate,
        formatTime,
    };
};
