import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Search, Fuel, Users, Activity, Calendar } from 'lucide-react';
import ClienteLayout from '../../components/layout/ClienteLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CarImage from '../../components/ui/CarImage';
import { veiculoService } from '../../services/veiculoService';
import { formatarMoeda, formatarData, hojeISO, validarDatas, diffDias } from '../../utils/validators';

const CATEGORIAS = ['Todos', 'Econômico', 'SUV', 'Sedan', 'Picape'];

// Compara categorias ignorando acentos ("Econômico" ≡ "Economico")
function mesmaCategoria(a, b) {
  return (a || '').localeCompare(b || '', 'pt', { sensitivity: 'base' }) === 0;
}

function VeiculoCard({ veiculo, retirada, devolucao, dias }) {
  const total = dias > 0 ? dias * (veiculo.valor_diaria || 0) : 0;
  return (
    <Link
      to={`/reservar/${veiculo.id}?retirada=${retirada}&devolucao=${devolucao}`}
      className="group block rounded-2xl border bg-gray-900 border-white/10 transition-all duration-300 overflow-hidden
        hover:-translate-y-1 hover:shadow-2xl hover:border-indigo-500/40 hover:shadow-indigo-500/10"
    >
      {/* Foto real do veículo */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-indigo-900/40 to-gray-900">
        <CarImage veiculo={veiculo} className="w-full h-full transition-transform duration-300 group-hover:scale-105" iconSize={44} />

        <div className="absolute top-3 right-3">
          <Badge variant="success">Disponível no período</Badge>
        </div>

        {veiculo.categoria && (
          <div className="absolute top-3 left-3">
            <Badge variant="info">{veiculo.categoria}</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
          {veiculo.fabricante} {veiculo.modelo}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">{veiculo.ano} · {veiculo.cor}</p>

        {/* Specs Row */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Activity size={12} />{veiculo.cambio || 'Manual'}</span>
          <span className="flex items-center gap-1"><Fuel size={12} />{veiculo.combustivel || 'Flex'}</span>
          <span className="flex items-center gap-1"><Users size={12} />{veiculo.passageiros || 5}p</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div>
            <p className="text-lg font-bold text-emerald-400">{formatarMoeda(veiculo.valor_diaria || 0)}<span className="text-xs text-gray-500 font-normal">/dia</span></p>
            {dias > 0 && (
              <p className="text-xs text-gray-500">{formatarMoeda(total)} por {dias} dia{dias !== 1 ? 's' : ''}</p>
            )}
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 text-xs font-semibold border border-indigo-500/30
            group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-200">
            Reservar
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function FrotaClientePage() {
  const hoje = hojeISO();
  const devolucaoPadrao = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  })();

  const [datas, setDatas] = useState({ retirada: hoje, devolucao: devolucaoPadrao });
  const [erroDatas, setErroDatas] = useState(null);
  // Período efetivamente pesquisado (os cards carregam as datas da última busca)
  const [periodo, setPeriodo] = useState(null);
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todos');

  async function buscarDisponiveis(retirada, devolucao) {
    const erro = validarDatas(retirada, devolucao);
    if (erro) {
      setErroDatas(erro);
      return;
    }
    setErroDatas(null);
    setLoading(true);
    try {
      const data = await veiculoService.listarDisponiveis(retirada, devolucao);
      setVeiculos(data);
      setPeriodo({ retirada, devolucao });
    } catch (err) {
      setErroDatas(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscarDisponiveis(datas.retirada, datas.devolucao);
  }, []);

  const filtrados = veiculos.filter((v) => {
    const q = busca.toLowerCase();
    const matchBusca = !q || v.modelo.toLowerCase().includes(q) || v.fabricante.toLowerCase().includes(q);
    const matchCat = categoria === 'Todos' || mesmaCategoria(v.categoria, categoria);
    return matchBusca && matchCat;
  });

  const dias = periodo ? diffDias(periodo.retirada, periodo.devolucao) : 0;

  return (
    <ClienteLayout>
      <div className="space-y-8">
        {/* Hero com busca por período */}
        <div className="relative py-10 px-6 rounded-3xl bg-gradient-to-br from-indigo-950 to-gray-900 border border-indigo-500/20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-600/5 rounded-full blur-3xl" />
          </div>
          <div className="relative text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Encontre o carro <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-400">perfeito</span>
            </h1>
            <p className="text-gray-400 text-base max-w-lg mx-auto">
              Escolha o período da locação e veja apenas os veículos disponíveis.
            </p>
          </div>

          {/* Painel de busca por data (estilo site de locadora) */}
          <div className="relative max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl bg-gray-950/70 border border-white/10 backdrop-blur">
              <div className="flex-1">
                <label htmlFor="busca_retirada" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  <Calendar size={11} className="inline mr-1" />Retirada
                </label>
                <input
                  id="busca_retirada"
                  type="date"
                  min={hoje}
                  value={datas.retirada}
                  onChange={(e) => setDatas((d) => ({ ...d, retirada: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="busca_devolucao" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  <Calendar size={11} className="inline mr-1" />Devolução
                </label>
                <input
                  id="busca_devolucao"
                  type="date"
                  min={datas.retirada || hoje}
                  value={datas.devolucao}
                  onChange={(e) => setDatas((d) => ({ ...d, devolucao: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <Button size="lg" onClick={() => buscarDisponiveis(datas.retirada, datas.devolucao)} className="w-full sm:w-auto">
                  <Search size={16} /> Buscar
                </Button>
              </div>
            </div>
            {erroDatas && (
              <p className="mt-2 text-center text-sm text-red-400">{erroDatas}</p>
            )}
          </div>
        </div>

        {/* Resumo do período pesquisado */}
        {periodo && !loading && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {filtrados.length} veículo{filtrados.length !== 1 ? 's' : ''} disponíve{filtrados.length !== 1 ? 'is' : 'l'} de {formatarData(periodo.retirada)} a {formatarData(periodo.devolucao)} ({dias} diária{dias !== 1 ? 's' : ''})
            </div>
          </div>
        )}

        {/* Filtros secundários */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Buscar por modelo ou fabricante..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${categoria === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <Car size={56} className="mb-4 opacity-30" />
            <p className="font-medium text-lg">Nenhum veículo disponível neste período</p>
            <p className="text-sm mt-1">Tente outras datas ou ajuste os filtros de busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtrados.map((v) => (
              <VeiculoCard
                key={v.id}
                veiculo={v}
                retirada={periodo?.retirada || datas.retirada}
                devolucao={periodo?.devolucao || datas.devolucao}
                dias={dias}
              />
            ))}
          </div>
        )}
      </div>
    </ClienteLayout>
  );
}
