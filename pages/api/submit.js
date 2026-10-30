import { saveTeam } from "../../lib/sheets";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Methode non autorisee" });
  }

  const { theme, members, email } = req.body || {};

  if (!theme || typeof theme !== "string" || !theme.trim()) {
    return res.status(400).json({ error: "Le theme est obligatoire." });
  }

  const cleanMembers = Array.isArray(members)
    ? members.map((m) => (m || "").trim()).filter(Boolean)
    : [];

  if (cleanMembers.length < 3 || cleanMembers.length > 4) {
    return res
      .status(400)
      .json({ error: "Une equipe doit avoir 3 ou 4 membres." });
  }

  const entry = {
    id: `team_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    theme: theme.trim(),
    members: cleanMembers,
    email: (email || "").trim(),
    submittedAt: new Date().toISOString(),
  };

  try {
    await saveTeam(entry);
    return res.status(200).json({ ok: true, entry });
  } catch (err) {
    console.error("Erreur lors de l'enregistrement de l'équipe:", err);
    return res.status(500).json({
      error:
        "Erreur lors de l'enregistrement dans Google Sheets. Vérifiez la configuration.",
    });
  }
}
