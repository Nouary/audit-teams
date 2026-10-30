import { useState } from "react";
import Head from "next/head";

function Logo({ size = 36 }) {
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

function StatCard({ value, label, icon }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [teams, setTeams] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/teams?password=${encodeURIComponent(password)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur");
        setTeams(null);
      } else {
        setTeams(data.teams);
      }
    } catch (e) {
      setError("Erreur réseau");
    }
    setLoading(false);
  };

  const exportXlsx = () => {
    window.location.href = `/api/export?password=${encodeURIComponent(password)}`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") load();
  };

  // Computed stats
  const totalTeams = teams?.length ?? 0;
  const totalStudents = teams?.reduce((sum, t) => sum + (t.members?.length || 0), 0) ?? 0;
  const withEmail = teams?.filter((t) => t.email).length ?? 0;
  const today = teams?.filter((t) => {
    const d = new Date(t.submittedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length ?? 0;

  return (
    <div className="page">
      <Head>
        <title>Administration – M357 | ENSA Fès</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-left">
          <Logo size={36} />
          <div>
            <div className="topbar-title">Administration</div>
            <div className="topbar-sub">ENSA Fès · M357 Audit Énergétique</div>
          </div>
        </div>
        <a href="/" className="back-link">← Formulaire public</a>
      </header>

      <main className="main">
        {/* Auth row */}
        <div className="auth-card">
          <label className="auth-label">Mot de passe administrateur</label>
          <div className="auth-row">
            <input
              id="admin-password"
              type="password"
              placeholder="Entrez le mot de passe…"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button id="btn-load" onClick={load} disabled={loading || !password}>
              {loading ? (
                <><span className="spinner" /> Chargement…</>
              ) : (
                "Afficher les équipes"
              )}
            </button>
            <button
              id="btn-export"
              onClick={exportXlsx}
              disabled={!password || !teams}
              className="btn-green"
            >
              ↓ Exporter Excel
            </button>
          </div>
          {error && <div className="alert-error">{error}</div>}
        </div>

        {/* Dashboard stats — shown after load */}
        {teams && (
          <>
            <div className="stats-grid">
              <StatCard value={totalTeams} label="Équipes inscrites" icon="👥" />
              <StatCard value={totalStudents} label="Étudiants total" icon="🎓" />
              <StatCard value={withEmail} label="Avec email de contact" icon="📧" />
              <StatCard value={today} label="Inscriptions aujourd'hui" icon="📅" />
            </div>

            {/* Table */}
            <div className="table-wrap">
              <div className="table-header">
                <h2 className="table-title">Liste des équipes</h2>
                <span className="badge">{totalTeams} équipe{totalTeams > 1 ? "s" : ""}</span>
              </div>
              {teams.length === 0 ? (
                <p className="empty">Aucune équipe inscrite pour le moment.</p>
              ) : (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Thème d'audit</th>
                        <th>Membres</th>
                        <th>Email</th>
                        <th>Date d'inscription</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((t, i) => (
                        <tr key={t.id}>
                          <td className="num">{i + 1}</td>
                          <td className="theme">{t.theme}</td>
                          <td>
                            <div className="members-list">
                              {t.members.map((m, j) => (
                                <span key={j} className="member-chip">{m}</span>
                              ))}
                            </div>
                          </td>
                          <td className="email">{t.email || <span className="dash">—</span>}</td>
                          <td className="date">
                            {new Date(t.submittedAt).toLocaleString("fr-FR", {
                              day: "2-digit", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', system-ui, sans-serif;
          color: #1e293b;
        }

        /* ── Top bar ── */
        .topbar {
          background: #1a2744;
          padding: 0 32px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .topbar-title {
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
        }

        .topbar-sub {
          font-size: 0.72rem;
          color: #22c55e;
          font-weight: 500;
          letter-spacing: 0.03em;
        }

        .back-link {
          font-size: 0.82rem;
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.15s;
        }

        .back-link:hover { color: #fff; }

        /* ── Main ── */
        .main {
          max-width: 960px;
          margin: 0 auto;
          padding: 28px 20px 48px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ── Auth card ── */
        .auth-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        .auth-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .auth-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        input {
          padding: 10px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: inherit;
          flex: 1;
          min-width: 200px;
          transition: border-color 0.15s;
          color: #1e293b;
        }

        input:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
        }

        button {
          padding: 10px 18px;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          background: #1a2744;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s, transform 0.1s;
          font-family: inherit;
          white-space: nowrap;
        }

        button:hover:not(:disabled) {
          background: #22335a;
          transform: translateY(-1px);
        }

        button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }

        .btn-green {
          background: #15803d;
        }
        .btn-green:hover:not(:disabled) {
          background: #166534;
        }

        .spinner {
          width: 13px;
          height: 13px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .alert-error {
          background: #fef2f2;
          border: 1.5px solid #fca5a5;
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* ── Stats grid ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
        }

        /* StatCard styles passed via global in _app or via className — using :global trick */
        .stat-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          transition: box-shadow 0.15s;
        }

        .stat-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .stat-icon {
          font-size: 1.6rem;
          line-height: 1;
        }

        .stat-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: #1a2744;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 4px;
          font-weight: 500;
        }

        /* ── Table ── */
        .table-wrap {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        .table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .table-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a2744;
        }

        .badge {
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #86efac;
          border-radius: 20px;
          padding: 3px 12px;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .table-scroll {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }

        th {
          background: #f8fafc;
          padding: 11px 16px;
          text-align: left;
          font-size: 0.78rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 12px 16px;
          font-size: 0.875rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
        }

        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #f8fafc; }

        .num {
          font-weight: 700;
          color: #94a3b8;
          font-size: 0.8rem;
          width: 36px;
        }

        .theme {
          font-weight: 600;
          color: #1e293b;
          max-width: 240px;
        }

        .members-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .member-chip {
          background: #f0f4ff;
          color: #1a2744;
          border-radius: 20px;
          padding: 2px 10px;
          font-size: 0.78rem;
          font-weight: 500;
          border: 1px solid #c7d2fe;
        }

        .email {
          color: #64748b;
          font-size: 0.82rem;
        }

        .date {
          color: #94a3b8;
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .dash { color: #cbd5e1; }

        .empty {
          padding: 32px;
          text-align: center;
          color: #94a3b8;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
