// src/services/api.js — Chamadas à API do backend
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Adiciona o token JWT em cada pedido automaticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──
export const registar    = (dados) => api.post('/auth/register', dados);
export const login       = (dados) => api.post('/auth/login', dados);

// ── Tweets ──
export const getFeed     = (page = 1) => api.get(`/tweets/feed?page=${page}`);
export const getExplore  = (page = 1, q = '') => api.get(`/tweets/explore?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
export const publicarTweet = (dados) => api.post('/tweets', dados);
export const apagarTweet = (id)      => api.delete(`/tweets/${id}`);
export const toggleGosto = (id)      => api.post(`/tweets/${id}/gosto`);

// ── Utilizadores ──
export const getSugestoes     = ()         => api.get('/utilizadores/sugestoes/lista');
export const getPerfil        = (username) => api.get(`/utilizadores/${username}`);
export const getTweetsUtilizador = (username) => api.get(`/utilizadores/${username}/tweets`);
export const toggleSeguir     = (id)      => api.post(`/utilizadores/${id}/seguir`);
export const editarPerfil     = (dados)   => api.put('/utilizadores/perfil/editar', dados);

// ── Admin ──
export const adminGetUtilizadores = ()   => api.get('/admin/utilizadores');
export const adminEditarUtilizador = (id, dados) => api.put(`/admin/utilizadores/${id}`, dados);
export const adminApagarUtilizador = (id) => api.delete(`/admin/utilizadores/${id}`);
export const adminGetTweets   = ()       => api.get('/admin/tweets');
export const adminEditarTweet = (id, dados) => api.put(`/admin/tweets/${id}`, dados);
export const adminApagarTweet = (id)     => api.delete(`/admin/tweets/${id}`);

export default api;
