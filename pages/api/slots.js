import { getTeams } from "../../lib/sheets";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const teams = await getTeams();
    const takenSlots = teams
      .map((t) => {
        const order = parseInt(t.presentationOrder || t.order, 10);
        return isNaN(order) ? null : order;
      })
      .filter((n) => n !== null && n >= 1 && n <= 15);

    // Unique sorted taken slots
    const uniqueTaken = Array.from(new Set(takenSlots)).sort((a, b) => a - b);

    return res.status(200).json({
      takenSlots: uniqueTaken,
      maxSlots: 15,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des créneaux:", err);
    // Return empty taken slots on network error rather than crashing
    return res.status(200).json({ takenSlots: [], maxSlots: 15 });
  }
}
