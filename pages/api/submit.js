import { saveTeam, getTeams } from "../../lib/sheets";

// Fonction pour normaliser les noms (minuscules, sans accents, sans espaces multiples)
function normalizeName(name) {
  return (name || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { theme, members, email, presentationOrder, hasCustomSubject } = req.body || {};

  // 1. Validation de l'ordre de passage (1 à 15 obligatoire)
  const orderNum = parseInt(presentationOrder, 10);
  if (isNaN(orderNum) || orderNum < 1 || orderNum > 15) {
    return res.status(400).json({
      error: "Veuillez sélectionner un ordre de passage valide entre 1 et 15.",
    });
  }

  // 2. Validation des membres de l'équipe (3 obligatoires, max 4)
  const cleanMembers = Array.isArray(members)
    ? members.map((m) => (m || "").trim()).filter(Boolean)
    : [];

  if (cleanMembers.length < 3 || cleanMembers.length > 4) {
    return res.status(400).json({
      error: "Une équipe doit obligatoirement être composée de 3 ou 4 membres.",
    });
  }

  // 2.a Vérification qu'il n'y a pas de doublon au sein de la même équipe
  const normalizedMembers = cleanMembers.map(normalizeName);
  const duplicatesInside = cleanMembers.filter(
    (m, idx) => normalizedMembers.indexOf(normalizeName(m)) !== idx
  );
  if (duplicatesInside.length > 0) {
    return res.status(400).json({
      error: `Le membre « ${duplicatesInside[0]} » est saisi plusieurs fois dans votre équipe.`,
    });
  }

  // 3. Récupération des équipes existantes pour vérifications
  let existingTeams = [];
  try {
    existingTeams = await getTeams();
  } catch (err) {
    console.warn("Vérification des équipes existantes ignorée en cas d'erreur de lecture:", err.message);
  }

  // 3.a Vérification de la disponibilité du créneau (premier arrivé premier servi)
  const isSlotTaken = existingTeams.some(
    (t) => parseInt(t.presentationOrder || t.order, 10) === orderNum
  );
  if (isSlotTaken) {
    return res.status(400).json({
      error: `L'ordre de passage n° ${orderNum} vient déjà d'être réservé par une autre équipe. Veuillez choisir un autre créneau libre.`,
    });
  }

  // 3.b Vérification qu'aucun membre n'est déjà inscrit dans une autre équipe
  for (const newMember of cleanMembers) {
    const norm = normalizeName(newMember);
    const conflictTeam = existingTeams.find((t) =>
      (t.members || []).some((existingMember) => normalizeName(existingMember) === norm)
    );

    if (conflictTeam) {
      const existingName =
        (conflictTeam.members || []).find((m) => normalizeName(m) === norm) || newMember;
      const teamDetail = conflictTeam.presentationOrder
        ? ` (Équipe n° ${conflictTeam.presentationOrder})`
        : "";
      return res.status(400).json({
        error: `L'étudiant(e) « ${existingName} » est déjà inscrit(e) dans une autre équipe${teamDetail}. Un étudiant ne peut pas appartenir à deux équipes différentes.`,
      });
    }
  }

  // 4. Gestion du sujet (proposé ou en attente du professeur)
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
