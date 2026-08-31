import api from './api';

export const weddingService = {
  getWedding: async () => {
    return await api.get('/wedding');
  },
  updateWedding: async (data) => {
    return await api.put('/wedding', data);
  }
};
