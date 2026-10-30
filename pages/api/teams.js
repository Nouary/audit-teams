import { kv } from "../../lib/kv";

export default async function handler(req, res) {
  const { password } = req.query;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Mot de passe incorrect." });
  }

  try {
    const raw = await kv.hgetall("teams");
    const teams = Object.values(raw || {}).map((v) =>
      typeof v === "string" ? JSON.parse(v) : v
    );
    teams.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    return res.status(200).json({ teams });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}
