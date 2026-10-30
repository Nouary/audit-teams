import { getTeams } from "../../lib/sheets";

export default async function handler(req, res) {
  const { password } = req.query;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Mot de passe incorrect." });
  }

  try {
    const teams = await getTeams();
    teams.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    return res.status(200).json({ teams });
  } catch (err) {
    console.error("Erreur lors de la récupération des équipes:", err);
    return res.status(500).json({ error: "Erreur serveur Google Sheets." });
  }
}
