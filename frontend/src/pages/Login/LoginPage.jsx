import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff, LogIn, Shield, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const DEMO_ACCOUNTS = [
  {
    label: 'Admin',
    email: 'admin@rental.com',
    senha: 'admin123',
    icon: Shield,
    color: 'from-indigo-600 to-purple-600',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  },
  {
    label: 'Cliente',
    email: 'cliente@rental.com',
    senha: 'cliente123',
    icon: User,
    color: 'from-amber-500 to-orange-500',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function preencherDemo(account) {
    setEmail(account.email);
    setSenha(account.senha);
    setErros({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const novosErros = {};
    if (!email.trim()) novosErros.email = 'E-mail é obrigatório.';
    if (!senha.trim()) novosErros.senha = 'Senha é obrigatória.';
    if (Object.keys(novosErros).length > 0) { setErros(novosErros); return; }

    setLoading(true);
    setErros({});
    try {
      const user = await login(email, senha);
      navigate(user.tipo === 'admin' ? '/dashboard' : '/frota', { replace: true });
    } catch (err) {
      setErros({ geral: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 p-12 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <Car size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">RentCar</h1>
              <p className="text-xs text-indigo-400 font-medium">Sistema de Locação</p>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Gerencie sua<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                frota com inteligência
              </span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              Plataforma completa para locadoras de veículos. Controle de frota, reservas e clientes em um só lugar.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2">
            {['Frota em tempo real', 'Gestão de clientes', 'Histórico completo', 'Multi-perfil'].map((f) => (
              <span key={f} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 font-medium">
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-gray-600">
          © 2025 RentCar — Projeto Acadêmico SCBIT
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Car size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">RentCar</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Bem-vindo de volta!</h2>
            <p className="text-gray-400 mt-1 text-sm">Acesse sua conta para continuar.</p>
          </div>

          {/* Demo Account Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => preencherDemo(acc)}
                className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all duration-200 hover:scale-105
                  ${acc.badgeColor} border-current/30 hover:brightness-110`}
              >
                <div className={`w-8 h-8 bg-gradient-to-br ${acc.color} rounded-lg flex items-center justify-center`}>
                  <acc.icon size={15} className="text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold">{acc.label}</p>
                  <p className="text-[10px] opacity-70">{acc.email}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">ou entre com suas credenciais</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {erros.geral && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {erros.geral}
              </div>
            )}

            <Input
              id="email"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={erros.email}
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="senha" className="text-sm font-medium text-gray-300">
                Senha <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={showSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="current-password"
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm
                    transition-all duration-200 outline-none focus:bg-white/8 focus:ring-1
                    ${erros.senha
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {erros.senha && <p className="text-xs text-red-400">{erros.senha}</p>}
            </div>

            <div className="flex justify-end -mt-1">
              <Link to="/recuperar-senha" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Esqueci minha senha
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              <LogIn size={17} />
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-600">
            Sistema de uso interno — RentCar © 2025
          </p>
        </div>
      </div>
    </div>
  );
}
