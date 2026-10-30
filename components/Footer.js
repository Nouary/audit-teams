export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-main">
          <strong>ENSA Fès</strong> · École Nationale des Sciences Appliquées
        </div>
        <div className="footer-meta">
          Module M357 : Efficacité et Audit Énergétique · Filière Génie Électrique & Systèmes Intelligents
        </div>
        <div className="footer-copy">
          Université Sidi Mohamed Ben Abdellah · Année Universitaire 2025–2026
        </div>
      </div>

      <style jsx>{`
        .site-footer {
          margin-top: auto;
          padding: 32px 20px 40px;
          border-top: 1px solid #eae6dc;
          text-align: center;
          color: #7a827c;
          font-size: 0.8rem;
          line-height: 1.6;
        }

        .footer-content {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .footer-main {
          color: #2b312d;
          font-weight: 500;
        }

        .footer-meta {
          color: #555c56;
          font-size: 0.77rem;
        }

        .footer-copy {
          color: #8c948e;
          font-size: 0.73rem;
          margin-top: 4px;
        }
      `}</style>
    </footer>
  );
}
