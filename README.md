<div align="center">

# ðŸ›¡ï¸ ScamShield AI

### Think before you click.

**AI-powered scam detection for texts, emails, WhatsApp, links, and screenshots â€” before they cost you.**

[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Engine-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](#-license)

[Live Demo](https://scamshield-ai-synercloud.vercel.app/) Â· [Report Bug](https://github.com/devrkumawat/scamshield-ai/issues) Â· [Request Feature](https://github.com/devrkumawat/scamshield-ai/issues)

</div>

---

## ðŸ“– About

**ScamShield AI** is a full-stack application that uses **Google Gemini** to analyze suspicious content and flag potential scams in real time. Whether it's a shady SMS, a phishing email, a WhatsApp forward, a sketchy link, or a screenshot of a suspicious chat â€” ScamShield AI reads it, reasons about it, and tells you exactly how risky it is and why. Think before you click.

Built for a world where fraud shows up in every inbox, DM, and text thread, ScamShield AI aims to be the first line of defense between people and the scammers trying to trick them.

## âœ¨ Features

| | |
|---|---|
| ðŸ’¬ **Text & SMS Analysis** | Paste any message and get an instant scam-likelihood assessment |
| ðŸ“§ **Email Scanning** | Detect phishing attempts, spoofed senders, and social-engineering red flags |
| ðŸŸ¢ **WhatsApp Message Analysis** | Spot scam patterns common in WhatsApp forwards and DMs |
| ðŸ”— **Link Inspection** | Identify malicious or suspicious URLs before you click |
| ðŸ–¼ï¸ **Screenshot Detection** | Upload a screenshot â€” ScamShield AI reads and analyzes the content directly |
| ðŸ§  **AI-Powered Reasoning** | Google Gemini explains *why* something looks like a scam, not just a score |
| âš¡ **Real-Time Results** | Fast analysis via a lightweight Express API |

## ðŸ§± Tech Stack

**Frontend**
- React

**Backend**
- Node.js + Express

**AI Engine**
- Google Gemini API

## ðŸ—ï¸ Project Structure

```
scamshield-ai/
â”œâ”€â”€ scamshield-backend/     # Express API â€” handles requests & Gemini integration
â””â”€â”€ scamshield-frontend/    # React client â€” UI for submitting text, links & screenshots
```

## ðŸš€ Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm or yarn
- A [Google Gemini API key](https://ai.google.dev/)

### 1. Clone the repository

```bash
git clone https://github.com/devrkumawat/scamshield-ai.git
cd scamshield-ai
```

### 2. Set up the backend

```bash
cd scamshield-backend
npm install
```

Create a `.env` file in `scamshield-backend/`:

```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key
```

Start the server:

```bash
npm start
```

### 3. Set up the frontend

```bash
cd ../scamshield-frontend
npm install
```

Create a `.env` file in `scamshield-frontend/` (adjust the URL to match your backend):

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the client:

```bash
npm start
```

The app should now be running at `http://localhost:3000`, connected to the API at `http://localhost:5000`.

## ðŸ” How It Works

1. A user submits text, a link, or uploads a screenshot through the React frontend.
2. The request hits the Express backend, which prepares the content for analysis.
3. The backend sends the content to **Google Gemini**, which evaluates it for scam indicators â€” urgency tactics, impersonation, suspicious links, financial requests, and more.
4. Gemini's assessment is parsed into a clear risk verdict with reasoning, returned to the frontend, and displayed to the user.

## ðŸ—ºï¸ Roadmap

- [ ] Browser extension for inline scanning
- [ ] Scam pattern history & personal dashboard
- [ ] Multi-language support
- [ ] Community-reported scam database

## ðŸ¤ Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ðŸ“„ License

Distributed under the MIT License. See `LICENSE` for more information.

## âš ï¸ Disclaimer

ScamShield AI is an assistive tool powered by AI and is **not a substitute for professional advice or official fraud verification**. Always verify suspicious activity through official channels (e.g., calling your bank directly) before taking action.

---

<div align="center">

Built with ðŸ›¡ï¸ by [devrkumawat](https://github.com/devrkumawat)

</div>
