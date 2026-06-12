import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Car, Save } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import Input, { Select } from '../../components/ui/Input';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { veiculoService } from '../../services/veiculoService';
import { validarPlaca, formatarPlaca } from '../../utils/validators';

const CATEGORIAS = ['Econômico', 'SUV', 'Sedan', 'Picape', 'Esportivo', 'Van'];
const CAMBIOS = ['Manual', 'Automático', 'CVT', 'Automatizado'];
const COMBUSTIVEIS = ['Flex', 'Gasolina', 'Diesel', 'Elétrico', 'Híbrido'];

const INICIAL = {
  modelo: '', fabricante: '', cor: '', placa: '', ano: new Date().getFullYear(),
  categoria: 'Econômico', cambio: 'Manual', combustivel: 'Flex',
  portas: 4, passageiros: 5, km: 0, valor_diaria: '', disponivel: true,
};

export default function VeiculoFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toasts, removeToast, toast } = useToast();
  const [form, setForm] = useState(INICIAL);
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    veiculoService.buscarPorId(id)
      .then((v) => { setForm({ ...INICIAL, ...v }); setLoadingData(false); })
      .catch(() => { toast.error('Veículo não encontrado.'); navigate('/veiculos'); });
  }, [id]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (erros[field]) setErros((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function validar() {
    const e = {};
    if (!form.modelo.trim()) e.modelo = 'Modelo é obrigatório.';
    if (!form.fabricante.trim()) e.fabricante = 'Fabricante é obrigatório.';
    if (!form.cor.trim()) e.cor = 'Cor é obrigatória.';
    if (!form.placa.trim()) e.placa = 'Placa é obrigatória.';
    else if (!validarPlaca(form.placa)) e.placa = 'Placa inválida. Use formato AAA9999 ou AAA9A99.';
    if (!form.valor_diaria || Number(form.valor_diaria) <= 0) e.valor_diaria = 'Informe a diária (valor > 0).';
    if (!form.ano || form.ano < 1990 || form.ano > new Date().getFullYear() + 1) e.ano = 'Ano inválido.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errosVal = validar();
    if (Object.keys(errosVal).length > 0) { setErros(errosVal); return; }
    setLoading(true);
    try {
      const dados = { ...form, placa: formatarPlaca(form.placa), valor_diaria: Number(form.valor_diaria), ano: Number(form.ano), km: Number(form.km) };
      if (isEdit) {
        await veiculoService.atualizar(id, dados);
        toast.success('Veículo atualizado com sucesso!');
      } else {
        await veiculoService.criar(dados);
        toast.success('Veículo cadastrado com sucesso!');
      }
      setTimeout(() => navigate('/veiculos'), 1200);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/veiculos')} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{isEdit ? 'Editar Veículo' : 'Novo Veículo'}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{isEdit ? `Editando: ${form.modelo}` : 'Preencha os dados do veículo'}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            {/* Identificação */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Car size={15} className="text-indigo-400" /> Identificação
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input id="modelo" label="Modelo" placeholder="Ex: Onix Plus" value={form.modelo} onChange={(e) => set('modelo', e.target.value)} error={erros.modelo} required />
                <Input id="fabricante" label="Fabricante" placeholder="Ex: Chevrolet" value={form.fabricante} onChange={(e) => set('fabricante', e.target.value)} error={erros.fabricante} required />
                <Input
                  id="placa" label="Placa" placeholder="Ex: BRA2E19"
                  value={form.placa}
                  onChange={(e) => set('placa', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 7))}
                  error={erros.placa} required
                  helpText="Padrão antigo (AAA9999) ou Mercosul (AAA9A99)"
                />
                <Input id="cor" label="Cor" placeholder="Ex: Prata" value={form.cor} onChange={(e) => set('cor', e.target.value)} error={erros.cor} required />
              </div>
            </div>

            {/* Características */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Características</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input id="ano" label="Ano" type="number" min="1990" max={new Date().getFullYear() + 1} value={form.ano} onChange={(e) => set('ano', e.target.value)} error={erros.ano} required />
                <Select id="categoria" label="Categoria" value={form.categoria} onChange={(e) => set('categoria', e.target.value)}>
                  {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                </Select>
                <Select id="cambio" label="Câmbio" value={form.cambio} onChange={(e) => set('cambio', e.target.value)}>
                  {CAMBIOS.map((c) => <option key={c}>{c}</option>)}
                </Select>
                <Select id="combustivel" label="Combustível" value={form.combustivel} onChange={(e) => set('combustivel', e.target.value)}>
                  {COMBUSTIVEIS.map((c) => <option key={c}>{c}</option>)}
                </Select>
                <Input id="portas" label="Portas" type="number" min="2" max="6" value={form.portas} onChange={(e) => set('portas', Number(e.target.value))} />
                <Input id="passageiros" label="Passageiros" type="number" min="1" max="15" value={form.passageiros} onChange={(e) => set('passageiros', Number(e.target.value))} />
              </div>
            </div>

            {/* Financeiro */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Financeiro & Status</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input id="valor_diaria" label="Diária (R$)" type="number" step="0.01" min="0" placeholder="0.00" value={form.valor_diaria} onChange={(e) => set('valor_diaria', e.target.value)} error={erros.valor_diaria} required />
                <Input id="km" label="Quilometragem" type="number" min="0" value={form.km} onChange={(e) => set('km', e.target.value)} />
                {isEdit && (
                  <Select id="disponivel" label="Disponibilidade" value={String(form.disponivel)} onChange={(e) => set('disponivel', e.target.value === 'true')}>
                    <option value="true">Disponível</option>
                    <option value="false">Alugado</option>
                  </Select>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate('/veiculos')}>Cancelar</Button>
              <Button type="submit" loading={loading}>
                <Save size={16} />
                {isEdit ? 'Salvar Alterações' : 'Cadastrar Veículo'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
