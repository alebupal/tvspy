import React from 'react';
import { useTranslation } from 'react-i18next';

interface CardDataLiveProps {
  user: string;
  channel: string;
  client: string;
  hostname: string;
  service: string;
  bandwidth: string;
  total_bandwidth: string;
  type: 'recording' | 'playing';
  ip_allowed: string;
}

const CardDataLive: React.FC<CardDataLiveProps> = ({
  user,
  channel,
  client,
  hostname,
  service,
  bandwidth,
  total_bandwidth,
  type,
  ip_allowed
}) => {
  const { t } = useTranslation();

  // Convertir la cadena ip_allowed en una lista de IPs
  const allowedIps = ip_allowed.split(',').map(ip => ip.trim());

  // Verificar si el hostname está en la lista de IPs permitidas
  const isHostnameAllowed = allowedIps.includes(hostname);

  // Definir el color basado en la verificación
  const hostnameColor = isHostnameAllowed ? 'text-green-700' : 'text-red-700';

  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-end justify-between">
        <div>
          <h4 className="text-title-xsm font-bold text-black dark:text-white">
            {user} {type === 'recording' ? t('is recording') : t('is playing')} {channel}
          </h4>
          <div className='mt-2'>
            <p className="text-sm font-medium"><i>{client}</i></p>
          </div>
          <div className='mt-2'>
            {hostname && (
              <p className="text-sm font-medium">
                <b>{t('Hostname')}:</b> <span className={hostnameColor}>{hostname}</span>
              </p>
            )}
            <p className="text-sm font-medium"><b>{t('Service')}:</b> {service}</p>
            <p className="text-sm font-medium"><b>{t('Bandwidth')}:</b> {bandwidth}/S</p>
            <p className="text-sm font-medium"><b>{t('Consumed')}:</b> {total_bandwidth}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDataLive;
