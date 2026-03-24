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

### 6. The "AI Edu" Code Execution Sandbox
- **Monaco Engine:** The static Course practice grid was upgraded with a physical, in-browser Code Sandbox utilizing `@monaco-editor/react`. It features native syntax highlighting, font emulation, and state management.
- **Groq Llama-3 Kernel Bypass:** Rather than relying on rigid, unreliable free-tier execution endpoints (like Piston or Judge0), the "Run Code" execution pipeline routes directly to the Supabase AI Edge. Llama-3 fundamentally behaves as a headless compiler, simulating the user's logic in Python/JS and returning syntactically perfect terminal output or tracebacks.

### 7. Deep AI Mentor Vectorization
- **Self-Healing IDE:** Integrated a persistent `Bug / Debug` module directly into the Monaco editor header. When triggered, the user's logic flaw and error traces are piped into the Groq Edge infrastructure for deep analysis.
- **Educational Constraint Pipelines:** The LLM's system prompt was specifically hardened to behave like a rigorous professor. To preserve the platform's core educational utility, the model is strictly forbidden from generating algorithmic answers. It may only use the "Apply Fix" UI pipeline to automatically hot-swap typos or missing syntactic braces, forcing the user to learn and solve the DSA challenges themselves.

### 8. The Universal Education Pivot
- **Dynamic JWT Hydration:** The platform's entire physical architecture was decoupled from hardcoded Engineering paths. The Profile `Save` hook was wired rigidly into the `supabase.auth.updateUser()` pipeline, forcing immediate virtual DOM synchronizations whenever a user changes their Major.
- **Adaptive Dashboards:** The `Dashboard.jsx` environment autonomously mutates its hero imagery, taglines, hex-color palettes (Emerald for Medicine, Gold for Business, Cyan for Engineering), and "Smart Path" module logic based exclusively on the active session's Major constraint.
- **Discipline-Specific Sandbox Routing:** The `Course.jsx` grid was completely transformed into a dynamic router. Clicking "Solve" interrogates your Major. Computer Science students are routed directly into the Monaco Web IDE compiler. Business, Law, and Medicine students are routed to the massive new `CaseStudyEditor.jsx`—a pristine Llama-3 powered sandbox rigidly structured to grade thesis logic, diagnostic analysis, and written corporate proposals out of 100 points.

## 🏁 Final State 
Phase 18 achieved the holy grail of hackathon scalability. The repository is officially an elite, serverless, and completely Universal AI Education matrix capable of seamlessly pivoting between completely disparate academic domains without a single reload hook.
