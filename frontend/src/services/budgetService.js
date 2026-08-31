import api from './api';

export const budgetService = {
  getBudget: async () => {
    return await api.get('/budget');
  },
  updateBudget: async (totalBudget) => {
    return await api.put('/budget', { totalBudget });
  }
};
