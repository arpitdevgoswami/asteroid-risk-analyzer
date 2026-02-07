# Asteroid Risk Analyzer

Quick local setup (Windows / macOS / Linux):

1. Install Node.js (16+ recommended).
2. From the project root install JS deps:

```bash
npm install
```

3. Seed the JSON DB (copies sample data into `data/asteroids.json`):

```bash
npm run seed
```

4. Start the API server:

```bash
npm run start:api
# or run auth server separately in another terminal
npm run start:auth
```

Endpoints:

- GET /api/asteroids — list asteroids
- GET /api/stats — DB stats
- POST /api/refresh — fetch latest from NASA (uses API key in `server1.js`)

Notes:
- This repository uses a JSON-file-based DB (`data/asteroids.json`) for simple local runs.
- If you prefer a SQL-backed DB, re-enable `better-sqlite3` and `sqlite3` and follow platform-specific install instructions for native modules.

If you need me to (A) add an npm `dev` script to run both servers concurrently, or (B) re-enable SQLite with install instructions, tell me which and I'll make the change.
