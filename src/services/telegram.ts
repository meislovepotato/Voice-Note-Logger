import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import fs from "fs";
import path from "path";

import { transcribeAudio, summarize } from "./ai";
import { appendRow } from "./sheets";

export function startTelegramBot() {
  const token = process.env.BOT_TOKEN;

  if (!token) throw new Error("BOT_TOKEN missing");

  const bot = new TelegramBot(token, {
    polling: {
      autoStart: true,
      params: {
        offset: -1,
      },
    },
  });

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Send me a voice note.");
  });

  bot.on("message", async (msg) => {
    if (!msg.voice?.file_id) return;

    const chatId = msg.chat.id;
    const fileId = msg.voice.file_id;

    if (!fileId) return;

    let outputPath: string | undefined;

    try {
      bot.sendMessage(chatId, "Processing voice note...");

      const tempDir = path.join(__dirname, "..", "temp");
      fs.mkdirSync(tempDir, { recursive: true });

      outputPath = path.join(tempDir, `${fileId}.ogg`);

      const stream = bot.getFileStream(fileId);

      const writer = fs.createWriteStream(outputPath);

      await new Promise((resolve, reject) => {
        stream.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const transcript = await transcribeAudio(outputPath);
      const summary = await summarize(transcript);

      await appendRow([new Date().toISOString(), transcript, summary]);

      bot.sendMessage(
        chatId,
        `Transcript:\n${transcript}\n\nSummary:\n${summary}`,
      );
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, "Something went wrong.");
    } finally {
      if (outputPath) {
        fs.promises.unlink(outputPath).catch(() => {});
      }
    }
  });

  console.log("Bot running...");
}
