import api from './api';

export const usuarioService = {
  async listar() {
    const { data } = await api.get('/usuarios');
    return data;
  },

  async buscarPorId(id) {
    const { data } = await api.get(`/usuarios/${id}`);
    return data;
  },

  async criar(dados) {
    const { data } = await api.post('/usuarios', dados);
    return data;
  },

  async atualizar(id, dados) {
    const { data } = await api.put(`/usuarios/${id}`, dados);
    return data;
  },

  async deletar(id) {
    await api.delete(`/usuarios/${id}`);
  },
};
