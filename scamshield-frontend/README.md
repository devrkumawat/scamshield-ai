
Action: file_editor create /app/work/out/scamshield-ai/README.md --file-text "# ScamShield AI — Frontend

Premium, dark-themed React dashboard for the ScamShield AI scam-detection product.
**Vite + React + Tailwind + React Router + Framer Motion + Recharts.**

This frontend is fully wired to the ScamShield backend
(`scamshield-backend` — Node.js + Express + MongoDB + Gemini). No mock data.

## 1. Configure the backend URL

Copy the example env file and edit as needed:

```bash
cp .env.example .env
```

Then open `.env` and set the backend base URL (no trailing slash, no `/api`):

```
VITE_API_URL=http://localhost:8001
```

Change this to point at wherever the ScamShield backend is running — locally,
on a staging server, or in production. `/api` is appended automatically by the
API client.

> The backend must have CORS enabled for the frontend's origin. This is on by
> default (`CORS_ORIGIN=*`); tighten it in the backend `.env` for production.

## 2. Install & run

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## 3. Build for production

```bash
npm run build
npm run preview
```

## Pages

- `/` — Dashboard: totals, quick-scan cards, recent scans, charts (all from backend)
- `/scan/text` — Text / SMS scanner → `POST /api/analyze/text`
- `/scan/whatsapp` — WhatsApp scanner → `POST /api/analyze/whatsapp`
- `/scan/email` — Email scanner → `POST /api/analyze/email`
- `/scan/url` — URL scanner → `POST /api/analyze/url`
- `/scan/screenshot` — Screenshot scanner → `POST /api/analyze/screenshot` (multipart)
- `/result` — Latest scan result with risk gauge, breakdown, red flags & advice
- `/about` — Loads from `GET /api/about`

## Integration notes

- API client lives in `src/lib/api.js`. It uses `fetch` (no extra deps) and
  reads `VITE_API_URL` at build time.
- Backend response is normalized into UI-friendly shapes by
  `src/lib/adapters.js` (`toResult`, `toScanRow`).
- Risk-level mapping (`safe | low | suspicious | high | critical`
  → `safe | suspicious | high_risk`) lives in `src/lib/constants.js`.
- Scan history and dashboard stats are re-fetched from the backend on every
  Dashboard mount (`GET /api/dashboard`).

## Backend environment reminder

Set these in the **backend** `.env` before running the frontend against it
(see the backend README for the full list):

```
PORT=8001
MONGO_URI=<your MongoDB Atlas connection string>
GEMINI_API_KEY=<your Gemini API key>
CORS_ORIGIN=*
```

Without a valid `MONGO_URI` the dashboard/history endpoints return empty
aggregates. Without `GEMINI_API_KEY` the backend falls back to the rule
engine only — the frontend still renders full verdicts.
"
Observation: Overwrite successful: /app/work/out/scamshield-ai/README.md