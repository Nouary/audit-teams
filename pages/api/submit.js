import { saveTeam, getTeams } from "../../lib/sheets";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { theme, members, email, presentationOrder, hasCustomSubject } = req.body || {};

  // 1. Validation de l'ordre de passage (1 à 15 obligatoire, premier arrivé premier servi)
  const orderNum = parseInt(presentationOrder, 10);
  if (isNaN(orderNum) || orderNum < 1 || orderNum > 15) {
    return res.status(400).json({
      error: "Veuillez sélectionner un ordre de passage valide entre 1 et 15.",
    });
  }

  // Vérification de la disponibilité du créneau
  try {
    const existingTeams = await getTeams();
    const isSlotTaken = existingTeams.some(
      (t) => parseInt(t.presentationOrder || t.order, 10) === orderNum
    );
    if (isSlotTaken) {
      return res.status(400).json({
        error: `L'ordre de passage n° ${orderNum} vient déjà d'être réservé par une autre équipe. Veuillez choisir un autre numéro libre.`,
      });
    }
  } catch (err) {
    console.warn("Vérification des créneaux ignorée en cas de déconnexion:", err.message);
  }

  // 2. Gestion du sujet (proposé ou en attente du professeur)
  const hasSubject = Boolean(hasCustomSubject);
  let finalTheme = "";
  let subjectStatus = "";

  if (hasSubject) {
    if (!theme || typeof theme !== "string" || !theme.trim()) {
      return res.status(400).json({
        error: "Vous avez indiqué avoir un sujet : veuillez renseigner le thème choisi.",
      });
    }
    finalTheme = theme.trim();
    subjectStatus = "Proposé par l'équipe";
  } else {
    finalTheme = "En attente d'une proposition du professeur";
    subjectStatus = "En attente du professeur";
  }

  // 3. Validation des membres (3 obligatoires, max 4)
  const cleanMembers = Array.isArray(members)
    ? members.map((m) => (m || "").trim()).filter(Boolean)
    : [];

  if (cleanMembers.length < 3 || cleanMembers.length > 4) {
    return res.status(400).json({
      error: "Une équipe doit obligatoirement être composée de 3 ou 4 membres.",
    });
  }

  const entry = {
    id: `team_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    presentationOrder: orderNum,
    hasCustomSubject: hasSubject,
    needsSubject: !hasSubject,
    subjectStatus,
    theme: finalTheme,
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
        "Erreur lors de l'enregistrement dans Google Sheets. Veuillez réessayer dans quelques instants.",
    });
  }
}
