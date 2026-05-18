// src/pages/Feed.js — Feed principal e página de explorar
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFeed, getExplore, publicarTweet } from '../services/api';
import TweetCard from '../components/TweetCard';
import { IconImage } from '../components/Icons';

export default function Feed({ tipo }) {
  const { utilizador } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const q = new URLSearchParams(location.search).get('q') || '';
  const [tweets, setTweets] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [conteudo, setConteudo] = useState('');
  const [imagem_url, setImagemUrl] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [mostrarImagem, setMostrarImagem] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    carregarTweets();
  }, [tipo, q]);

  const carregarTweets = async () => {
    setCarregando(true);
    try {
      const { data } = tipo === 'feed' ? await getFeed() : await getExplore(1, q);
      setTweets(data);
    } catch (err) {
      console.error('Erro ao carregar tweets:', err);
    } finally {
      setCarregando(false);
    }
  };

  const handlePublicar = async (e) => {
    e.preventDefault();
    if (!conteudo.trim()) return;
    setPublicando(true);
    try {
      const { data: novoTweet } = await publicarTweet({
        conteudo: conteudo.trim(),
        imagem_url: imagem_url.trim() || undefined
      });
      setTweets(prev => [novoTweet, ...prev]);
      setConteudo('');
      setImagemUrl('');
      setMostrarImagem(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao publicar tweet.');
    } finally {
      setPublicando(false);
    }
  };

  const handleApagado = (id) => {
    setTweets(prev => prev.filter(t => t.tweet_id !== id));
  };

  const handleAtualizar = (tweetAtualizado) => {
    setTweets(prev => prev.map(t => t.tweet_id === tweetAtualizado.tweet_id ? tweetAtualizado : t));
  };

  const restantes = 280 - conteudo.length;
  const inicial = utilizador?.username?.[0]?.toUpperCase() || '?';

  return (
    <>
      <div className="page-header">
        <h2>{tipo === 'explorar' && q ? `"${q}"` : 'Início'}</h2>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${tipo === 'feed' ? 'active' : ''}`}
          onClick={() => navigate('/feed')}
        >
          A Seguir
        </button>
        <button
          className={`tab-btn ${tipo === 'explorar' ? 'active' : ''}`}
          onClick={() => navigate('/explorar')}
        >
          Explorar
        </button>
      </div>

      {/* ── Caixa de novo tweet (só no feed) ── */}
      {tipo === 'feed' && (
        <div className="new-tweet-box">
          <div className="avatar">{inicial}</div>
          <div className="tweet-input-area">
            <textarea
              ref={textareaRef}
              className="tweet-textarea"
              placeholder="O que se passa?"
              value={conteudo}
              onChange={e => setConteudo(e.target.value)}
              rows={3}
              maxLength={280}
            />
            {mostrarImagem && (
              <div className="form-group" style={{ marginTop: 8 }}>
                <input
                  type="url"
                  placeholder="URL da imagem (https://...)"
                  value={imagem_url}
                  onChange={e => setImagemUrl(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font)',
                    fontSize: 14
                  }}
                />
              </div>
            )}
            <div className="tweet-actions">
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="tweet-action-btn"
                  onClick={() => setMostrarImagem(!mostrarImagem)}
                  title="Adicionar imagem"
                >
                  <IconImage size={20} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span className={`char-count ${restantes < 20 ? 'warning' : ''} ${restantes < 0 ? 'danger' : ''}`}>
                  {restantes}
                </span>
                <button
                  className="btn-primary"
                  onClick={handlePublicar}
                  disabled={publicando || !conteudo.trim() || conteudo.length > 280}
                  style={{ padding: '8px 20px' }}
                >
                  {publicando ? 'A publicar...' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Lista de tweets ── */}
      {carregando ? (
        <div className="spinner" />
      ) : tweets.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
          {tipo === 'feed'
            ? 'Ainda não há tweets no teu feed. Segue alguém!'
            : 'Não há tweets para mostrar.'}
        </div>
      ) : (
        tweets.map(tweet => (
          <TweetCard
            key={tweet.tweet_id}
            tweet={tweet}
            onApagado={handleApagado}
            onAtualizar={handleAtualizar}
          />
        ))
      )}
    </>
  );
}
