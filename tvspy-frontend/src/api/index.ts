import apiClient from './client';
import {
  ConfigEntry,
  RegistryItem,
  PaginatedResult,
  ChannelItem,
  UserItem,
  StatisticsData,
} from '../types';

export const configApi = {
  getAll: async (): Promise<ConfigEntry[]> => {
    const res = await apiClient.get<ConfigEntry[]>('/config');
    return res.data;
  },

  getAsMap: async (): Promise<Record<string, string>> => {
    const entries = await configApi.getAll();
    const map: Record<string, string> = {};
    entries.forEach((e) => {
      map[e.name] = e.value;
    });
    return map;
  },

  getMultiple: async (names: string[]): Promise<ConfigEntry[]> => {
    const res = await apiClient.post<ConfigEntry[]>('/config/multiple', { names });
    return res.data;
  },

  update: async (name: string, value: string): Promise<void> => {
    await apiClient.put(`/config/${name}`, { value });
  },

  updateBulk: async (settings: Record<string, any>): Promise<void> => {
    await apiClient.put('/config/bulk', settings);
  },

  testTvheadend: async (credentials?: any): Promise<{ success: boolean; serverInfo?: any }> => {
    const res = await apiClient.post('/config/test-tvheadend', credentials || {});
    return res.data;
  },

  testTelegram: async (data?: { botToken?: string; chatId?: string }): Promise<any> => {
    const res = await apiClient.post('/config/test-telegram', data || {});
    return res.data;
  },

  testWebhook: async (data?: { webhookUrl?: string; webhookType?: string }): Promise<any> => {
    const res = await apiClient.post('/config/test-webhook', data || {});
    return res.data;
  },

  getPinStatus: async (): Promise<{ enabled: boolean }> => {
    const res = await apiClient.get('/config/pin-status');
    return res.data;
  },

  verifyPin: async (pin: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    const res = await apiClient.post('/config/verify-pin', { pin });
    return res.data;
  },
};

export const registriesApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    channel?: string;
    username?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResult<RegistryItem>> => {
    const res = await apiClient.get<PaginatedResult<RegistryItem>>('/registries', { params });
    return res.data;
  },

  getUserSummary: async (username: string): Promise<any> => {
    const res = await apiClient.get(`/registries/user/${encodeURIComponent(username)}/summary`);
    return res.data;
  },

  getAllRaw: async (): Promise<RegistryItem[]> => {
    const res = await apiClient.get<RegistryItem[]>('/registries', { params: { raw: 'true' } });
    return res.data;
  },

  getById: async (id: number): Promise<RegistryItem> => {
    const res = await apiClient.get<RegistryItem>(`/registries/${id}`);
    return res.data;
  },
};

export const statisticsApi = {
  getGeneral: async (params?: {
    type?: 'time' | 'uses';
    daysAgo?: number;
    limit?: number;
  }): Promise<StatisticsData> => {
    const res = await apiClient.get<StatisticsData>('/statistics/general', { params });
    return res.data;
  },
};

export const tvheadendApi = {
  getChannels: async (name?: string): Promise<{ entries: ChannelItem[]; totalCount: number }> => {
    const res = await apiClient.get('/channel', { params: { name } });
    return res.data;
  },

  getUsers: async (): Promise<{ entries: UserItem[]; totalCount: number }> => {
    const res = await apiClient.get('/users');
    return res.data;
  },

  getStatus: async (): Promise<{
    status: string;
    error: string | null;
    activeCount: number;
    totalBandwidth: number;
    totalConsumed: number;
  }> => {
    const res = await apiClient.get('/tvheadend/status');
    return res.data;
  },

  cancelSubscription: async (id: number): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post('/subscriptions/cancel', { id });
    return res.data;
  },
};

export const systemApi = {
  getDbInfo: async (): Promise<{ sizeBytes: number; totalRegistries: number; dbPath: string }> => {
    const res = await apiClient.get('/system/db-info');
    return res.data;
  },

  purgeOldRecords: async (days: number): Promise<{ message: string; deletedCount: number }> => {
    const res = await apiClient.post('/system/purge', { days });
    return res.data;
  },

  getGeoIp: async (ip: string): Promise<{
    ip: string;
    isLocal: boolean;
    country: string;
    countryCode: string;
    city: string;
    flag: string;
    isp: string;
  }> => {
    const res = await apiClient.get(`/system/geoip/${encodeURIComponent(ip)}`);
    return res.data;
  },

  checkUpdate: async (force?: boolean): Promise<import('../types').UpdateCheckResult> => {
    const res = await apiClient.get('/system/check-update', {
      params: force ? { force: true } : undefined,
    });
    return res.data;
  },
};

export const docsApi = {
  getDoc: async (type: 'changelog' | 'readme', lang = 'es'): Promise<{ filename: string; content: string }> => {
    const res = await apiClient.get<{ filename: string; content: string }>(`/docs/${type}`, {
      params: { lang },
    });
    return res.data;
  },
};

