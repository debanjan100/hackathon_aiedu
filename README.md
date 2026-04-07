<div align="center">

<br/>

# 🧠 CognifyX AI

### *The Next-Generation AI-Powered Learning & Skill Validation Platform*

<br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

<br/>

> **"Stop Googling. Start Understanding."**  
> CognifyX AI is your 24/7 AI tutor, code reviewer, career coach, and skill tracker — all in one stunning, gamified platform.

<br/>

</div>

---

## 🚀 The Problem We're Solving

Every CS student and aspiring developer faces the same wall:

- 📚 **Isolated learning** — Textbooks and tutorials give no feedback when you're stuck
- 🎯 **No skill map** — Nobody knows *exactly* what they know vs what they don't
- 💬 **Zero mentorship access** — Expert feedback is expensive & hard to access
- 📄 **Resume blindspots** — Students write resumes with no idea how ATS systems see them
- 🗣️ **Interview anxiety** — No safe space to practice without judgment

**CognifyX AI solves all of this in one unified, intelligent platform.**

---

## ✨ Core Features

### 🤖 AI Tutor (Gemini-Powered)
Real-time conversational AI tutor that uses the **Socratic method** — it doesn't just give answers, it guides you to *understand*. Ask anything: "How does QuickSort work?", "Debug my code", "Explain Big-O of this algorithm."

### 🏋️ Practice Room (Monaco Code Editor)
A full-featured in-browser IDE (powered by Monaco Editor — the same engine as VS Code) with:
- DSA problem sets across Arrays, Graphs, Trees, Hashing, DP & more
- AI-assisted code review after submission
- Real-time syntax highlighting and error detection

### 📊 Mastery Analytics & XP Tracker
Visual SVG ring charts mapping your exact proficiency across every DSA topic. Know precisely where you're strong and where you need work. Every problem solved earns **XP** that feeds into your global leaderboard rank.

### 🎯 AI Roadmap Generator
Generates a fully personalized, step-by-step learning roadmap based on your current skill level, your target role (SWE, ML Engineer, etc.), and timeline. No more generic YouTube playlists.

### 📅 AI Study Planner (Drag & Drop)
Smart study scheduling with a drag-and-drop interface (powered by **@dnd-kit**). The AI distributes topics intelligently across your available days, adapting difficulty curves automatically.

### 🎙️ Mock Interview Room (AI Interviewer)
Simulate real technical interviews with an AI acting as the interviewer. It asks follow-up questions, evaluates your thought process, and gives structured feedback on your answers — helping kill interview anxiety before the real thing.

### 📄 Resume Scanner & ATS Analyzer
Upload your resume as a PDF. The AI parses it, scores it against ATS filters, identifies missing keywords, and suggests targeted improvements to maximize your callback rate.

### 🏆 Live Global Leaderboard
Real-time competitive ranking powered by **Supabase Realtime**. See where you rank globally, filter by topic, and challenge friends. Daily resets keep competition fresh.

### 📹 Curated Learning Videos
Handpicked, topic-tagged video resources integrated directly into the learning flow — no rabbit holes, just exactly what you need at exactly the right moment.

### 🎓 Certificate Generator (PDF Export)
Upon completing a learning path or assessment, generate a professional certificate with your name, topic, score, and date — exportable as a high-quality PDF via **jsPDF + html2canvas**.

### 📈 Deep Analytics Dashboard
Recharts-powered visualizations tracking your learning velocity, streak history (GitHub-style heatmap), problem completion rates, and XP growth over time.

### 🌗 Premium Dual-Theme UI
Stunning glassmorphism design with hand-crafted Light and Dark modes, animated gradient borders, Framer Motion page transitions, and a custom design system — built entirely from scratch.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite 8 | Ultra-fast SPA with code-splitting |
| **Styling** | Vanilla CSS + Ant Design | Custom design system + component primitives |
| **Animations** | Framer Motion | Page transitions, micro-animations |
| **Code Editor** | Monaco Editor | In-browser VS Code experience |
| **Drag & Drop** | @dnd-kit | Study planner scheduling UI |
| **Charts** | Recharts | Analytics & progress visualizations |
| **3D Background** | Three.js | Immersive landing page experience |
| **AI Engine** | Google Gemini API | Tutor, interviewer, roadmap, resume analysis |
| **Auth & DB** | Supabase (PostgreSQL) | Authentication, RLS, real-time data |
| **Backend** | Express.js + Vercel Functions | API proxy, serverless endpoints |
| **PDF Export** | jsPDF + html2canvas | Certificate generation |
| **Deployment** | Vercel | CI/CD, edge caching, zero cold starts |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
│                  React 19 SPA (Vite Build)                  │
│   Landing → Auth → Dashboard → [All Feature Pages]         │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTPS
          ┌────────────┴────────────┐
          │                         │
   ┌──────▼──────┐         ┌────────▼────────┐
   │  Supabase   │         │  Vercel Edge    │
   │  Auth + DB  │         │  Functions      │
   │  (Postgres) │         │  /api/chat      │
   │  Realtime   │         └────────┬────────┘
   │  RLS Guards │                  │
   └─────────────┘         ┌────────▼────────┐
                            │  Google Gemini  │
                            │  AI API         │
                            └─────────────────┘
