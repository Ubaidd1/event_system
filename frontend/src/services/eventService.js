import api from './api';

export const eventService = {
  getEvents: async () => {
    return await api.get('/events');
  },
  getEventById: async (id) => {
    return await api.get(`/events/${id}`);
  },
  createEvent: async (data) => {
    return await api.post('/events', data);
  },
  updateEvent: async (id, data) => {
    return await api.put(`/events/${id}`, data);
  },
  deleteEvent: async (id) => {
    return await api.delete(`/events/${id}`);
  }
};
