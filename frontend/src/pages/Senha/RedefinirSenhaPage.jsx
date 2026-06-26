import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Car, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authService } from '../../services/authService';

export default function RedefinirSenhaPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const erro = {};
    if (!novaSenha) erro.novaSenha = 'Informe a nova senha.';
    else if (novaSenha.length < 6) erro.novaSenha = 'Mínimo de 6 caracteres.';
    if (novaSenha !== confirmar) erro.confirmar = 'As senhas não coincidem.';
    if (Object.keys(erro).length > 0) { setErros(erro); return; }

    setLoading(true);
    try {
      await authService.redefinirSenha(token, novaSenha);
      setOk(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setErros({ geral: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Car size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">RentCar</span>
        </div>

        <div className="p-8 rounded-2xl bg-gray-900/60 border border-white/10">
          {ok ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Senha redefinida!</h1>
              <p className="text-gray-400 text-sm mt-1">Redirecionando para o login...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                <Lock size={22} className="text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Nova senha</h1>
              <p className="text-gray-400 text-sm mt-1 mb-6">Defina uma nova senha para sua conta.</p>

              {!token && (
                <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm mb-4">
                  Token ausente. Use o link enviado para o seu e-mail.
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {erros.geral && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{erros.geral}</div>
                )}
                <Input id="nova_senha" label="Nova Senha" type="password" placeholder="••••••••" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} error={erros.novaSenha} required />
                <Input id="confirmar" label="Confirmar Senha" type="password" placeholder="••••••••" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} error={erros.confirmar} required />
                <Button type="submit" fullWidth size="lg" loading={loading} disabled={!token}>
                  <Lock size={16} /> Redefinir senha
                </Button>
              </form>
            </>
          )}

          <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
