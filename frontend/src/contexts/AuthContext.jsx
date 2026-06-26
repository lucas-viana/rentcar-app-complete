import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const user = authService.getUsuarioLogado();
    if (user) setUsuario(user);
    setCarregando(false);
  }, []);

  async function login(email, senha) {
    const { token, usuario: user } = await authService.login(email, senha);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setUsuario(user);
    return user;
  }

  function logout() {
    authService.logout();
    setUsuario(null);
  }

  // Atualiza o usuário em memória e no localStorage (ex.: após editar o perfil)
  function atualizarUsuario(novoUsuario) {
    localStorage.setItem('auth_user', JSON.stringify(novoUsuario));
    setUsuario(novoUsuario);
  }

  const isAdmin = usuario?.tipo === 'admin';
  const isCliente = usuario?.tipo === 'cliente';
  const isAutenticado = !!usuario;

  return (
    <AuthContext.Provider value={{ usuario, login, logout, atualizarUsuario, isAdmin, isCliente, isAutenticado, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
