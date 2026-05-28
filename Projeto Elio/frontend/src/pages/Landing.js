import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing-left">
        <span className="landing-logo-big">𝕏</span>
      </div>

      <div className="landing-right">
        <span className="landing-logo-mobile">𝕏</span>

        <h1 className="landing-title">O que se passa<br />no mundo</h1>
        <p className="landing-sub">Junta-te hoje.</p>

        <div className="landing-actions">
          <Link to="/registo" className="btn-primary landing-btn">
            Criar conta
          </Link>

          <div className="landing-divider">
            <hr /><span>Já tens conta?</span><hr />
          </div>

          <Link to="/login" className="btn-outline landing-btn">
            Entrar
          </Link>
        </div>

        <ul className="landing-features">
          <li>🐦 Publica tweets até 280 caracteres</li>
          <li>🖼️ Partilha imagens</li>
          <li>❤️ Dá gostos e segue utilizadores</li>
          <li>🔍 Explora o que todos publicam</li>
        </ul>
      </div>
    </div>
  );
}
