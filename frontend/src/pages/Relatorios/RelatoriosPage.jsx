import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, FileText, Percent, DollarSign, AlertTriangle, Trophy, Car } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import { relatorioService } from '../../services/relatorioService';
import { formatarMoeda } from '../../utils/validators';

function Kpi({ icon: Icon, label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'from-indigo-600/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/20 text-purple-400',
  };
  return (
    <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${colors[color]} border overflow-hidden`}>
      <div className="p-2.5 rounded-xl bg-white/10 w-fit mb-3"><Icon size={20} className="text-current" /></div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm font-medium text-gray-300">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function RelatoriosPage() {
  const [rel, setRel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    relatorioService.gerenciais()
      .then((data) => setRel(data))
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center py-32"><div className="w-8 h-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" /></div></AdminLayout>;
  }
  if (erro) {
    return <AdminLayout><div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">{erro}</div></AdminLayout>;
  }

  const maxMes = Math.max(1, ...rel.faturamento_mensal.map((m) => Number(m.total)));

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart3 size={22} className="text-indigo-400" /> Relatórios Gerenciais</h1>
          <p className="text-gray-400 text-sm mt-1">Histórico de locações, faturamento mensal e taxa de ociosidade da frota.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={FileText} label="Total de Locações" value={rel.total_locacoes} sub={`${rel.locacoes_ativas} ativas · ${rel.locacoes_finalizadas} finalizadas`} color="indigo" />
          <Kpi icon={DollarSign} label="Faturamento" value={formatarMoeda(rel.faturamento_total)} sub="ativas + finalizadas" color="emerald" />
          <Kpi icon={TrendingUp} label="Ticket Médio" value={formatarMoeda(rel.ticket_medio)} sub="por locação" color="amber" />
          <Kpi icon={Percent} label="Taxa de Ociosidade" value={`${rel.taxa_ociosidade}%`} sub={`${rel.veiculos_ociosos_hoje}/${rel.total_veiculos} ociosos hoje`} color="purple" />
        </div>

        {/* Histórico por status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Histórico por Status</h2>
            <div className="space-y-3">
              {[
                { label: 'Ativas', value: rel.locacoes_ativas, variant: 'success' },
                { label: 'Finalizadas', value: rel.locacoes_finalizadas, variant: 'info' },
                { label: 'Canceladas', value: rel.locacoes_canceladas, variant: 'danger' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <Badge variant={s.variant}>{s.label}</Badge>
                  <span className="text-lg font-bold text-white">{s.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-sm text-amber-400 flex items-center gap-1.5"><AlertTriangle size={14} /> Total em multas</span>
                <span className="text-lg font-bold text-amber-400">{formatarMoeda(rel.total_multas)}</span>
              </div>
            </div>
          </div>

          {/* Faturamento mensal */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-gray-900/50 border border-white/5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">Faturamento Mensal</h2>
            {rel.faturamento_mensal.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">Sem dados de faturamento.</p>
            ) : (
              <div className="flex items-end gap-3 h-48">
                {rel.faturamento_mensal.map((m) => (
                  <div key={m.mes} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
                    <span className="text-[11px] text-emerald-400 font-semibold">{formatarMoeda(m.total)}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 min-h-[4px] transition-all"
                      style={{ height: `${(Number(m.total) / maxMes) * 100}%` }}
                      title={`${m.quantidade} locação(ões)`}
                    />
                    <span className="text-[11px] text-gray-400">{m.mes}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top veículos */}
        <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy size={15} className="text-amber-400" /> Veículos com Maior Receita
          </h2>
          {rel.top_veiculos.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center">Nenhuma locação registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['#', 'Veículo', 'Placa', 'Locações', 'Receita'].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 font-semibold px-4 py-3 uppercase tracking-wider last:text-right">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rel.top_veiculos.map((v, i) => (
                    <tr key={v.placa} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{i + 1}º</td>
                      <td className="px-4 py-3 text-sm font-medium text-white flex items-center gap-2"><Car size={14} className="text-indigo-400" /> {v.veiculo}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{v.placa}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{v.locacoes}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-400 text-right">{formatarMoeda(v.receita)}</td>
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
