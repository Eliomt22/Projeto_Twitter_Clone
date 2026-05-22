import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, registar as apiRegistar, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilizador, setUtilizador] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('utilizador');
    if (token && userData) {
      setUtilizador(JSON.parse(userData));
    }
    setCarregando(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await apiLogin({ username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('utilizador', JSON.stringify(data.utilizador));
    setUtilizador(data.utilizador);
    return data;
  };

  const registar = async (dados) => {
    const { data } = await apiRegistar(dados);
    localStorage.setItem('token', data.token);
    localStorage.setItem('utilizador', JSON.stringify(data.utilizador));
    setUtilizador(data.utilizador);
    return data;
  };

  const logout = async () => {
    try { await apiLogout(); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('utilizador');
    setUtilizador(null);
  };

  return (
    <AuthContext.Provider value={{ utilizador, login, registar, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
