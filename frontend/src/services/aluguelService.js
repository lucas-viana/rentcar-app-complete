import api from './api';

export const aluguelService = {
  async listar() {
    const { data } = await api.get('/alugueis');
    return data;
  },

  async listarPorUsuario(usuarioId) {
    const { data } = await api.get(`/alugueis/usuario/${usuarioId}`);
    return data;
  },

  async buscarPorId(id) {
    const { data } = await api.get(`/alugueis/${id}`);
    return data;
  },

  async criar(dados) {
    const { data } = await api.post('/alugueis', dados);
    return data;
  },

  async finalizar(id, dataDevolucaoReal) {
    const { data } = await api.put(`/alugueis/${id}/finalizar`,
      dataDevolucaoReal ? { data_devolucao_real: dataDevolucaoReal } : {});
    return data;
  },

  async cancelar(id) {
    const { data } = await api.put(`/alugueis/${id}/cancelar`);
    return data;
  },
};
