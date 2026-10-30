import { useState } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  const [theme, setTheme] = useState("");
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState(["", "", "", ""]);
  const [status, setStatus] = useState({ loading: false, msg: "", ok: null, submittedData: null });

  const updateMember = (i, value) => {
    const next = [...members];
    next[i] = value;
    setMembers(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, msg: "", ok: null, submittedData: null });

    try {
      const payload = { theme, members, email };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ loading: false, msg: data.error, ok: false, submittedData: null });
        return;
      }

      setStatus({
        loading: false,
        msg: "Votre équipe a été enregistrée avec succès !",
        ok: true,
        submittedData: payload,
      });
      setTheme("");
      setEmail("");
      setMembers(["", "", "", ""]);
    } catch (err) {
      setStatus({
        loading: false,
        msg: "Erreur réseau, veuillez vérifier votre connexion et réessayer.",
        ok: false,
        submittedData: null,
      });
    }
  };

  return (
    <div className="layout">
      <Head>
        <title>M357 – Inscription des équipes | ENSA Fès</title>
        <meta
          name="description"
          content="Formulaire d'inscription des équipes pour le module M357 Efficacité et Audit Énergétique – ENSA Fès"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Navbar activeTab="form" />

      <main className="content">
        <div className="card">
          <div className="card-top">
            <div className="badge-row">
              <span className="badge">M357 · Audit Énergétique</span>
              <span className="badge-light">3 à 4 étudiants</span>
            </div>
            <h1 className="title">Inscription des équipes</h1>
            <p className="subtitle">
              Chaque groupe soumet ce formulaire <strong>une seule fois</strong> pour valider le thème
              choisi et la liste des membres. Les données sont directement synchronisées avec l'enseignant.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="theme" className="label">
                <span>Thème de l'audit énergétique <span className="req">*</span></span>
                <span className="hint">Sujet convenu ou proposé</span>
              </label>
              <input
                id="theme"
                type="text"
                className="input"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex. : Audit énergétique d'une cimenterie / chaîne de production"
                required
              />
            </div>

            <div className="members-box">
              <div className="members-box-header">
                <div>
                  <div className="members-box-title">Composition du groupe <span className="req">*</span></div>
                  <div className="members-box-sub">3 membres obligatoires, 4ème optionnel</div>
                </div>
                <span className="members-count-badge">
                  {members.filter((m) => m.trim().length > 0).length} / 4
                </span>
              </div>

              <div className="members-inputs">
                {members.map((m, i) => (
                  <div key={i} className="member-input-row">
                    <span className="member-index">{i + 1}</span>
                    <input
                      type="text"
                      className="input input-member"
                      value={m}
                      onChange={(e) => updateMember(i, e.target.value)}
                      placeholder={
                        i === 0
                          ? "Nom & Prénom (Chef d'équipe) *"
                          : i < 3
                          ? `Membre ${i + 1} *`
                          : "Membre 4 (optionnel)"
                      }
                      required={i < 3}
                    />
                    {i < 3 && <span className="tag-required">Requis</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="email" className="label">
                <span>Email de contact académique</span>
                <span className="hint">Optionnel mais conseillé pour les retours</span>
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@usmba.ac.ma"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={status.loading}>
              {status.loading ? (
                <span className="btn-inner">
                  <span className="spinner" />
                  <span>Enregistrement en cours...</span>
                </span>
              ) : (
                <span className="btn-inner">
                  <span>Enregistrer l'équipe</span>
                  <span className="arrow">→</span>
                </span>
              )}
            </button>

            {status.msg && (
              <div className={status.ok ? "alert-success" : "alert-error"}>
                <div className="alert-head">
                  <span className="alert-icon">{status.ok ? "✓" : "!"}</span>
                  <span className="alert-title">{status.msg}</span>
                </div>
                {status.submittedData && (
                  <div className="alert-details">
                    <div><strong>Thème :</strong> {status.submittedData.theme}</div>
                    <div>
                      <strong>Membres :</strong>{" "}
                      {status.submittedData.members.filter((m) => m.trim()).join(", ")}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #faf9f5;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1f2421;
        }

        .content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px 56px;
        }

        .card {
          width: 100%;
          max-width: 560px;
          background: #ffffff;
          border: 1px solid #e8e5dc;
          border-radius: 18px;
          padding: 38px 34px;
          box-shadow: 0 2px 6px rgba(30, 25, 15, 0.03), 0 12px 32px rgba(30, 25, 15, 0.05);
        }

        .card-top {
          margin-bottom: 26px;
        }

        .badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .badge {
          background: #eaf5ee;
          color: #15803d;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid #cde7d6;
        }

        .badge-light {
          background: #f4f2ea;
          color: #636b65;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .title {
          font-size: 1.55rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #181d19;
          margin-bottom: 8px;
          line-height: 1.25;
        }

        .subtitle {
          font-size: 0.88rem;
          color: #5d6560;
          line-height: 1.55;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.84rem;
          font-weight: 600;
          color: #2b332e;
        }

        .req {
          color: #dc2626;
          margin-left: 2px;
        }

        .hint {
          font-size: 0.74rem;
          color: #838c85;
          font-weight: 400;
        }

        .input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #dedbd0;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: inherit;
          color: #1b201d;
          background: #ffffff;
          transition: all 0.16s ease;
          outline: none;
        }

        .input:hover {
          border-color: #cac5b7;
        }

        .input:focus {
          border-color: #15803d;
          box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.12);
        }

        .input::placeholder {
          color: #9fa7a1;
        }

        /* ── Members container ── */
        .members-box {
          border: 1px solid #e8e5dc;
          background: #faf9f6;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .members-box-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .members-box-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #242c27;
        }

        .members-box-sub {
          font-size: 0.74rem;
          color: #717a74;
        }

        .members-count-badge {
          font-size: 0.75rem;
          font-weight: 700;
          background: #ede9df;
          color: #4a524c;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .members-inputs {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .member-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }

        .member-index {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e8e4da;
          color: #555e58;
          border-radius: 50%;
          font-size: 0.74rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .input-member {
          background: #ffffff;
          padding-right: 60px;
        }

        .tag-required {
          position: absolute;
          right: 12px;
          font-size: 0.68rem;
          font-weight: 600;
          color: #8c948e;
          background: #f4f2eb;
          padding: 2px 6px;
          border-radius: 4px;
          pointer-events: none;
        }

        /* ── Submit Button ── */
        .submit-btn {
          width: 100%;
          padding: 13px 20px;
          background: #18211b;
          color: #ffffff;
          border: none;
          border-radius: 11px;
          font-size: 0.92rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 1px 3px rgba(24, 33, 27, 0.2);
          margin-top: 4px;
        }

        .submit-btn:hover:not(:disabled) {
          background: #232f27;
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(24, 33, 27, 0.25);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          background: #7a847d;
          cursor: not-allowed;
        }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .arrow {
          font-size: 1.1rem;
          transition: transform 0.16s ease;
        }

        .submit-btn:hover:not(:disabled) .arrow {
          transform: translateX(3px);
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Alerts ── */
        .alert-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 14px 16px;
          color: #14532d;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 14px 16px;
          color: #991b1b;
        }

        .alert-head {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: currentColor;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        .alert-error .alert-icon {
          background: #dc2626;
        }

        .alert-success .alert-icon {
          background: #16a34a;
        }

        .alert-title {
          font-size: 0.88rem;
          font-weight: 600;
        }

        .alert-details {
          font-size: 0.8rem;
          color: #166534;
          border-top: 1px solid #bbf7d0;
          padding-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        @media (max-width: 600px) {
          .card {
            padding: 26px 20px;
          }
          .title {
            font-size: 1.35rem;
          }
        }
      `}</style>
    </div>
  );
}
