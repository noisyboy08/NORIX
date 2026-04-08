<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield.svg" width="80" height="80" alt="Norix Logo">
  
  # Norix v3.0

  **The Supreme God-Level Cognitive Phishing Defense Platform**

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)](https://www.framer.com/motion/)

  <br />
</div>

Norix is an ultra-premium, cutting-edge security platform designed to detect, analyze, and neutralize top-tier cognitive phishing threats. Rebuilt entirely in React & Vite with a "Shadcn/Tailwind UI" aesthetic, Norix represents the intersection between supreme user experience and impenetrable cybersecurity.

---

## 🌟 Supreme Features & Components

Norix encompasses 29 deeply integrated modules providing 360-degree digital security. Here are the major highlights:

### 1. 🛡️ The AI Chrome Extension Layer
A full-featured Chrome extension built using vanilla JS & premium CSS variables, operating offline-first. It overlays real-time, interactive glassmorphic threat badges on links and emails as you browse without ever reporting your data back to a centralized server.

### 2. ⚡ The "God-Level" Dashboard Experience
A multi-page dynamic React application featuring a Cmd/Ctrl+K global command palette, real-time metrics, and deeply interactive dashboards encompassing:
- **Universal Scanner:** Input any URL, SMS, or Raw Email and let the ensemble ML model rip it apart.
- **PhishBot AI:** An integrated LLM assistant answering user questions regarding security posture.
- **Enterprise Fleet Tracker:** Live simulated geographic tracking of protected endpoints across a global organization.
- **Visual DOM Cloning Detection:** Pixel-perfect discrepancy tracking between legitimate domains and visual clones.
- **Deepfake Voice AI Detection:** Acoustic metadata analysis to detect synthetic AI voices in voicemail.

### 3. 🎮 Gamified "Catch the Phish" Sandbox Training
A deeply interactive security training module where users are presented with realistic, interactive UIs (like fake PayPal emails). Users must actively click and identify red flags within the DOM. Scoring scales from "Rookie" to "PhishPro."

### 4. 🧭 Cinematic Landing Page
A Vercel-style landing page featuring a dotted global background grid, complex Framer Motion 3D tilt-card mockups, typing PhishBot AI effects, and pristine light/dark mode implementations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+`
- npm or yarn

### Installation
1. Move to the main project directory:
   ```bash
   cd "Norix/project"
   ```
2. Install standard dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the God-Level UI at `http://localhost:5173`.

### Tests & CI
- **Unit tests:** `npm run test` (Vitest; `npm run test:watch` while developing).
- **E2E smoke tests:** `npm run build` then `npm run test:e2e` (Playwright starts `vite preview` on port 4173).
- **Lint:** `npm run lint`
- GitHub Actions workflow (`.github/workflows/ci.yml`) runs install, typecheck, lint, unit tests, production build, and E2E on push/PR when the workflow is in the repo root.

### Deploy on Vercel (ready)

This repo is configured for Vercel in two ways:
- If you import the **repo root** (`Norix/`), Vercel uses root `vercel.json` and builds from `project/`.
- If you import **`project/` directly**, Vercel uses `project/vercel.json`.

#### 1) Import project
- In Vercel: **New Project** → import your Git repository.
- Either set **Root Directory** to `project`, or keep root (both are supported).

#### 2) Environment variables
Add these in Vercel Project Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (must be the anon JWT starting with `eyJ`)
- `VITE_GEMINI_API_KEY` (optional)

You can copy variable names from `project/.env.example`.

#### 3) Build settings (if not auto-detected)
- Build Command: `npm run build` (or `cd project && npm run build` if deploying from repo root)
- Output Directory: `dist` (or `project/dist` from repo root)

#### 4) SPA routing
`vercel.json` includes rewrite to `index.html` for client-side routes, so URLs like `/?view=app&page=universal` and deep links continue to work.

### Extension Installation (Chrome)
1. Open Google Chrome.
2. Navigate to `chrome://extensions/`.
3. Enable **Developer Mode** in the top right.
4. Click **Load Unpacked**.
5. Select the `extension` folder inside the `Norix/project` directory.
6. The extension is now active. Pin it to your toolbar!

---

## ⌨️ Global Command Palette
From any page within the dashboard, press **`Ctrl + K`** (or `Cmd + K` on Mac) to bring up the global interactive search routing. From here, you can seamlessly navigate to:
- Sandbox Environments
- Live Fleet Tracker
- Phish Training

---

## Detection accuracy, limits, and configuration

**Norix cannot be 100% accurate.** No URL, email, or phone classifier can guarantee correctness in the real world: attackers adapt, legitimate services mimic “urgent” language, and browser-only tools lack access to proprietary threat feeds or carrier databases.

### What the app actually does

1. **Local heuristic engine** (`src/utils/mlDetection.ts`)  
   Weighted URL / text / call-script features (HTTPS, host shape, typosquat-prone patterns, urgency + credential combos, etc.). Scores are **normalized 0–100** with caps so a single weak signal cannot max out the gauge.

2. **Trusted-domain damping** (`src/utils/trustedDomains.ts`)  
   Well-known provider hostnames reduce false positives from generic keywords (e.g. “login” in a path on a major site).

3. **Typosquat helper** (`src/utils/typosquat.ts`)  
   Short edit-distance checks against a **small** set of common brand domains — not a full homoglyph / IDN squatter database.

4. **Optional Supabase Edge Function** (`analyzePhishing` in `src/utils/api.ts`)  
   When `VITE_SUPABASE_URL` and a valid **anon JWT** (`eyJ…`) are set, the UI calls your `detect-phishing` function. If the call fails or env is missing, **`analyzePhishingWithFallback`** returns the same JSON shape from **`buildLocalAnalysisResult`** (`src/utils/localAnalysis.ts`) so the dashboard never silently shows empty results.

5. **Domain context** (`src/utils/threatIntel.ts`)  
   - **RDAP** (via `rdap.org`) for registration age when available.  
   - **ip-api.com** for coarse hosting location — **country is informational only** (it no longer inflates risk by region).  
   - **Brand / hostname** heuristics with expanded official suffixes (e.g. `amazonaws.com`, `googleusercontent.com`) to avoid obvious false “impersonation” flags on infrastructure domains.

6. **Phone page** (`PhoneIntelligence.tsx`)  
   Previously used **random** digit logic — removed. The UI now parses dial prefixes for a **best-effort region guess**, runs **script heuristics** when you paste what the caller said, and clearly states that **spam report counts are not fetched** in the browser.

7. **Email intelligence** (`EmailIntelligence.tsx`)  
   Uses the same `analyzePhishingWithFallback` pipeline plus explicit typosquat messaging; it does **not** claim “domain verified safe” without signals.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL for Edge Functions + community APIs |
| `VITE_SUPABASE_ANON_KEY` | **JWT** anon key (`eyJ…`), not a publishable `sb_*` string |
| `VITE_GEMINI_API_KEY` | Optional: explanations in URL flow / PhishBot |

Copy from `.env.example` if present, or create `.env` in `project/`.

### Recommended hardening (for production)

- Implement or extend the **`detect-phishing`** Edge Function with real feeds (Safe Browsing API, commercial reputation APIs, your own blocklists).  
- Add **server-side** phone reputation (Twilio Lookup, etc.) — not feasible to do honestly from static client JS alone.  
- Log **false positives/negatives** and tune weights; consider per-tenant allowlists for corporate domains.  
- Show users an explicit **“advisory / not legal advice”** banner (the Universal Scanner surfaces **local mode** when Supabase is unset).

---

## 🏗️ Architecture Stack
- **Frontend Framework:** React 19
- **Build Tooling:** Vite 6
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (v3) + Inline CSS Variables (for perfect Light/Dark modes)
- **Animations:** Framer Motion
- **Icons:** Lucide-React
- **Extension API:** Chrome Manifest V3
- **Threat heuristics:** `mlDetection.ts`, `localAnalysis.ts`, `trustedDomains.ts`, `typosquat.ts`, `threatIntel.ts`, `phoneParse.ts`

---

## 🎨 Design Philosophy
The design of Norix is strictly inspired by Top-Tier aesthetics (ui.shadcn.com, Tailwind UI, Vercel).
- **Light Mode:** Pure whites, 1px off-white borders (`border-zinc-200`), minimal drop shadows, dark text.
- **Dark Mode:** Deepest black (`#0a0a0b`), crisp white borders at 10% opacity, pure neon accents without bleeding gradients.
- **Micro-Interactions:** Custom `framer-motion` 3D tilt tracking, typing simulation intervals, and pulsing notification indicators.

---

## 🛡️ Privacy & Compliance
The browser extension emphasizes local-first checks. Cloud paths (Supabase / optional Gemini) depend on your deployment and keys — review data handling in your own backend policies.

<div align="center">
  <br/>
  <b>Built for supreme security. Designed for pure admiration.</b>
</div>
