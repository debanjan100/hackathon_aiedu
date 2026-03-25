# AI Edu - Architecture Planner & Future Roadmap

## 1. Current State Evaluation
The application is now entirely decoupled from early-stage technical debt. The MERN stack (MongoDB, Express, Node.js) has been successfully decommissioned and physically deleted from the repository. We are left with a lightning-fast React frontend natively linked to Supabase PostgREST tables. The AI (Groq Llama-3) and Payment (Razorpay) architectures operate synchronously via Deno Edge Functions.

The foundation is rock solid. The primary objective moving forward is expanding the application with "Killer Hackathon Features" heading into Production.

## 2. Phase 16: The Future Production Roadmap (New Features)

### A. Context-Aware Code Execution (Web IDE)
- **Concept:** Replace the mock "Opening Code Editor" toast messages in `Course.jsx` with a literal embedded `monaco-editor` inside the browser.
- **Execution:** We can ping the free **Piston API** (or execute code over a secure custom Docker container) to let users physically run Python and JavaScript solutions directly inside our dashboard and visually test them against predefined IO cases.

### B. Real-time Multiplayer Battles ("Ghost Racing")
- **Concept:** Exploit Supabase's native WebSocket (`realtime`) infrastructure.
- **Execution:** Users can click "Challenge a Friend" on a DSA topic. Both users are routed to a shared roomId where they can see each other's live cursors and progress bars. The first person to pass the test cases wins XP. This transforms the platform from a standard learning app into a highly addictive multiplayer arena.

### C. Live GitHub & LeetCode Synchronization
- **Concept:** The `Profile.jsx` already requests the user's GitHub username.
- **Execution:** Run a background CRON Edge Function that hits the GitHub GraphQL API or an unofficial LeetCode stats scraper to automatically award users passive XP based on how many commits or real-world problems they solve each week. 

### D. Deep AI Mentor Vectorization
- **Concept:** Instead of passing simply the user's immediate question to `Llama-3`, pass the user's actual architecture context.
- **Execution:** Build a specific "Debug My Code" button inside the new Web IDE that sends the exact line number where their code is failing to the `chat` Edge Function, allowing Llama-3 to act exactly like an elite Staff Engineer debugging their logic flaw.

### E. The Vercel-Tier Aesthetic Overhaul (Phase 19)
- **Concept:** The current platform relies on a dark-only, hardcoded RGBA hackathon aesthetic. This must be modernized.
- **Execution:** Refactor `index.css` to use a global CSS variable architecture (`--bg-primary`, `--text-primary`) supporting native Light/Dark theme toggling. Implement a minimalist Bento Box layout for the Landing Page and wrap all `react-router` DOM paths in `framer-motion` `<AnimatePresence>` for buttery smooth transitions.

## 3. Immediate Deployment Guide
Since the architecture is fully modernized, pushing this to production takes less than 2 minutes:
1. Push the entire repository up to GitHub.
2. Link the repository directly to Vercel, Netlify, or Render.
3. Configure the **Build Command** to `npm run build` and **Output Directory** to `dist`.
4. Inject your `.env` keys (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) as Environment Variables inside the Vercel dashboard.
5. The platform will deploy globally as a fully functional, static Edge-capable serverless app!

## 4. Known Hacks & Configuration Blockades
### A. The Supabase "Confirm Email" SMTP Rate Limit
- **The Issue:** Attempting to create an account (`signUp()`) technically succeeds in Postgres, but the frontend returns `Invalid login credentials` on subsequent login attempts.
- **The Root Cause:** By default, new Supabase projects enforce Email Confirmation (`email_confirmed_at`). However, the free-tier default Supabase SMTP server (`noreply@mail.app.supabase.io`) heavily rate-limits outgoing emails (approx 3 per hour) to prevent abuse, or heavily trigger Google Spam filters. Thus, users never receive the token to verify themselves and the session blockages persist.
- **The Hackathon Workaround:** Disable the "Confirm Email" toggle inside the Supabase Project Dashboard (`Authentication > Providers > Email`) entirely. The application architecture handles this elegantly by instantly passing `session` directly on `signUp`, allowing developers/judges to bypass SMTP completely for testing.

