import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleGosto, apagarTweet, adminEditarTweet } from '../services/api';
import { IconHeart, IconEdit, IconDelete } from './Icons';

function formatarData(dataStr) {
  const data = new Date(dataStr);
  const agora = new Date();
  const diff = (agora - data) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return data.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
}

export default function TweetCard({ tweet, onApagado, onAtualizar }) {
  const { utilizador } = useAuth();
  const navigate = useNavigate();
  const [gostos, setGostos] = useState(Number(tweet.total_gostos) || 0);
  const [euGostei, setEuGostei] = useState(Boolean(tweet.eu_gostei));
  const [apagando, setApagando] = useState(false);

  const handleGosto = async (e) => {
    e.stopPropagation();
    try {
      const { data } = await toggleGosto(tweet.tweet_id);
      setEuGostei(data.gostou);
      setGostos(prev => data.gostou ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Erro ao dar gosto:', err);
    }
  };

  const handleEditar = async (e) => {
    e.stopPropagation();
    const novoConteudo = window.prompt('Editar conteúdo do tweet:', tweet.conteudo);
    if (novoConteudo === null) return;
    const novaImagem = window.prompt('Editar URL da imagem (deixe em branco para remover):', tweet.imagem_url || '');
    try {
      const { data } = await adminEditarTweet(tweet.tweet_id, {
        conteudo: novoConteudo,
        imagem_url: novaImagem.trim() || null
      });
      onAtualizar?.(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao editar tweet.');
    }
  };

  const handleApagar = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Tens a certeza que queres apagar este tweet?')) return;
    setApagando(true);
    try {
      await apagarTweet(tweet.tweet_id);
      onApagado?.(tweet.tweet_id);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao apagar.');
      setApagando(false);
    }
  };

  const podeEditar = utilizador?.utilizador_id === tweet.utilizador_id || utilizador?.is_admin === 1;
  const podeApagar = utilizador?.utilizador_id === tweet.utilizador_id || utilizador?.is_admin === 1;

  return (
    <article className="tweet-card" onClick={() => navigate(`/perfil/${tweet.username}`)}>
      <div className="avatar" onClick={e => { e.stopPropagation(); navigate(`/perfil/${tweet.username}`); }}>
        {tweet.foto_perfil
          ? <img src={tweet.foto_perfil} alt={tweet.username} />
          : tweet.username?.[0]?.toUpperCase()}
      </div>

      <div className="tweet-body">
        <div className="tweet-header">
          <span className="tweet-username" onClick={e => { e.stopPropagation(); navigate(`/perfil/${tweet.username}`); }}>
            {tweet.username}
          </span>
          <span className="tweet-handle">@{tweet.username}</span>
          <span className="tweet-time">· {formatarData(tweet.data_publicacao)}</span>
        </div>

        <p className="tweet-text">{tweet.conteudo}</p>

        {tweet.imagem_url && (
          <img
            src={tweet.imagem_url}
            alt="Imagem do tweet"
            className="tweet-img"
            onClick={e => e.stopPropagation()}
          />
        )}

        <div className="tweet-footer">
          <button
            className={`tweet-action-btn ${euGostei ? 'liked' : ''}`}
            onClick={handleGosto}
            title={euGostei ? 'Retirar gosto' : 'Dar gosto'}
          >
            <IconHeart size={18} filled={euGostei} />
            {gostos > 0 && <span>{gostos}</span>}
          </button>

          {podeEditar && (
            <button className="tweet-action-btn" onClick={handleEditar} title="Editar tweet">
              <IconEdit size={18} />
            </button>
          )}

          {podeApagar && (
            <button className="tweet-action-btn delete" onClick={handleApagar} disabled={apagando} title="Apagar tweet">
              <IconDelete size={18} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
