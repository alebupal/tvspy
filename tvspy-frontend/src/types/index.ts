export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface SubscriptionMessage {
  id: number;
  hostname: string;
  username: string;
  client: string;
  title: string;
  channel: string;
  service: string;
  pids?: number[];
  profile?: string;
  in: number;
  out?: number;
  total_in: number;
  start: number;
  errors?: number;
  notificationClass: 'subscriptions';
}

export interface Metrics {
  totalBandwidth: number;
  totalConsumed: number;
  count: number;
}

export interface RegistryItem {
  id: number;
  username: string;
  channel: string;
  hostname: string;
  client: string;
  service: string;
  title: string;
  errors: number;
  total_in: number;
  start: string;
  end: string | null;
  formattedStart?: string;
  formattedEnd?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ServiceDetail {
  uuid: string;
  name: string;
  network?: string;
  multiplex?: string;
}

export interface ChannelItem {
  uuid: string;
  enabled: boolean;
  name: string;
  number: number;
  icon?: string;
  icon_public_url?: string;
  services?: string[];
  tags?: string[];
  tags_names?: string[];
  services_details?: ServiceDetail[];
  networks?: string[];
  network_name?: string;
}

export interface UserItem {
  uuid: string;
  enabled: boolean;
  username: string;
  comment?: string;
  prefix?: string;
}

export interface StatisticsData {
  topChannels: { channel: string; total_time_seconds: number; count: number }[];
  topClients: { client: string | null; total_time_seconds: number; count: number }[];
  topUsers: { username: string; total_time_seconds: number; count: number }[];
  lastReproductions: RegistryItem[];
  activityByDay?: { date: string; reproductions: number; total_seconds: number; total_bandwidth: number }[];
  activityByHour?: { hour: string; count: number }[];
  summary?: {
    total_reproductions: number;
    total_duration_seconds: number;
    total_consumed_bytes: number;
    unique_channels: number;
    unique_users: number;
  };
}

export interface ConfigEntry {
  name: string;
  value: string;
}

export interface UpdateCheckResult {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  updateType: 'major' | 'minor' | 'patch' | null;
  releaseUrl: string;
  releaseName?: string;
  releaseNotes?: string;
  publishedAt?: string | null;
  checkedAt: string;
  cached?: boolean;
}

export interface DiskSpaceInfo {
  total: number;
  free: number;
  used: number;
  usedByTvh?: number;
  usedPercentage: number;
  freePercentage: number;
  isLowSpace: boolean;
}

export interface CurrentEpgEvent {
  eventId?: number;
  title: string;
  subtitle?: string;
  summary?: string;
  start: number;
  stop: number;
  progress: number;
  durationMinutes: number;
  remainingMinutes: number;
  channelName: string;
}

export interface DvrEntry {
  uuid: string;
  title?: string | Record<string, string>;
  disp_title?: string;
  channelname?: string;
  start: number;
  stop: number;
  duration?: number;
  status?: string;
  sched_status?: string;
  comment?: string;
  filesize?: number;
  enabled?: boolean;
  description?: string | Record<string, string>;
  disp_description?: string;
}

