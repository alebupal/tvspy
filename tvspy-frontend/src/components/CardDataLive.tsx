import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface CardDataLiveProps {
  user: string;
  channel: string;
  device: string;
  hostname: string;
  service: string;
  bandwidth: string;
  total_bandwidth: string;
}

const CardDataLive: React.FC<CardDataLiveProps> = ({
  user,
  channel,
  device,
  hostname,
  service,
  bandwidth,
  total_bandwidth,
}) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-end justify-between">
        <div>
          <h4 className="text-title-xsm font-bold text-black dark:text-white">
            {user} {t('is playing')} {channel}
          </h4>
          <div className='mt-2'>
            <p className="text-sm font-medium"><i>{device}</i></p>
          </div>
          <div className='mt-2'>
            <p className="text-sm font-medium"><b>{t('Hostname')}:</b> {hostname}</p>
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
