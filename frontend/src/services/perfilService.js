import api from './api';

export const perfilService = {
  async obter() {
    const { data } = await api.get('/perfil');
    return data;
  },

  async atualizar(dados) {
    const { data } = await api.put('/perfil', dados);
    return data;
  },
};
