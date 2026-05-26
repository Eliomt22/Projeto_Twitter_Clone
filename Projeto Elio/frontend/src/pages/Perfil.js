import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPerfil, getTweetsUtilizador, toggleSeguir, getSeguindo, getSeguidores, editarPerfil, uploadImagem } from '../services/api';
import TweetCard from '../components/TweetCard';
import { IconImage } from '../components/Icons';

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
  const { utilizador: eu, atualizarUtilizador } = useAuth();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [seguindo, setSeguindo] = useState(false);

  const [modal, setModal] = useState(null);
  const [listaModal, setListaModal] = useState([]);
  const [carregandoModal, setCarregandoModal] = useState(false);

  // editar perfil
  const [editando, setEditando] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editFoto, setEditFoto] = useState('');
  const [fotoFicheiro, setFotoFicheiro] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [guardando, setGuardando] = useState(false);
  const fotoRef = useRef(null);

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

  const abrirEdicao = () => {
    setEditBio(perfil.bio || '');
    setEditFoto(perfil.foto_perfil || '');
    setFotoPreview(perfil.foto_perfil || '');
    setFotoFicheiro(null);
    setEditando(true);
  };

  const handleSelecionarFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFicheiro(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleRemoverFoto = () => {
    setFotoFicheiro(null);
    setFotoPreview('');
    setEditFoto('');
    if (fotoRef.current) fotoRef.current.value = '';
  };

  const handleGuardarPerfil = async () => {
    setGuardando(true);
    try {
      let foto_perfil = editFoto || null;

      if (fotoFicheiro) {
        const formData = new FormData();
        formData.append('imagem', fotoFicheiro);
        const { data: uploadData } = await uploadImagem(formData);
        foto_perfil = `http://localhost:5000${uploadData.imagem_url}`;
      }

      await editarPerfil({ bio: editBio || null, foto_perfil });
      setPerfil(prev => ({ ...prev, bio: editBio, foto_perfil }));
      // atualiza o AuthContext para refletir nos avatares do sidebar e compositor
      atualizarUtilizador({ bio: editBio, foto_perfil });
      setEditando(false);
    } catch (err) {
      console.error('Erro ao guardar perfil:', err);
    } finally {
      setGuardando(false);
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
      console.error(err);
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
          {/* foto de perfil com opção de trocar se for o meu perfil */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div className="avatar lg">
              {(editando ? fotoPreview : perfil.foto_perfil)
                ? <img src={editando ? fotoPreview : perfil.foto_perfil} alt={perfil.username} />
                : inicial}
            </div>
            {editando && (
              <>
                <button
                  onClick={() => fotoRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    background: 'var(--accent)', border: 'none',
                    borderRadius: '50%', width: 28, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Trocar foto"
                >
                  <IconImage size={14} />
                </button>
                <input
                  ref={fotoRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleSelecionarFoto}
                />
              </>
            )}
          </div>

          {/* botão editar / seguir */}
          {eSouEu ? (
            !editando && (
              <button className="btn-outline" onClick={abrirEdicao} style={{ padding: '8px 20px' }}>
                Editar perfil
              </button>
            )
          ) : (
            <button
              className={seguindo ? 'btn-outline' : 'btn-primary'}
              onClick={handleSeguir}
              style={{ padding: '8px 20px' }}
            >
              {seguindo ? 'A seguir' : 'Seguir'}
            </button>
          )}
        </div>

        {editando ? (
          /* formulário de edição */
          <div className="profile-edit-form">
            {fotoPreview && (
              <button
                onClick={handleRemoverFoto}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--danger)', fontSize: 12,
                  cursor: 'pointer', marginBottom: 8, padding: 0
                }}
              >
                × Remover foto
              </button>
            )}
            <textarea
              className="tweet-textarea"
              placeholder="A tua bio..."
              value={editBio}
              onChange={e => setEditBio(e.target.value)}
              rows={3}
              maxLength={200}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                className="btn-outline"
                style={{ padding: '6px 16px', fontSize: 13 }}
                onClick={() => setEditando(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                style={{ padding: '6px 16px', fontSize: 13 }}
                onClick={handleGuardarPerfil}
                disabled={guardando}
              >
                {guardando ? 'A guardar...' : 'Guardar'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-name">{perfil.username}</div>
            <div className="profile-handle">@{perfil.username}</div>
            {perfil.bio && <p className="profile-bio">{perfil.bio}</p>}
          </>
        )}

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
