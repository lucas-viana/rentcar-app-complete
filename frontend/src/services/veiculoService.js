import api from './api';

export const veiculoService = {
  async listar() {
    const { data } = await api.get('/veiculos');
    return data;
  },

  async listarDisponiveis(dataRetirada, dataEntrega) {
    const params = {};
    if (dataRetirada && dataEntrega) {
      params.data_retirada = dataRetirada;
      params.data_entrega = dataEntrega;
    }
    const { data } = await api.get('/veiculos/disponiveis', { params });
    return data;
  },

  async buscarPorId(id) {
    const { data } = await api.get(`/veiculos/${id}`);
    return data;
  },

  async criar(dados) {
    const { data } = await api.post('/veiculos', dados);
    return data;
  },

  async atualizar(id, dados) {
    const { data } = await api.put(`/veiculos/${id}`, dados);
    return data;
  },

  async deletar(id) {
    await api.delete(`/veiculos/${id}`);
  },
};
