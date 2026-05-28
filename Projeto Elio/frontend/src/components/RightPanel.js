import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSugestoes, toggleSeguir } from '../services/api';
import { IconExplore } from './Icons';

export default function RightPanel() {
  const [sugestoes, setSugestoes] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getSugestoes()
      .then(({ data }) => setSugestoes(data))
      .catch(() => {});
  }, []);

  const handleSeguir = async (u) => {
    try {
      await toggleSeguir(u.utilizador_id);
      setSugestoes(prev => prev.filter(s => s.utilizador_id !== u.utilizador_id));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePesquisa = (e) => {
    e.preventDefault();
    if (pesquisa.trim()) navigate(`/explorar?q=${encodeURIComponent(pesquisa.trim())}`);
    else navigate('/explorar');
  };

  return (
    <aside className="right-panel">
      <form className="search-bar" onSubmit={handlePesquisa}>
        <span className="search-icon"><IconExplore size={16} /></span>
        <input
          type="text"
          placeholder="Pesquisar"
          value={pesquisa}
          onChange={e => setPesquisa(e.target.value)}
        />
      </form>

      {sugestoes.length > 0 && (
        <div className="rp-card">
          <h3 className="rp-title">Quem seguir</h3>
          {sugestoes.map(u => (
            <div key={u.utilizador_id} className="rp-user">
              <div
                className="rp-user-info"
                onClick={() => navigate(`/perfil/${u.username}`)}
              >
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                  {u.foto_perfil
                    ? <img src={u.foto_perfil} alt={u.username} />
                    : u.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="rp-username">@{u.username}</div>
                  {u.bio && <div className="rp-bio">{u.bio}</div>}
                </div>
              </div>
              <button className="rp-follow-btn" onClick={() => handleSeguir(u)}>
                Seguir
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rp-footer">
        © 2026 Twitter Clone · SGBD I
      </div>
    </aside>
  );
}
