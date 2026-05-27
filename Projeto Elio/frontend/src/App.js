import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registo from './pages/Registo';
import Feed from './pages/Feed';
import Perfil from './pages/Perfil';
import Admin from './pages/Admin';
import Layout from './components/Layout';
import './App.css';

function RotaProtegida({ children }) {
  const { utilizador, carregando } = useAuth();
  if (carregando) return <div className="loading">A carregar...</div>;
  return utilizador ? children : <Navigate to="/login" replace />;
}

function RotaAdmin({ children }) {
  const { utilizador } = useAuth();
  if (!utilizador?.is_admin) return <Navigate to="/feed" replace />;
  return children;
}

function AppRoutes() {
  const { utilizador } = useAuth();

  return (
    <Routes>
      <Route path="/"        element={utilizador ? <Navigate to="/feed" /> : <Landing />} />
      <Route path="/login"   element={utilizador ? <Navigate to="/feed" /> : <Login />} />
      <Route path="/registo" element={utilizador ? <Navigate to="/feed" /> : <Registo />} />

      <Route path="/" element={<RotaProtegida><Layout /></RotaProtegida>}>
        <Route path="feed"             element={<Feed tipo="feed" />} />
        <Route path="explorar"         element={<Feed tipo="explorar" />} />
        <Route path="perfil/:username" element={<Perfil />} />
        <Route path="admin"            element={<RotaAdmin><Admin /></RotaAdmin>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
