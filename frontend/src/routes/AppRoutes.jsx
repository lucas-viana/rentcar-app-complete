import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute, AdminRoute, ClienteRoute } from './PrivateRoute';
import { useAuth } from '../contexts/AuthContext';

// Pages
import LoginPage from '../pages/Login/LoginPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import VeiculosPage from '../pages/Veiculos/VeiculosPage';
import VeiculoFormPage from '../pages/Veiculos/VeiculoFormPage';
import VeiculoDetalhesPage from '../pages/Veiculos/VeiculoDetalhesPage';
import UsuariosPage from '../pages/Usuarios/UsuariosPage';
import UsuarioFormPage from '../pages/Usuarios/UsuarioFormPage';
import AlugueisPage from '../pages/Alugueis/AlugueisPage';
import AluguelFormPage from '../pages/Alugueis/AluguelFormPage';
import FrotaClientePage from '../pages/Frota/FrotaClientePage';
import ReservaFluxoPage from '../pages/Reserva/ReservaFluxoPage';
import MeusAlugueisPage from '../pages/MeusAlugueis/MeusAlugueisPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';

function HomeRedirect() {
  const { isAdmin, isCliente, isAutenticado } = useAuth();
  if (!isAutenticado) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/dashboard' : '/frota'} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomeRedirect />} />

      {/* ADMIN Only */}
      <Route element={<AdminRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/veiculos" element={<VeiculosPage />} />
        <Route path="/veiculos/novo" element={<VeiculoFormPage />} />
        <Route path="/veiculos/:id/editar" element={<VeiculoFormPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/usuarios/novo" element={<UsuarioFormPage />} />
        <Route path="/usuarios/:id/editar" element={<UsuarioFormPage />} />
        <Route path="/alugueis" element={<AlugueisPage />} />
        <Route path="/alugueis/novo" element={<AluguelFormPage />} />
      </Route>

      {/* Client + Admin (shared) */}
      <Route element={<ClienteRoute />}>
        <Route path="/frota" element={<FrotaClientePage />} />
        <Route path="/veiculos/:id" element={<VeiculoDetalhesPage />} />
        <Route path="/reservar/:id" element={<ReservaFluxoPage />} />
        <Route path="/meus-alugueis" element={<MeusAlugueisPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
