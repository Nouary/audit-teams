import { useState, useMemo } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  IconLock,
  IconRefresh,
  IconDownload,
  IconUsers,
  IconGraduation,
  IconMail,
  IconCalendar,
  IconSearch,
  IconClose,
  IconClipboardCheck,
  IconEmptyBox,
  IconStar,
  IconAlert,
  IconPresentation,
  IconBulb,
} from "../components/Icons";

function StatCard({ value, label, icon, sub, highlight = false }) {
  return (
    <div className={`stat-card ${highlight ? "stat-card-highlight" : ""}`}>
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
        .stat-card-highlight {
          border-color: #fcd34d;
          background: #fffdf5;
        }
        .stat-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 11px;
          background: #f4f1e8;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #15803d;
          flex-shrink: 0;
        }
        .stat-card-highlight .stat-icon-wrap {
          background: #fef3c7;
          color: #b45309;
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
  const [filterSubject, setFilterSubject] = useState("all"); // 'all' | 'needs' | 'has'
  const [sortBy, setSortBy] = useState("order"); // 'order' | 'date'

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

  // Computed stats
  const totalTeams = teams?.length ?? 0;
  const totalStudents = teams?.reduce((sum, t) => sum + (t.members?.length || 0), 0) ?? 0;
  const needsSubjectCount = teams?.filter((t) => t.needsSubject || (t.theme || "").toLowerCase().includes("attente")).length ?? 0;
  const hasSubjectCount = totalTeams - needsSubjectCount;
  const reservedSlotsCount = teams?.filter((t) => t.presentationOrder).length ?? 0;

  // Filtered and sorted teams
  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    let list = [...teams];

    // Filter by subject status
    if (filterSubject === "needs") {
      list = list.filter((t) => t.needsSubject || (t.theme || "").toLowerCase().includes("attente"));
    } else if (filterSubject === "has") {
      list = list.filter((t) => !t.needsSubject && !(t.theme || "").toLowerCase().includes("attente"));
    }

    // Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((t) => {
        const themeMatch = (t.theme || "").toLowerCase().includes(q);
        const emailMatch = (t.email || "").toLowerCase().includes(q);
        const orderMatch = t.presentationOrder ? `créneau #${t.presentationOrder} passage ${t.presentationOrder} #${t.presentationOrder}`.includes(q) : false;
        const memberMatch = (t.members || []).some((m) => (m || "").toLowerCase().includes(q));
        return themeMatch || emailMatch || memberMatch || orderMatch;
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "order") {
        const orderA = a.presentationOrder || 999;
        const orderB = b.presentationOrder || 999;
        if (orderA !== orderB) return orderA - orderB;
      }
      return new Date(a.submittedAt) - new Date(b.submittedAt);
    });

    return list;
  }, [teams, search, filterSubject, sortBy]);

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
                <span className="badge-light">Créneaux 1 à 15</span>
              </div>
              <h1 className="header-title">Tableau de bord des inscriptions</h1>
              <p className="header-sub">
                Gérez les équipes inscrites, visualisez les créneaux d'ordre de passage choisis et identifiez les équipes qui attendent un sujet de projet.
              </p>
            </div>

            <div className="auth-controls">
              <div className="password-input-wrap">
                <span className="lock-icon"><IconLock size={15} /></span>
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
                    <span className="btn-icon-text">
                      <IconRefresh size={14} />
                      <span>Actualiser</span>
                    </span>
                  ) : (
                    <span>Accéder aux équipes</span>
                  )}
                </button>

                {teams && (
                  <button
                    id="btn-export"
                    onClick={exportXlsx}
                    className="btn-export"
                    title="Télécharger la feuille de calcul Excel"
                  >
                    <IconDownload size={15} />
                    <span>Exporter Excel</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="alert-error">
              <span className="alert-icon"><IconAlert size={13} /></span>
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Unloaded placeholder hint */}
        {!teams && !loading && !error && (
          <div className="welcome-placeholder">
            <div className="placeholder-icon"><IconClipboardCheck size={38} /></div>
            <div className="placeholder-title">Entrez le mot de passe pour consulter les inscriptions</div>
            <p className="placeholder-sub">
              Visualisez en temps réel les créneaux réservés par les étudiants et les demandes d'attribution de sujet.
            </p>
          </div>
        )}

        {/* Dashboard Loaded State */}
        {teams && (
          <div className="dashboard-content">
            {/* KPI Stat Cards */}
            <div className="stats-grid">
              <StatCard
                value={`${reservedSlotsCount} / 15`}
                label="Créneaux réservés"
                icon={<IconPresentation size={22} />}
                sub="Ordres de passage 1 à 15"
              />
              <StatCard
                value={totalTeams}
                label="Équipes inscrites"
                icon={<IconUsers size={22} />}
                sub={`${totalStudents} étudiants au total`}
              />
              <StatCard
                value={needsSubjectCount}
                label="En attente de sujet"
                icon={<IconBulb size={22} />}
                sub="À attribuer par le professeur"
                highlight={needsSubjectCount > 0}
              />
              <StatCard
                value={hasSubjectCount}
                label="Sujets proposés"
                icon={<IconClipboardCheck size={22} />}
                sub="Proposés par les étudiants"
              />
            </div>

            {/* Table Card */}
            <div className="table-card">
              <div className="table-top-bar">
                <div className="table-left-controls">
                  <div className="table-heading-group">
                    <h2 className="table-heading">Équipes & Passages</h2>
                    <span className="count-pill">
                      {filteredTeams.length} / {totalTeams} équipe{totalTeams > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Filter tabs */}
                  <div className="filter-pill-group">
                    <button
                      className={`filter-btn ${filterSubject === "all" ? "filter-active" : ""}`}
                      onClick={() => setFilterSubject("all")}
                    >
                      Toutes ({totalTeams})
                    </button>
                    <button
                      className={`filter-btn ${filterSubject === "needs" ? "filter-active filter-warn" : ""}`}
                      onClick={() => setFilterSubject("needs")}
                    >
                      ⚠️ Sujet à attribuer ({needsSubjectCount})
                    </button>
                    <button
                      className={`filter-btn ${filterSubject === "has" ? "filter-active" : ""}`}
                      onClick={() => setFilterSubject("has")}
                    >
                      ✓ Sujet proposé ({hasSubjectCount})
                    </button>
                  </div>
                </div>

                <div className="table-right-controls">
                  {/* Sort selector */}
                  <div className="sort-selector">
                    <span className="sort-label">Trier par :</span>
                    <button
                      className={`sort-btn ${sortBy === "order" ? "sort-active" : ""}`}
                      onClick={() => setSortBy("order")}
                    >
                      Ordre (1-15)
                    </button>
                    <button
                      className={`sort-btn ${sortBy === "date" ? "sort-active" : ""}`}
                      onClick={() => setSortBy("date")}
                    >
                      Date
                    </button>
                  </div>

                  <div className="search-wrap">
                    <span className="search-icon"><IconSearch size={14} /></span>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Filtrer par thème, nom, #passage..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button className="clear-search" onClick={() => setSearch("")} aria-label="Effacer">
                        <IconClose size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {filteredTeams.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    {search ? <IconSearch size={32} /> : <IconEmptyBox size={36} />}
                  </div>
                  <div className="empty-title">
                    {search ? "Aucun résultat trouvé" : "Aucune équipe dans cette vue"}
                  </div>
                  <div className="empty-sub">
                    {search
                      ? `Aucune équipe ne correspond à la recherche "${search}".`
                      : "Toutes les équipes ont été traitées ou aucune équipe n'est inscrite."}
                  </div>
                </div>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: "90px" }}>Passage</th>
                        <th style={{ width: "170px" }}>Statut Sujet</th>
                        <th>Thème d'audit énergétique</th>
                        <th>Membres de l'équipe</th>
                        <th>Email de contact</th>
                        <th style={{ width: "150px" }}>Date d'enregistrement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeams.map((t, idx) => {
                        const isAwaitingSubject = t.needsSubject || (t.theme || "").toLowerCase().includes("attente");
                        return (
                          <tr key={t.id || idx} className={isAwaitingSubject ? "row-awaiting-subject" : ""}>
                            <td className="col-order">
                              {t.presentationOrder ? (
                                <span className="order-pill">
                                  #{t.presentationOrder}
                                </span>
                              ) : (
                                <span className="order-unassigned">Non défini</span>
                              )}
                            </td>
                            <td className="col-status">
                              {isAwaitingSubject ? (
                                <span className="status-badge-warn" title="Cette équipe attend que l'enseignant lui propose un sujet d'audit">
                                  <span className="warn-dot">●</span>
                                  <span>À attribuer par le prof</span>
                                </span>
                              ) : (
                                <span className="status-badge-ok">
                                  <span>✓ Proposé par l'équipe</span>
                                </span>
                              )}
                            </td>
                            <td className="col-theme">
                              {isAwaitingSubject ? (
                                <div className="theme-awaiting">
                                  <em>En attente d'une proposition de l'enseignant</em>
                                </div>
                              ) : (
                                <div className="theme-title">{t.theme}</div>
                              )}
                            </td>
                            <td className="col-members">
                              <div className="members-chips">
                                {t.members && t.members.map((m, j) => (
                                  <span key={j} className="member-chip">
                                    {j === 0 && (
                                      <span className="lead-star" title="Chef d'équipe">
                                        <IconStar size={11} />
                                      </span>
                                    )}
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
                        );
                      })}
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
          max-width: 1160px;
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
          max-width: 560px;
        }

        .badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          flex-wrap: wrap;
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
          left: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #727b75;
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

        .btn-icon-text {
          display: inline-flex;
          align-items: center;
          gap: 6px;
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
          color: #15803d;
          display: flex;
          justify-content: center;
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
          max-width: 480px;
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

        .table-left-controls {
          display: flex;
          align-items: center;
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

        .filter-pill-group {
          display: flex;
          background: #f2efe7;
          padding: 3px;
          border-radius: 8px;
          gap: 3px;
        }

        .filter-btn {
          border: none;
          background: transparent;
          font-size: 0.76rem;
          font-weight: 500;
          color: #555e57;
          padding: 5px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .filter-btn:hover {
          color: #1b201d;
        }

        .filter-active {
          background: #ffffff;
          color: #15803d;
          font-weight: 700;
          box-shadow: 0 1px 3px rgba(30, 25, 15, 0.08);
        }

        .filter-warn.filter-active {
          color: #b45309;
        }

        .table-right-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .sort-selector {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #faf9f6;
          border: 1px solid #dedbd0;
          padding: 2px 4px;
          border-radius: 8px;
        }

        .sort-label {
          font-size: 0.72rem;
          color: #7b837d;
          margin-left: 4px;
        }

        .sort-btn {
          border: none;
          background: transparent;
          font-size: 0.72rem;
          font-weight: 600;
          color: #636b65;
          padding: 4px 8px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .sort-active {
          background: #18211b;
          color: #ffffff;
        }

        .search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 11px;
          display: flex;
          align-items: center;
          color: #7d857f;
          pointer-events: none;
        }

        .search-input {
          padding: 8px 30px 8px 32px;
          border: 1.5px solid #dedbd0;
          border-radius: 9px;
          font-size: 0.84rem;
          font-family: inherit;
          color: #1b201d;
          background: #faf9f6;
          width: 250px;
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
          background: #eae5dc;
          border: none;
          color: #616a64;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease;
        }

        .clear-search:hover {
          background: #ded7ca;
          color: #1b201d;
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

        .row-awaiting-subject {
          background: #fffdf7;
        }

        .data-table td {
          padding: 14px 18px;
          vertical-align: middle;
        }

        .col-order {
          text-align: center;
        }

        .order-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 10px;
          background: #18211b;
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 700;
          border-radius: 7px;
          box-shadow: 0 1px 3px rgba(24, 33, 27, 0.18);
        }

        .order-unassigned {
          font-size: 0.75rem;
          color: #949c95;
          font-style: italic;
        }

        .col-status {
          white-space: nowrap;
        }

        .status-badge-warn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fef3c7;
          border: 1px solid #fde68a;
          color: #92400e;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 6px;
        }

        .warn-dot {
          color: #d97706;
          font-size: 0.7rem;
        }

        .status-badge-ok {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #eaf5ee;
          border: 1px solid #cde7d6;
          color: #15803d;
          font-size: 0.74rem;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 6px;
        }

        .theme-title {
          font-weight: 600;
          color: #181d1a;
          line-height: 1.4;
          max-width: 280px;
        }

        .theme-awaiting {
          color: #92400e;
          font-size: 0.82rem;
        }

        .members-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          max-width: 300px;
        }

        .member-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f4f2ea;
          border: 1px solid #e5e1d5;
          color: #2b332d;
          font-size: 0.78rem;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .lead-star {
          color: #d97706;
          display: inline-flex;
          align-items: center;
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
          gap: 8px;
        }

        .empty-icon {
          color: #8f9791;
          display: flex;
          align-items: center;
          justify-content: center;
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
          .filter-pill-group {
            width: 100%;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
