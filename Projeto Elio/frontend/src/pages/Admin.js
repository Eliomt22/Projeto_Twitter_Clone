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
    } catch (err) { alert('Erro ao atualizar.'); }
  };

  const apagarUtilizador = async (id) => {
    if (!window.confirm('Apagar utilizador e todos os seus dados?')) return;
    try {
      await adminApagarUtilizador(id);
      setUtilizadores(prev => prev.filter(u => u.utilizador_id !== id));
    } catch (err) { alert('Erro ao apagar.'); }
  };

  const editarTweet = async (tweet) => {
    const novoConteudo = window.prompt('Editar conteúdo do tweet:', tweet.conteudo);
    if (novoConteudo === null) return;
    const novaImagem = window.prompt('URL da imagem (vazio para remover):', tweet.imagem_url || '');
    try {
      const { data } = await adminEditarTweet(tweet.tweet_id, {
        conteudo: novoConteudo,
        imagem_url: novaImagem.trim() || null
      });
      setTweets(prev => prev.map(t => t.tweet_id === data.tweet_id ? data : t));
    } catch (err) { alert(err.response?.data?.error || 'Erro ao editar.'); }
  };

  const apagarTweet = async (id) => {
    if (!window.confirm('Apagar este tweet?')) return;
    try {
      await adminApagarTweet(id);
      setTweets(prev => prev.filter(t => t.tweet_id !== id));
    } catch (err) { alert('Erro ao apagar.'); }
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

      {/* ── Estatísticas ── */}
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

      {/* ── Tabs ── */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'utilizadores' ? 'active' : ''}`} onClick={() => setTab('utilizadores')}>
          <IconUsers size={16} style={{ marginRight: 6 }} /> Utilizadores
        </button>
        <button className={`tab-btn ${tab === 'tweets' ? 'active' : ''}`} onClick={() => setTab('tweets')}>
          <IconTweet size={16} style={{ marginRight: 6 }} /> Tweets
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
                      <div className="admin-actions">
                        <button
                          className={`admin-btn ${u.ativo ? 'admin-btn-warn' : 'admin-btn-ok'}`}
                          onClick={() => toggleAtivo(u)}
                        >
                          {u.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                        <button className="admin-btn admin-btn-danger" onClick={() => apagarUtilizador(u.utilizador_id)}>
                          <IconDelete size={14} />
                        </button>
                      </div>
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
                    <td className="admin-tweet-text">{t.conteudo}</td>
                    <td className="admin-center">
                      <span className="admin-gostos">
                        <IconHeart size={13} filled /> {t.total_gostos}
                      </span>
                    </td>
                    <td className="admin-muted">
                      {new Date(t.data_publicacao).toLocaleDateString('pt-PT')}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-edit" onClick={() => editarTweet(t)}>
                          <IconEdit size={14} />
                        </button>
                        <button className="admin-btn admin-btn-danger" onClick={() => apagarTweet(t.tweet_id)}>
                          <IconDelete size={14} />
                        </button>
                      </div>
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
