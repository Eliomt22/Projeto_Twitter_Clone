import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Registo() {
  const { registar } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', bio: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await registar(form);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao registar.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">𝕏</div>
        <h1>Criar conta</h1>
        {erro && <div className="error-msg">{erro}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome de utilizador</label>
            <input
              type="text"
              placeholder="@utilizador"
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="email@exemplo.pt"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Bio (opcional)</label>
            <textarea
              placeholder="Fala um pouco sobre ti..."
              value={form.bio}
              onChange={e => setForm({...form, bio: e.target.value})}
              rows={3}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? 'A criar conta...' : 'Criar conta'}
          </button>
        </form>
        <p className="auth-link">
          Já tens conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
