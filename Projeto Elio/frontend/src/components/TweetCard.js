import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleGosto, apagarTweet, editarTweet, adminEditarTweet, uploadImagem, getComentarios, criarComentario, apagarComentario } from '../services/api';
import { IconHeart, IconEdit, IconDelete, IconComment, IconImage } from './Icons';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
const getImgUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

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

  // apagar tweet
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const [apagando, setApagando] = useState(false);

  // editar tweet
  const [editando, setEditando] = useState(false);
  const [editConteudo, setEditConteudo] = useState(tweet.conteudo);
  const [editImagem, setEditImagem] = useState(tweet.imagem_url || null);
  const [editFicheiro, setEditFicheiro] = useState(null);
  const [editPreview, setEditPreview] = useState(tweet.imagem_url || null);
  const [guardando, setGuardando] = useState(false);
  const editFileRef = useRef(null);

  // comentários
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [totalComentarios, setTotalComentarios] = useState(Number(tweet.total_comentarios) || 0);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [carregandoCom, setCarregandoCom] = useState(false);
  const [confirmarApagarCom, setConfirmarApagarCom] = useState(null);

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

  const handleSelecionarImagemEdit = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditFicheiro(file);
    setEditPreview(URL.createObjectURL(file));
  };

  const handleRemoverImagemEdit = (e) => {
    e.stopPropagation();
    setEditFicheiro(null);
    setEditPreview(null);
    setEditImagem(null);
    if (editFileRef.current) editFileRef.current.value = '';
  };

  const handleGuardarEdicao = async (e) => {
    e.stopPropagation();
    if (!editConteudo.trim()) return;
    setGuardando(true);
    try {
      let imagem_url = editImagem;

      if (editFicheiro) {
        const formData = new FormData();
        formData.append('imagem', editFicheiro);
        const { data: uploadData } = await uploadImagem(formData);
        imagem_url = uploadData.imagem_url;
      }

      const fn = utilizador?.is_admin === 1 ? adminEditarTweet : editarTweet;
      const { data } = await fn(tweet.tweet_id, {
        conteudo: editConteudo.trim(),
        imagem_url: imagem_url || null
      });
      onAtualizar?.(data);
      setEditando(false);
      setEditFicheiro(null);
    } catch (err) {
      console.error('Erro ao editar:', err);
    } finally {
      setGuardando(false);
    }
  };

  const handleApagar = async (e) => {
    e.stopPropagation();
    setApagando(true);
    try {
      await apagarTweet(tweet.tweet_id);
      onApagado?.(tweet.tweet_id);
    } catch (err) {
      console.error('Erro ao apagar:', err);
      setApagando(false);
      setConfirmarApagar(false);
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
      console.error('Erro ao comentar:', err);
    } finally {
      setEnviando(false);
    }
  };

  const handleApagarComentario = async (cid) => {
    try {
      await apagarComentario(tweet.tweet_id, cid);
      setComentarios(prev => prev.filter(c => c.comentario_id !== cid));
      setTotalComentarios(prev => prev - 1);
      setConfirmarApagarCom(null);
    } catch (err) {
      console.error('Erro ao apagar comentário:', err);
    }
  };

  const podeEditar = utilizador?.utilizador_id === tweet.utilizador_id || utilizador?.is_admin === 1;
  const podeApagar = utilizador?.utilizador_id === tweet.utilizador_id || utilizador?.is_admin === 1;

  return (
    <article className="tweet-card" onClick={() => !editando && navigate(`/perfil/${tweet.username}`)}>
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

        {/* modo edição */}
        {editando ? (
          <div className="tweet-edit-box" onClick={e => e.stopPropagation()}>
            <textarea
              className="tweet-textarea"
              value={editConteudo}
              onChange={e => setEditConteudo(e.target.value)}
              maxLength={280}
              rows={3}
              autoFocus
            />

            {/* imagem atual / preview */}
            {editPreview && (
              <div style={{ position: 'relative', marginTop: 8, display: 'inline-block' }}>
                <img
                  src={editPreview}
                  alt="preview"
                  style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, display: 'block' }}
                />
                <button
                  onClick={handleRemoverImagemEdit}
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

            <input
              ref={editFileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleSelecionarImagemEdit}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
              <button
                className="tweet-action-btn"
                type="button"
                onClick={() => editFileRef.current?.click()}
                title={editPreview ? 'Trocar imagem' : 'Adicionar imagem'}
              >
                <IconImage size={18} />
                <span style={{ fontSize: 12, marginLeft: 4 }}>
                  {editPreview ? 'Trocar' : 'Imagem'}
                </span>
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn-outline"
                  style={{ padding: '5px 14px', fontSize: 13 }}
                  onClick={e => {
                    e.stopPropagation();
                    setEditando(false);
                    setEditConteudo(tweet.conteudo);
                    setEditPreview(tweet.imagem_url || null);
                    setEditImagem(tweet.imagem_url || null);
                    setEditFicheiro(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  style={{ padding: '5px 14px', fontSize: 13 }}
                  onClick={handleGuardarEdicao}
                  disabled={guardando || !editConteudo.trim()}
                >
                  {guardando ? 'A guardar...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="tweet-text">{tweet.conteudo}</p>
        )}

        {tweet.imagem_url && !editando && (
          <img
            src={getImgUrl(tweet.imagem_url)}
            alt="Imagem do tweet"
            className="tweet-img"
            onClick={e => e.stopPropagation()}
          />
        )}

        {/* confirmação apagar tweet */}
        {confirmarApagar && (
          <div className="tweet-confirm-box" onClick={e => e.stopPropagation()}>
            <span>Apagar este tweet?</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-outline"
                style={{ padding: '4px 12px', fontSize: 13 }}
                onClick={e => { e.stopPropagation(); setConfirmarApagar(false); }}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                style={{ padding: '4px 12px', fontSize: 13 }}
                onClick={handleApagar}
                disabled={apagando}
              >
                {apagando ? 'A apagar...' : 'Apagar'}
              </button>
            </div>
          </div>
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

          {podeEditar && !confirmarApagar && (
            <button
              className={`tweet-action-btn ${editando ? 'active' : ''}`}
              onClick={e => { e.stopPropagation(); setEditando(prev => !prev); setConfirmarApagar(false); }}
              title="Editar tweet"
            >
              <IconEdit size={18} />
            </button>
          )}

          {podeApagar && !editando && (
            <button
              className="tweet-action-btn delete"
              onClick={e => { e.stopPropagation(); setConfirmarApagar(prev => !prev); setEditando(false); }}
              title="Apagar tweet"
            >
              <IconDelete size={18} />
            </button>
          )}
        </div>

        {/* secção de comentários */}
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

                    {/* confirmação apagar comentário */}
                    {confirmarApagarCom === c.comentario_id && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Apagar?</span>
                        <button
                          className="btn-outline"
                          style={{ padding: '2px 10px', fontSize: 12 }}
                          onClick={() => setConfirmarApagarCom(null)}
                        >
                          Não
                        </button>
                        <button
                          className="btn-danger"
                          style={{ padding: '2px 10px', fontSize: 12 }}
                          onClick={() => handleApagarComentario(c.comentario_id)}
                        >
                          Sim
                        </button>
                      </div>
                    )}
                  </div>

                  {(utilizador?.utilizador_id === c.utilizador_id || utilizador?.is_admin === 1) && confirmarApagarCom !== c.comentario_id && (
                    <button
                      className="tweet-action-btn delete"
                      style={{ marginLeft: 'auto', padding: 4 }}
                      onClick={() => setConfirmarApagarCom(c.comentario_id)}
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
