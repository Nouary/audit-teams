import { useState } from "react";
import Head from "next/head";

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
        msg: "Equipe enregistree avec succes !",
        ok: true,
      });
      setTheme("");
      setEmail("");
      setMembers(["", "", "", ""]);
    } catch (err) {
      setStatus({
        loading: false,
        msg: "Erreur reseau, reessaie.",
        ok: false,
      });
    }
  };

  return (
    <div className="container">
      <Head>
        <title>M357 - Inscription Equipes Audit Energetique</title>
      </Head>

      <main className="card">
        <p className="module">M357 : Efficacite et Audit Energetique</p>
        <h1>Inscription des equipes</h1>
        <p className="subtitle">
          Chaque equipe (3 ou 4 personnes) choisit un theme et remplit ce
          formulaire une seule fois.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Theme choisi *
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex: Audit energetique d'un batiment industriel"
              required
            />
          </label>

          <fieldset>
            <legend>Membres de l'equipe (3 obligatoires, 4e optionnel)</legend>
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
            Email de contact (optionnel)
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@usmba.ac.ma"
            />
          </label>

          <button type="submit" disabled={status.loading}>
            {status.loading ? "Envoi..." : "Valider mon equipe"}
          </button>

          {status.msg && (
            <p className={status.ok ? "success" : "error"}>{status.msg}</p>
          )}
        </form>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f4f6f8;
          padding: 24px;
        }
        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          padding: 32px;
          max-width: 480px;
          width: 100%;
        }
        .module {
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.04em;
          color: #888;
          font-weight: 700;
          margin-bottom: 6px;
        }
        h1 {
          font-size: 1.4rem;
          margin-bottom: 4px;
        }
        .subtitle {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 20px;
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
          font-size: 0.9rem;
          font-weight: 600;
        }
        fieldset {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        legend {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0 4px;
        }
        input {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 0.95rem;
        }
        button {
          background: #111;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 6px;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .success {
          color: #1a7f37;
          font-weight: 600;
        }
        .error {
          color: #c0392b;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
