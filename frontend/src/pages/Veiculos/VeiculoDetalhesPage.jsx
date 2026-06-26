import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Car, Pencil, Calendar, Fuel, Users, Gauge, DollarSign, Activity, Tag } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import ClienteLayout from '../../components/layout/ClienteLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CarImage from '../../components/ui/CarImage';
import { veiculoService } from '../../services/veiculoService';
import { formatarMoeda, STATUS_VEICULO } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
        <Icon size={16} className="text-indigo-400" />
      </div>
      <div>
        <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function VeiculoDetalhesPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [veiculo, setVeiculo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    veiculoService.buscarPorId(id)
      .then((v) => { setVeiculo(v); setLoading(false); })
      .catch(() => navigate(isAdmin ? '/veiculos' : '/frota'));
  }, [id]);

  const Layout = isAdmin ? AdminLayout : ClienteLayout;
  const voltarUrl = isAdmin ? '/veiculos' : '/frota';
  const statusInfo = veiculo ? (STATUS_VEICULO[veiculo.status] || { label: '—', variant: 'default' }) : null;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(voltarUrl)} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{veiculo.modelo}</h1>
            <p className="text-gray-400 text-sm">{veiculo.fabricante} · {veiculo.ano}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-indigo-900/40 to-gray-900 border border-white/10 p-8 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
            <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-44 h-28 rounded-2xl overflow-hidden border border-indigo-500/30 shrink-0 bg-gray-900/40">
              <CarImage veiculo={veiculo} className="w-full h-full" iconSize={40} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{veiculo.fabricante} {veiculo.modelo}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="font-mono text-sm bg-white/10 text-gray-300 px-3 py-1 rounded-lg">{veiculo.placa}</span>
                <span className="text-sm text-gray-400">{veiculo.cor}</span>
                {veiculo.categoria && <Badge variant="info">{veiculo.categoria}</Badge>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Diária</p>
              <p className="text-3xl font-bold text-emerald-400">{formatarMoeda(veiculo.valor_diaria || 0)}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <InfoChip icon={Calendar} label="Ano" value={veiculo.ano || '—'} />
          <InfoChip icon={Activity} label="Câmbio" value={veiculo.cambio || '—'} />
          <InfoChip icon={Fuel} label="Combustível" value={veiculo.combustivel || '—'} />
          <InfoChip icon={Users} label="Passageiros" value={`${veiculo.passageiros || 5} pessoas`} />
          <InfoChip icon={Tag} label="Portas" value={`${veiculo.portas || 4} portas`} />
          <InfoChip icon={Gauge} label="Km rodados" value={`${(veiculo.km || 0).toLocaleString('pt-BR')} km`} />
        </div>

        {/* Aviso conforme o status atual do veículo (RF06) */}
        {veiculo.status === 'manutencao' && (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center text-purple-300 text-sm font-medium">
            Veículo em manutenção — temporariamente indisponível para locação.
          </div>
        )}
        {(veiculo.status === 'locado' || veiculo.status === 'aguardando_limpeza') && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-amber-400 text-sm font-medium">
            {veiculo.status === 'locado'
              ? 'Veículo locado no momento'
              : 'Veículo em preparação (aguardando limpeza)'} — disponível para reservas em datas futuras
            (com intervalo de 1 dia após cada devolução).
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <Link to={`/veiculos/${id}/editar`} className="flex-1">
                <Button fullWidth variant="ghost">
                  <Pencil size={15} /> Editar Veículo
                </Button>
              </Link>
              <Link to={`/alugueis/novo?veiculo=${id}`} className="flex-1">
                <Button fullWidth>
                  <Calendar size={15} /> Criar Locação
                </Button>
              </Link>
            </>
          ) : (
            <Link to={`/reservar/${id}`} className="flex-1">
              <Button fullWidth variant="amber" size="lg">
                <Calendar size={17} /> {veiculo.disponivel ? 'Reservar Este Veículo' : 'Reservar para Data Futura'}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
}
