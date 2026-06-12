import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import Input, { Select } from '../../components/ui/Input';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { usuarioService } from '../../services/usuarioService';
import { validarCPF, validarEmail, validarTelefone, formatarCPF, formatarTelefone } from '../../utils/validators';

const INICIAL = {
  nome_completo: '', cpf: '', data_nascimento: '', telefone: '',
  email: '', senha: '', confirmar_senha: '', endereco: '', tipo: 'cliente',
};

export default function UsuarioFormPage() {
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
    usuarioService.buscarPorId(id)
      .then((u) => { setForm({ ...INICIAL, ...u, senha: '', confirmar_senha: '' }); setLoadingData(false); })
      .catch(() => { toast.error('Usuário não encontrado.'); navigate('/usuarios'); });
  }, [id]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (erros[field]) setErros((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function validar() {
    const e = {};
    if (!form.nome_completo.trim()) e.nome_completo = 'Nome é obrigatório.';
    if (!form.cpf.trim()) e.cpf = 'CPF é obrigatório.';
    else if (!validarCPF(form.cpf)) e.cpf = 'CPF inválido.';
    if (!form.data_nascimento) e.data_nascimento = 'Data de nascimento é obrigatória.';
    if (!form.telefone.trim()) e.telefone = 'Telefone é obrigatório.';
    else if (!validarTelefone(form.telefone)) e.telefone = 'Telefone inválido.';
    if (!form.email.trim()) e.email = 'E-mail é obrigatório.';
    else if (!validarEmail(form.email)) e.email = 'E-mail inválido.';
    if (!isEdit) {
      if (!form.senha) e.senha = 'Senha é obrigatória.';
      else if (form.senha.length < 6) e.senha = 'Mínimo de 6 caracteres.';
    } else if (form.senha && form.senha.length < 6) {
      e.senha = 'Mínimo de 6 caracteres.';
    }
    if (form.senha && form.senha !== form.confirmar_senha) e.confirmar_senha = 'As senhas não coincidem.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errosVal = validar();
    if (Object.keys(errosVal).length > 0) { setErros(errosVal); return; }
    setLoading(true);
    try {
      const dados = { ...form };
      if (!dados.senha) delete dados.senha;
      delete dados.confirmar_senha;
      if (isEdit) {
        await usuarioService.atualizar(id, dados);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await usuarioService.criar(dados);
        toast.success('Usuário cadastrado com sucesso!');
      }
      setTimeout(() => navigate('/usuarios'), 1200);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return <AdminLayout><div className="flex items-center justify-center py-32"><div className="w-8 h-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/usuarios')} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{isEdit ? form.nome_completo : 'Preencha os dados do usuário'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <User size={15} className="text-indigo-400" /> Dados Pessoais
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input id="nome_completo" label="Nome Completo" placeholder="Nome completo" value={form.nome_completo} onChange={(e) => set('nome_completo', e.target.value)} error={erros.nome_completo} required className="sm:col-span-2" />
                <Input
                  id="cpf" label="CPF" placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => set('cpf', formatarCPF(e.target.value))}
                  error={erros.cpf} required maxLength={14}
                />
                <Input id="data_nascimento" label="Data de Nascimento" type="date" value={form.data_nascimento} onChange={(e) => set('data_nascimento', e.target.value)} error={erros.data_nascimento} required />
                <Input
                  id="telefone" label="Telefone" placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={(e) => set('telefone', formatarTelefone(e.target.value))}
                  error={erros.telefone} required maxLength={15}
                />
                <Input id="email" label="E-mail" type="email" placeholder="email@exemplo.com" value={form.email} onChange={(e) => set('email', e.target.value)} error={erros.email} required />
                <Input id="endereco" label="Endereço" placeholder="Rua, número — Cidade/UF" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} className="sm:col-span-2" />
              </div>
            </div>

            {/* Acesso */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Acesso ao Sistema</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select id="tipo" label="Perfil" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
                  <option value="cliente">Cliente</option>
                  <option value="admin">Administrador</option>
                </Select>
                <Input id="senha" label={isEdit ? 'Nova Senha (opcional)' : 'Senha'} type="password" placeholder="••••••••" value={form.senha} onChange={(e) => set('senha', e.target.value)} error={erros.senha} required={!isEdit} helpText={isEdit ? 'Deixe em branco para não alterar' : undefined} />
                {(form.senha || !isEdit) && (
                  <Input id="confirmar_senha" label="Confirmar Senha" type="password" placeholder="••••••••" value={form.confirmar_senha} onChange={(e) => set('confirmar_senha', e.target.value)} error={erros.confirmar_senha} required={!isEdit} />
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate('/usuarios')}>Cancelar</Button>
              <Button type="submit" loading={loading}>
                <Save size={16} />
                {isEdit ? 'Salvar Alterações' : 'Cadastrar Usuário'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