## 5. Active Overhauls
### A. The Combinatorial Roadmap Engine (Phase 20.2)
- **Concept:** Scrapping generic predefined roadmaps in favor of an AI synthesis engine.
- **Execution:** Users select a Core Stream (e.g. Engineering) and a cross-disciplinary Minor (e.g. Finance). The system visually computes the intersection and spits out modernized, futuristic career paths (e.g. High-Frequency Quantitative Architect) complete with a highly specialized Framer Motion node-tree to actually get there.

### B. Project-Wide Diagnostic Sweep (Phase 22)
- **Concept:** Executing a strict native compilation of the entire React/Vite/Deno OS to flush out architectural flaws and broken links before proceeding to deployment variables.
- **Execution:** Utilizing the strict `eslint` configuration against the active environment.
- **Results:** Discovered 20 silent framework bugs primarily relating to unoptimized generic `import` payloads and React Fast-Refresh limitations.
- **Critical Catch:** Uncovered a fatal UX bug in the new Phase 21.3 `Roadmap.jsx` where the Heuristic Engine would completely crash the browser upon a user trying to view their generated skill tree (undefined `handleCareerSelect` function reference).
- **Resolution:** Surgically rewrote the missing semantic mapper hook inside Roadmap.jsx, disabled false-positive strict tracking for `motion.div` syntax nodes, and refactored global unused variables (resulting in `exit code: 0` for `npm run build` & `npm run lint`).

### C. Actionable Generative Nodes (Phase 23)
- **Concept:** Transforming the visual Phase 21 Career trajectories into actual physical pipelines.
- **Execution:** 
  1. **Dynamic Sandbox Routing:** Clicking a node intercepts the Llama-3 compiler, instantly bootstrapping a tailored `Course.jsx` sandbox environment explicit to the node title.
  2. **Study Planner Injection:** AI paths instantly synchronize into the user's Postgres task payload as unscheduled tasks.
  3. **Supabase Persistence:** The trajectory is locked entirely into the Auth Network via `user.user_metadata` JSONB schema, preventing layout destruction upon refresh.
  4. **Capstone Gateway:** The master node triggers a FAANG mock interview in the global AI drawer.

### D. Minimalist Dashboard Overhaul (Phase 24)
- **Concept:** Replaced the bloated Recharts `Dashboard.jsx` environment with a pure native Postgres connection.
- **Execution:**
  1. Built the massive Flow State Pomodoro Engine mapping sessions to XP natively.
  2. Wired the Active Roadmap Node to dynamically inject Sandbox initializations.
  3. Synced Study Planner tasks into a minimalist 'Today' view.
  4. Added a hash-generated Daily Motivation anchor.

### E. The Universal Problem Bank (Phase 25 - ACTIVE)
- **Problem Statement:** The Dashboard overhaul deleted the "Smart Path" curriculum links. Additionally, routing a generated Roadmap Node into `Course.jsx` (Sandbox Mode) completely overrides the problem list, obscuring standard curicular problems.
- **The Solution:** We must strictly divorce "Generative AI Sandboxes" from "Static Curricular Practice". `Course.jsx` will be reserved *strictly* for visual course completion and Sandbox Arena isolation. We will build an entirely new `ProblemDeck.jsx` specifically for LeetCode/HackerRank style browsing.
- **The Execution Plan:**
  1. **Restore Dashboard Smart Path:** Re-inject the "Smart Path" recommended problem card into `Dashboard.jsx`. Clicking [Solve] will no longer route to `Course.jsx`, but rather to the new Problem Deck.
  2. **Create `ProblemDeck.jsx`:** A highly professional Data Table containing hundreds of mock problems across all Universal Majors (CS, Med, Law, Business). Columns: `Status (Checked)`, `Title`, `Difficulty`, `Acceptance Rate`, `Discipline`.
  3. **Sidebar Expansion:** Add a "Problem Deck" or "Challenges" icon to the global `MainLayout.jsx` sidebar to ensure it is always accessible 1-click away from anywhere.
  4. **Unify Editors:** The `ProblemDeck.jsx` will instantly trigger the exact same `CodeEditor.jsx` or `CaseStudyEditor.jsx` modal (with AI Grading) without needing to leave the page or load a course node.
