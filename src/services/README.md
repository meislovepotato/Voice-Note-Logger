# Services

This folder contains modular service code used by the application. Each file is focused on a single concern so they can be tested and replaced independently.

Files

- `ai.ts`
  - Purpose: Wraps the AI transcription provider (AssemblyAI by default).
  - Main responsibilities:
    - Upload audio files or forward audio URLs to the transcription API.
    - Poll for or await transcription results.
    - Normalize transcription responses into a consistent shape (text, confidence, timestamps if available).
  - Expected exports (conceptual): `transcribeFile(filePath): Promise<{text:string, id?:string, raw:any}>`.

- `converter.ts`
  - Purpose: Convert incoming audio blobs into a consistent PCM/WAV/MP3 format expected by the transcription service.
  - Main responsibilities:
    - Detect input format and metadata.
    - Use `fluent-ffmpeg` + `ffmpeg-static` to perform conversions.
    - Store converted files in `temp/` and return the path.
  - Expected exports (conceptual): `convertToWav(inputPath): Promise<string>`.

- `sheets.ts`
  - Purpose: Append transcription results and metadata into Google Sheets.
  - Main responsibilities:
    - Authenticate with Google Sheets using a service account JSON (`accounts.json` values).
    - Format rows (timestamp, sender info, transcription text, audio file name/URL, duration, confidence).
    - Append rows to the configured spreadsheet.
  - Expected exports (conceptual): `appendTranscription(row: object): Promise<void>`.

- `telegram.ts`
  - Purpose: Start and wire the Telegram bot, handle incoming voice messages, and orchestrate processing.
  - Main responsibilities:
    - Listen for `voice` and `audio` messages from Telegram.
    - Download the incoming file to `temp/`.
    - Call `converter` to prepare the file and `ai` to transcribe it.
    - Call `sheets` to persist the result and optionally reply to the user with the transcript.
  - Expected exports (conceptual): `startBot(): void` or `initTelegram(botToken, handlers)`.

Error handling & retries

- Services should surface errors to the caller and avoid swallowing failures silently.
- Transcription may be retried or polled depending on the provider; implement backoff if needed.

Extensibility

- Swap the transcription provider by replacing `ai.ts` without changing the rest of the system.
- The sheets module is separated so you can replace Google Sheets with a database or other storage.
