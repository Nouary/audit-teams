import { getTeams } from "../../lib/sheets";
import * as XLSX from "xlsx";

export default async function handler(req, res) {
  const { password } = req.query;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Mot de passe incorrect." });
  }

  try {
    const teams = await getTeams();
    // Sort by presentation order if present, otherwise by date
    teams.sort((a, b) => {
      const orderA = a.presentationOrder || 999;
      const orderB = b.presentationOrder || 999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(a.submittedAt) - new Date(b.submittedAt);
    });

    const rows = teams.map((t, i) => ({
      "N°": i + 1,
      "Ordre de passage": t.presentationOrder ? `Passage #${t.presentationOrder}` : "Non assigné",
      "Statut Sujet": t.subjectStatus || (t.hasCustomSubject ? "Proposé" : "En attente du prof"),
      "Thème d'audit": t.theme,
      "Membre 1 (Chef)": t.members[0] || "",
      "Membre 2": t.members[1] || "",
      "Membre 3": t.members[2] || "",
      "Membre 4": t.members[3] || "",
      "Email contact": t.email || "",
      "Date inscription": new Date(t.submittedAt).toLocaleString("fr-FR"),
    }));

    const ws = XLSX.utils.json_to_sheet(rows, { origin: "A3" });
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        ["M357 : Efficacité et Audit Énergétique — ENSA Fès"],
        ["Liste des équipes et ordres de passage"],
      ],
      { origin: "A1" }
    );
    ws["!cols"] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 22 },
      { wch: 35 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 28 },
      { wch: 20 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipes M357");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="m357_equipes_audit_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx"`
    );
    return res.status(200).send(buf);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur lors de l'exportation." });
  }
}
