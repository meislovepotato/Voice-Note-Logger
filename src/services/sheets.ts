import { google } from "googleapis";
import fs from "fs";
import path from "path";

function loadServiceAccount() {
  // Support storing the whole service account JSON in one env var
  const rawJson =
    process.env.GOOGLE_SERVICE_ACCOUNT || process.env.GOOGLE_CREDENTIALS;

  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      const client_email = parsed.client_email;
      const private_key = parsed.private_key;
      if (client_email && private_key) return { client_email, private_key };
      // fallthrough to error below
    } catch (e) {
      // not JSON, continue to separate vars
    }
  }

  const client_email = process.env.GOOGLE_CLIENT_EMAIL;
  const private_key = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  return { client_email, private_key };
}

const creds = loadServiceAccount();

if (!creds.client_email || !creds.private_key) {
  // Try loading accounts.json from project root as a convenience during local dev
  try {
    const candidate = path.resolve(process.cwd(), "accounts.json");
    if (fs.existsSync(candidate)) {
      const raw = fs.readFileSync(candidate, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed.client_email && parsed.private_key) {
        creds.client_email = parsed.client_email;
        creds.private_key = parsed.private_key;
      }
    }
  } catch (e) {
    // ignore and throw below
  }

  if (!creds.client_email || !creds.private_key) {
    throw new Error(
      "Google credentials missing: set GOOGLE_SERVICE_ACCOUNT (JSON) or GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in environment, or add accounts.json to project root",
    );
  } else {
    console.warn(
      "Using Google credentials from local accounts.json (development only). Consider setting env variables instead.",
    );
  }
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: creds.client_email,
    private_key: creds.private_key,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function appendRow(data: string[]) {
  const client = await auth.getClient();

  const sheets = google.sheets({
    version: "v4",
    auth: client as any,
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A:C",
    valueInputOption: "RAW",
    requestBody: {
      values: [data],
    },
  });
}
