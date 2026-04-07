# CognifyX AI — Application Architecture & Workflow

This document captures the complete architectural design, development workflow, and strategic vision of the CognifyX AI platform — an AI-powered, gamified learning ecosystem for developers.

---

## 🟢 Core Technical Stack

| Layer | Technology | Role |
|-------|-----------|------|
| **Frontend** | React 19, Vite 8, Framer Motion, Ant Design | High-performance SPA with premium glassmorphism UI |
| **Code Editor** | Monaco Editor (@monaco-editor/react) | In-browser VS Code experience for DSA practice |
| **Drag & Drop** | @dnd-kit/core + sortable | Study Planner scheduling interface |
| **Charts** | Recharts | Analytics dashboards & progress visualization |
| **3D Graphics** | Three.js | Immersive landing page particle background |
| **AI Engine** | Google Gemini API (gemini-2.5-flash-lite) | Tutor, Resume Scanner, Mock Interviewer, Roadmap |
| **Auth & Database** | Supabase (PostgreSQL + Auth + Realtime) | Row Level Security, JWT sessions, real-time leaderboard |
| **Backend** | Express.js (local) / Vercel Serverless Functions | API proxy for secure AI key handling |
| **PDF Processing** | pdfjs-dist, jsPDF, html2canvas | Resume parsing & certificate export |
| **Payments** | Razorpay | Premium feature unlocks |
| **Deployment** | Vercel (CI/CD + Edge Network) | Auto-deploy on push, zero cold starts |

---

## 🔄 Application Workflow — End-to-End User Journey

### 1. Landing & Onboarding
```
User visits site → Landing page (Three.js 3D background, feature showcase, testimonials)
  → Clicks "Get Started"
  → Redirected to /signup or /login
  → Supabase Auth handles signup (email/password or Google OAuth)
  → DB trigger auto-creates a `profiles` row
  → Authenticated → redirected to /dashboard
```

### 2. Dashboard — Command Center
```
Dashboard loads → Fetches profile from Supabase (XP, streak, level)
  → Displays: Greeting Banner, XP ring, streak heatmap, daily challenge
  → AI Quick Chat sidebar available globally
  → Navigation: Study Planner, Practice Room, Analytics, Roadmap, etc.
```

### 3. AI Tutor (Quick Chat)
```
User types question → Frontend POSTs to /api/ai/chat
  → Vercel Serverless Function injects GEMINI_API_KEY
  → Google Gemini processes with Socratic system prompt
  → Response streamed back → rendered in chat UI
  → No answers given directly — guides user to understand
```

### 4. Practice Room (Code Editor)
```
User selects a DSA problem → Monaco Editor loads with starter code
  → User writes solution → clicks "Run Code"
  → Frontend POSTs to /run-code → Piston API executes code
  → stdout/stderr displayed → User clicks "Submit"
  → AI Code Review triggered (/api/ai/code-review)
  → XP earned → Supabase upsert → Leaderboard updates in real-time
```

### 5. Resume Scanner (AI-Powered)
```
User pastes resume text OR uploads PDF/TXT
  → PDF: pdfjs-dist extracts text client-side (3-tier worker fallback)
  → Selects target company (Google, Amazon, Meta, etc.)
  → Clicks "Scan My Résumé"
  → Client-side: GoogleGenerativeAI calls Gemini directly from browser
     ↳ Model fallback chain: gemini-2.5-flash-lite → 2.0-flash-lite → 2.0-flash → 1.5-flash
     ↳ If all fail: falls back to /api/scan-resume backend endpoint
  → AI returns JSON: readinessScore, hasTopics, missingTopics, partialTopics, 4-week studyPlan
  → Results rendered: skill gap chips, gauge score, weekly topic cards
  → User can "Add to Study Planner" → Supabase insert into study_tasks
```

### 6. AI Roadmap Generator
```
User selects target role + timeline → AI generates personalized learning path
  → Step-by-step topics with estimated hours
  → Progress tracked as user completes modules
```

### 7. Study Planner (Drag & Drop)
```
User views weekly schedule → @dnd-kit enables drag-and-drop reordering
  → Tasks sourced from: manual entry, resume scanner, AI roadmap
  → Each task: title, priority, estimated hours, scheduled date
  → Stored in Supabase `study_tasks` table
  → Completion toggles update progress metrics
```

### 8. Mock Interview Room
```
User starts mock interview → AI acts as technical interviewer
  → Asks DSA questions, follow-ups, behavioral prompts
  → Evaluates thought process and provides structured feedback
  → Builds confidence for real interviews
```

### 9. Analytics Dashboard
```
Recharts renders: XP growth over time, streak heatmap, topic mastery rings
  → Data pulled from Supabase profiles + study_tasks
  → Visual breakdowns by category: Arrays, Graphs, DP, Trees, etc.
```

### 10. Leaderboard
```
Real-time global ranking via Supabase Realtime subscriptions
  → XP-based scoring → daily/weekly/all-time filters
  → Competitive gamification loop
```

### 11. Certificate Generator
```
User completes learning path or assessment → clicks "Generate Certificate"
  → html2canvas captures styled certificate DOM
  → jsPDF exports as high-quality PDF
  → Personalized: name, topic, score, date
```

### 12. Raise Complaint (AI Triage)
```
User submits complaint → /api/triage-complaint
  → AI analyzes category, severity → assigns ticket ID
  → Returns acknowledgement, ETA, self-help suggestions
  → Fallback: deterministic response if AI unavailable
```

