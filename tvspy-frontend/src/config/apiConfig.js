const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  CHANNEL:         `${API_BASE_URL}/channel`,
  REGISTRY:        `${API_BASE_URL}/registries`,
  USER:            `${API_BASE_URL}/users`,
  CONFIG:          `${API_BASE_URL}/config`,
  CONFIG_LANGUAGE: `${API_BASE_URL}/config/language`,
  DEBUG_MODE:      `${API_BASE_URL}/config/debug_mode`,
  STATISTICS:      `${API_BASE_URL}/statistics`
};
