import { Link } from 'react-router-dom';
import { Car, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function NotFoundPage() {
  const { isAdmin } = useAuth();
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <p className="text-[120px] font-black text-white/5 leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl flex items-center justify-center">
              <Car size={36} className="text-indigo-400" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Página não encontrada</h1>
        <p className="text-gray-400 text-sm mb-8">A rota que você acessou não existe ou foi removida.</p>
        <Link
          to={isAdmin ? '/dashboard' : '/frota'}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold text-sm hover:from-indigo-500 hover:to-indigo-400 transition-all shadow-lg shadow-indigo-500/25"
        >
          <Home size={16} /> Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