---

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│              React 19 SPA (Vite Build, Code-Split)              │
│                                                                 │
│   Landing → Auth → Dashboard → Practice → Analytics → ...       │
│                                                                 │
│   Client-Side AI:  GoogleGenerativeAI (Gemini)                  │
│   Client-Side PDF: pdfjs-dist                                   │
│   Client-Side PDF Export: jsPDF + html2canvas                    │
└────────────────┬──────────────────────┬─────────────────────────┘
                 │ HTTPS                │ HTTPS
        ┌────────▼────────┐    ┌────────▼────────┐
        │   Supabase       │    │   Vercel Edge    │
        │   ─────────      │    │   Functions      │
        │   Auth (JWT)     │    │   ───────────    │
        │   PostgreSQL     │    │   /api/ai/chat   │
        │   Realtime       │    │   /api/scan-resume│
        │   RLS Policies   │    │   /api/ai/hint   │
        │   Storage        │    │   /api/ai/code-review│
        └─────────────────┘    │   /run-code       │
                                └────────┬────────┘
                                         │
                          ┌──────────────┼──────────────┐
                          │              │              │
                   ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
                   │ Google       │ │ Piston    │ │ Razorpay  │
                   │ Gemini AI   │ │ Code Exec │ │ Payments  │
                   └─────────────┘ └───────────┘ └───────────┘
```

---

## 🔐 Security Architecture

- **API Keys**: `GEMINI_API_KEY` stored server-side only in Vercel env vars. `VITE_GEMINI_API_KEY` exposed to browser for client-side fallback (acceptable for hackathon; production would route all through backend).
- **Auth**: Supabase JWT tokens, session refresh, Google OAuth integration.
- **Database**: Row Level Security (RLS) — users can only read/write their own rows.
- **CORS**: Express server allows all origins (`*`) for development.

---

## 📊 Feasibility & Viability Analysis

### Technical Viability
- Built entirely on proven, production-grade technologies (React 19, Supabase, Google Gemini, Vercel).
- Serverless architecture eliminates infrastructure management and scales automatically.
- Client-side AI fallback ensures resilience even when backend is unreachable.

### Market Readiness
- Strong demand: 140K+ U.S. schools and 4,000+ colleges seeking digital transformation.
- Addresses the $325B global EdTech market with an AI-first approach.
- Competitive edge: combines tutoring, practice, analytics, and career prep in one platform.

### Financial Sustainability
- **Freemium Model**: Free tier with core features; premium unlocks advanced AI, mock interviews, certificates.
- **SaaS Pricing**: $50/student/year for institutional licenses.
- **Cost Efficiency**: Serverless = near-zero cost when idle. Gemini Flash Lite = extremely low per-query cost.

---

## ⚠️ Challenges & Mitigations

| Challenge | Risk | Mitigation |
|-----------|------|------------|
| **Data Privacy** | Handling student data requires compliance | COPPA/FERPA compliant architecture, Supabase RLS, encrypted sessions |
| **AI Hallucination** | Gemini may give incorrect coding advice | Socratic prompting (guide, don't answer), low temperature (0.3), JSON schema enforcement |
| **Teacher Adoption** | Educators may resist new tools | Intuitive UI, minimal training, onboarding program |
| **API Rate Limits** | Gemini/Piston may throttle under high load | Model fallback chain, client-side caching, graceful error UX |
| **Content Quality** | AI recommendations depend on prompt quality | Curated system prompts, human-validated problem sets |

---

## 📈 Rollout Strategy

### Phase 1: Pilot (Months 1–6)
- Deploy to 10 partner schools/coding bootcamps
- Gather usage analytics and NPS feedback
- Iterate on AI prompt quality and UI/UX

### Phase 2: Expansion (Months 7–12)
- Scale to 100 institutions across diverse demographics
- Launch premium tier with Razorpay integration
- Add collaborative study rooms and voice tutor

### Phase 3: National Scale (Year 2+)
- Full rollout to 1,000+ institutions
- Enterprise contracts with university systems
- Mobile app (React Native) for iOS/Android
- Advanced analytics: AI-powered learning velocity predictions

---

## 🛠️ Development Workflow

### Local Development
```bash
# Frontend (Vite dev server)
npm run dev          # → http://localhost:5173

# Backend (Express API proxy) — optional, frontend can call Gemini directly
npm run server       # → http://localhost:5000

# Vite automatically proxies /api/* and /run-code to Express backend
```

### Deployment
```
Push to main → Vercel webhook → npm run build → Edge deploy
  → Environment variables injected from Vercel dashboard
  → Serverless functions deployed from /api/ directory
  → Zero-downtime deployment with instant rollback
```

### Environment Variables
```env
# Browser-accessible (VITE_ prefix)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GEMINI_API_KEY=...        # Client-side AI fallback
VITE_GOOGLE_CLIENT_ID=...     # Google OAuth
VITE_RAZORPAY_KEY_ID=...      # Payment widget

# Server-only (no VITE_ prefix)
GEMINI_API_KEY=...             # Backend AI calls
RAZORPAY_KEY=...
RAZORPAY_SECRET=...
```

---

## 📚 Key References
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [React 19 Official Docs](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite 8 Configuration](https://vitejs.dev/config/)
- [Monaco Editor for React](https://github.com/suren-atoyan/monaco-react)
- [@dnd-kit Documentation](https://dndkit.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

## 🏁 Conclusion

CognifyX AI is a production-ready, AI-first learning platform that combines the intelligence of Google Gemini with modern serverless architecture. By integrating an in-browser code editor, AI-powered resume scanning, mock interviews, gamified progress tracking, and a real-time leaderboard into a single premium interface, it delivers an experience that transforms isolated self-study into guided, measurable, and competitive skill development. The platform's resilient client-side AI fallback architecture ensures it works reliably in any environment — from a hackathon demo to a university-wide deployment.
