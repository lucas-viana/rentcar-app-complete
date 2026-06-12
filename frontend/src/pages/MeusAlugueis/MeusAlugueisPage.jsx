import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Car, XCircle } from 'lucide-react';
import ClienteLayout from '../../components/layout/ClienteLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { ConfirmModal } from '../../components/ui/Modal';
import { aluguelService } from '../../services/aluguelService';
import { useAuth } from '../../contexts/AuthContext';
import { formatarData, formatarMoeda } from '../../utils/validators';

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

export default function MeusAlugueisPage() {
  const [alugueis, setAlugueis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { usuario } = useAuth();
  const { toasts, removeToast, toast } = useToast();

  async function carregar() {
    try {
      const data = await aluguelService.listarPorUsuario(usuario?.id);
      setAlugueis(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function cancelarAluguel() {
    if (!cancelando) return;
    setActionLoading(true);
    try {
      await aluguelService.cancelar(cancelando.id);
      toast.success(`Reserva #${cancelando.id} cancelada.`);
      setConfirmOpen(false);
      carregar();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const ativos = alugueis.filter((a) => a.status === 'ativo');
  const historico = alugueis.filter((a) => a.status !== 'ativo');

  function RentalCard({ aluguel }) {
    return (
      <div className="p-5 rounded-2xl bg-gray-900 border border-white/5 hover:border-white/10 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Car size={18} className="text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-white">{aluguel.veiculo}</p>
              <p className="text-xs text-gray-500 font-mono">{aluguel.placa}</p>
            </div>
          </div>
          <StatusBadge status={aluguel.status} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <p className="text-xs text-gray-500">Retirada</p>
            <p className="text-sm text-white font-medium">{formatarData(aluguel.data_retirada)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Devolução</p>
            <p className="text-sm text-white font-medium">{formatarData(aluguel.data_entrega)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pagamento</p>
            <p className="text-sm text-white font-medium">{PAGAMENTO_LABEL[aluguel.forma_pagamento] || aluguel.forma_pagamento}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500">Locação #{aluguel.id}</p>
          <div className="flex items-center gap-3">
            {aluguel.status === 'ativo' && (
              <button
                onClick={() => { setCancelando(aluguel); setConfirmOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
              >
                <XCircle size={13} /> Cancelar
              </button>
            )}
            <p className="text-base font-bold text-emerald-400">{formatarMoeda(aluguel.valor_total || 0)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClienteLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={cancelarAluguel}
        loading={actionLoading}
        title="Cancelar Reserva"
        message={`Confirma o cancelamento da reserva #${cancelando?.id} (${cancelando?.veiculo})? Esta ação não pode ser desfeita.`}
      />
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Meus Aluguéis</h1>
          <p className="text-gray-400 text-sm mt-1">{alugueis.length} locação{alugueis.length !== 1 ? 'ões' : ''} no histórico</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : alugueis.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-gray-600">
            <FileText size={56} className="mb-4 opacity-30" />
            <p className="font-semibold text-lg text-gray-400">Você ainda não tem aluguéis</p>
            <p className="text-sm mt-1 mb-6">Explore nossa frota e faça sua primeira reserva!</p>
            <Link to="/frota">
              <Button variant="amber"><Car size={16} /> Explorar Frota</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Ativos */}
            {ativos.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Locações Ativas ({ativos.length})
                </h2>
                {ativos.map((a) => <RentalCard key={a.id} aluguel={a} />)}
              </div>
            )}

            {/* Histórico */}
            {historico.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Histórico ({historico.length})</h2>
                {historico.map((a) => <RentalCard key={a.id} aluguel={a} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </ClienteLayout>
  );
}
