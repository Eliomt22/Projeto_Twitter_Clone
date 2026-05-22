import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPerfil, getTweetsUtilizador, toggleSeguir, getSeguindo, getSeguidores } from '../services/api';
import TweetCard from '../components/TweetCard';

function ModalLista({ titulo, lista, carregando, onFechar, onSeguir }) {
  const navigate = useNavigate();

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{titulo}</h3>
          <button className="modal-close" onClick={onFechar}>✕</button>
        </div>
        <div className="modal-body">
          {carregando ? (
            <div className="spinner" />
          ) : lista.length === 0 ? (
            <div className="modal-empty">Nenhum utilizador para mostrar.</div>
          ) : (
            lista.map(u => (
              <div key={u.utilizador_id} className="modal-user">
                <div
                  className="modal-user-info"
                  onClick={() => { onFechar(); navigate(`/perfil/${u.username}`); }}
                >
                  <div className="avatar" style={{ width: 42, height: 42, fontSize: 16, cursor: 'pointer' }}>
                    {u.foto_perfil
                      ? <img src={u.foto_perfil} alt={u.username} />
                      : u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="modal-username">@{u.username}</div>
                    {u.bio && <div className="modal-bio">{u.bio}</div>}
                  </div>
                </div>
                <button
                  className={u.eu_sigo ? 'btn-outline' : 'btn-primary'}
                  style={{ padding: '6px 16px', fontSize: 13 }}
                  onClick={() => onSeguir(u)}
                >
                  {u.eu_sigo ? 'A seguir' : 'Seguir'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Perfil() {
  const { username } = useParams();
  const { utilizador: eu } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [seguindo, setSeguindo] = useState(false);

  const [modal, setModal] = useState(null); // 'seguindo' | 'seguidores' | null
  const [listaModal, setListaModal] = useState([]);
  const [carregandoModal, setCarregandoModal] = useState(false);

  useEffect(() => { carregarPerfil(); }, [username]);

  const carregarPerfil = async () => {
    setCarregando(true);
    try {
      const [{ data: p }, { data: t }] = await Promise.all([
        getPerfil(username),
        getTweetsUtilizador(username)
      ]);
      setPerfil(p);
      setTweets(t);
      setSeguindo(Boolean(p.eu_sigo));
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setCarregando(false);
    }
  };

  const abrirModal = async (tipo) => {
    setModal(tipo);
    setCarregandoModal(true);
    try {
      const { data } = tipo === 'seguindo'
        ? await getSeguindo(username)
        : await getSeguidores(username);
      setListaModal(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregandoModal(false);
    }
  };

  const handleSeguirModal = async (u) => {
    try {
      const { data } = await toggleSeguir(u.utilizador_id);
      setListaModal(prev => prev.map(x =>
        x.utilizador_id === u.utilizador_id ? { ...x, eu_sigo: data.a_seguir ? 1 : 0 } : x
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeguir = async () => {
    try {
      const { data } = await toggleSeguir(perfil.utilizador_id);
      setSeguindo(data.a_seguir);
      setPerfil(prev => ({
        ...prev,
        total_seguidores: data.a_seguir ? prev.total_seguidores + 1 : prev.total_seguidores - 1
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao seguir.');
    }
  };

  const handleApagado = (id) => setTweets(prev => prev.filter(t => t.tweet_id !== id));

  if (carregando) return <div className="spinner" style={{ marginTop: 40 }} />;
  if (!perfil) return <div style={{ padding: 32, color: 'var(--text-secondary)' }}>Utilizador não encontrado.</div>;

  const inicial = perfil.username?.[0]?.toUpperCase();
  const eSouEu = eu?.utilizador_id === perfil.utilizador_id;

  return (
    <>
      <div className="page-header">
        <h2>{perfil.username}</h2>
      </div>

      <div className="profile-header">
        <div className="profile-top">
          <div className="avatar lg">
            {perfil.foto_perfil
              ? <img src={perfil.foto_perfil} alt={perfil.username} />
              : inicial}
          </div>
          {!eSouEu && (
            <button
              className={seguindo ? 'btn-outline' : 'btn-primary'}
              onClick={handleSeguir}
              style={{ padding: '8px 20px' }}
            >
              {seguindo ? 'A seguir' : 'Seguir'}
            </button>
          )}
        </div>

        <div className="profile-name">{perfil.username}</div>
        <div className="profile-handle">@{perfil.username}</div>
        {perfil.bio && <p className="profile-bio">{perfil.bio}</p>}

        <div className="profile-stats">
          <div className="profile-stat-btn" onClick={() => abrirModal('seguindo')}>
            <strong>{perfil.total_seguindo}</strong> <span>A seguir</span>
          </div>
          <div className="profile-stat-btn" onClick={() => abrirModal('seguidores')}>
            <strong>{perfil.total_seguidores}</strong> <span>Seguidores</span>
          </div>
          <div>
            <strong>{perfil.total_tweets}</strong> <span>Tweets</span>
          </div>
        </div>
      </div>

      {tweets.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Este utilizador ainda não publicou nenhum tweet.
        </div>
      ) : (
        tweets.map(tweet => (
          <TweetCard key={tweet.tweet_id} tweet={tweet} onApagado={handleApagado} />
        ))
      )}

      {modal && (
        <ModalLista
          titulo={modal === 'seguindo' ? 'A seguir' : 'Seguidores'}
          lista={listaModal}
          carregando={carregandoModal}
          onFechar={() => setModal(null)}
          onSeguir={handleSeguirModal}
        />
      )}
    </>
  );
}
