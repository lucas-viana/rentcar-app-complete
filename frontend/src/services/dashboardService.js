import api from './api';

export const dashboardService = {
  async obterEstatisticas() {
    const { data } = await api.get('/dashboard');
    return data;
  },
};
