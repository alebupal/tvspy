import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../config/apiConfig';

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
  name: string; // Agrega el parámetro name para la búsqueda
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
  const [iconPublicUrl, setIconPublicUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false); // Estado para manejar errores de carga

  // Convertir la cadena ip_allowed en una lista de IPs
  const allowedIps = ip_allowed.split(',').map(ip => ip.trim());

  // Verificar si el hostname está en la lista de IPs permitidas
  const isHostnameAllowed = allowedIps.includes(hostname);

  // Definir el color basado en la verificación
  const hostnameColor = isHostnameAllowed ? 'text-green-700' : 'text-red-700';

  useEffect(() => {
    const fetchChannel = async () => {
        try {            
            // Obtener los datos del canal
            const response = await axios.get(API_ENDPOINTS.CHANNEL, {
              params: { name: channel } // Usar el parámetro codificado
            });
            
            // Suponiendo que response.data.entries es un array
            const channelEntries = response.data.entries;
            if (channelEntries.length > 0) {
                setIconPublicUrl(channelEntries[0].icon_public_url); // Extraer solo el primer icon_public_url
            } else {
                setIconPublicUrl(null);
            }
        } catch (err) {
            setIconPublicUrl(null); // En caso de error, establecer como null
        }
    };

    fetchChannel();
  }, [channel]); // Cambiar la dependencia a `channel`

  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-end justify-between">
        <div>
          {iconPublicUrl && !imageError && (
            <div className="flex flex-col items-center mb-4">
              <img
                src={iconPublicUrl}
                alt={channel} 
                className="w-30 max-w-xs"
                onError={() => setImageError(true)}  // Manejar el error de carga
              />
            </div>
          )}
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
