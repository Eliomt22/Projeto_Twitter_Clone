// src/pages/Perfil.js — Página de perfil de utilizador
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPerfil, getTweetsUtilizador, toggleSeguir } from '../services/api';
import TweetCard from '../components/TweetCard';

export default function Perfil() {
  const { username } = useParams();
  const { utilizador: eu } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [seguindo, setSeguindo] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, [username]);

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

  const handleSeguir = async () => {
    try {
      const { data } = await toggleSeguir(perfil.utilizador_id);
      setSeguindo(data.a_seguir);
      setPerfil(prev => ({
        ...prev,
        total_seguidores: data.a_seguir
          ? prev.total_seguidores + 1
          : prev.total_seguidores - 1
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao seguir.');
    }
  };

  const handleApagado = (id) => {
    setTweets(prev => prev.filter(t => t.tweet_id !== id));
  };

  if (carregando) return <div className="spinner" />;
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
          <div><strong>{perfil.total_seguindo}</strong> <span>A seguir</span></div>
          <div><strong>{perfil.total_seguidores}</strong> <span>Seguidores</span></div>
          <div><strong>{perfil.total_tweets}</strong> <span>Tweets</span></div>
        </div>
      </div>

      {tweets.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Este utilizador ainda não publicou nenhum tweet.
        </div>
      ) : (
        tweets.map(tweet => (
          <TweetCard
            key={tweet.tweet_id}
            tweet={tweet}
            onApagado={handleApagado}
          />
        ))
      )}
    </>
  );
}
