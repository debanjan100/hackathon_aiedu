# AI in Education: Application Architecture Workflow

This document tracks the cumulative historical state of the application architecture, reflecting the dramatic pivots towards a premium UI and cloud serverless infrastructure.

## 🟢 Core Technical Stack
- **Frontend:** React 19, Vite, React Router DOM, Framer Motion, Ant Design
- **Cloud Backend:** Supabase (Enterprise PostgreSQL, Auth, Edge Functions)
- **AI Integration:** Groq Platform (Llama-3.1-8b-instant)

## 🚀 Key Architectures Built (Phases 1-15)

### 1. Zero-Lag Premium UI (Antigravity Design)
The application originally suffered from massive scrolling lag due to endless looped CSS and generic glassmorphism filters. 
- Fully reconstructed `index.css` to inject static mesh gradients.
- Bound `MainLayout.jsx` and all underlying pages (`Landing.jsx`) to `framer-motion` `<AnimatePresence>` for buttery smooth Single Page Application routing.

### 2. The Great Push to Serverless (Supabase & PostgREST)
The generic `<AuthContext>` relying on mocked React State ('demo123') and the monolithic Node.js/MongoDB local backend were completely ripped out.
- **Supabase SDK Injection:** Authentications are securely handled by natively validated Supabase JWTs.
- **PostgREST React Bindings:** The `Profile.jsx` user metadata, `Assessment.jsx` skill tests, `StudyPlanner.jsx` tasks, and `Roadmap.jsx` enrollments use the active session payload to execute dynamic SQL Row Updates instantly, circumventing any need for a middleman Express routing layer.

### 3. Edge AI Proxy with Groq Llama-3
Originally dependent on Google's Gemini endpoint directly from a local Node.js proxy, strict API routing rules completely disrupted functionality. 
- **The Pivot:** The entire AI routing system was ripped out in favor of the hyper-fast **Groq** API executing Meta's `Llama-3.1` models.
- **The Edge Shield:** To completely anonymize and protect the `GROQ_API_KEY`, a Supabase Edge Function was authored in Deno (`supabase/functions/chat/index.ts`). The React frontend securely invokes this edge payload, completely decoupling from local environments.

### 4. Interactive Gamification
- Recharts was deeply mapped into `Analytics.jsx`, charting physical user progress fetched directly from the Postgres database.
- A functional LeetCode-style Pomodoro focus timer lives in the Header toolbar, explicitly programmed to inject `+10 XP` to the user's Postgres record every 60 seconds of un-paused focus.
- The Dashboard tracks live `Algorithm Match` speeds and `Course Velocity`.

### 5. Razorpay Edge Cryptography
- The Premium Upsell functionality securely writes the `isPremium` boolean back to the user's Postgres identity by calling a secondary Deno Edge Function (`supabase/functions/payment`), which generates Stripe/Razorpay orders and validates crypto HMAC SHA256 signatures entirely on the cloud edge.

## 🏁 Final State 
Phase 15 successfully executed an aggressive teardown. The project has been effectively purged of all legacy Node/Express dependencies and the `server` monolith was terminated. The repository is 100% structurally prepared for Vercel/Netlify production deployment as a purely Client-Edge mapped architecture!
