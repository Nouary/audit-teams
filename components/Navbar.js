import Link from "next/link";

export function Logo({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#1b241e" />
      <circle cx="24" cy="24" r="18" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
      <path
        d="M26 9L15 25H24L21 39L33 23H24L26 9Z"
        fill="#22c55e"
        stroke="#16a34a"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="15" r="1.5" fill="#22c55e" opacity="0.6" />
      <circle cx="35" cy="33" r="1.5" fill="#22c55e" opacity="0.6" />
    </svg>
  );
}

export default function Navbar({ activeTab = "form" }) {
  return (
    <header className="nav-header">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          <Logo size={38} />
          <div className="brand-text">
            <div className="brand-title">
              <span>M357</span>
              <span className="brand-sep">·</span>
              <span>Audit Énergétique</span>
            </div>
            <div className="brand-sub">ENSA Fès · GESI</div>
          </div>
        </Link>

        <nav className="nav-tabs">
          <Link
            href="/"
            className={`tab-link ${activeTab === "form" ? "tab-active" : ""}`}
            id="nav-tab-form"
          >
            <span className="tab-icon">📝</span>
            <span className="tab-label">Inscription</span>
          </Link>
          <Link
            href="/admin"
            className={`tab-link ${activeTab === "admin" ? "tab-active" : ""}`}
            id="nav-tab-admin"
          >
            <span className="tab-icon">📊</span>
            <span className="tab-label">Tableau de bord</span>
          </Link>
        </nav>
      </div>

      <style jsx>{`
        .nav-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(250, 249, 245, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #eae5da;
        }

        .nav-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        :global(.nav-brand) {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none !important;
          color: inherit !important;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .brand-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #171c19;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none !important;
        }

        .brand-sep {
          color: #16a34a;
        }

        .brand-sub {
          font-size: 0.72rem;
          color: #6a736d;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .nav-tabs {
          display: flex;
          background: #ebe6dc;
          padding: 3px;
          border-radius: 10px;
          gap: 2px;
        }

        :global(.tab-link) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 500;
          color: #555e57 !important;
          text-decoration: none !important;
          transition: all 0.16s ease;
          user-select: none;
        }

        :global(.tab-link:hover) {
          color: #181d1a !important;
          text-decoration: none !important;
        }

        :global(.tab-link.tab-active) {
          background: #ffffff !important;
          color: #15803d !important;
          font-weight: 600 !important;
          box-shadow: 0 1px 3px rgba(30, 25, 15, 0.08);
          text-decoration: none !important;
        }

        .tab-icon {
          font-size: 0.85rem;
          line-height: 1;
        }

        @media (max-width: 640px) {
          .nav-inner {
            padding: 10px 16px;
          }
          .brand-sub {
            display: none;
          }
          :global(.tab-label) {
            display: none;
          }
          :global(.tab-link) {
            padding: 8px 12px;
          }
        }
      `}</style>
    </header>
  );
}
