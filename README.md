<div align="center">
  <img src="public/logo.png" alt="CognifyX AI Logo" width="120" />
  <h1>CognifyX AI</h1>
  <p><b>The Next-Generation AI-Powered Coding & Skill Validation Platform.</b></p>
  <br />
</div>

---

## 🔷 SECTION 1: PROJECT OVERVIEW

- **Project Name:** CognifyX AI
- **Tagline:** Empowering developers through intelligent, personalized learning.
- **Problem Statement:** Traditional educational platforms offer a one-size-fits-all approach, leaving learners without personalized mentoring, precise skill tracking, or immediate conceptual help when they inevitably get stuck.
- **Solution Overview:** CognifyX AI is an intelligent, gamified learning dashboard that tracks user mastery across specific DSA topics, provides curated daily problem sets, and features a seamlessly integrated real-time AI tutor to guide users through complex programming concepts.
- **Target Users:** Computer Science students, aspiring software engineers, hackathon participants, and lifelong technical learners looking to master Data Structures and Algorithms.

---

## 🔷 SECTION 2: TECH STACK

**Frontend:**
- **Framework:** React.js / Vite (High-performance SPA)
- **Styling:** Vanilla CSS (Custom Design System with Light/Dark Mode), Ant Design (Component primitives), Tailwind CSS utility classes
- **UI Components:** Framer Motion (micro-animations, staggering effects), Lucide React (vector iconography)

**Backend:**
- **Local Dev:** Express.js Middleware (`server.js`)
- **API Handling:** Vercel Serverless Functions (`/api/chat.js`)
- **AI Integration:** **OpenAI GPT-3.5-turbo** — Providing lightning-fast, highly accurate educational mentoring.

**Database:**
- **Storage & Auth:** Supabase (PostgreSQL)
  - **Data Flow:** The frontend communicates directly with Supabase via the `@supabase/supabase-js` client using Row Level Security (RLS) policies. Profiles, user progress (XP/streak), leaderboard rankings, and problem sets are stored relationally and updated in real-time.

**Other Tools:**
- **Deployment:** Vercel (CI/CD pipeline and Edge deployment)
- **Version Control:** GitHub 

---

## 🔷 SECTION 3: SYSTEM ARCHITECTURE

### Full Application Flow Step-by-Step:
**User** → **Frontend (React)** → **Serverless API (Vercel)** → **AI Model (OpenAI)** → **Database (Supabase)** → **Response to User**

1. **Authentication Flow:** Users sign up/log in using Supabase Auth. A secure session token is stored. The application creates a corresponding `profiles` row in the Supabase PostgreSQL database via a secure trigger.
2. **Chat System Flow:** When a user asks a doubt in the AI Quick Chat, the React frontend sends a POST request to our custom Vercel Serverless Function (`/api/chat`). The serverless API securely injects the `OPENAI_API_KEY` from environment variables and proxies the request to the OpenAI chat completions endpoint. The GPT-3.5 or GPT-4o model computes the response and sends it back through the serverless function to the user's UI.
3. **Data Storage Logic:** When a user completes a daily challenge or earns XP, the React frontend dispatches a Supabase RPC or upsert command. Supabase updates the `profiles` table (incrementing XP/Streak) and triggers a refresh on the dynamic Leaderboard component.

---

## 🔷 SECTION 4: FEATURES

- **⚡ AI Quick Chat Tutor:** Context-aware chatbot powered by OpenAI GPT-3.5-turbo, capable of solving coding doubts and explaining DSA concepts in real-time.
- **🔐 Secure Authentication:** Seamless login, signup, and profile management using Supabase Auth.
- **📈 Mastery & XP Tracker:** Visual data representation mapping a user’s progress across categories (Arrays, Graphs, Hashing) via animated SVG rings.
- **🎯 Gamified Learning:** Daily Challenges synced to midnight IST, streak tracking heatmaps, and a real-time Top Scholars Leaderboard.
- **🌗 Stunning Premium UI:** High-fidelity Glassmorphic aesthetics featuring custom micro-animations, animated gradient borders, and dual-theme (Light/Dark) support.
- **💡 Smart Study Assistant:** Daily rotating study tips and intelligent path recommendations based on previous activity.

