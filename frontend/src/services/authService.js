import api from './api';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.token) {
      localStorage.setItem('shaadi_token', res.data.token);
      localStorage.setItem('shaadi_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.token) {
      localStorage.setItem('shaadi_token', res.data.token);
      localStorage.setItem('shaadi_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout request
    } finally {
      localStorage.removeItem('shaadi_token');
      localStorage.removeItem('shaadi_user');
    }
  },

  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  updatePassword: async (passwordData) => {
    return await api.put('/auth/update-password', passwordData);
  },

  getAllUsers: async () => {
    return await api.get('/auth/users');
  },

  updateUserRole: async (userId, role) => {
    return await api.put(`/auth/users/${userId}/role`, { role });
  },

  seedDemo: async () => {
    return await api.post('/seed');
  }
};
