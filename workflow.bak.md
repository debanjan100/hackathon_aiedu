# Development Workflow: AI in Education & Skill Development

This document details the step-by-step development process of the AI in Education application, from initial planning to execution, highlighting key decisions, intentions, and debugging phases.

## Phase 1: Planning and Initialization
**Intention:** Create a modern, robust web application to facilitate AI-driven education and skill development.
- **Setup:** 
  - Initialized a frontend project using **React** and **Vite** for fast development and build times.
  - Set up a **Node.js + Express** backend to handle API requests and business logic.
- **Dependencies Installed:** 
  - **Frontend:** `react-router-dom` (routing), `antd`, `framer-motion`, `lucide-react` (UI/animations), `axios` (API client), `recharts` (analytics).
  - **Backend:** `mongoose` (MongoDB), `bcrypt`, `jsonwebtoken` (Auth), `razorpay` (Payments), `dotenv` (Environment variables), `cors` (Cross-origin access).
- **Project Structure:** 
  - Decided on a separated architecture with `src/` handling client-side components and `server/` handling the backend services.

## Phase 2: Execution and Feature Implementation
**Intention:** Build the core user flows and integrate backend services.
- **Frontend Development:**
  - Created a robust routing system in `src/App.jsx` utilizing `react-router-dom`.
  - Implemented protected routes relying on an internal `AuthContext`.
  - Built core pages: `Landing`, `Dashboard`, `Profile`, `Assessment`, `Analytics`, `Course`, `Login`, `Signup`, `StudyPlanner`, and `Roadmap`.
- **Backend Development (`server/index.js`):**
  - Configured MongoDB connection via Mongoose models (`User`, `Course`, `Task`, `Progress`).
  - Implemented secure user authentication endpoints (`/signup`, `/login`) using bcrypt and JWT.
  - Integrated Razorpay for processing course payments (`/create-order`, `/verify-payment`).
  - Integrated Google's Gemini AI to power the chatbot (`/chat` endpoint).

## Phase 3: Debugging and Server Load Issues
**Intention:** Stabilize the local development environment and ensure the frontend and backend communicate flawlessly.
- **Issue Encountered:** Dev Server Load issues, where the website would fail to load after recent changes. 
- **Root Cause & Troubleshooting:** 
  - Port conflicts between Vite's dev server and the Express backend.
  - CORS policy blocks preventing the frontend from fetching data from the local API.
- **Fix Applied:** 
  - Adjusted CORS settings in `server/index.js` (`app.use(cors())`).
  - Ensured the backend was running correctly on `PORT 5000` while the frontend runs on Vite's default port.
  - Verified environment variables (`MONGO_URI`, `JWT_SECRET`, etc.) were properly loaded without crashing the server.

## Phase 4: Version Control and Deployment
**Intention:** Safely store the codebase and prepare for potential team collaboration or remote deployment.
- **Issue Encountered:** Needed to push the local project to a remote GitHub repository.
- **Fix Applied / Actions Taken:**
  - Configured `.gitignore` to omit `node_modules`, `.env`, and other unneeded local files.
  - Staged all frontend and backend code.
  - Created the initial commit bundling the AI Education & Skill Development project.
  - Pushed to the `master` branch on the origin repository.

---
*Note: This file serves as a context window to help new contributors or agents understand the trajectory of the app's development.*
