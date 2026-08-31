import api from './api';

export const vendorService = {
  getVendors: async () => {
    return await api.get('/vendors');
  },
  createVendor: async (data) => {
    return await api.post('/vendors', data);
  },
  updateVendor: async (id, data) => {
    return await api.put(`/vendors/${id}`, data);
  },
  deleteVendor: async (id) => {
    return await api.delete(`/vendors/${id}`);
  }
};
