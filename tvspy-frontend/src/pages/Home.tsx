import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CardDataLive from '../components/CardDataLive';
import Loader from '../common/Loader/index';
import { API_ENDPOINTS } from '../config/apiConfig';
import { useTranslation } from 'react-i18next';
import {useFormatter } from '../utils/formatters';

interface SubscriptionMessage {
  id: number;
  start: number;
  errors: number;
  state: string;
  hostname: string;
  client: string;
  title: string;
  channel: string;
  service: string;
  pids: number[];
  profile: string;
  in: number;
  out: number;
  total_in: number;
  total_out: number;
  updateEntry: number;
  notificationClass: 'subscriptions';
}

interface Registry {
  id: number;
  username: string;
  channel: string;
  start: string;
  client: string;
}

type MessageType = {
  messages: SubscriptionMessage[];
};

type Statistics = {
  topChannels: { channel: string, total_time_seconds: number, count: number }[];
  topClients: { client: string | null, total_time_seconds: number, count: number  }[];
  topUsers: { username: string, total_time_seconds: number, count: number }[];
  lastReproductions: Registry[];
};

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<SubscriptionMessage[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [wsServerUrl, setWsServerUrl] = useState<string>('');
  const [totalBandwidth, setTotalBandwidth] = useState<number>(0);
  const [totalConsumed, setTotalConsumed] = useState<number>(0);
  const [ipAllowed, setIpAllowed] = useState<string>('');
  const [type, setType] = useState<'time' | 'uses'>('time');
  const [daysAgo, setDaysAgo] = useState<number>(30);
  const { formatBytes, formatDate, formatTime } = useFormatter();

  const determineType = (title: string | undefined): 'recording' | 'playing' => {
    if (title && title.includes('DVR:')) {
      return 'recording';
    }
    return 'playing';
  };

  useEffect(() => {
    const fetchWsServerUrl = async () => {
      try {
        const names = ['port', 'username', 'hostname', 'password'];
        const response = await axios.post(`${API_ENDPOINTS.CONFIG}/multiple`, { names });
        const config = response.data.reduce((acc, item) => {
          acc[item.name] = item.value;
          return acc;
        }, {} as Record<string, string | undefined>);
  
        const { port, username, hostname, password } = config;
  
        if (port && username && hostname && password) {
          const url = `ws://${username}:${password}@${hostname}:${port}/comet/ws`;
          setWsServerUrl(url);
        } else {
          throw new Error(t('Missing one or more values required to connect with TVHeadend'));
        }
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };
  
    const fetchIpAllowed = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS.CONFIG}/ip_allowed`);
        setIpAllowed(response.data.value);
      } catch (err) {
        setError(err as Error);
      }
    };
  
    fetchWsServerUrl();
    fetchIpAllowed();
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS.STATISTICS}/general`, {
          params: { type, daysAgo }
        });
        setStatistics(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [type, daysAgo]);

  useEffect(() => {
    if (!wsServerUrl) return;

    const socket = new WebSocket(wsServerUrl, ['tvheadend-comet']);

    socket.onopen = () => {
      console.log('WebSocket - Conectado al servidor');
    };

    socket.onmessage = (event) => {
      try {
        const data: MessageType = JSON.parse(event.data);

        let subscriptionMessages: SubscriptionMessage[] = [];
        subscriptionMessages = data.messages.filter(
          (msg): msg is SubscriptionMessage => msg.notificationClass === 'subscriptions'
        );

        setMessages(subscriptionMessages.length > 0 ? subscriptionMessages : []);

        // Calcular la suma de los bandwidths
        const totalIn = subscriptionMessages.reduce((sum, msg) => sum + (msg.in || 0), 0);
        const totalTotalIn = subscriptionMessages.reduce((sum, msg) => sum + (msg.total_in || 0), 0);

        setTotalBandwidth(totalIn);
        setTotalConsumed(totalTotalIn);

        setLoading(false);
      } catch (error) {
        console.error('WebSocket - Error al analizar el mensaje:', error);
        setError(error as Error);
        setLoading(false);
      }
    };

    socket.onerror = (event) => {
      console.error('WebSocket - Error:', event);
      setError(new Error('Error en la conexión WebSocket'));
      setLoading(false);
    };

    socket.onclose = () => {
      console.log('WebSocket - Conexión cerrada');
      setLoading(false);
    };

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [wsServerUrl]);

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value as 'time' | 'uses');
  };

  const handleDaysAgoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDaysAgo(parseInt(event.target.value, 10) || 30);
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5 mb-4">
        <div className="col-span-full text-center mb-1">
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="text-red-500">
              {t('Error')} {error.message}
            </div>
          ) : (
            <>
              {totalBandwidth > 0 && totalConsumed > 0 && (
                <div>
                  <div className="text-lg"><b>{t('Total bandwidth')}:</b> {formatBytes(totalBandwidth)}/S</div>
                  <div className="text-lg"><b>{t('Total consumed')}:</b> {formatBytes(totalConsumed)}</div>
                </div>
              )}
            </>
          )}
        </div>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <CardDataLive
              key={msg.id}
              user="alebupal"
              channel={msg.channel}
              client={msg.client}
              hostname={msg.hostname}
              service={msg.service}
              bandwidth={msg.in ? formatBytes(msg.in) : 'N/A'}
              total_bandwidth={msg.total_in ? formatBytes(msg.total_in) : 'N/A'}
              type={determineType(msg.title)}
              ip_allowed={ipAllowed}
            ></CardDataLive>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            {t('No active plays')}
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-col col-span-12">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white mb-4">
          {t('Statistics')}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="type" className="block text-sm font-medium text-black dark:text-white mb-2">
              {t('Type')}
            </label>
            <select
              name="type"
              id="type"
              className="w-full appearance-none rounded border border-stroke bg-transparent py-3 px-4.5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
              value={type}
              onChange={handleTypeChange}
            >
              <option value="time" className="text-body dark:text-bodydark">
                {t('Time')}
              </option>
              <option value="uses" className="text-body dark:text-bodydark">
                {t('Use')}
              </option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="daysAgo" className="block text-sm font-medium text-black dark:text-white mb-2">
              {t('Days ago')}
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="number"
              name="daysAgo"
              id="daysAgo"
              value={daysAgo}
              onChange={handleDaysAgoChange}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        {statistics ? (
          <>
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  {t('Top channels')}
                </h3>
              </div>
              <div className="p-7">
                <ul className="space-y-2">
                  {statistics.topChannels.map((item) => (
                    <li key={item.channel} className="text-sm text-gray-300">
                      {item.channel} - {type === 'time' ? formatTime(item.total_time_seconds) : item.count + ' ' + t('reproductions')}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  {t('Top clients')}
                </h3>
              </div>
              <div className="p-7">
                <ul className="space-y-2">
                  {statistics.topClients.map((item) => (
                    <li key={item.client} className="text-sm text-gray-300">
                      {item.client} - {type === 'time' ? formatTime(item.total_time_seconds) :  item.count + ' ' + t('reproductions')}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  {t('Top users')}
                </h3>
              </div>
              <div className="p-7">
                <div className="mb-5.5">
                  <div className="h-40 overflow-y-auto">
                    <ul className="space-y-2">
                      {statistics.topUsers.map((item) => (
                        <li key={item.username} className="text-sm text-gray-300">
                          {item.username} - {type === 'time' ? formatTime(item.total_time_seconds) :  item.count + ' ' + t('reproductions')}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  {t('Last reproductions')}
                </h3>
              </div>
              <div className="p-7">
                <div className="mb-5.5">
                  <div className="h-40 overflow-y-auto">
                    <ul className="space-y-2">
                      {statistics.lastReproductions.map((item) => (
                        <li key={item.id} className="text-sm text-gray-300">
                          <p><b>{item.username}</b> - {item.channel}</p>
                          <p className='text-xs'>{item.client}</p>
                          <p className='text-xs'><i>{formatDate(item.start)}</i></p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-full text-center text-gray-500">
            {t('No statistics available')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
