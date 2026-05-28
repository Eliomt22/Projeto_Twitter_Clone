import { useState, useEffect } from 'react';
import {
  adminGetUtilizadores, adminApagarUtilizador, adminEditarUtilizador,
  adminGetTweets, adminEditarTweet, adminApagarTweet
} from '../services/api';
import { IconUsers, IconTweet, IconEdit, IconDelete, IconAdmin, IconHeart } from '../components/Icons';

export default function Admin() {
  const [tab, setTab] = useState('utilizadores');
  const [utilizadores, setUtilizadores] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [confirmarApagarUser, setConfirmarApagarUser] = useState(null);
  const [confirmarApagarTweet, setConfirmarApagarTweet] = useState(null);

  const [editandoTweet, setEditandoTweet] = useState(null);
  const [editConteudo, setEditConteudo] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { carregarDados(); }, [tab]);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      if (tab === 'utilizadores') {
        const { data } = await adminGetUtilizadores();
        setUtilizadores(data);
      } else {
        const { data } = await adminGetTweets();
        setTweets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  const toggleAtivo = async (u) => {
    try {
      await adminEditarUtilizador(u.utilizador_id, { bio: u.bio, is_admin: u.is_admin, ativo: !u.ativo });
      setUtilizadores(prev => prev.map(x =>
        x.utilizador_id === u.utilizador_id ? { ...x, ativo: !x.ativo } : x
      ));
    } catch (err) { console.error(err); }
  };

  const handleApagarUtilizador = async (id) => {
    try {
      await adminApagarUtilizador(id);
      setUtilizadores(prev => prev.filter(u => u.utilizador_id !== id));
      setConfirmarApagarUser(null);
    } catch (err) { console.error(err); }
  };

  const iniciarEdicaoTweet = (tweet) => {
    setEditandoTweet(tweet);
    setEditConteudo(tweet.conteudo);
    setConfirmarApagarTweet(null);
  };

  const handleGuardarTweet = async () => {
    if (!editConteudo.trim()) return;
    setGuardando(true);
    try {
      const { data } = await adminEditarTweet(editandoTweet.tweet_id, {
        conteudo: editConteudo.trim(),
        imagem_url: editandoTweet.imagem_url || null
      });
      setTweets(prev => prev.map(t => t.tweet_id === data.tweet_id ? data : t));
      setEditandoTweet(null);
    } catch (err) { console.error(err); }
    finally { setGuardando(false); }
  };

  const handleApagarTweet = async (id) => {
    try {
      await adminApagarTweet(id);
      setTweets(prev => prev.filter(t => t.tweet_id !== id));
      setConfirmarApagarTweet(null);
    } catch (err) { console.error(err); }
  };

  const totalAtivos = utilizadores.filter(u => u.ativo).length;
  const totalAdmins = utilizadores.filter(u => u.is_admin).length;
  const totalTweets = tweets.length;
  const totalGostos = tweets.reduce((acc, t) => acc + Number(t.total_gostos), 0);

  return (
    <>
      <div className="page-header">
        <IconAdmin size={22} />
        <h2>Backoffice</h2>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-value">{utilizadores.length}</span>
          <span className="stat-label">Utilizadores</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalAtivos}</span>
          <span className="stat-label">Ativos</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalAdmins}</span>
          <span className="stat-label">Admins</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{tab === 'tweets' ? totalTweets : '—'}</span>
          <span className="stat-label">Tweets</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{tab === 'tweets' ? totalGostos : '—'}</span>
          <span className="stat-label">Gostos</span>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'utilizadores' ? 'active' : ''}`} onClick={() => setTab('utilizadores')}>
          <IconUsers size={16} /> Utilizadores
        </button>
        <button className={`tab-btn ${tab === 'tweets' ? 'active' : ''}`} onClick={() => setTab('tweets')}>
          <IconTweet size={16} /> Tweets
        </button>
      </div>

      <div className="admin-body">
        {carregando ? (
          <div className="spinner" />
        ) : tab === 'utilizadores' ? (

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Utilizador</th>
                  <th>Email</th>
                  <th>Função</th>
                  <th>Estado</th>
                  <th>Tweets</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {utilizadores.map(u => (
                  <tr key={u.utilizador_id}>
                    <td className="admin-id">{u.utilizador_id}</td>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-avatar">{u.username[0].toUpperCase()}</div>
                        <strong>@{u.username}</strong>
                      </div>
                    </td>
                    <td className="admin-muted">{u.email}</td>
                    <td>
                      {u.is_admin
                        ? <span className="badge badge-admin">Admin</span>
                        : <span className="admin-muted">—</span>}
                    </td>
                    <td>
                      <span className={`badge ${u.ativo ? 'badge-ativo' : 'badge-inativo'}`}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="admin-center">{u.total_tweets}</td>
                    <td>
                      {confirmarApagarUser === u.utilizador_id ? (
                        <div className="admin-confirm">
                          <span>Apagar?</span>
                          <button className="admin-btn admin-btn-ok" onClick={() => setConfirmarApagarUser(null)}>Não</button>
                          <button className="admin-btn admin-btn-danger" onClick={() => handleApagarUtilizador(u.utilizador_id)}>Sim</button>
                        </div>
                      ) : (
                        <div className="admin-actions">
                          <button
                            className={`admin-btn ${u.ativo ? 'admin-btn-warn' : 'admin-btn-ok'}`}
                            onClick={() => toggleAtivo(u)}
                          >
                            {u.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                          <button
                            className="admin-btn admin-btn-danger"
                            onClick={() => setConfirmarApagarUser(u.utilizador_id)}
                          >
                            <IconDelete size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Autor</th>
                  <th>Conteúdo</th>
                  <th>Gostos</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tweets.map(t => (
                  <tr key={t.tweet_id}>
                    <td className="admin-id">{t.tweet_id}</td>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-avatar">{t.username[0].toUpperCase()}</div>
                        <strong>@{t.username}</strong>
                      </div>
                    </td>
                    <td className="admin-tweet-text">
                      {editandoTweet?.tweet_id === t.tweet_id ? (
                        <div className="admin-edit-inline">
                          <textarea
                            className="admin-edit-textarea"
                            value={editConteudo}
                            onChange={e => setEditConteudo(e.target.value)}
                            maxLength={280}
                            rows={2}
                            autoFocus
                          />
                          <div className="admin-edit-btns">
                            <button
                              className="admin-btn"
                              onClick={() => setEditandoTweet(null)}
                            >
                              Cancelar
                            </button>
                            <button
                              className="admin-btn admin-btn-ok"
                              onClick={handleGuardarTweet}
                              disabled={guardando || !editConteudo.trim()}
                            >
                              {guardando ? '...' : 'Guardar'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        t.conteudo
                      )}
                    </td>
                    <td className="admin-center">
                      <span className="admin-gostos">
                        <IconHeart size={13} filled /> {t.total_gostos}
                      </span>
                    </td>
                    <td className="admin-muted">
                      {new Date(t.data_publicacao).toLocaleDateString('pt-PT')}
                    </td>
                    <td>
                      {confirmarApagarTweet === t.tweet_id ? (
                        <div className="admin-confirm">
                          <span>Apagar?</span>
                          <button className="admin-btn admin-btn-ok" onClick={() => setConfirmarApagarTweet(null)}>Não</button>
                          <button className="admin-btn admin-btn-danger" onClick={() => handleApagarTweet(t.tweet_id)}>Sim</button>
                        </div>
                      ) : (
                        <div className="admin-actions">
                          <button
                            className="admin-btn admin-btn-edit"
                            onClick={() => iniciarEdicaoTweet(t)}
                          >
                            <IconEdit size={14} />
                          </button>
                          <button
                            className="admin-btn admin-btn-danger"
                            onClick={() => { setConfirmarApagarTweet(t.tweet_id); setEditandoTweet(null); }}
                          >
                            <IconDelete size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
