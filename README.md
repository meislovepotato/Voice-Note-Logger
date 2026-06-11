# Voice Note Logger

> A small Node.js/TypeScript service that accepts voice notes (via Telegram), transcribes them using an AI transcription service, converts audio formats when needed, and logs the results to Google Sheets.

## Summary

- Receives voice notes from a Telegram bot.
- Converts incoming audio to a consistent format using `ffmpeg`.
- Sends audio to an AI transcription service (AssemblyAI or similar).
- Persists transcriptions and metadata into Google Sheets.

## Features

- Telegram bot integration to receive voice notes.
- Automatic audio conversion for consistent transcription results.
- AssemblyAI (or similar) transcription integration.
- Google Sheets logging for record-keeping and analytics.

## Requirements

- Node.js 18+ (or a modern LTS). Tested with Node 18 and 20.
- npm or yarn
- A Google service account with Sheets API access (spreadsheet ID and credentials).
- A Telegram bot token.
- An AI transcription API key (AssemblyAI is used in dependencies).

## Repository layout

- `package.json` — npm scripts and dependencies.
- `tsconfig.json` — TypeScript config.
- `src/` — Source TypeScript files. Entry: `src/index.ts`.
- `src/services/` — Service modules: `ai.ts`, `converter.ts`, `sheets.ts`, `telegram.ts`.
- `temp/` — Temporary directory for audio files and intermediate artifacts.

## Installation

1. Install dependencies:

```bash
npm install
```

2. Provide credentials via environment variables or a local `.env` file. Do NOT commit secrets.

3. Run in development:

```bash
npm run dev
```

4. Build and run production:

```bash
npm run build
npm start
```

Notes:

- The application reads credentials from environment variables. You can place them in a local `.env` file for development when using `dotenv`.

- Required Google credentials: either set `GOOGLE_SERVICE_ACCOUNT` (JSON string) or both `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY`.

- Other required env vars: `BOT_TOKEN`, `ASSEMBLY_API_KEY`, `GOOGLE_SHEET_ID`.

## Environment & Tools

- The project uses `ffmpeg` via `ffmpeg-static` and `fluent-ffmpeg` to handle audio conversions.
- Transcription is performed with `assemblyai` (package present). You can replace it with another provider; see `src/services/ai.ts`.

## Scripts (from package.json)

- `npm run dev` — Run the app in dev using `ts-node-dev`.
- `npm run build` — Compile TypeScript to `dist/`.
- `npm run start` — Run the compiled `dist/index.js`.
- `npm run test` — Placeholder; no tests configured.

## Files of interest

- `src/index.ts` — Application entrypoint; wires services together and starts the Telegram bot.
- `src/services/telegram.ts` — Telegram bot listeners and handlers for incoming voice messages.
- `src/services/converter.ts` — Converts incoming audio blobs to a consistent format for transcription.
- `src/services/ai.ts` — Wrapper for calling the transcription API and polling results.
- `src/services/sheets.ts` — Writes transcription rows into Google Sheets.

## Development notes

- Keep `temp/` cleared routinely; audio files may be large. The project uses `fs-extra` for file operations.
- If you run into `ffmpeg` issues, ensure `ffmpeg-static` installed matches your platform and that `fluent-ffmpeg` can find the binary.

## Contributing

- Open an issue describing the change or bug.
- Create a branch and a PR with focused changes.

## License

- ISC (see `package.json`).
