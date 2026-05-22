import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFeed, getExplore, publicarTweet, uploadImagem } from '../services/api';
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
  const [ficheiroImagem, setFicheiroImagem] = useState(null);
  const [previewImagem, setPreviewImagem] = useState('');
  const [publicando, setPublicando] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleSelecionarFicheiro = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFicheiroImagem(file);
    setPreviewImagem(URL.createObjectURL(file));
  };

  const removerImagem = () => {
    setFicheiroImagem(null);
    setPreviewImagem('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePublicar = async (e) => {
    e.preventDefault();
    if (!conteudo.trim()) return;
    setPublicando(true);
    try {
      let imagem_url = undefined;

      if (ficheiroImagem) {
        const formData = new FormData();
        formData.append('imagem', ficheiroImagem);
        const { data: uploadData } = await uploadImagem(formData);
        imagem_url = uploadData.imagem_url;
      }

      const { data: novoTweet } = await publicarTweet({ conteudo: conteudo.trim(), imagem_url });
      setTweets(prev => [novoTweet, ...prev]);
      setConteudo('');
      removerImagem();
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleSelecionarFicheiro}
            />
            {previewImagem && (
              <div style={{ position: 'relative', marginTop: 8, display: 'inline-block' }}>
                <img
                  src={previewImagem}
                  alt="preview"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, display: 'block' }}
                />
                <button
                  onClick={removerImagem}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    background: 'rgba(0,0,0,0.6)', border: 'none',
                    borderRadius: '50%', color: '#fff',
                    width: 24, height: 24, cursor: 'pointer', fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Remover imagem"
                >×</button>
              </div>
            )}
            <div className="tweet-actions">
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="tweet-action-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Adicionar imagem"
                  type="button"
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
