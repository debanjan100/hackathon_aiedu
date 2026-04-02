# CognifyX AI — Bug Fix Log
# Generated: 2026-03-29

## Bug #1 — CRITICAL: Dashboard redirect loop (ProtectedRoute auth race)
**File:** `src/App.jsx` line 34-37  
**Symptom:** `/dashboard` immediately redirects to `/login` on every page load/refresh.  
**Root Cause:** `ProtectedRoute` checked `isLoggedIn` (which is `false` while auth is loading) without waiting for the `loading` state from `AuthContext`. Since Supabase `getSession()` is async, `isLoggedIn` is always `false` for the first 50-200ms.  
**Fix:** Added `if (loading) return <PageSpinner />` before the redirect check.  
```diff
- return isLoggedIn ? children : <Navigate to="/login" replace />;
+ if (loading) return <PageSpinner />;
+ return isLoggedIn ? children : <Navigate to="/login" replace />;
```

---

## Bug #2 — CRITICAL: Gemini API errors (wrong API version URL)
**Files:** `server.js`, `api/chat.js`, `api/run-code.js`, `src/components/AICodeReview.jsx`  
**Symptom:** AI features returned 404/error responses.  
**Fix:** Initial fix was switching to `v1beta` for Gemini. **Ultimate Fix:** Fully migrated to OpenAI GPT-3.5-turbo for higher stability and reliability.

---

## Bug #3 — Unused import (`Loader`) in AICodeReview.jsx
**File:** `src/components/AICodeReview.jsx`  
**Symptom:** ESLint/build warning.  
**Fix:** Removed unused `Loader` from lucide-react import.

---

## Bug #4 — Backend: no global error handler in server.js
**File:** `server.js`  
**Symptom:** Unhandled promise rejections in route handlers could crash the server process.  
**Fix:** Added Express global error handler middleware:
```js
app.use((err, _req, res, _next) => {
  res.status(500).json({ error: 'Internal server error' });
});
```

---

## Bug #5 — Backend: no input validation on POST routes
**Files:** `server.js`, `api/chat.js`, `api/run-code.js`  
**Symptom:** Could crash with TypeError if request body fields were missing or wrong type.  
**Fix:** Added type checks and `typeof` validation before processing each request.

---

## Bug #6 — Frontend: no Error Boundary around Dashboard
**File:** `src/App.jsx`, new `src/components/DashboardErrorBoundary.jsx`  
**Symptom:** Any single widget throwing a render-time JS error would blank the entire page.  
**Fix:** Created `DashboardErrorBoundary` class component and wrapped Dashboard in it in App.jsx.

---

## Bug #7 — server.js content duplicated after partial edit
**File:** `server.js`  
**Symptom:** Duplicate `const app = express()` declarations causing "Cannot redeclare block-scoped variable" errors.  
**Fix:** Completely rewrote server.js with correct clean content.

---

## Optimizations Applied
- `ProtectedRoute` shows spinner while auth loads instead of redirecting (better UX).
- All Supabase queries protected with optional chaining (`data?.length`, `data?.streak`).
- Error boundary prevents full-page crashes from widget failures.
- `server.js` now uses `process.env.PORT || 5000` for flexible deployment.
- Created `.env.example` documenting all required environment variables.

---

- All AI calls (Chat, Code Review, Mock Interview) now use OpenAI GPT-3.5-turbo via the official `openai` SDK.
- Unified AI architecture: Frontend components now proxy all AI requests through the `/chat` or `/run-code` backend endpoints for better security and key protection.
- Removed `@google/generative-ai` dependency to trim bundle size and reduce complexity.

---

## Bug #8 — CRITICAL: Gemini API Limit Exceeded
**Files:** Entire AI Backend  
**Symptom:** AI features stopped responding due to "429 Too Many Requests" from Google Gemini.  
**Fix:** Migrated the entire platform to OpenAI GPT-3.5-turbo. Replaced all `fetch` calls with the `openai` SDK and updated environment variables.
