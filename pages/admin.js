import { useState } from "react";
import Head from "next/head";

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
      setError("Erreur reseau");
    }
    setLoading(false);
  };

  const exportXlsx = () => {
    window.location.href = `/api/export?password=${encodeURIComponent(password)}`;
  };

  return (
    <div className="wrap">
      <Head>
        <title>M357 - Admin Equipes Audit</title>
      </Head>
      <p className="module">M357 : Efficacite et Audit Energetique</p>
      <h1>Administration - Equipes</h1>

      <div className="row">
        <input
          type="password"
          placeholder="Mot de passe admin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={load} disabled={loading || !password}>
          {loading ? "Chargement..." : "Afficher les equipes"}
        </button>
        <button onClick={exportXlsx} disabled={!password} className="secondary">
          Telecharger Excel
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {teams && (
        <>
          <p>{teams.length} equipe(s) inscrite(s)</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Theme</th>
                <th>Membres</th>
                <th>Email</th>
                <th>Soumis le</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t, i) => (
                <tr key={t.id}>
                  <td>{i + 1}</td>
                  <td>{t.theme}</td>
                  <td>{t.members.join(", ")}</td>
                  <td>{t.email || "-"}</td>
                  <td>{new Date(t.submittedAt).toLocaleString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <style jsx>{`
        .wrap {
          max-width: 900px;
          margin: 40px auto;
          padding: 0 20px;
          font-family: system-ui, sans-serif;
        }
        .module {
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.04em;
          color: #888;
          font-weight: 700;
          margin-bottom: 4px;
        }
        h1 {
          font-size: 1.4rem;
        }
        .row {
          display: flex;
          gap: 10px;
          margin: 16px 0;
          flex-wrap: wrap;
        }
        input {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          flex: 1;
          min-width: 180px;
        }
        button {
          background: #111;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
        button.secondary {
          background: #1a7f37;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .error {
          color: #c0392b;
          font-weight: 600;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th,
        td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 0.9rem;
        }
        th {
          background: #f4f6f8;
        }
      `}</style>
    </div>
  );
}
