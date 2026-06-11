import dotenv from "dotenv";
import express from "express";

dotenv.config({ path: ".env" });

// Load services after dotenv so environment variables are available to them
const { startTelegramBot } = require("./services/telegram");

const requiredEnv = ["BOT_TOKEN", "ASSEMBLY_API_KEY", "GOOGLE_SHEET_ID"];

const missing = requiredEnv.filter((k) => !process.env[k]);

const hasGoogleServiceAccount = !!(
  process.env.GOOGLE_SERVICE_ACCOUNT || process.env.GOOGLE_CREDENTIALS
);
const hasGoogleEnvPair = !!(
  process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY
);

if (!hasGoogleServiceAccount && !hasGoogleEnvPair) {
  missing.push(
    "GOOGLE_SERVICE_ACCOUNT or (GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY)",
  );
}

if (missing.length > 0) {
  console.error(
    `Missing required environment variables: ${missing.join(", ")}`,
  );
  process.exit(1);
}

startTelegramBot();

const app = express();

app.get("/", (_, res) => {
  res.send("Wallet Alert Bot is running");
});

app.get("/health", (_, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
