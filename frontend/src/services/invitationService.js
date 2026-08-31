import api from './api';

export const invitationService = {
  getInvitations: async () => {
    return await api.get('/invitations');
  },
  createInvitation: async (data) => {
    return await api.post('/invitations', data);
  },
  deleteInvitation: async (id) => {
    return await api.delete(`/invitations/${id}`);
  },
  // Public Guest Facing APIs
  getPublicInvitation: async (token) => {
    return await api.get(`/invitations/public/${token}`);
  },
  submitPublicRSVP: async (token, data) => {
    return await api.post(`/invitations/public/${token}/rsvp`, data);
  }
};
