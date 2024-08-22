const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3001/api`;

console.log(API_BASE_URL);
export const API_ENDPOINTS = {
  CHANNEL:         `${API_BASE_URL}/channels`,
  REGISTRY:        `${API_BASE_URL}/registries`,
  USER:            `${API_BASE_URL}/users`,
  CONFIG:          `${API_BASE_URL}/config`,
  CONFIG_LANGUAJE: `${API_BASE_URL}/config/languaje`,
  STATISTICS:      `${API_BASE_URL}/statistics`
};
