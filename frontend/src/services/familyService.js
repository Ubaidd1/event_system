import api from './api';

export const familyService = {
  getFamilies: async () => {
    return await api.get('/families');
  },
  createFamily: async (data) => {
    return await api.post('/families', data);
  },
  updateFamily: async (id, data) => {
    return await api.put(`/families/${id}`, data);
  },
  deleteFamily: async (id) => {
    return await api.delete(`/families/${id}`);
  }
};