---

## 🔷 SECTION 5: DEPLOYMENT WORKFLOW

1. **Code Pushed to GitHub:** Developers commit and push changes directly to the `master` branch on GitHub.
2. **Connected to Vercel:** The Vercel platform is linked to the GitHub repository webhook.
3. **Auto Deployment Pipeline:** Upon every push, Vercel automatically runs `npm run build`, creates a production-ready optimized bundle, and deploys it to the global edge caching network. 
4. **Environment Variables:** Secure keys are explicitly stored in Vercel settings and never exposed to the client:
   - `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` mapping to the Supabase instance.
   - `OPENAI_API_KEY` mapping securely to OpenAI Dashboard, accessed only by the `/api` serverless backend.

---

## 🔷 SECTION 6: HOW IT WORKS (STEP FLOW)

1. **User Opens Website:** The user lands on the high-conversion landing page and clicks "Get Started".
2. **User Logs In:** Authentication is handled by Supabase, securely dropping the user into their personalized dashboard.
3. **User Action (Practice/Doubt):** The user clicks to solve the "Daily Challenge" or types a question into the AI Sidebar ("How does a Hash Map handle collisions?").
4. **API Processes Request:** The frontend queries the Serverless backend, formatting the chat history safely.
5. **AI Generates Response:** OpenAI’s `gpt-3.5-turbo` model processes the prompt and returns an optimized, educational response without giving away the direct code answer immediately.
6. **Response Displayed & Progress Saved:** The user reads the AI response, solves their code, clicks "Solve", and the platform sends their earned XP straight to the Supabase database. The UI toasts a celebration notification.

---

## 🔷 SECTION 7: USE CASES

- **🎓 Students Learning with AI:** Providing 24/7 on-demand tutoring for complex university computer science subjects when professors are unavailable.
- **💻 Coding Assistant:** Assisting developers dynamically during high-stress environments to debug syntax errors and plan architectures.
- **Tracks Mastery:** Creating completely tailored roadmaps based on what topics the user is definitively weak in (e.g. tracking "Graphs" score internally).

---

## 🔷 SECTION 8: BENEFITS

- **⚡ Fast & Scalable:** By utilizing Vercel Functions and Supabase, the application has zero cold starts and can scale to thousands of simultaneous users effortlessly.
- **🤖 Socratic Learning:** Doesn't just give answers, but acts as a Socratic tutor utilizing the OpenAI model to increase information retention.
- **🎨 User-Friendly:** Reduced cognitive load through a distraction-free, visually stunning environment that encourages flow state.
- **💰 Cost-Efficient:** Built completely on a serverless paradigm, costing practically nothing when idle compared to traditional monolithic EC2 instances.

---

## 🔷 SECTION 9: FUTURE IMPROVEMENTS

- **🛠️ Better AI Fine-Tuning:** Injecting context windows so the AI tutor can read the actual code the user currently has open in the Practice Room.
- **🎙️ Voice Assistant integration:** Utilizing the Web Speech API to allow users to ask programming questions out loud.
- **📱 Mobile Native App:** Exporting the React logic to React Native for an iOS / Android cross-platform experience.
- **📊 Advanced Analytics Dashboard:** Providing deeply intensive charts mapping algorithmic understanding over months.

---

## 🔷 SECTION 10: CONCLUSION

**CognifyX AI is not just another dashboard; it is a fundamental shift in how developers acquire and validate skills.** By combining the frictionless speed of modern React serverless architecture with the sheer reasoning power of OpenAI’s GPT API, we have built a platform that democratizes elite-level technical tutoring. The integration of gamified psychological loops—like streaks, live leaderboards, and daily XP milestones—ensures that users don't just briefly visit, but build lasting, compounding habits. CognifyX AI stands as a highly viable, immediately deployable product that bridges the gap between isolation while learning and the necessity of immediate, intelligent feedback.
