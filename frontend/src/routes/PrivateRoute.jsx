import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/ui/Spinner';

export function PrivateRoute() {
  const { isAutenticado, carregando } = useAuth();
  if (carregando) return <Spinner fullPage />;
  return isAutenticado ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const { isAdmin, isAutenticado, carregando } = useAuth();
  if (carregando) return <Spinner fullPage />;
  if (!isAutenticado) return <Navigate to="/login" replace />;
  return isAdmin ? <Outlet /> : <Navigate to="/frota" replace />;
}

export function ClienteRoute() {
  const { isCliente, isAdmin, isAutenticado, carregando } = useAuth();
  if (carregando) return <Spinner fullPage />;
  if (!isAutenticado) return <Navigate to="/login" replace />;
  // Admin também pode acessar rotas cliente
  return isCliente || isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
