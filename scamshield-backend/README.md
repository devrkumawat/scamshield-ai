# ScamShield AI — Backend

Production-ready Node.js + Express backend that detects scams, phishing, and fraud across **text, WhatsApp, email, URLs, screenshots, and QR codes** — combining a rule-based cybersecurity engine with **Gemini 2.5 Flash**.

## ✨ Features

- 🧠 **Hybrid analysis**: rule engine + Gemini 2.5 Flash + URL reputation
- 📸 **OCR** for screenshots (Tesseract.js)
- 📱 **QR code** decoding (jsQR + Sharp)
- ⚡ **SSE streaming** — real-time typing animation of Gemini response
- 📊 **Dashboard aggregates** (totals, distributions, 7-day trend, recents)
- 💾 **MongoDB Atlas** persistence of every scan
- 🛡️ Helmet, CORS, rate limiting, centralized error handling
- 🧱 Clean **MVC** architecture

## 📂 Project structure

```
scamshield-backend/
├── config/
│   ├── db.js              # Mongoose connection
│   └── gemini.js          # Gemini 2.5 Flash client
├── controllers/
│   ├── analysisController.js
│   ├── dashboardController.js
│   ├── aboutController.js
│   └── healthController.js
├── middlewares/
│   ├── errorHandler.js
│   ├── upload.js          # Multer image upload
│   └── validate.js
├── models/
│   └── Analysis.js        # Mongoose schema
├── routes/
│   ├── analysisRoutes.js
│   ├── dashboardRoutes.js
│   ├── aboutRoutes.js
│   └── healthRoutes.js
├── services/
│   ├── analysisService.js # Orchestrator
│   └── geminiService.js   # Gemini + SSE stream
├── utils/
│   ├── ruleEngine.js      # 14 scam heuristic categories
│   ├── riskCalculator.js  # Combined 0-100 score
│   ├── ocr.js
│   ├── qrDecoder.js
│   └── urlChecker.js
├── uploads/               # Multer temp
├── .env.example
├── package.json
└── index.js
```

## 🚀 Quick start

```bash
# 1. Install
cd scamshield-backend
npm install

# 2. Configure
cp .env.example .env
# Edit .env and set:
#   MONGO_URI=<your MongoDB Atlas connection string>
#   GEMINI_API_KEY=<your Gemini API key>

# 3. Run
npm run dev        # nodemon
# or
npm start
```

Backend listens on `http://localhost:8001` (configurable via `PORT`).

## 🔑 Environment variables

| Var | Description | Default |
|-----|-------------|---------|
| `PORT` | HTTP port | `8001` |
| `NODE_ENV` | `development` / `production` | `development` |
| `MONGO_URI` | MongoDB Atlas connection string | *(required for persistence)* |
| `DB_NAME` | Database name | `scamshield` |
| `GEMINI_API_KEY` | Google Gemini API key | *(required for AI analysis)* |
| `GEMINI_MODEL` | Model name | `gemini-2.5-flash` |
| `CORS_ORIGIN` | Allowed origin(s) | `*` |
| `MAX_UPLOAD_SIZE_MB` | Image upload limit | `8` |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window | `60000` |
| `RATE_LIMIT_MAX` | Requests per window on `/api/analyze/*` | `60` |

> The app boots even if `MONGO_URI` or `GEMINI_API_KEY` are missing — you'll get a warning and reduced functionality (no persistence / rule-engine-only verdicts).

## 📡 API reference

Base URL: `http://localhost:8001/api`

### Health & info
- `GET  /health` → service + dependency status
- `GET  /about` → app metadata, capabilities, detection categories
- `GET  /dashboard` → aggregated stats (totals, distributions, trend, recent)

### Analysis (returns full JSON verdict)
- `POST /analyze/text`       — `{ "text": "..." }`
- `POST /analyze/whatsapp`   — `{ "text": "..." }`
- `POST /analyze/email`      — `{ "subject": "...", "body": "...", "sender": "..." }`
- `POST /analyze/url`        — `{ "url": "https://..." }`
- `POST /analyze/screenshot` — `multipart/form-data` field `image`
- `POST /analyze/qr`         — `multipart/form-data` field `image`

### Streaming (typing animation)
- `POST /analyze/stream` — `{ "inputType": "text|whatsapp|email|url", "text": "..." }`
  - Server-Sent Events. Emits:
    - `rules` — early rule-engine hits
    - `chunk` — Gemini text chunks (for typing effect)
    - `ai_error` — Gemini failure (rule engine still returns final)
    - `final` — full assembled analysis object (same shape as non-streaming)
    - `done` — end of stream

## 📦 Consistent response shape

```json
{
  "success": true,
  "data": {
    "id": "…",
    "riskScore": 87,
    "riskLevel": "critical",
    "confidence": 92,
    "scamType": "OTP Phishing",
    "summary": "Message impersonates SBI and requests an OTP…",
    "detectedIndicators": [
      { "category": "OTP / credential harvesting", "keyword": "OTP", "weight": 20 }
    ],
    "analysisBreakdown": {
      "keywordRules": 65,
      "aiClassification": 90,
      "semanticAnalysis": 88,
      "contextualReasoning": 92,
      "urlReputation": 40
    },
    "explanation": ["Requests OTP which no bank ever asks for…", "…"],
    "preventiveSteps": ["Never share OTPs.", "…"],
    "recommendedAction": "Do NOT reply. Block the number and report at cybercrime.gov.in.",
    "urlAnalyses": [ { "url": "…", "host": "…", "score": 55, "findings": ["…"] } ],
    "processingMs": 2130
  }
}
```

## 🧪 Quick test (curl)

```bash
curl -X POST http://localhost:8001/api/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"text":"URGENT! Your SBI account will be blocked. Share OTP 456789 to verify KYC. https://sbi-verify.tk"}'
```

## 🖥️ SSE client example

```js
const res = await fetch('/api/analyze/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ inputType: 'text', text: '...' }),
});

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buf = '';
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  buf += decoder.decode(value, { stream: true });
  const events = buf.split('\n\n');
  buf = events.pop();
  for (const raw of events) {
    const [evtLine, dataLine] = raw.split('\n');
    const event = evtLine.replace('event: ', '');
    const data = JSON.parse(dataLine.replace('data: ', ''));
    if (event === 'chunk')      appendTypingText(data.text);
    else if (event === 'final') renderVerdict(data);
  }
}
```

## 📜 License
MIT
