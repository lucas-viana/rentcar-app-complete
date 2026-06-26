import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, CheckCircle, XCircle, FileText, Calendar, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal, { ConfirmModal } from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { aluguelService } from '../../services/aluguelService';
import { formatarData, formatarMoeda, diffDias, hojeISO } from '../../utils/validators';

const PAGAMENTO_LABEL = {
  cartao_credito: 'Cartão Crédito',
  cartao_debito: 'Cartão Débito',
  pix: 'PIX',
  dinheiro: 'Dinheiro',
};

function StatusBadge({ status }) {
  const map = {
    ativo: <Badge variant="success">Ativo</Badge>,
    finalizado: <Badge variant="info">Finalizado</Badge>,
    cancelado: <Badge variant="danger">Cancelado</Badge>,
  };
  return map[status] || <Badge>{status}</Badge>;
}

export default function AlugueisPage() {
  const [alugueis, setAlugueis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [cancelar, setCancelar] = useState(null);      // aluguel a cancelar
  const [devolver, setDevolver] = useState(null);      // aluguel a finalizar (RF13)
  const [dataDev, setDataDev] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toasts, removeToast, toast } = useToast();

  async function carregar() {
    setLoading(true);
    const data = await aluguelService.listar();
    setAlugueis(data);
    setLoading(false);
  }
  useEffect(() => { carregar(); }, []);

  const filtrados = alugueis.filter((a) => {
    const q = busca.toLowerCase();
    const match = !q || a.usuario?.toLowerCase().includes(q) || a.veiculo?.toLowerCase().includes(q) || a.placa?.toLowerCase().includes(q);
    const matchStatus = filtroStatus === 'todos' || a.status === filtroStatus;
    return match && matchStatus;
  });

  function abrirDevolucao(aluguel) {
    setDevolver(aluguel);
    // sugere hoje, respeitando a data de retirada como mínimo
    const hoje = hojeISO();
    setDataDev(hoje < aluguel.data_retirada ? aluguel.data_retirada : hoje);
  }

  async function confirmarDevolucao() {
    if (!devolver) return;
    setActionLoading(true);
    try {
      await aluguelService.finalizar(devolver.id, dataDev);
      toast.success(`Locação #${devolver.id} finalizada. Veículo liberado!`);
      setDevolver(null);
      carregar();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmarCancelamento() {
    if (!cancelar) return;
    setActionLoading(true);
    try {
      await aluguelService.cancelar(cancelar.id);
      toast.success(`Locação #${cancelar.id} cancelada.`);
      setCancelar(null);
      carregar();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  // Receita contratada: locações ativas + finalizadas (mesma regra do dashboard/backend)
  const totalReceita = alugueis
    .filter((a) => a.status === 'finalizado' || a.status === 'ativo')
    .reduce((s, a) => s + (a.valor_final ?? a.valor_total ?? 0), 0);

  // Preview do recálculo na devolução (espelha a regra do backend)
  const diasPrevistos = devolver ? Math.max(1, diffDias(devolver.data_retirada, devolver.data_entrega)) : 0;
  const diaria = devolver && diasPrevistos > 0 ? (devolver.valor_total || 0) / diasPrevistos : 0;
  const diasReais = devolver && dataDev ? Math.max(1, diffDias(devolver.data_retirada, dataDev)) : 0;
  const diasAtraso = devolver && dataDev ? diffDias(devolver.data_entrega, dataDev) : 0;
  const multaPreview = diaria * diasAtraso * 0.5;
  const valorFinalPreview = diaria * diasReais + multaPreview;

  return (
    <AdminLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Cancelamento */}
      <ConfirmModal
        isOpen={Boolean(cancelar)}
        onClose={() => setCancelar(null)}
        onConfirm={confirmarCancelamento}
        loading={actionLoading}
        title="Cancelar Locação"
        message={`Confirma o cancelamento da locação #${cancelar?.id} (${cancelar?.veiculo})? Esta ação não pode ser desfeita.`}
      />

      {/* Devolução (RF13/RF14) */}
      <Modal
        isOpen={Boolean(devolver)}
        onClose={() => setDevolver(null)}
        title="Registrar Devolução"
        actions={
          <>
            <Button variant="ghost" onClick={() => setDevolver(null)} disabled={actionLoading}>Cancelar</Button>
            <Button variant="success" onClick={confirmarDevolucao} loading={actionLoading}>
              <CheckCircle size={16} /> Confirmar Devolução
            </Button>
          </>
        }
      >
        {devolver && (
          <div className="space-y-4">
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white">{devolver.veiculo} <span className="text-gray-500 font-mono text-xs">{devolver.placa}</span></p>
              <p className="text-xs text-gray-500 mt-0.5">
                Período previsto: {formatarData(devolver.data_retirada)} → {formatarData(devolver.data_entrega)}
              </p>
            </div>

            <Input
              id="data_devolucao"
              label="Data real da devolução"
              type="date"
              min={devolver.data_retirada}
              value={dataDev}
              onChange={(e) => setDataDev(e.target.value)}
            />

            <div className="p-4 rounded-xl bg-gray-800/60 border border-white/10 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Diárias utilizadas</span><span className="text-white font-medium">{diasReais} dia{diasReais !== 1 ? 's' : ''}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Valor das diárias</span><span className="text-white font-medium">{formatarMoeda(diaria * diasReais)}</span></div>
              {diasAtraso > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span className="flex items-center gap-1"><AlertTriangle size={13} /> Multa por atraso ({diasAtraso} dia{diasAtraso !== 1 ? 's' : ''})</span>
                  <span className="font-semibold">{formatarMoeda(multaPreview)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="font-semibold text-white">Valor final</span>
                <span className="text-lg font-bold text-emerald-400">{formatarMoeda(valorFinalPreview)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Locações</h1>
            <p className="text-gray-400 text-sm mt-1">
              {alugueis.filter((a) => a.status === 'ativo').length} ativas · Receita: {formatarMoeda(totalReceita)}
            </p>
          </div>
          <Link to="/alugueis/novo">
            <Button><Plus size={16} /> Nova Locação</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Buscar por cliente, veículo ou placa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-white/10 text-gray-300 text-sm focus:outline-none"
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="finalizado">Finalizados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-gray-900/50 border border-white/5 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
              <FileText size={48} className="mb-4 opacity-30" />
              <p className="font-medium">Nenhuma locação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['#', 'Cliente', 'Veículo', 'Período', 'Pagamento', 'Valor', 'Status', 'Ações'].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 font-semibold px-5 py-3.5 uppercase tracking-wider last:text-right">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtrados.map((a) => (
                    <tr key={a.id} className="hover:bg-white/3 transition-colors group">
                      <td className="px-5 py-4 text-sm text-gray-500 font-mono">#{a.id}</td>
                      <td className="px-5 py-4 text-sm font-medium text-white">{a.usuario}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-300">{a.veiculo}</p>
                        <p className="text-xs text-gray-500 font-mono">{a.placa}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {formatarData(a.data_retirada)}<br />→ {formatarData(a.data_entrega)}
                        {a.data_devolucao_real && a.data_devolucao_real !== a.data_entrega && (
                          <span className="block text-amber-400 mt-0.5">devolvido: {formatarData(a.data_devolucao_real)}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400">{PAGAMENTO_LABEL[a.forma_pagamento] || a.forma_pagamento}</td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-emerald-400">{formatarMoeda(a.valor_final ?? a.valor_total ?? 0)}</span>
                        {a.multa_atraso > 0 && (
                          <span className="block text-[11px] text-amber-400">+ multa {formatarMoeda(a.multa_atraso)}</span>
                        )}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-4 text-right">
                        {a.status === 'ativo' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => abrirDevolucao(a)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                            >
                              <Calendar size={13} /> Devolver
                            </button>
                            <button
                              onClick={() => setCancelar(a)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
                            >
                              <XCircle size={13} /> Cancelar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
