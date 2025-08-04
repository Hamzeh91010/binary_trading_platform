import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Bot Management
export const botApi = {
  getStatus: () => api.get('/api/bots/status'),
  startBot: (botId: string, script: string, workingDir?: string) => 
    api.post('/api/bots/start', { botId, script, workingDir }),
  stopBot: (botId: string) => 
    api.post('/api/bots/stop', { botId }),
};

// Signals
export const signalsApi = {
  getTodaySignals: () => api.get('/api/signals/today'),
  getAllSignals: (params?: any) => api.get('/api/signals/all', { params }),
  updateSignal: (messageId: number, data: any) => 
    api.put(`/api/signals/${messageId}`, data),
  addSignal: (data: any) => api.post('/api/signals', data),
  deleteSignal: (messageId: number) => 
    api.delete(`/api/signals/${messageId}`),
};

// Trading Results
export const resultsApi = {
  getResults: (params?: any) => api.get('/api/results', { params }),
  getStats: (params?: any) => api.get('/api/results/stats', { params }),
  exportResults: (params?: any) => 
    api.get('/api/results/export', { params, responseType: 'blob' }),
};

// Settings
export const settingsApi = {
  getBaseSettings: () => api.get('/api/settings/base'),
  updateBaseSettings: (data: any) => api.put('/api/settings/base', data),
  getTodayProfit: () => api.get('/api/settings/today-profit'),
  getTradingStatus: () => api.get('/api/settings/trading-status'),
  stopTradingBots: () => api.post('/api/settings/stop-trading'),
};

// Channels
export const channelsApi = {
  getChannels: () => api.get('/api/channels'),
  addChannel: (data: any) => api.post('/api/channels', data),
  updateChannel: (id: number, data: any) => 
    api.put(`/api/channels/${id}`, data),
  deleteChannel: (id: number) => api.delete(`/api/channels/${id}`),
};

export default api;