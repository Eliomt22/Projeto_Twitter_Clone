import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import RightPanel from './RightPanel';
import {
  IconHome, IconExplore, IconProfile, IconAdmin,
  IconSun, IconMoon, IconLogout
} from './Icons';

export default function Layout() {
  const { utilizador, logout } = useAuth();
  const { tema, alternarTema } = useTheme();
  const navigate = useNavigate();

  const inicial = utilizador?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="layout">
      {/* ── Sidebar esquerda ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">𝕏</div>

        <nav className="sidebar-nav">
          <NavLink to="/feed" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><IconHome size={22} /></span>
            <span className="nav-label">Início</span>
          </NavLink>

          <NavLink to="/explorar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><IconExplore size={22} /></span>
            <span className="nav-label">Explorar</span>
          </NavLink>

          <NavLink
            to={`/perfil/${utilizador?.username}`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><IconProfile size={22} /></span>
            <span className="nav-label">Perfil</span>
          </NavLink>

          {utilizador?.is_admin === 1 && (
            <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon"><IconAdmin size={22} /></span>
              <span className="nav-label">Admin</span>
            </NavLink>
          )}

          <button className="nav-item" onClick={alternarTema}>
            <span className="nav-icon">{tema === 'escuro' ? <IconSun size={22} /> : <IconMoon size={22} />}</span>
            <span className="nav-label">{tema === 'escuro' ? 'Tema Claro' : 'Tema Escuro'}</span>
          </button>
        </nav>

        <div className="sidebar-tweet-btn">
          <button className="btn-primary" style={{ width: '100%', padding: '12px' }} onClick={() => navigate('/feed')}>
            Tweetar
          </button>
        </div>

        <div className="sidebar-user" onClick={logout} title="Clica para sair">
          <div className="avatar">
            {utilizador?.foto_perfil
              ? <img src={utilizador.foto_perfil} alt={utilizador.username} />
              : inicial}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{utilizador?.username}</div>
            <div className="sidebar-user-handle">@{utilizador?.username}</div>
          </div>
          <IconLogout size={16} />
        </div>
      </aside>

      {/* ── Conteúdo principal ── */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* ── Painel direito ── */}
      <RightPanel />
    </div>
  );
}
