import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleGosto, apagarTweet, adminEditarTweet, getComentarios, criarComentario, apagarComentario } from '../services/api';
import { IconHeart, IconEdit, IconDelete, IconComment } from './Icons';

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

  // comentários
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [totalComentarios, setTotalComentarios] = useState(Number(tweet.total_comentarios) || 0);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [carregandoCom, setCarregandoCom] = useState(false);

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

  const toggleComentarios = async (e) => {
    e.stopPropagation();
    if (!mostrarComentarios && comentarios.length === 0) {
      setCarregandoCom(true);
      try {
        const { data } = await getComentarios(tweet.tweet_id);
        setComentarios(data);
      } catch (err) {
        console.error('Erro ao carregar comentários:', err);
      } finally {
        setCarregandoCom(false);
      }
    }
    setMostrarComentarios(prev => !prev);
  };

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;
    setEnviando(true);
    try {
      const { data } = await criarComentario(tweet.tweet_id, novoComentario.trim());
      setComentarios(prev => [data, ...prev]);
      setTotalComentarios(prev => prev + 1);
      setNovoComentario('');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao comentar.');
    } finally {
      setEnviando(false);
    }
  };

  const handleApagarComentario = async (cid) => {
    if (!window.confirm('Apagar este comentário?')) return;
    try {
      await apagarComentario(tweet.tweet_id, cid);
      setComentarios(prev => prev.filter(c => c.comentario_id !== cid));
      setTotalComentarios(prev => prev - 1);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao apagar.');
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

          <button
            className={`tweet-action-btn ${mostrarComentarios ? 'active' : ''}`}
            onClick={toggleComentarios}
            title="Comentários"
          >
            <IconComment size={18} />
            {totalComentarios > 0 && <span>{totalComentarios}</span>}
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

        {mostrarComentarios && (
          <div className="comentarios-section" onClick={e => e.stopPropagation()}>
            <form className="comentario-form" onSubmit={handleEnviarComentario}>
              <input
                type="text"
                className="comentario-input"
                placeholder="Escreve um comentário..."
                value={novoComentario}
                onChange={e => setNovoComentario(e.target.value)}
                maxLength={280}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={enviando || !novoComentario.trim()}
                style={{ padding: '6px 14px', fontSize: 13 }}
              >
                {enviando ? '...' : 'Enviar'}
              </button>
            </form>

            {carregandoCom ? (
              <div className="spinner" style={{ margin: '12px auto', width: 20, height: 20 }} />
            ) : comentarios.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, padding: '8px 0' }}>
                Sem comentários. Sê o primeiro!
              </p>
            ) : (
              comentarios.map(c => (
                <div key={c.comentario_id} className="comentario-item">
                  <div
                    className="avatar"
                    style={{ width: 28, height: 28, fontSize: 12, flexShrink: 0, cursor: 'pointer' }}
                    onClick={() => navigate(`/perfil/${c.Utilizador?.username}`)}
                  >
                    {c.Utilizador?.foto_perfil
                      ? <img src={c.Utilizador.foto_perfil} alt={c.Utilizador.username} />
                      : c.Utilizador?.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="comentario-body">
                    <span
                      className="tweet-username"
                      style={{ fontSize: 13, cursor: 'pointer' }}
                      onClick={() => navigate(`/perfil/${c.Utilizador?.username}`)}
                    >
                      {c.Utilizador?.username}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 12, marginLeft: 6 }}>
                      {formatarData(c.data_criacao)}
                    </span>
                    <p style={{ margin: '2px 0 0', fontSize: 14 }}>{c.conteudo}</p>
                  </div>
                  {(utilizador?.utilizador_id === c.utilizador_id || utilizador?.is_admin === 1) && (
                    <button
                      className="tweet-action-btn delete"
                      style={{ marginLeft: 'auto', padding: 4 }}
                      onClick={() => handleApagarComentario(c.comentario_id)}
                      title="Apagar comentário"
                    >
                      <IconDelete size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </article>
  );
}
