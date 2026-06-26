import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, ArrowLeft, KeyRound, Copy, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authService } from '../../services/authService';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null);
  const [copiado, setCopiado] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setErro('Informe seu e-mail.'); return; }
    setLoading(true);
    setErro('');
    try {
      const data = await authService.recuperarSenha(email);
      setResultado(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  const linkCompleto = resultado ? `${window.location.origin}${resultado.link_redefinicao}` : '';

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
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
            <KeyRound size={22} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Recuperar senha</h1>
          <p className="text-gray-400 text-sm mt-1 mb-6">Informe o e-mail da sua conta e geraremos um link de redefinição.</p>

          {!resultado ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {erro && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{erro}</div>
              )}
              <Input id="email" label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" fullWidth size="lg" loading={loading}>
                <Mail size={16} /> Enviar link de redefinição
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
                <CheckCircle size={18} className="mt-0.5 shrink-0" />
                <p>{resultado.mensagem}</p>
              </div>
              {/* Simulação do e-mail: em produção o link iria para a caixa de entrada */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Link de redefinição (simulação de e-mail)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-indigo-300 break-all bg-black/30 rounded-lg px-3 py-2">{linkCompleto}</code>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard?.writeText(linkCompleto); setCopiado(true); setTimeout(() => setCopiado(false), 1500); }}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    title="Copiar"
                  >
                    {copiado ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <Link to={resultado.link_redefinicao}>
                <Button fullWidth size="lg"><KeyRound size={16} /> Redefinir senha agora</Button>
              </Link>
            </div>
          )}

          <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
