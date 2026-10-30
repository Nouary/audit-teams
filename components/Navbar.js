import Link from "next/link";
import { LogoIcon, IconForm, IconDashboard } from "./Icons";

export { LogoIcon as Logo };

export default function Navbar({ activeTab = "form" }) {
  return (
    <header className="nav-header">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          <LogoIcon size={38} />
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
            <IconForm size={15} className="tab-icon-svg" />
            <span className="tab-label">Inscription</span>
          </Link>
          <Link
            href="/admin"
            className={`tab-link ${activeTab === "admin" ? "tab-active" : ""}`}
            id="nav-tab-admin"
          >
            <IconDashboard size={15} className="tab-icon-svg" />
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
          gap: 7px;
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
        }

        :global(.tab-link.tab-active) {
          background: #ffffff !important;
          color: #15803d !important;
          font-weight: 600 !important;
          box-shadow: 0 1px 3px rgba(30, 25, 15, 0.08);
        }

        :global(.tab-icon-svg) {
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }

        :global(.tab-link.tab-active .tab-icon-svg) {
          color: #15803d;
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
