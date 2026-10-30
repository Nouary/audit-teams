import { kv } from "../../lib/kv";

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
    // Chaque equipe est stockee comme un champ dans un hash KV "teams"
    await kv.hset("teams", { [entry.id]: JSON.stringify(entry) });
    return res.status(200).json({ ok: true, entry });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error:
        "Erreur serveur. Verifie que la base Vercel KV est bien connectee au projet.",
    });
  }
}
