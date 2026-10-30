import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  IconArrowRight,
  IconCheck,
  IconAlert,
  IconBulb,
  IconPresentation,
  IconRefresh,
} from "../components/Icons";

export default function Home() {
  const [hasCustomSubject, setHasCustomSubject] = useState(true);
  const [theme, setTheme] = useState("");
  const [presentationOrder, setPresentationOrder] = useState(null);
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState(["", "", "", ""]);
  const [status, setStatus] = useState({ loading: false, msg: "", ok: null, submittedData: null });

  // Slots 1 to 15 management
  const [takenSlots, setTakenSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch("/api/slots");
      if (res.ok) {
        const data = await res.json();
        setTakenSlots(Array.isArray(data.takenSlots) ? data.takenSlots : []);
      }
    } catch (e) {
      console.warn("Erreur chargement créneaux:", e);
    }
    setLoadingSlots(false);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const updateMember = (i, value) => {
    const next = [...members];
    next[i] = value;
    setMembers(next);
  };

  const handleSlotSelect = (num) => {
    if (takenSlots.includes(num)) return;
    setPresentationOrder(num === presentationOrder ? null : num);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier l'ordre de passage
    if (!presentationOrder) {
      setStatus({
        loading: false,
        msg: "Veuillez choisir un ordre de passage libre entre 1 et 15.",
        ok: false,
        submittedData: null,
      });
      return;
    }

    // Vérifier le sujet si la case est cochée
    if (hasCustomSubject && !theme.trim()) {
      setStatus({
        loading: false,
        msg: "Veuillez renseigner le thème proposé ou décocher la case si vous attendez une proposition du professeur.",
        ok: false,
        submittedData: null,
      });
      return;
    }

    // Vérifier les membres saisis (doublons internes)
    const validMembers = members.map((m) => m.trim()).filter(Boolean);
    const normalized = validMembers.map((m) =>
      m.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ")
    );
    const hasInternalDuplicates = validMembers.some(
      (m, idx) =>
        normalized.indexOf(
          m.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ")
        ) !== idx
    );
    if (hasInternalDuplicates) {
      setStatus({
        loading: false,
        msg: "Veuillez vérifier les membres : le même nom ne peut pas être saisi plusieurs fois dans votre équipe.",
        ok: false,
        submittedData: null,
      });
      return;
    }

    setStatus({ loading: true, msg: "", ok: null, submittedData: null });

    try {
      const payload = {
        hasCustomSubject,
        theme: hasCustomSubject ? theme.trim() : "En attente d'une proposition du professeur",
        presentationOrder,
        members,
        email,
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        // En cas de créneau déjà pris entre temps, recharger les créneaux
        fetchSlots();
        setStatus({ loading: false, msg: data.error, ok: false, submittedData: null });
        return;
      }

      setStatus({
        loading: false,
        msg: "Votre équipe a été enregistrée avec succès !",
        ok: true,
        submittedData: payload,
      });

      // Mettre à jour les créneaux pris
      setTakenSlots((prev) => [...prev, presentationOrder]);
      setTheme("");
      setEmail("");
      setMembers(["", "", "", ""]);
      setPresentationOrder(null);
    } catch (err) {
      setStatus({
        loading: false,
        msg: "Erreur réseau, veuillez vérifier votre connexion et réessayer.",
        ok: false,
        submittedData: null,
      });
    }
  };

  const allSlots = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="layout">
      <Head>
        <title>M357 – Inscription des équipes | ENSA Fès</title>
        <meta
          name="description"
          content="Formulaire officiel d'inscription des équipes et choix de l'ordre de passage pour le module M357 Audit Énergétique – ENSA Fès"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </Head>

      <Navbar activeTab="form" />

      <main className="content">
        <div className="card">
          <div className="card-top">
            <div className="badge-row">
              <span className="badge">M357 · Audit Énergétique</span>
              <span className="badge-light">3 à 4 étudiants</span>
              <span className="badge-light">Créneaux 1 à 15</span>
            </div>
            <h1 className="title">Inscription des équipes</h1>
            <p className="subtitle">
              Chaque groupe soumet ce formulaire <strong>une seule fois</strong> pour réserver son ordre
              de passage (premier arrivé, premier servi) et enregistrer les membres de l'équipe.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ── 1. Choix de l'ordre de passage (1 à 15) ── */}
            <div className="field-section">
              <div className="section-head">
                <div className="section-title-wrap">
                  <span className="section-icon"><IconPresentation size={18} /></span>
                  <div>
                    <span className="section-title">
                      Ordre de passage pour la soutenance <span className="req">*</span>
                    </span>
                    <span className="section-hint">
                      Premier arrivé, premier servi · Choisissez un créneau libre
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-refresh-slots"
                  onClick={fetchSlots}
                  disabled={loadingSlots}
                  title="Actualiser les disponibilités"
                >
                  <IconRefresh size={13} className={loadingSlots ? "spinning" : ""} />
                  <span>Actualiser</span>
                </button>
              </div>

              <div className="slots-grid">
                {allSlots.map((num) => {
                  const isTaken = takenSlots.includes(num);
                  const isSelected = presentationOrder === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={isTaken}
                      onClick={() => handleSlotSelect(num)}
                      className={`slot-card ${isTaken ? "slot-taken" : ""} ${
                        isSelected ? "slot-selected" : ""
                      }`}
                    >
                      <span className="slot-num">#{num}</span>
                      <span className="slot-badge">
                        {isTaken ? "Réservé" : isSelected ? "✓ Choisi" : "Libre"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {presentationOrder ? (
                <div className="slot-selection-summary">
                  ✓ Vous avez sélectionné le <strong>créneau #{presentationOrder}</strong>.
                </div>
              ) : (
                <div className="slot-selection-hint">
                  Veuillez cliquer sur un créneau libre (1 à 15) ci-dessus.
                </div>
              )}
            </div>

            {/* ── 2. Sujet du projet (case à cocher) ── */}
            <div className="field-section">
              <div className="subject-toggle-card">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    className="toggle-checkbox"
                    checked={hasCustomSubject}
                    onChange={(e) => setHasCustomSubject(e.target.checked)}
                  />
                  <div className="toggle-text">
                    <div className="toggle-title">
                      <span className="bulb-icon"><IconBulb size={16} /></span>
                      <span>Nous proposons notre propre sujet d'audit</span>
                    </div>
                    <div className="toggle-desc">
                      Cochez cette case si votre équipe a déjà un sujet. Décochez-la si vous attendez que le professeur vous en attribue un.
                    </div>
                  </div>
                </label>
              </div>

              {hasCustomSubject ? (
                <div className="theme-input-wrap">
                  <label htmlFor="theme" className="label">
                    <span>Thème proposé par votre équipe <span className="req">*</span></span>
                    <span className="hint">Précisez le lieu ou l'installation ciblée</span>
                  </label>
                  <input
                    id="theme"
                    type="text"
                    className="input"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="Ex. : Audit énergétique d'une minoterie / station de pompage"
                    required={hasCustomSubject}
                  />
                </div>
              ) : (
                <div className="no-subject-notice">
                  <span className="notice-icon">ℹ️</span>
                  <div>
                    <strong>Sujet en attente d'attribution :</strong> Le professeur sera notifié
                    sur son tableau de bord et vous affectera un thème d'audit énergétique adapté.
                  </div>
                </div>
              )}
            </div>

            {/* ── 3. Membres du groupe ── */}
            <div className="members-box">
              <div className="members-box-header">
                <div>
                  <div className="members-box-title">Composition de l'équipe <span className="req">*</span></div>
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
                    {i === 0 ? (
                      <span className="tag-lead">Chef d'équipe</span>
                    ) : i < 3 ? (
                      <span className="tag-required">Requis</span>
                    ) : (
                      <span className="tag-optional">Optionnel</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── 4. Contact email ── */}
            <div className="field-group">
              <label htmlFor="email" className="label">
                <span>Email de contact académique</span>
                <span className="hint">Recommandé pour recevoir les validations de l'enseignant</span>
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

            {/* ── Submit button ── */}
            <button type="submit" className="submit-btn" disabled={status.loading}>
              {status.loading ? (
                <span className="btn-inner">
                  <span className="spinner" />
                  <span>Validation de l'inscription...</span>
                </span>
              ) : (
                <span className="btn-inner">
                  <span>Valider et réserver le créneau #{presentationOrder || "..."}</span>
                  <span className="arrow-svg"><IconArrowRight size={16} /></span>
                </span>
              )}
            </button>

            {status.msg && (
              <div className={status.ok ? "alert-success" : "alert-error"}>
                <div className="alert-head">
                  <span className="alert-icon">
                    {status.ok ? <IconCheck size={14} /> : <IconAlert size={14} />}
                  </span>
                  <span className="alert-title">{status.msg}</span>
                </div>
                {status.submittedData && (
                  <div className="alert-details">
                    <div>
                      <strong>Ordre de passage réservé :</strong> Créneau #{status.submittedData.presentationOrder}
                    </div>
                    <div>
                      <strong>Statut du sujet :</strong>{" "}
                      {status.submittedData.hasCustomSubject
                        ? status.submittedData.theme
                        : "En attente d'une proposition du professeur"}
                    </div>
                    <div>
                      <strong>Membres inscrits :</strong>{" "}
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
          padding: 36px 20px 56px;
        }

        .card {
          width: 100%;
          max-width: 600px;
          background: #ffffff;
          border: 1px solid #e8e5dc;
          border-radius: 18px;
          padding: 38px 34px;
          box-shadow: 0 2px 6px rgba(30, 25, 15, 0.03), 0 12px 32px rgba(30, 25, 15, 0.05);
        }

        .card-top {
          margin-bottom: 24px;
        }

        .badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
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
          gap: 22px;
        }

        /* ── Sections ── */
        .field-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .section-title-wrap {
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }

        .section-icon {
          color: #15803d;
          margin-top: 2px;
        }

        .section-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #1f2621;
          display: block;
        }

        .section-hint {
          font-size: 0.74rem;
          color: #747c76;
          display: block;
          margin-top: 2px;
        }

        .btn-refresh-slots {
          background: #f4f2eb;
          border: 1px solid #e2ddd2;
          color: #555e57;
          border-radius: 8px;
          padding: 5px 9px;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.15s ease;
        }

        .btn-refresh-slots:hover:not(:disabled) {
          background: #e9e4d8;
          color: #1b201d;
        }

        .spinning {
          animation: spin 0.8s linear infinite;
        }

        /* ── Slots Grid (1 to 15) ── */
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }

        .slot-card {
          background: #ffffff;
          border: 1.5px solid #dedbd0;
          border-radius: 10px;
          padding: 10px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.16s ease;
          font-family: inherit;
        }

        .slot-card:hover:not(:disabled) {
          border-color: #15803d;
          background: #f7faf7;
          transform: translateY(-1px);
        }

        .slot-num {
          font-size: 1rem;
          font-weight: 700;
          color: #1e2521;
        }

        .slot-badge {
          font-size: 0.65rem;
          font-weight: 600;
          color: #15803d;
          background: #eaf5ee;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .slot-selected {
          background: #18211b !important;
          border-color: #18211b !important;
          color: #ffffff !important;
          transform: scale(1.03);
          box-shadow: 0 4px 12px rgba(24, 33, 27, 0.22);
        }

        .slot-selected .slot-num {
          color: #ffffff;
        }

        .slot-selected .slot-badge {
          background: #22c55e;
          color: #ffffff;
        }

        .slot-taken {
          background: #f5f3ec !important;
          border-color: #e5e1d5 !important;
          opacity: 0.55;
          cursor: not-allowed;
        }

        .slot-taken .slot-num {
          color: #8c948e;
          text-decoration: line-through;
        }

        .slot-taken .slot-badge {
          background: #e8e4da;
          color: #7b837d;
        }

        .slot-selection-summary {
          font-size: 0.8rem;
          color: #15803d;
          background: #edf7f0;
          border: 1px solid #cbe9d3;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 500;
        }

        .slot-selection-hint {
          font-size: 0.77rem;
          color: #7a827c;
          font-style: italic;
        }

        /* ── Subject Toggle Card ── */
        .subject-toggle-card {
          background: #faf9f6;
          border: 1px solid #e8e5dc;
          border-radius: 12px;
          padding: 14px 16px;
          transition: border-color 0.15s ease;
        }

        .toggle-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
        }

        .toggle-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #15803d;
          margin-top: 2px;
          cursor: pointer;
        }

        .toggle-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .toggle-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #1e2420;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bulb-icon {
          color: #d97706;
          display: flex;
        }

        .toggle-desc {
          font-size: 0.75rem;
          color: #6d756f;
          line-height: 1.4;
        }

        .theme-input-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }

        .no-subject-notice {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.8rem;
          color: #92400e;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.5;
        }

        .notice-icon {
          font-size: 0.95rem;
          flex-shrink: 0;
        }

        /* ── Fields & Labels ── */
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
          padding-right: 85px;
        }

        .tag-lead {
          position: absolute;
          right: 12px;
          font-size: 0.68rem;
          font-weight: 700;
          color: #b45309;
          background: #fef3c7;
          border: 1px solid #fde68a;
          padding: 2px 7px;
          border-radius: 5px;
          pointer-events: none;
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

        .tag-optional {
          position: absolute;
          right: 12px;
          font-size: 0.68rem;
          font-weight: 500;
          color: #a4aca6;
          background: #f8f6f0;
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

        .arrow-svg {
          display: inline-flex;
          align-items: center;
          transition: transform 0.16s ease;
        }

        .submit-btn:hover:not(:disabled) .arrow-svg {
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
          gap: 4px;
        }

        @media (max-width: 600px) {
          .card {
            padding: 24px 18px;
          }
          .title {
            font-size: 1.35rem;
          }
          .slots-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
