import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CardDataLive from '../components/CardDataLive';
import Loader from '../common/Loader/index';
import { API_ENDPOINTS } from '../config/apiConfig';
import { useTranslation } from 'react-i18next';
import { formatBytes } from '../utils/formatters'; 

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

type MessageType = {
  messages: (SubscriptionMessage)[];
};

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<SubscriptionMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [wsServerUrl, setWsServerUrl] = useState<string>('');
  const [totalBandwidth, setTotalBandwidth] = useState<number>(0);
  const [totalConsumed, setTotalConsumed] = useState<number>(0);
  const determineType = (title: string): 'recording' | 'playing' => {
    return title.includes('DVR:') ? 'recording' : 'playing';
  };
  const [ipAllowed, setIpAllowed] = useState<string>('');

  

  useEffect(() => {
    const fetchWsServerUrl = async () => {
      try {
        const names = ['port', 'username', 'hostname', 'password'];
        const response = await axios.post(`${API_ENDPOINTS.CONFIG}/multiple`, { names });
        const config = response.data.reduce((acc, item) => {
          acc[item.name] = item.value;
          return acc;
        }, {});
        const { port, username, hostname: host, password } = config;
        const url = `ws://${username}:${password}@${host}:${port}/comet/ws`;
        setWsServerUrl(url);
      } catch (err) {
        console.error('Error al obtener la URL del WebSocket:', err);
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

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
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
  );
};

export default Home;