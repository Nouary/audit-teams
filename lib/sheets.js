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
      // Check if it's base64 encoded
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
      range: `${sheetName}!A1:H1`,
    });
    if (!res.data.values || res.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:H1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [
              "Date d'inscription",
              "ID Equipe",
              "Thème",
              "Membre 1",
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
    // If sheetName doesn't match default, try reading without sheet prefix
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
      entry.theme,
      entry.members[0] || "",
      entry.members[1] || "",
      entry.members[2] || "",
      entry.members[3] || "",
      entry.email || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "A:H",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row],
      },
    });

    return entry;
  }

  // Local fallback when Google credentials are not yet configured
  console.log("ℹ️ [Local fallback] Saving to .teams-local-db.json (Google credentials not set)");
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
      return Array.isArray(data.teams) ? data.teams : [];
    }
  }

  const auth = getGoogleAuth();
  if (auth) {
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A2:H",
    });

    const rows = res.data.values || [];
    const teams = rows.map((r) => {
      const members = [r[3], r[4], r[5], r[6]].filter(Boolean);
      return {
        submittedAt: r[0] || new Date().toISOString(),
        id: r[1] || "",
        theme: r[2] || "",
        members,
        email: r[7] || "",
      };
    });

    return teams;
  }

  // Local fallback
  const data = getLocalData();
  return Array.isArray(data.teams) ? data.teams : [];
}
