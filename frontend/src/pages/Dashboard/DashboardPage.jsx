import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, FileText, TrendingUp, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { dashboardService } from '../../services/dashboardService';
import { aluguelService } from '../../services/aluguelService';
import { formatarMoeda, formatarData } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';

function KpiCard({ icon: Icon, label, value, sub, color, trend }) {
  const colors = {
    indigo: 'from-indigo-600/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/20 text-purple-400',
  };
  return (
    <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${colors[color]} border overflow-hidden`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/3" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-white/10`}>
            <Icon size={20} className="text-current" />
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-xs font-medium">
              <TrendingUp size={12} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm font-medium text-gray-300">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ativo: <Badge variant="success">Ativo</Badge>,
    finalizado: <Badge variant="info">Finalizado</Badge>,
    cancelado: <Badge variant="danger">Cancelado</Badge>,
  };
  return map[status] || <Badge>{status}</Badge>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ veiculos: 0, disponiveis: 0, usuarios: 0, alugueisAtivos: 0, receitaTotal: 0 });
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();

  useEffect(() => {
    async function carregar() {
      // Estatísticas vêm do backend (/api/dashboard), calculadas direto do banco
      const [dashboard, alugueis] = await Promise.all([
        dashboardService.obterEstatisticas(),
        aluguelService.listar(),
      ]);
      setStats({
        veiculos: dashboard.total_veiculos,
        disponiveis: dashboard.veiculos_disponiveis,
        usuarios: dashboard.total_clientes,
        alugueisAtivos: dashboard.alugueis_ativos,
        receitaTotal: dashboard.receita_total,
      });
      setRecentes([...alugueis].sort((a, b) => b.id - a.id).slice(0, 6));
      setLoading(false);
    }
    carregar();
  }, []);

  const now = new Date();
  const hora = now.getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-gray-400 text-sm">{saudacao}, <span className="text-indigo-400 font-medium">{usuario?.nome_completo?.split(' ')[0]}</span>!</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/veiculos/novo">
              <Button size="sm">
                <Plus size={15} />
                Novo Veículo
              </Button>
            </Link>
            <Link to="/alugueis/novo">
              <Button size="sm" variant="ghost">
                <Plus size={15} />
                Nova Locação
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={Car} label="Veículos na Frota" value={stats.veiculos} sub={`${stats.disponiveis} disponíveis`} color="indigo" />
            <KpiCard icon={CheckCircle} label="Disponíveis" value={stats.disponiveis} sub={`${stats.veiculos - stats.disponiveis} alugados`} color="emerald" />
            <KpiCard icon={AlertCircle} label="Locações Ativas" value={stats.alugueisAtivos} color="amber" />
            <KpiCard icon={Users} label="Clientes" value={stats.usuarios} color="purple" />
          </div>
        )}

        {/* Receita Banner */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-gray-400 text-sm">Receita Total (locações ativas e finalizadas)</p>
              <p className="text-3xl font-bold text-white mt-1">{formatarMoeda(stats.receitaTotal)}</p>
            </div>
            <Link to="/alugueis">
              <Button variant="ghost" size="sm">
                <FileText size={15} />
                Ver Relatório
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Rentals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock size={18} className="text-gray-400" />
              Locações Recentes
            </h2>
            <Link to="/alugueis" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Ver todas →
            </Link>
          </div>

          <div className="rounded-2xl bg-gray-900/50 border border-white/5 overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}
              </div>
            ) : recentes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                <FileText size={40} className="mb-3 opacity-40" />
                <p>Nenhuma locação registrada.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs text-gray-500 font-semibold px-5 py-3.5 uppercase tracking-wider">Cliente</th>
                      <th className="text-left text-xs text-gray-500 font-semibold px-5 py-3.5 uppercase tracking-wider hidden sm:table-cell">Veículo</th>
                      <th className="text-left text-xs text-gray-500 font-semibold px-5 py-3.5 uppercase tracking-wider hidden md:table-cell">Período</th>
                      <th className="text-left text-xs text-gray-500 font-semibold px-5 py-3.5 uppercase tracking-wider">Status</th>
                      <th className="text-right text-xs text-gray-500 font-semibold px-5 py-3.5 uppercase tracking-wider hidden lg:table-cell">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentes.map((a) => (
                      <tr key={a.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-white">{a.usuario}</p>
                          <p className="text-xs text-gray-500">#{a.id}</p>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <p className="text-sm text-gray-300">{a.veiculo}</p>
                          <p className="text-xs text-gray-500">{a.placa}</p>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <p className="text-xs text-gray-400">{formatarData(a.data_retirada)} → {formatarData(a.data_entrega)}</p>
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                        <td className="px-5 py-4 text-right hidden lg:table-cell">
                          <p className="text-sm font-medium text-white">{formatarMoeda(a.valor_total || 0)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
