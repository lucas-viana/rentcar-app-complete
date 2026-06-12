import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import Input, { Select } from '../../components/ui/Input';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { aluguelService } from '../../services/aluguelService';
import { veiculoService } from '../../services/veiculoService';
import { usuarioService } from '../../services/usuarioService';
import { validarDatas, formatarMoeda, diffDias, hojeISO } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';

const PAGAMENTOS = [
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'dinheiro', label: 'Dinheiro' },
];

const hoje = hojeISO();

export default function AluguelFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, removeToast, toast } = useToast();
  const { usuario } = useAuth();
  const [veiculos, setVeiculos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});
  const [form, setForm] = useState({
    usuario_id: '',
    veiculo_id: searchParams.get('veiculo') || '',
    data_retirada: hoje,
    data_entrega: '',
    forma_pagamento: 'pix',
  });

  useEffect(() => {
    usuarioService.listar().then((u) => setUsuarios(u.filter((x) => x.tipo === 'cliente')));
  }, []);

  // Disponibilidade dirigida pelas datas: o select de veículos mostra apenas
  // os disponíveis no período escolhido (buffer de 1 dia validado no backend)
  const datasValidas = form.data_retirada && form.data_entrega
    && !validarDatas(form.data_retirada, form.data_entrega);

  useEffect(() => {
    if (!datasValidas) {
      setVeiculos([]);
      return;
    }
    let ativo = true;
    veiculoService.listarDisponiveis(form.data_retirada, form.data_entrega)
      .then((v) => {
        if (!ativo) return;
        setVeiculos(v);
        setForm((f) => (
          f.veiculo_id && !v.some((x) => x.id === Number(f.veiculo_id))
            ? { ...f, veiculo_id: '' }
            : f
        ));
      })
      .catch(() => { if (ativo) setVeiculos([]); });
    return () => { ativo = false; };
  }, [form.data_retirada, form.data_entrega]);

  const veiculoSelecionado = veiculos.find((v) => v.id === Number(form.veiculo_id));
  const dias = form.data_retirada && form.data_entrega ? diffDias(form.data_retirada, form.data_entrega) : 0;
  const valorTotal = dias > 0 && veiculoSelecionado ? dias * (veiculoSelecionado.valor_diaria || 0) : 0;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (erros[field]) setErros((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function validar() {
    const e = {};
    if (!form.usuario_id) e.usuario_id = 'Selecione um cliente.';
    if (!form.veiculo_id) e.veiculo_id = 'Selecione um veículo.';
    if (!form.data_retirada) e.data_retirada = 'Data de retirada obrigatória.';
    if (!form.data_entrega) e.data_entrega = 'Data de entrega obrigatória.';
    const erroData = form.data_retirada && form.data_entrega ? validarDatas(form.data_retirada, form.data_entrega) : null;
    if (erroData) e.data_entrega = erroData;
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errosVal = validar();
    if (Object.keys(errosVal).length > 0) { setErros(errosVal); return; }
    setLoading(true);
    try {
      const usuarioSel = usuarios.find((u) => u.id === Number(form.usuario_id));
      await aluguelService.criar({
        ...form,
        usuario_id: Number(form.usuario_id),
        veiculo_id: Number(form.veiculo_id),
        usuario_nome: usuarioSel?.nome_completo,
      });
      toast.success('Locação registrada com sucesso!');
      setTimeout(() => navigate('/alugueis'), 1200);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/alugueis')} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Nova Locação</h1>
            <p className="text-gray-400 text-sm mt-0.5">Registre uma nova locação de veículo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5">
            {/* 1. Período — escolha as datas primeiro, como em sites de locação */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">1. Período da Locação</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input id="data_retirada" label="Data de Retirada" type="date" min={hoje} value={form.data_retirada} onChange={(e) => set('data_retirada', e.target.value)} error={erros.data_retirada} required />
                <Input id="data_entrega" label="Data de Entrega" type="date" min={form.data_retirada || hoje} value={form.data_entrega} onChange={(e) => set('data_entrega', e.target.value)} error={erros.data_entrega} required />
              </div>
            </div>

            {/* 2. Cliente e veículo disponível no período */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <FileText size={15} className="text-indigo-400" /> 2. Cliente & Veículo
              </h2>
              <Select id="usuario_id" label="Cliente" value={form.usuario_id} onChange={(e) => set('usuario_id', e.target.value)} error={erros.usuario_id} required>
                <option value="">Selecione o cliente</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nome_completo} — {u.cpf}</option>
                ))}
              </Select>
              <Select
                id="veiculo_id"
                label={`Veículo${datasValidas ? ` (${veiculos.length} disponíve${veiculos.length !== 1 ? 'is' : 'l'} no período)` : ''}`}
                value={form.veiculo_id}
                onChange={(e) => set('veiculo_id', e.target.value)}
                error={erros.veiculo_id}
                required
                disabled={!datasValidas}
                helpText={datasValidas ? undefined : 'Apenas veículos livres no período escolhido serão listados'}
              >
                <option value="">
                  {datasValidas ? 'Selecione o veículo' : 'Escolha o período primeiro'}
                </option>
                {veiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.modelo} — {v.fabricante} ({v.placa})
                  </option>
                ))}
              </Select>
            </div>

            {/* 3. Pagamento */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">3. Pagamento</h2>
              <Select id="forma_pagamento" label="Forma de Pagamento" value={form.forma_pagamento} onChange={(e) => set('forma_pagamento', e.target.value)} required>
                {PAGAMENTOS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            </div>

            {/* Resumo */}
            {dias > 0 && veiculoSelecionado && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/30 to-indigo-900/20 border border-emerald-500/20">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Resumo da Locação</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">{dias}</p>
                    <p className="text-xs text-gray-400">dia{dias !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-400">{formatarMoeda(veiculoSelecionado.valor_diaria || 0)}</p>
                    <p className="text-xs text-gray-400">por dia</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{formatarMoeda(valorTotal)}</p>
                    <p className="text-xs text-gray-400">total</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate('/alugueis')}>Cancelar</Button>
              <Button type="submit" loading={loading}>
                <Save size={16} /> Registrar Locação
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
