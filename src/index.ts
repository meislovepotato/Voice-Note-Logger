import dotenv from "dotenv";
import { startTelegramBot } from "./services/telegram";

dotenv.config({ path: ".env" });

const requiredEnv = [
  "BOT_TOKEN",
  "ASSEMBLY_API_KEY",
  "GOOGLE_CLIENT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "GOOGLE_SHEET_ID",
];

const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(
    `Missing required environment variables: ${missing.join(", ")}`,
  );
  process.exit(1);
}

startTelegramBot();
