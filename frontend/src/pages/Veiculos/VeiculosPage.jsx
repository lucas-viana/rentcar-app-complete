import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Eye, Car, Filter } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CarImage from '../../components/ui/CarImage';
import { ConfirmModal } from '../../components/ui/Modal';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { veiculoService } from '../../services/veiculoService';
import { formatarMoeda, STATUS_VEICULO } from '../../utils/validators';

const CATEGORIAS = ['Todos', 'Econômico', 'SUV', 'Sedan', 'Picape'];

function StatusVeiculoBadge({ status }) {
  const s = STATUS_VEICULO[status] || { label: '—', variant: 'default' };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroDisp, setFiltroDisp] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [deletando, setDeletando] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toasts, removeToast, toast } = useToast();
  const navigate = useNavigate();

  async function carregar() {
    setLoading(true);
    const data = await veiculoService.listar();
    setVeiculos(data);
    setLoading(false);
  }
  useEffect(() => { carregar(); }, []);

  const filtrados = veiculos.filter((v) => {
    const q = busca.toLowerCase();
    const matchBusca = !q || v.modelo.toLowerCase().includes(q) || v.fabricante.toLowerCase().includes(q) || v.placa.toLowerCase().includes(q);
    const matchDisp = filtroDisp === 'todos' || (filtroDisp === 'disponivel' ? v.disponivel : !v.disponivel);
    const matchCat = filtroCategoria === 'Todos' || v.categoria === filtroCategoria;
    return matchBusca && matchDisp && matchCat;
  });

  function abrirConfirmDelete(v) {
    setDeletando(v);
    setConfirmOpen(true);
  }

  async function confirmarDelete() {
    if (!deletando) return;
    setDeleteLoading(true);
    try {
      await veiculoService.deletar(deletando.id);
      toast.success(`Veículo "${deletando.modelo}" excluído com sucesso!`);
      setConfirmOpen(false);
      carregar();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <AdminLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmarDelete}
        loading={deleteLoading}
        title="Excluir Veículo"
        message={`Tem certeza que deseja excluir o veículo "${deletando?.modelo}" (${deletando?.placa})? Esta ação não pode ser desfeita.`}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Frota de Veículos</h1>
            <p className="text-gray-400 text-sm mt-1">{veiculos.length} veículo{veiculos.length !== 1 ? 's' : ''} cadastrado{veiculos.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/veiculos/novo">
            <Button><Plus size={16} /> Novo Veículo</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Buscar por modelo, fabricante ou placa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filtroDisp}
            onChange={(e) => setFiltroDisp(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="todos">Todos</option>
            <option value="disponivel">Disponíveis</option>
            <option value="indisponivel">Alugados</option>
          </select>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-indigo-500"
          >
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-gray-900/50 border border-white/5 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
              <Car size={48} className="mb-4 opacity-30" />
              <p className="font-medium">Nenhum veículo encontrado</p>
              <p className="text-sm mt-1">Tente ajustar os filtros ou adicione um novo veículo.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Veículo', 'Placa', 'Categoria', 'Diária', 'Status', 'Ações'].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 font-semibold px-5 py-3.5 uppercase tracking-wider first:pr-0 last:text-right">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtrados.map((v) => (
                    <tr key={v.id} className="hover:bg-white/3 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-gray-800">
                            <CarImage veiculo={v} className="w-full h-full" iconSize={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{v.modelo}</p>
                            <p className="text-xs text-gray-500">{v.fabricante} · {v.ano} · {v.cor}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm text-gray-300 bg-white/5 px-2 py-1 rounded-lg">{v.placa}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-400">{v.categoria || '—'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-emerald-400">{formatarMoeda(v.valor_diaria || 0)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusVeiculoBadge status={v.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/veiculos/${v.id}`)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Detalhes"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => navigate(`/veiculos/${v.id}/editar`)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => abrirConfirmDelete(v)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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
