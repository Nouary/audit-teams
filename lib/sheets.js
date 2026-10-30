import { google } from "googleapis";
import fs from "fs";
import path from "path";

const localDbPath = path.join(process.cwd(), ".teams-local-db.json");

function getLocalData() {
  try {
    if (fs.existsSync(localDbPath)) {
      return JSON.parse(fs.readFileSync(localDbPath, "utf-8"));
    }
  } catch (e) {
    console.error("Local DB read error:", e);
  }
  return { teams: [] };
}

function saveLocalData(data) {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Local DB write error:", e);
  }
}

function getGoogleAuth() {
  let credentials = null;

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch {
      try {
        const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, "base64").toString("utf-8");
        credentials = JSON.parse(decoded);
      } catch (err) {
        console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON", err);
      }
    }
  } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }

  if (!credentials || !process.env.GOOGLE_SHEET_ID) {
    return null;
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

/**
 * Ensures header row exists if sheet is empty
 */
async function ensureHeaders(sheets, spreadsheetId, sheetName = "Sheet1") {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:J1`,
    });
    if (!res.data.values || res.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:J1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [
              "Date d'inscription",
              "ID Equipe",
              "Ordre de passage",
              "Statut Sujet",
              "Thème d'audit",
              "Membre 1 (Chef)",
              "Membre 2",
              "Membre 3",
              "Membre 4",
              "Email de contact",
            ],
          ],
        },
      });
    }
  } catch (err) {
    console.warn("Header check note:", err.message);
  }
}

/**
 * Save an audit team into Google Sheets
 */
export async function saveTeam(entry) {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (webhookUrl) {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!resp.ok) {
      throw new Error(`Google Apps Script error: ${resp.statusText}`);
    }
    return entry;
  }

  const auth = getGoogleAuth();
  if (auth) {
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    await ensureHeaders(sheets, spreadsheetId);

    const row = [
      new Date(entry.submittedAt).toLocaleString("fr-FR"),
      entry.id,
      entry.presentationOrder || "",
      entry.subjectStatus || (entry.hasCustomSubject ? "Proposé par l'équipe" : "En attente du professeur"),
      entry.theme,
      entry.members[0] || "",
      entry.members[1] || "",
      entry.members[2] || "",
      entry.members[3] || "",
      entry.email || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "A:J",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row],
      },
    });

    return entry;
  }

  // Local fallback
  console.log("ℹ️ [Local fallback] Saving to .teams-local-db.json");
  const data = getLocalData();
  data.teams = data.teams || [];
  data.teams.push(entry);
  saveLocalData(data);
  return entry;
}

/**
 * Retrieve all registered teams
 */
export async function getTeams() {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (webhookUrl) {
    const resp = await fetch(`${webhookUrl}?action=get`);
    if (resp.ok) {
      const data = await resp.json();
      const rawTeams = Array.isArray(data.teams) ? data.teams : [];
      return rawTeams.map((t, idx) => {
        const order = parseInt(t.presentationOrder || t.order, 10);
        const hasCustom = t.hasCustomSubject !== undefined ? Boolean(t.hasCustomSubject) : !(t.theme || "").toLowerCase().includes("attente");
        return {
          ...t,
          presentationOrder: isNaN(order) ? null : order,
          hasCustomSubject: hasCustom,
          needsSubject: !hasCustom,
          subjectStatus: t.subjectStatus || (hasCustom ? "Proposé par l'équipe" : "En attente du professeur"),
        };
      });
    }
  }

  const auth = getGoogleAuth();
  if (auth) {
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A2:J",
    });

    const rows = res.data.values || [];
    return rows.map((r) => {
      // Check if row has 10 columns (new format) or 8 columns (legacy)
      const isNewFormat = r.length >= 9;
      if (isNewFormat) {
        const order = parseInt(r[2], 10);
        const subjectStatus = r[3] || "";
        const theme = r[4] || "";
        const members = [r[5], r[6], r[7], r[8]].filter(Boolean);
        const hasCustom = !subjectStatus.toLowerCase().includes("attente") && !theme.toLowerCase().includes("attente");
        return {
          submittedAt: r[0] || new Date().toISOString(),
          id: r[1] || "",
          presentationOrder: isNaN(order) ? null : order,
          subjectStatus: subjectStatus || (hasCustom ? "Proposé par l'équipe" : "En attente du professeur"),
          hasCustomSubject: hasCustom,
          needsSubject: !hasCustom,
          theme,
          members,
          email: r[9] || "",
        };
      } else {
        const theme = r[2] || "";
        const members = [r[3], r[4], r[5], r[6]].filter(Boolean);
        const hasCustom = !theme.toLowerCase().includes("attente");
        return {
          submittedAt: r[0] || new Date().toISOString(),
          id: r[1] || "",
          presentationOrder: null,
          subjectStatus: hasCustom ? "Proposé par l'équipe" : "En attente du professeur",
          hasCustomSubject: hasCustom,
          needsSubject: !hasCustom,
          theme,
          members,
          email: r[7] || "",
        };
      }
    });
  }

  // Local fallback
  const data = getLocalData();
  const list = Array.isArray(data.teams) ? data.teams : [];
  return list.map((t) => {
    const order = parseInt(t.presentationOrder || t.order, 10);
    const hasCustom = t.hasCustomSubject !== undefined ? Boolean(t.hasCustomSubject) : !(t.theme || "").toLowerCase().includes("attente");
    return {
      ...t,
      presentationOrder: isNaN(order) ? null : order,
      hasCustomSubject: hasCustom,
      needsSubject: !hasCustom,
      subjectStatus: t.subjectStatus || (hasCustom ? "Proposé par l'équipe" : "En attente du professeur"),
    };
  });
}
