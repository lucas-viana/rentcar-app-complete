import { useEffect, useState } from 'react';
import { User, IdCard, Lock, Save, ShieldCheck } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import ClienteLayout from '../../components/layout/ClienteLayout';
import Button from '../../components/ui/Button';
import Input, { Select } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { perfilService } from '../../services/perfilService';
import { useAuth } from '../../contexts/AuthContext';
import {
  validarEmail, validarTelefone, validarCNH,
  formatarTelefone, formatarCNH, formatarCPF, formatarData,
} from '../../utils/validators';

const CATEGORIAS_CNH = ['', 'A', 'B', 'AB', 'C', 'D', 'E'];

export default function PerfilPage() {
  const { isAdmin, atualizarUsuario } = useAuth();
  const Layout = isAdmin ? AdminLayout : ClienteLayout;
  const { toasts, removeToast, toast } = useToast();

  const [form, setForm] = useState(null);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    perfilService.obter()
      .then((u) => setForm({
        nome_completo: u.nome_completo || '',
        email: u.email || '',
        telefone: u.telefone || '',
        endereco: u.endereco || '',
        cpf: u.cpf || '',
        data_nascimento: u.data_nascimento || '',
        tipo: u.tipo,
        numero_cnh: u.numero_cnh || '',
        categoria_cnh: u.categoria_cnh || '',
        validade_cnh: u.validade_cnh || '',
        senha_atual: '',
        nova_senha: '',
        confirmar_senha: '',
      }))
      .catch((err) => toast.error(err.message));
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (erros[field]) setErros((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function validar() {
    const e = {};
    if (!form.nome_completo.trim()) e.nome_completo = 'Nome é obrigatório.';
    if (!form.email.trim()) e.email = 'E-mail é obrigatório.';
    else if (!validarEmail(form.email)) e.email = 'E-mail inválido.';
    if (form.telefone && !validarTelefone(form.telefone)) e.telefone = 'Telefone inválido.';
    if (form.numero_cnh && !validarCNH(form.numero_cnh)) e.numero_cnh = 'CNH inválida (11 dígitos).';
    if (form.nova_senha) {
      if (form.nova_senha.length < 6) e.nova_senha = 'Mínimo de 6 caracteres.';
      if (!form.senha_atual) e.senha_atual = 'Informe a senha atual.';
      if (form.nova_senha !== form.confirmar_senha) e.confirmar_senha = 'As senhas não coincidem.';
    }
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validar();
    if (Object.keys(e).length > 0) { setErros(e); return; }
    setSalvando(true);
    try {
      const atualizado = await perfilService.atualizar({
        nome_completo: form.nome_completo,
        email: form.email,
        telefone: form.telefone,
        endereco: form.endereco,
        numero_cnh: form.numero_cnh,
        categoria_cnh: form.categoria_cnh,
        validade_cnh: form.validade_cnh || null,
        senha_atual: form.senha_atual || null,
        nova_senha: form.nova_senha || null,
      });
      atualizarUsuario(atualizado);
      setForm((f) => ({ ...f, senha_atual: '', nova_senha: '', confirmar_senha: '' }));
      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSalvando(false);
    }
  }

  if (!form) {
    return <Layout><div className="flex items-center justify-center py-32"><div className="w-8 h-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" /></div></Layout>;
  }

  const cnhVencida = form.validade_cnh && new Date(form.validade_cnh) < new Date(new Date().toDateString());

  return (
    <Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
          <p className="text-gray-400 text-sm mt-1">Mantenha seus dados de contato e a habilitação atualizados.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            {/* Dados de contato */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <User size={15} className="text-indigo-400" /> Dados de Contato
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input id="nome_completo" label="Nome Completo" value={form.nome_completo} onChange={(e) => set('nome_completo', e.target.value)} error={erros.nome_completo} required className="sm:col-span-2" />
                <Input id="email" label="E-mail" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={erros.email} required />
                <Input id="telefone" label="Telefone" value={form.telefone} onChange={(e) => set('telefone', formatarTelefone(e.target.value))} error={erros.telefone} maxLength={15} />
                <Input id="endereco" label="Endereço" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} className="sm:col-span-2" />
              </div>
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-500">
                <span>CPF: <span className="text-gray-300 font-medium">{formatarCPF(form.cpf)}</span> (não editável)</span>
                {form.data_nascimento && <span>Nascimento: <span className="text-gray-300 font-medium">{formatarData(form.data_nascimento)}</span></span>}
              </div>
            </div>

            {/* CNH */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <IdCard size={15} className="text-indigo-400" /> Habilitação (CNH)
                </h2>
                {form.numero_cnh && (cnhVencida
                  ? <Badge variant="danger">CNH vencida</Badge>
                  : <Badge variant="success">CNH válida</Badge>)}
              </div>
              <p className="text-xs text-gray-500">A CNH é obrigatória para realizar locações (RF12).</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input id="numero_cnh" label="Número da CNH" placeholder="00000000000" value={form.numero_cnh} onChange={(e) => set('numero_cnh', formatarCNH(e.target.value))} error={erros.numero_cnh} maxLength={11} helpText="11 dígitos" />
                <Select id="categoria_cnh" label="Categoria" value={form.categoria_cnh} onChange={(e) => set('categoria_cnh', e.target.value)}>
                  {CATEGORIAS_CNH.map((c) => <option key={c} value={c}>{c || '—'}</option>)}
                </Select>
                <Input id="validade_cnh" label="Validade" type="date" value={form.validade_cnh} onChange={(e) => set('validade_cnh', e.target.value)} />
              </div>
            </div>

            {/* Senha */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Lock size={15} className="text-indigo-400" /> Alterar Senha
              </h2>
              <p className="text-xs text-gray-500">Deixe em branco para manter a senha atual.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input id="senha_atual" label="Senha Atual" type="password" value={form.senha_atual} onChange={(e) => set('senha_atual', e.target.value)} error={erros.senha_atual} />
                <Input id="nova_senha" label="Nova Senha" type="password" value={form.nova_senha} onChange={(e) => set('nova_senha', e.target.value)} error={erros.nova_senha} />
                <Input id="confirmar_senha" label="Confirmar Nova Senha" type="password" value={form.confirmar_senha} onChange={(e) => set('confirmar_senha', e.target.value)} error={erros.confirmar_senha} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500 flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> Seus dados são protegidos e usados apenas na locação.</p>
              <Button type="submit" loading={salvando}>
                <Save size={16} /> Salvar Alterações
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
