import api from './api';

export const relatorioService = {
  async gerenciais() {
    const { data } = await api.get('/relatorios/gerenciais');
    return data;
  },
};