```

**Data flows:**
1. **Auth** — Supabase handles signup/login. A DB trigger auto-creates a `profiles` row on new user creation.
2. **AI Chat** — Frontend → Vercel Serverless Function → Gemini API → response proxied back securely (API key never exposed to client).
3. **Progress** — XP earned → Supabase upsert → Realtime broadcast → Leaderboard live update.
4. **Resume** — PDF parsed client-side via `pdfjs-dist` → extracted text → Gemini analysis → structured feedback rendered.

---

## 📁 Project Structure

```
hackathon_aiedu/
├── api/
│   └── chat.js              # Vercel serverless AI proxy
├── src/
│   ├── pages/
│   │   ├── Landing.jsx        # Hero + feature showcase
│   │   ├── Dashboard.jsx      # Main hub (XP, streak, daily challenge)
│   │   ├── PracticeRoom.jsx   # Monaco IDE + problem sets
│   │   ├── Analytics.jsx      # Progress charts & heatmaps
│   │   ├── StudyPlanner.jsx   # Drag-and-drop AI scheduler
│   │   ├── Roadmap.jsx        # Personalized learning path
│   │   ├── MockInterview.jsx  # AI interview simulator
│   │   ├── ResumeScanner.jsx  # ATS resume analyzer
│   │   ├── LeaderboardPage.jsx # Global rankings
│   │   ├── Certificate.jsx    # PDF certificate export
│   │   ├── LearningVideos.jsx # Curated video library
│   │   ├── Resources.jsx      # Study resources hub
│   │   ├── Profile.jsx        # User profile & settings
│   │   └── Assessment.jsx     # Skill assessment tests
│   ├── components/
│   │   ├── CodeEditor.jsx     # Monaco wrapper
│   │   ├── AICodeReview.jsx   # AI code feedback panel
│   │   ├── Leaderboard.jsx    # Real-time rankings widget
│   │   ├── Background3D.jsx   # Three.js particle background
│   │   └── TopNav.jsx         # Navigation bar
│   ├── context/
│   │   └── AuthContext.jsx    # Global auth state
│   └── lib/
│       └── supabase.js        # Supabase client config
├── server.js                  # Local Express dev server
└── supabase/                  # Database migrations & schema
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google Gemini API key](https://aistudio.google.com)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/debanjan100/hackathon_aiedu.git
cd hackathon_aiedu

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Fill in your keys in .env.local

# 4. Run the development server
npm run dev

# 5. (Optional) Run the Express API proxy locally
npm run server
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_google_gemini_api_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## 🔐 Security

- All AI API keys are stored as **server-side environment variables** — never exposed to the browser
- Supabase **Row Level Security (RLS)** ensures users can only access their own data
- Auth sessions use **JWT tokens** managed by Supabase Auth
- Google OAuth integration for one-click secure sign-in

---

## 🌐 Deployment

CognifyX AI is deployed on **Vercel** with automatic CI/CD:

1. Push to `main` branch on GitHub
2. Vercel webhook triggers automatic build (`npm run build`)
3. Optimized bundle deployed to Vercel's global edge network
4. Serverless functions deployed alongside for AI API proxying

Zero configuration needed for scaling — handles thousands of concurrent users out of the box.

---

## 🔮 Roadmap & Future Features

- [ ] **Voice Tutor** — Web Speech API integration for hands-free learning
- [ ] **Collaborative Rooms** — Study with friends in real-time shared sessions
- [ ] **Company-Specific Prep** — FAANG, startup-specific problem sets & interview patterns
- [ ] **AI Code Execution** — Run and test code directly in the browser (WASM sandbox)
- [ ] **Mobile App** — React Native port for iOS & Android
- [ ] **Advanced Fine-Tuning** — Custom model fine-tuned on top competitive programmer solutions
- [ ] **LeetCode/Codeforces Sync** — Pull in external solve history for unified tracking

---

## 👥 Team

Built with 🔥 at **[Hackathon Name]** — *because every developer deserves a world-class AI mentor.*

---

## 📜 License

MIT License — free to use, modify, and build upon.

---

<div align="center">

**⭐ If CognifyX AI helped you, give it a star!**

*Built with React · Gemini AI · Supabase · Vercel*

</div>
