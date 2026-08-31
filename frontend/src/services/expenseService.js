import api from './api';

export const expenseService = {
  getExpenses: async () => {
    return await api.get('/expenses');
  },
  createExpense: async (formData) => {
    return await api.post('/expenses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateExpense: async (id, formData) => {
    return await api.put(`/expenses/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteExpense: async (id) => {
    return await api.delete(`/expenses/${id}`);
  }
};
