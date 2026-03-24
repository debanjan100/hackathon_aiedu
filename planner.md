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
