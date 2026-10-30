import { getTeams } from "../../lib/sheets";
import * as XLSX from "xlsx";

export default async function handler(req, res) {
  const { password } = req.query;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Mot de passe incorrect." });
  }

  try {
    const teams = await getTeams();
    teams.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

    const rows = teams.map((t, i) => ({
      "N° Equipe": i + 1,
      "Thème": t.theme,
      "Membre 1": t.members[0] || "",
      "Membre 2": t.members[1] || "",
      "Membre 3": t.members[2] || "",
      "Membre 4": t.members[3] || "",
      "Email contact": t.email || "",
      "Soumis le": new Date(t.submittedAt).toLocaleString("fr-FR"),
    }));

    const ws = XLSX.utils.json_to_sheet(rows, { origin: "A3" });
    XLSX.utils.sheet_add_aoa(
      ws,
      [["M357 : Efficacite et Audit Energetique"], ["Liste des equipes"]],
      { origin: "A1" }
    );
    ws["!cols"] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipes Audit");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="equipes_audit_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx"`
    );
    return res.status(200).send(buf);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}
