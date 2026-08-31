import api from './api';

export const guestService = {
  getGuests: async (params = {}) => {
    return await api.get('/guests', { params });
  },
  getGuestById: async (id) => {
    return await api.get(`/guests/${id}`);
  },
  createGuest: async (data) => {
    return await api.post('/guests', data);
  },
  updateGuest: async (id, data) => {
    return await api.put(`/guests/${id}`, data);
  },
  deleteGuest: async (id) => {
    return await api.delete(`/guests/${id}`);
  }
};
