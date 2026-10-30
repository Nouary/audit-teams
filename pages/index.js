import { useState } from "react";
import Head from "next/head";

// Inline SVG logo — bolt + circuit, ENSA Fès energy theme
function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#1a2744"/>
      <path d="M27 6L14 26h10l-3 16 17-22H28L27 6z" fill="#22c55e"/>
      <circle cx="10" cy="38" r="2" fill="#22c55e" opacity="0.5"/>
      <circle cx="38" cy="10" r="2" fill="#22c55e" opacity="0.5"/>
      <line x1="12" y1="38" x2="18" y2="38" stroke="#22c55e" strokeWidth="1.5" opacity="0.4"/>
      <line x1="30" y1="10" x2="36" y2="10" stroke="#22c55e" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  );
}

export default function Home() {
  const [theme, setTheme] = useState("");
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState(["", "", "", ""]);
  const [status, setStatus] = useState({ loading: false, msg: "", ok: null });

  const updateMember = (i, value) => {
    const next = [...members];
    next[i] = value;
    setMembers(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, msg: "", ok: null });

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, members, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ loading: false, msg: data.error, ok: false });
        return;
      }

      setStatus({
        loading: false,
        msg: "Équipe enregistrée avec succès ! ✓",
        ok: true,
      });
      setTheme("");
      setEmail("");
      setMembers(["", "", "", ""]);
    } catch (err) {
      setStatus({
        loading: false,
        msg: "Erreur réseau, veuillez réessayer.",
        ok: false,
      });
    }
  };

  return (
    <div className="container">
      <Head>
        <title>M357 – Inscription des Équipes | ENSA Fès</title>
        <meta name="description" content="Formulaire d'inscription des équipes pour le module M357 Efficacité et Audit Énergétique – ENSA Fès" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="card">
        {/* Header */}
        <div className="header">
          <Logo size={48} />
          <div className="header-text">
            <span className="school">ENSA Fès — Génie Électrique & Systèmes Intelligents</span>
            <span className="module-tag">M357 : Efficacité et Audit Énergétique</span>
          </div>
        </div>

        <div className="divider" />

        <h1>Inscription des Équipes</h1>
        <p className="subtitle">
          Chaque équipe (3 ou 4 étudiants) choisit un thème d'audit et remplit ce formulaire <strong>une seule fois</strong>.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            <span>Thème choisi <span className="req">*</span></span>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex : Audit énergétique d'un bâtiment industriel"
              required
            />
          </label>

          <fieldset>
            <legend>Membres de l'équipe <span className="hint">(3 obligatoires, 4ème optionnel)</span></legend>
            {members.map((m, i) => (
              <input
                key={i}
                type="text"
                value={m}
                onChange={(e) => updateMember(i, e.target.value)}
                placeholder={`Membre ${i + 1}${i < 3 ? " *" : " (optionnel)"}`}
                required={i < 3}
              />
            ))}
          </fieldset>

          <label>
            <span>Email de contact <span className="hint">(optionnel)</span></span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@usmba.ac.ma"
            />
          </label>

          <button type="submit" disabled={status.loading}>
            {status.loading ? (
              <span className="btn-loading"><span className="spinner" /> Envoi en cours...</span>
            ) : (
              "Valider mon équipe →"
            )}
          </button>

          {status.msg && (
            <div className={status.ok ? "alert-success" : "alert-error"}>
              {status.msg}
            </div>
          )}
        </form>
      </main>

      <footer className="footer">
        ENSA Fès · Module M357 · Année Universitaire 2025–2026
      </footer>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%);
          padding: 24px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(26,39,68,0.10);
          padding: 36px 32px;
          max-width: 500px;
          width: 100%;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }

        .header-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .school {
          font-size: 0.78rem;
          font-weight: 700;
          color: #1a2744;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .module-tag {
          font-size: 0.75rem;
          color: #22c55e;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .divider {
          height: 1px;
          background: #f0f0f0;
          margin-bottom: 20px;
        }

        h1 {
          font-size: 1.45rem;
          font-weight: 700;
          color: #1a2744;
          margin-bottom: 6px;
        }

        .subtitle {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 22px;
          line-height: 1.5;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .req { color: #ef4444; }
        .hint { font-weight: 400; color: #9ca3af; font-size: 0.8rem; }

        fieldset {
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        legend {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          padding: 0 6px;
        }

        input {
          padding: 10px 12px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: 'Inter', system-ui, sans-serif;
          transition: border-color 0.15s;
          color: #111827;
        }

        input:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
        }

        button {
          background: #1a2744;
          color: white;
          border: none;
          padding: 13px;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 4px;
          transition: background 0.15s, transform 0.1s;
          font-family: 'Inter', system-ui, sans-serif;
        }

        button:hover:not(:disabled) {
          background: #22335a;
          transform: translateY(-1px);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .alert-success {
          background: #f0fdf4;
          border: 1.5px solid #86efac;
          color: #15803d;
          padding: 12px 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .alert-error {
          background: #fef2f2;
          border: 1.5px solid #fca5a5;
          color: #b91c1c;
          padding: 12px 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .footer {
          margin-top: 20px;
          font-size: 0.75rem;
          color: #94a3b8;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
