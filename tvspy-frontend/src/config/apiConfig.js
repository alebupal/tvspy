const API_BASE_URL = `${window.location.protocol}//${window.location.host}/api`;

export const API_ENDPOINTS = {
  CHANNEL:         `${API_BASE_URL}/channels`,
  REGISTRY:        `${API_BASE_URL}/registries`,
  USER:            `${API_BASE_URL}/users`,
  CONFIG:          `${API_BASE_URL}/config`,
  CONFIG_LANGUAJE: `${API_BASE_URL}/config/languaje`,
  STATISTICS:      `${API_BASE_URL}/statistics`
};
