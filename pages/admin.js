import { useState, useMemo } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function StatCard({ value, label, icon, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrap">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
      <style jsx>{`
        .stat-card {
          background: #ffffff;
          border: 1px solid #e8e5dc;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 4px rgba(30, 25, 15, 0.03);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .stat-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(30, 25, 15, 0.06);
        }
        .stat-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 11px;
          background: #f4f1e8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .stat-value {
          font-size: 1.55rem;
          font-weight: 700;
          color: #171c19;
          line-height: 1.1;
        }
        .stat-label {
          font-size: 0.8rem;
          color: #636b66;
          font-weight: 500;
        }
        .stat-sub {
          font-size: 0.7rem;
          color: #949c96;
        }
      `}</style>
    </div>
  );
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [teams, setTeams] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/teams?password=${encodeURIComponent(password)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Mot de passe incorrect ou erreur serveur.");
        setTeams(null);
      } else {
        setTeams(data.teams);
      }
    } catch (e) {
      setError("Erreur réseau lors du chargement des données.");
    }
    setLoading(false);
  };

  const exportXlsx = () => {
    window.location.href = `/api/export?password=${encodeURIComponent(password)}`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") load();
  };

  // Filtered teams based on search query
  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    if (!search.trim()) return teams;
    const q = search.toLowerCase().trim();
    return teams.filter((t) => {
      const themeMatch = (t.theme || "").toLowerCase().includes(q);
      const emailMatch = (t.email || "").toLowerCase().includes(q);
      const memberMatch = (t.members || []).some((m) => (m || "").toLowerCase().includes(q));
      return themeMatch || emailMatch || memberMatch;
    });
  }, [teams, search]);

  // Computed stats
  const totalTeams = teams?.length ?? 0;
  const totalStudents = teams?.reduce((sum, t) => sum + (t.members?.length || 0), 0) ?? 0;
  const withEmail = teams?.filter((t) => t.email && t.email.trim()).length ?? 0;
  const todayCount = teams?.filter((t) => {
    if (!t.submittedAt) return false;
    const d = new Date(t.submittedAt);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length ?? 0;

  return (
    <div className="layout">
      <Head>
        <title>Tableau de bord – M357 | ENSA Fès</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Navbar activeTab="admin" />

      <main className="content">
        {/* Top Header / Auth Bar */}
        <section className="admin-header-card">
          <div className="auth-flex">
            <div className="auth-text">
              <div className="badge-row">
                <span className="badge">Espace Enseignant</span>
                <span className="badge-light">M357 Audit Énergétique</span>
              </div>
              <h1 className="header-title">Tableau de bord des inscriptions</h1>
              <p className="header-sub">
                Visualisez la liste en direct des équipes inscrites, effectuez des recherches et
                exportez les données vers Excel.
              </p>
            </div>

            <div className="auth-controls">
              <div className="password-input-wrap">
                <span className="lock-icon">🔒</span>
                <input
                  id="admin-password"
                  type="password"
                  className="password-input"
                  placeholder="Mot de passe admin…"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="action-buttons">
                <button
                  id="btn-load"
                  onClick={load}
                  disabled={loading || !password}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      <span>Chargement...</span>
                    </>
                  ) : teams ? (
                    <>
                      <span>↻ Actualiser</span>
                    </>
                  ) : (
                    <>
                      <span>Accéder aux équipes</span>
                    </>
                  )}
                </button>

                {teams && (
                  <button
                    id="btn-export"
                    onClick={exportXlsx}
                    className="btn-export"
                    title="Télécharger la feuille de calcul Excel"
                  >
                    <span>↓ Exporter Excel</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="alert-error">
              <span className="alert-icon">!</span>
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Unloaded placeholder hint */}
        {!teams && !loading && !error && (
          <div className="welcome-placeholder">
            <div className="placeholder-icon">📋</div>
            <div className="placeholder-title">Entrez le mot de passe pour consulter les inscriptions</div>
            <p className="placeholder-sub">
              Les données sont synchronisées directement depuis le Google Sheet connecté au module M357.
            </p>
          </div>
        )}

        {/* Dashboard Loaded State */}
        {teams && (
          <div className="dashboard-content">
            {/* KPI Stat Cards */}
            <div className="stats-grid">
              <StatCard
                value={totalTeams}
                label="Équipes inscrites"
                icon="👥"
                sub="Binômes, trinômes & quadrinômes"
              />
              <StatCard
                value={totalStudents}
                label="Étudiants au total"
                icon="🎓"
                sub={`Moyenne de ${(totalStudents / (totalTeams || 1)).toFixed(1)} par équipe`}
              />
              <StatCard
                value={withEmail}
                label="Contacts renseignés"
                icon="📧"
                sub={`${Math.round((withEmail / (totalTeams || 1)) * 100)}% des équipes`}
              />
              <StatCard
                value={todayCount}
                label="Inscrits aujourd'hui"
                icon="📅"
                sub="Nouvelles inscriptions"
              />
            </div>

            {/* Table Container */}
            <div className="table-card">
              <div className="table-top-bar">
                <div className="table-heading-group">
                  <h2 className="table-heading">Liste des équipes</h2>
                  <span className="count-pill">
                    {filteredTeams.length} / {totalTeams} équipe{totalTeams > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="search-wrap">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Filtrer par thème, étudiant, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="clear-search" onClick={() => setSearch("")}>
                      ×
                    </button>
                  )}
                </div>
              </div>

              {filteredTeams.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{search ? "🔍" : "📭"}</div>
                  <div className="empty-title">
                    {search ? "Aucun résultat trouvé" : "Aucune équipe inscrite"}
                  </div>
                  <div className="empty-sub">
                    {search
                      ? `Aucune équipe ne correspond au terme "${search}".`
                      : "Le formulaire est prêt à recevoir les premières inscriptions."}
                  </div>
                </div>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: "50px" }}>#</th>
                        <th>Thème d'audit énergétique</th>
                        <th>Membres de l'équipe</th>
                        <th>Email de contact</th>
                        <th style={{ width: "160px" }}>Date d'enregistrement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeams.map((t, idx) => (
                        <tr key={t.id || idx}>
                          <td className="col-num">
                            <span className="num-pill">{idx + 1}</span>
                          </td>
                          <td className="col-theme">
                            <div className="theme-title">{t.theme}</div>
                          </td>
                          <td className="col-members">
                            <div className="members-chips">
                              {t.members && t.members.map((m, j) => (
                                <span key={j} className="member-chip">
                                  {j === 0 && <span className="lead-dot" title="Chef d'équipe">★</span>}
                                  {m}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="col-email">
                            {t.email ? (
                              <a href={`mailto:${t.email}`} className="email-link">
                                {t.email}
                              </a>
                            ) : (
                              <span className="dash">—</span>
                            )}
                          </td>
                          <td className="col-date">
                            <span className="date-text">
                              {t.submittedAt
                                ? new Date(t.submittedAt).toLocaleString("fr-FR", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
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
          max-width: 1120px;
          width: 100%;
          margin: 0 auto;
          padding: 28px 20px 56px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── Header Card & Auth ── */
        .admin-header-card {
          background: #ffffff;
          border: 1px solid #e8e5dc;
          border-radius: 18px;
          padding: 26px 28px;
          box-shadow: 0 1px 4px rgba(30, 25, 15, 0.03);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .auth-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .auth-text {
          max-width: 540px;
        }

        .badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .badge {
          background: #eaf5ee;
          color: #15803d;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding: 3px 10px;
          border-radius: 999px;
          border: 1px solid #cde7d6;
        }

        .badge-light {
          background: #f4f2ea;
          color: #636b65;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
        }

        .header-title {
          font-size: 1.45rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #181d19;
          margin-bottom: 6px;
        }

        .header-sub {
          font-size: 0.86rem;
          color: #616a64;
          line-height: 1.5;
        }

        .auth-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .password-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .lock-icon {
          position: absolute;
          left: 12px;
          font-size: 0.82rem;
          opacity: 0.6;
          pointer-events: none;
        }

        .password-input {
          padding: 10px 14px 10px 34px;
          border: 1.5px solid #dedbd0;
          border-radius: 10px;
          font-size: 0.88rem;
          font-family: inherit;
          color: #1b201d;
          background: #faf9f6;
          outline: none;
          width: 190px;
          transition: all 0.16s ease;
        }

        .password-input:focus {
          background: #ffffff;
          border-color: #15803d;
          box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.12);
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          background: #18211b;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 0.86rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.16s ease;
        }

        .btn-primary:hover:not(:disabled) {
          background: #27342b;
        }

        .btn-primary:disabled {
          background: #9aa39d;
          cursor: not-allowed;
        }

        .btn-export {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: #eaf5ee;
          color: #15803d;
          border: 1px solid #c2e2cc;
          border-radius: 10px;
          font-size: 0.86rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.16s ease;
        }

        .btn-export:hover {
          background: #ddf0e3;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 10px 14px;
          color: #991b1b;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-icon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #dc2626;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        /* ── Welcome Placeholder ── */
        .welcome-placeholder {
          text-align: center;
          padding: 64px 20px;
          background: #ffffff;
          border: 1px solid #e8e5dc;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .placeholder-icon {
          font-size: 2.2rem;
          margin-bottom: 6px;
        }

        .placeholder-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: #1f2521;
        }

        .placeholder-sub {
          font-size: 0.85rem;
          color: #717a74;
          max-width: 440px;
        }

        /* ── Dashboard Layout ── */
        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        /* ── Table Card ── */
        .table-card {
          background: #ffffff;
          border: 1px solid #e8e5dc;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(30, 25, 15, 0.03);
        }

        .table-top-bar {
          padding: 18px 24px;
          border-bottom: 1px solid #eeebe2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .table-heading-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .table-heading {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1f1c;
        }

        .count-pill {
          background: #f1ede3;
          color: #4f5751;
          font-size: 0.76rem;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 999px;
        }

        .search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          font-size: 0.8rem;
          opacity: 0.5;
        }

        .search-input {
          padding: 8px 30px 8px 32px;
          border: 1.5px solid #dedbd0;
          border-radius: 9px;
          font-size: 0.84rem;
          font-family: inherit;
          color: #1b201d;
          background: #faf9f6;
          width: 260px;
          outline: none;
          transition: all 0.16s ease;
        }

        .search-input:focus {
          background: #ffffff;
          border-color: #15803d;
          box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.12);
        }

        .clear-search {
          position: absolute;
          right: 8px;
          background: none;
          border: none;
          color: #8b938d;
          font-size: 1rem;
          cursor: pointer;
          padding: 0 4px;
        }

        .table-scroll {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.86rem;
          text-align: left;
        }

        .data-table thead tr {
          background: #faf9f6;
          border-bottom: 1px solid #ebe7de;
        }

        .data-table th {
          padding: 12px 18px;
          font-size: 0.74rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #6a736d;
        }

        .data-table tbody tr {
          border-bottom: 1px solid #f2efea;
          transition: background 0.12s ease;
        }

        .data-table tbody tr:hover {
          background: #faf9f6;
        }

        .data-table td {
          padding: 14px 18px;
          vertical-align: middle;
        }

        .col-num {
          text-align: center;
        }

        .num-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: #f1ede3;
          color: #555e58;
          font-size: 0.72rem;
          font-weight: 700;
          border-radius: 6px;
        }

        .theme-title {
          font-weight: 600;
          color: #181d1a;
          line-height: 1.4;
          max-width: 300px;
        }

        .members-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          max-width: 320px;
        }

        .member-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #f4f2ea;
          border: 1px solid #e5e1d5;
          color: #2b332d;
          font-size: 0.78rem;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .lead-dot {
          color: #d97706;
          font-size: 0.75rem;
        }

        .email-link {
          color: #15803d;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 500;
        }

        .email-link:hover {
          text-decoration: underline;
        }

        .dash {
          color: #b0b6b1;
        }

        .date-text {
          font-size: 0.78rem;
          color: #6f7872;
          white-space: nowrap;
        }

        /* ── Empty State ── */
        .empty-state {
          text-align: center;
          padding: 56px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .empty-icon {
          font-size: 2rem;
          margin-bottom: 4px;
        }

        .empty-title {
          font-weight: 600;
          color: #262c28;
          font-size: 0.95rem;
        }

        .empty-sub {
          font-size: 0.82rem;
          color: #7b837d;
        }

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .auth-controls {
            width: 100%;
          }
          .password-input {
            width: 100%;
          }
          .search-input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
