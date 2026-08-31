import api from './api';

export const reportService = {
  getReports: async () => {
    return await api.get('/reports');
  }
};
