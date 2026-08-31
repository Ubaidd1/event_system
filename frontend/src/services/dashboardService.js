import api from './api';

export const dashboardService = {
  getStats: async (params = {}) => {
    return await api.get('/dashboard', { params });
  }
};
