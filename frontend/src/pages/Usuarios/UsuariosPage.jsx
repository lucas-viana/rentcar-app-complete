import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Users, Shield, User } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/Modal';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { usuarioService } from '../../services/usuarioService';
import { formatarData } from '../../utils/validators';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('todos');
  const [deletando, setDeletando] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toasts, removeToast, toast } = useToast();
  const navigate = useNavigate();

  async function carregar() {
    setLoading(true);
    const data = await usuarioService.listar();
    setUsuarios(data);
    setLoading(false);
  }
  useEffect(() => { carregar(); }, []);

  const filtrados = usuarios.filter((u) => {
    const q = busca.toLowerCase();
    const match = !q || u.nome_completo.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.cpf.includes(q);
    const matchPerfil = filtroPerfil === 'todos' || u.tipo === filtroPerfil;
    return match && matchPerfil;
  });

  async function confirmarDelete() {
    if (!deletando) return;
    setDeleteLoading(true);
    try {
      await usuarioService.deletar(deletando.id);
      toast.success(`Usuário "${deletando.nome_completo}" excluído.`);
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
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir o usuário "${deletando?.nome_completo}"?`}
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Usuários</h1>
            <p className="text-gray-400 text-sm mt-1">{usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} cadastrado{usuarios.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/usuarios/novo">
            <Button><Plus size={16} /> Novo Usuário</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Buscar por nome, e-mail ou CPF..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filtroPerfil}
            onChange={(e) => setFiltroPerfil(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-white/10 text-gray-300 text-sm focus:outline-none"
          >
            <option value="todos">Todos os perfis</option>
            <option value="admin">Admin</option>
            <option value="cliente">Cliente</option>
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
              <Users size={48} className="mb-4 opacity-30" />
              <p className="font-medium">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Usuário', 'CPF', 'Telefone', 'Perfil', 'Ações'].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 font-semibold px-5 py-3.5 uppercase tracking-wider last:text-right">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtrados.map((u) => (
                    <tr key={u.id} className="hover:bg-white/3 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white
                            ${u.tipo === 'admin'
                              ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                              : 'bg-gradient-to-br from-amber-500 to-orange-500'
                            }`}>
                            {u.nome_completo[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{u.nome_completo}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400 font-mono">{u.cpf}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{u.telefone}</td>
                      <td className="px-5 py-4">
                        {u.tipo === 'admin'
                          ? <Badge variant="info"><Shield size={11} className="mr-1" />Admin</Badge>
                          : <Badge variant="warning"><User size={11} className="mr-1" />Cliente</Badge>
                        }
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/usuarios/${u.id}/editar`)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => { setDeletando(u); setConfirmOpen(true); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
