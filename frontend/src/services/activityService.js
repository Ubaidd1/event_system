import api from './api';

export const activityService = {
  getActivityLogs: async (params = {}) => {
    return await api.get('/activity-logs', { params });
  }
};
