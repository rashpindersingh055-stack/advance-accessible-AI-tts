# 🎙️ Vision Max Intelligence — Neural Voice Studio (v2.0)

An enterprise-grade, mobile- and desktop-friendly Voice AI platform built with **React / Vite + Tailwind CSS** on the frontend and **Python (FastAPI + SciPy/NumPy DSP + SQLAlchemy DB)** on the backend.

Protected with **WAF Application Firewall & DDoS Rate Limiter**, and configured for **1-Click Vercel Serverless & Docker Deployment**.

---

## 🌟 Key Features

1. **Vercel Serverless Ready (`vercel.json` & `api/index.py`)**:
   - Zero-config deployment on Vercel with automatic Python ASGI serverless routing.
2. **WAF Application Firewall & DDoS Protection (`SecurityFirewallMiddleware`)**:
   - Real-time SQL Injection, XSS, and Remote Code Execution attack detection and blocking.
   - Sliding-window IP rate limiting (120 req/min) to prevent quota depletion and DDoS attacks.
   - Malicious bot and vulnerability scanner filtering.
   - Full OWASP Security Headers (`CSP`, `HSTS`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
3. **Pro Database & User Onboarding**:
   - First-time user registration modal with SQLite/SQLAlchemy persistent storage.
   - Automatic email notification dispatched to `rashpindertechwith@gmail.com` with user full name, email, phone number, gender, age, client IP, and timestamp.
4. **Dynamic Engine Switcher (4 Engines)**:
   - `gemini-2.5-flash-preview-tts` (Standard / Stable)
   - `gemini-3.1-flash-tts` (Next-Gen Expressive Audio)
   - `gemini-3-pro-tts` (Cinematic Studio Master)
   - `gemini-2.5-pro-tts` (Legacy Pro)
5. **30 Neural Voice Personas & 10 Emotion Styles**:
   - High-fidelity vocal timbre across all tonal spectrums with gender and characteristic filtering.
6. **60FPS Real-Time Waveform Visualizer & Audio Deck**:
   - Dual-channel reactive canvas spectrum analyzer with scrub timeline, speed multiplier (0.75x–2.0x), volume slider, and dual export in **24kHz Lossless WAV** & **128kbps MP3**.
7. **Multi-Speaker Podcast & Dialogue Studio**:
   - Multi-character timeline sequencer with custom speaker assignment and pause gaps.
8. **Audio FX & DSP Lab**:
   - Parametric pitch shifter (-12st to +12st), spatial reverb simulator, and bass warmth EQ boost.

---

## 🚀 Deployment on Vercel (1-Click)

### Step 1: Push to GitHub / GitLab
```bash
git init
git add .
git commit -m "feat: Vision Max Neural Studio Production v2.0"
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

### Step 2: Import into Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository.
3. In **Environment Variables**, add:
   - `GEMINI_API_KEY`: `your_google_ai_studio_api_key`
4. Click **Deploy**.

Vercel will automatically build the React frontend into `frontend/dist` and deploy the FastAPI backend as a serverless ASGI handler at `/api/*`!

---

## 💻 Local Development (PowerShell / Windows)

Run the single PowerShell launcher script:
```powershell
.\start_studio.ps1
```

Or start the servers individually:

```powershell
# 1. Start Python Backend
cd backend
pip install -r requirements.txt
python run.py

# 2. Start React Frontend
cd frontend
npm install
npm run dev
```

- **Frontend App**: `http://localhost:3000`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`

---

## 🐳 Docker Deployment

```bash
docker-compose up --build -d
```

Access the studio at `http://localhost:8000`.

---

## 🛡️ Security & WAF Protection

The backend incorporates an enterprise security layer:
- **Rate Limiting**: Limits abusive client requests to 120 req/minute per IP address.
- **WAF Inspection**: Analyzes incoming query parameters and headers against attack signatures.
- **Edge Headers**: Injects `Strict-Transport-Security`, `X-XSS-Protection`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.
- **Database Safety**: Parameterized queries through SQLAlchemy preventing SQL injection vulnerabilities.

---

## 📂 Project Architecture

```
├── api/
│   └── index.py                # Vercel serverless ASGI entrypoint
├── backend/
│   ├── database.py             # SQLite / SQLAlchemy database connection
│   ├── middleware/
│   │   └── firewall.py         # WAF Firewall, DDoS Limiter & OWASP headers
│   ├── models/
│   │   ├── schemas.py          # Pydantic schemas (TTS, Dialogue, User Auth)
│   │   └── user.py             # SQLAlchemy User table model
│   ├── routers/
│   │   ├── auth.py             # User onboarding, database & email dispatcher
│   │   ├── tts.py              # Single voice speech synthesis & streaming
│   │   ├── dialogue.py         # Multi-speaker podcast sequencer
│   │   └── effects.py          # Pro Audio DSP & Equalizer
│   ├── services/
│   │   ├── gemini_tts.py       # Gemini API client with LRU caching & fallback
│   │   ├── audio_processor.py  # PCM16, WAV, MP3, 3-Band EQ & Limiter
│   │   └── email_service.py    # Notification dispatcher to rashpindertechwith@gmail.com
│   ├── main.py                 # FastAPI application
│   ├── run.py                  # Uvicorn runner
│   └── requirements.txt        # Backend dependencies
├── frontend/
│   ├── public/
│   │   ├── favicon.svg         # Glowing equalizer vector icon
│   │   ├── icon.svg            # 512x512 app icon
│   │   ├── logo.svg            # Horizontal brand logo
│   │   ├── og-banner.svg       # Social share preview card
│   │   └── manifest.json       # PWA Web App manifest
│   ├── src/
│   │   ├── components/         # All React studio components & modals
│   │   ├── constants/          # 30 Voices, 10 Styles, 13 Languages
│   │   ├── services/           # Hybrid unified API client with ping test
│   │   └── utils/              # Audio encoders & formatters
│   ├── package.json
│   └── vite.config.js
├── vercel.json                 # Vercel serverless deployment configuration
├── .vercelignore               # Vercel build exclusions
├── Dockerfile                  # Multi-stage production Docker container
├── docker-compose.yml          # Container orchestration
├── start_studio.ps1            # PowerShell launcher
├── start_studio.bat            # Windows 1-click batch launcher
└── README.md                   # Full documentation
```

---

## 🛡️ License & Credits
Crafted with pride by **Vision Max Intelligence**.
