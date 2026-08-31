import api from './api';

export const checkinService = {
  verifyQR: async (token, eventId = null) => {
    return await api.post('/qr/verify', { token, eventId });
  },
  processCheckIn: async (data) => {
    return await api.post('/check-in', data);
  },
  getCheckInHistory: async (params = {}) => {
    return await api.get('/check-in/history', { params });
  }
};
