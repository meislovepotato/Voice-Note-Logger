# Source (src)

This folder contains the TypeScript source for the Voice Note Logger application. The project is structured for a small service with a single entrypoint and modular service files.

Entrypoint

- `src/index.ts` — boots the application, loads `accounts.json`, initializes services, and starts the Telegram listener.

Services

- Implementations live in `src/services/` and are imported by `index.ts`.

Build & Run

- Development (hot reload): `npm run dev` (uses `ts-node-dev`).
- Production build: `npm run build` to compile to `dist/`, then `npm start`.

TypeScript

- The project uses `tsconfig.json` for compilation. Generated output goes to `dist/` when built.

Notes

- Keep `accounts.json` at the repository root for local development. The runtime code expects credentials there.
