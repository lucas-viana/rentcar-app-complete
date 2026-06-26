import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, CreditCard, CheckCircle, Fuel, Users, Activity, IdCard } from 'lucide-react';
import ClienteLayout from '../../components/layout/ClienteLayout';
import Button from '../../components/ui/Button';
import Input, { Select } from '../../components/ui/Input';
import CarImage from '../../components/ui/CarImage';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { veiculoService } from '../../services/veiculoService';
import { aluguelService } from '../../services/aluguelService';
import { validarDatas, formatarMoeda, formatarData, diffDias, hojeISO } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';

const PAGAMENTOS = [
  { value: 'pix', label: 'PIX', desc: 'Desconto de 5%' },
  { value: 'cartao_credito', label: 'Cartão de Crédito', desc: 'Parcelamento disponível' },
  { value: 'cartao_debito', label: 'Cartão de Débito', desc: 'Débito imediato' },
  { value: 'dinheiro', label: 'Dinheiro', desc: 'Pagamento na retirada' },
];

const hoje = hojeISO();

function StepIndicator({ step }) {
  const steps = [
    { n: 1, label: 'Período', icon: Calendar },
    { n: 2, label: 'Pagamento', icon: CreditCard },
    { n: 3, label: 'Confirmação', icon: CheckCircle },
  ];
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, idx) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
              ${step === s.n ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/30' :
                step > s.n ? 'bg-emerald-600 border-emerald-500' :
                'bg-gray-800 border-white/10'}`}
            >
              {step > s.n
                ? <CheckCircle size={18} className="text-white" />
                : <s.icon size={18} className={step === s.n ? 'text-white' : 'text-gray-500'} />
              }
            </div>
            <p className={`text-xs mt-1.5 font-medium transition-colors ${step >= s.n ? 'text-white' : 'text-gray-500'}`}>{s.label}</p>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mb-5 transition-all duration-300 ${step > s.n ? 'bg-emerald-500' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ReservaFluxoPage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, removeToast, toast } = useToast();
  const [veiculo, setVeiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [reservaOk, setReservaOk] = useState(false);
  // Datas escolhidas na busca da frota chegam via query string
  const [form, setForm] = useState({
    data_retirada: searchParams.get('retirada') || hoje,
    data_entrega: searchParams.get('devolucao') || '',
    forma_pagamento: 'pix',
  });
  const [erros, setErros] = useState({});

  useEffect(() => {
    veiculoService.buscarPorId(id)
      .then((v) => { setVeiculo(v); setLoading(false); })
      .catch(() => navigate('/frota'));
  }, [id]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (erros[field]) setErros((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  const dias = form.data_retirada && form.data_entrega ? diffDias(form.data_retirada, form.data_entrega) : 0;
  const valorTotal = dias > 0 && veiculo ? dias * (veiculo.valor_diaria || 0) : 0;
  // RF12: cliente precisa de CNH cadastrada para concluir a reserva
  const semCnh = !usuario?.numero_cnh;

  function avancar() {
    if (step === 1) {
      const e = {};
      if (!form.data_retirada) e.data_retirada = 'Obrigatório.';
      if (!form.data_entrega) e.data_entrega = 'Obrigatório.';
      const erroData = form.data_retirada && form.data_entrega ? validarDatas(form.data_retirada, form.data_entrega) : null;
      if (erroData) e.data_entrega = erroData;
      if (dias < 1) e.data_entrega = 'Mínimo de 1 dia.';
      if (Object.keys(e).length > 0) { setErros(e); return; }
    }
    setStep((s) => s + 1);
  }

  async function confirmar() {
    setSubmitting(true);
    try {
      await aluguelService.criar({
        usuario_id: usuario.id,
        veiculo_id: Number(id),
        data_retirada: form.data_retirada,
        data_entrega: form.data_entrega,
        forma_pagamento: form.forma_pagamento,
        usuario_nome: usuario.nome_completo,
      });
      setReservaOk(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <ClienteLayout><div className="flex items-center justify-center py-32"><div className="w-8 h-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" /></div></ClienteLayout>;
  }

  if (reservaOk) {
    return (
      <ClienteLayout>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={44} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Reserva Confirmada!</h1>
          <p className="text-gray-400 mb-2">Seu <span className="text-white font-semibold">{veiculo.fabricante} {veiculo.modelo}</span> foi reservado com sucesso.</p>
          <p className="text-sm text-gray-500 mb-8">
            {formatarData(form.data_retirada)} → {formatarData(form.data_entrega)} · {dias} dia{dias !== 1 ? 's' : ''} · {formatarMoeda(valorTotal)}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => navigate('/meus-alugueis')}>Ver Meus Aluguéis</Button>
            <Button onClick={() => navigate('/frota')}>Explorar Frota</Button>
          </div>
        </div>
      </ClienteLayout>
    );
  }

  return (
    <ClienteLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => step === 1 ? navigate('/frota') : setStep((s) => s - 1)} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Reservar Veículo</h1>
            <p className="text-gray-400 text-sm">{veiculo.fabricante} {veiculo.modelo}</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center">
          <StepIndicator step={step} />
        </div>

        {/* CNH obrigatória (RF12) */}
        {semCnh && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
            <IdCard size={18} className="mt-0.5 shrink-0" />
            <p>
              Para concluir uma reserva você precisa cadastrar sua CNH.{' '}
              <Link to="/perfil" className="underline font-semibold hover:text-amber-200">Completar meu perfil</Link>
            </p>
          </div>
        )}

        {/* Vehicle Summary */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-900/50 border border-white/5">
          <div className="w-20 h-14 rounded-xl overflow-hidden border border-indigo-500/20 shrink-0 bg-gray-800">
            <CarImage veiculo={veiculo} className="w-full h-full" iconSize={22} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white">{veiculo.fabricante} {veiculo.modelo}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Activity size={11} />{veiculo.cambio}</span>
              <span className="flex items-center gap-1"><Fuel size={11} />{veiculo.combustivel}</span>
              <span className="flex items-center gap-1"><Users size={11} />{veiculo.passageiros}p</span>
            </div>
          </div>
          <p className="text-right text-sm">
            <span className="text-emerald-400 font-bold">{formatarMoeda(veiculo.valor_diaria || 0)}</span>
            <span className="text-gray-500">/dia</span>
          </p>
        </div>

        {/* Steps */}
        <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5">
          {/* STEP 1: Período */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Calendar size={18} className="text-indigo-400" /> Escolha o Período</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input id="data_retirada" label="Data de Retirada" type="date" min={hoje} value={form.data_retirada} onChange={(e) => set('data_retirada', e.target.value)} error={erros.data_retirada} required />
                <Input id="data_entrega" label="Data de Devolução" type="date" min={form.data_retirada || hoje} value={form.data_entrega} onChange={(e) => set('data_entrega', e.target.value)} error={erros.data_entrega} required />
              </div>
              {dias > 0 && (
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                  <p className="text-sm text-gray-400"><span className="text-white font-bold text-xl">{dias}</span> dia{dias !== 1 ? 's' : ''} · Total estimado: <span className="text-emerald-400 font-bold">{formatarMoeda(valorTotal)}</span></p>
                </div>
              )}
              <Button fullWidth onClick={avancar}>Continuar <ArrowRight size={16} /></Button>
            </div>
          )}

          {/* STEP 2: Pagamento */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><CreditCard size={18} className="text-indigo-400" /> Forma de Pagamento</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAGAMENTOS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => set('forma_pagamento', p.value)}
                    className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200
                      ${form.forma_pagamento === p.value
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-white/10 bg-white/3 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                  >
                    <p className="font-semibold text-sm">{p.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft size={16} /> Voltar</Button>
                <Button fullWidth onClick={avancar}>Revisar <ArrowRight size={16} /></Button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmar */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><CheckCircle size={18} className="text-indigo-400" /> Confirmar Reserva</h2>
              <div className="space-y-3">
                {[
                  { label: 'Veículo', value: `${veiculo.fabricante} ${veiculo.modelo} (${veiculo.placa})` },
                  { label: 'Cliente', value: usuario?.nome_completo },
                  { label: 'Retirada', value: formatarData(form.data_retirada) },
                  { label: 'Devolução', value: formatarData(form.data_entrega) },
                  { label: 'Duração', value: `${dias} dia${dias !== 1 ? 's' : ''}` },
                  { label: 'Pagamento', value: PAGAMENTOS.find((p) => p.value === form.forma_pagamento)?.label },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-sm text-gray-400">{row.label}</span>
                    <span className="text-sm font-medium text-white">{row.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3 bg-emerald-500/10 px-4 rounded-xl mt-2">
                  <span className="text-sm font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-emerald-400">{formatarMoeda(valorTotal)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft size={16} /> Voltar</Button>
                <Button fullWidth variant="amber" loading={submitting} disabled={semCnh} onClick={confirmar}>
                  <CheckCircle size={16} /> {semCnh ? 'Cadastre sua CNH para reservar' : 'Confirmar Reserva'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClienteLayout>
  );
}
