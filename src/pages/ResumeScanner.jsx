import React, { useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { GoogleGenerativeAI } from "@google/generative-ai";

const COMPANIES = [
  { id: "Google", emoji: "🔵", label: "Google" },
  { id: "Amazon", emoji: "📦", label: "Amazon" },
  { id: "Meta", emoji: "📘", label: "Meta" },
  { id: "Apple", emoji: "🍎", label: "Apple" },
  { id: "Microsoft", emoji: "🪟", label: "Microsoft" },
  { id: "Netflix", emoji: "🎬", label: "Netflix" },
  { id: "Startup", emoji: "🚀", label: "Startup" },
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function gaugeColor(score) {
  if (score < 40) return "#ef4444";
  if (score < 70) return "#f59e0b";
  return "#10b981";
}

function calcDateForWeek(weekNumber) {
  const now = new Date();
  const target = new Date(now);
  target.setDate(now.getDate() + (weekNumber - 1) * 7);
  return target.toISOString().split("T")[0]; // YYYY-MM-DD
}

/* ── Build the Gemini prompt ── */
function buildScanPrompt(resumeText, targetCompany) {
  const systemPrompt = `You are a senior technical recruiter at ${targetCompany} who also has deep DSA expertise.
Analyze the provided résumé and respond ONLY with valid JSON (no markdown fences, no extra text).
The JSON must follow this exact schema:
{
  "readinessScore": <number 0-100>,
  "hasTopics": ["topic1", "topic2"],
  "missingTopics": ["topic1", "topic2"],
  "partialTopics": ["topic1", "topic2"],
  "studyPlan": {
    "week1": [
      { "topic": "Topic Name", "estimatedHours": 4, "priority": "high", "description": "What to study" }
    ],
    "week2": [{ "topic": "...", "estimatedHours": 3, "priority": "medium", "description": "..." }],
    "week3": [{ "topic": "...", "estimatedHours": 3, "priority": "medium", "description": "..." }],
    "week4": [{ "topic": "...", "estimatedHours": 2, "priority": "low", "description": "..." }]
  },
  "summary": "One paragraph summary of the analysis."
}

Rules:
- Each week must have 2-4 topics.
- readinessScore must be a number between 0 and 100.
- hasTopics, missingTopics, partialTopics must each have at least 1 item.
- Output ONLY the JSON object. No markdown code fences. No explanatory text.`;

  return `${systemPrompt}\n\nResume:\n${resumeText}\n\nTarget company: ${targetCompany}`;
}

/* ── Parse AI response to JSON ── */
function parseAIResponse(text) {
  // Strip markdown code fences if present
  let clean = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

  // Try to extract JSON object if there's extra text around it
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    clean = jsonMatch[0];
  }

  const parsed = JSON.parse(clean);

  // Validate required fields
  if (typeof parsed.readinessScore !== "number") {
    parsed.readinessScore = 50;
  }
  if (!Array.isArray(parsed.hasTopics)) parsed.hasTopics = [];
  if (!Array.isArray(parsed.missingTopics)) parsed.missingTopics = [];
  if (!Array.isArray(parsed.partialTopics)) parsed.partialTopics = [];
  if (!parsed.studyPlan || typeof parsed.studyPlan !== "object") {
    parsed.studyPlan = { week1: [], week2: [], week3: [], week4: [] };
  }
  if (!parsed.summary) parsed.summary = "Analysis complete.";

  return parsed;
}

/* ── Call Gemini directly from the browser ── */
async function callGeminiDirect(resumeText, targetCompany) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Try models in order of preference
  const modelNames = [
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ];

  let lastError = null;

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = buildScanPrompt(resumeText, targetCompany);

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.3,
        },
      });

      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from AI");
      }

      return parseAIResponse(text);
    } catch (err) {
      console.warn(`Model ${modelName} failed:`, err.message);
      lastError = err;
      // Continue to next model
    }
  }

  throw lastError || new Error("All AI models failed");
}

/* ── Fallback: call the backend server ── */
async function callBackendAPI(resumeText, targetCompany) {
  const res = await fetch("/api/scan-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, targetCompany }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export default function ResumeScanner() {
  const { user } = useAuth();
  const fileRef = useRef(null);

  const [resumeText, setResumeText] = useState("");
  const [targetCompany, setTargetCompany] = useState("Google");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [result, setResult] = useState(null);

  const canScan = resumeText.trim().length > 30 && !!targetCompany;

  const studyPlanFlat = useMemo(() => {
    if (!result?.studyPlan) return [];
    const entries = [
      ["week1", 1],
      ["week2", 2],
      ["week3", 3],
      ["week4", 4],
    ];
    const out = [];
    for (const [k, wk] of entries) {
      const arr = Array.isArray(result.studyPlan?.[k]) ? result.studyPlan[k] : [];
      for (const item of arr) out.push({ ...item, weekNumber: wk });
    }
    return out;
  }, [result]);

  /* ── PDF text extraction ── */
  const extractPdfText = async (arrayBuffer) => {
    try {
      // Dynamic import for pdfjs-dist — works with v4/v5
      const pdfjsLib = await import("pdfjs-dist");

      // Set up worker — try multiple known paths
      try {
        const workerModule = await import("pdfjs-dist/build/pdf.worker.min?url");
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
      } catch {
        try {
          const workerModule = await import("pdfjs-dist/build/pdf.worker?url");
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
        } catch {
          // Disable worker as ultimate fallback — still works, just slower
          pdfjsLib.GlobalWorkerOptions.workerSrc = "";
        }
      }

      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pages = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((it) => it.str);
        pages.push(strings.join(" "));
      }
      return pages.join("\n\n");
    } catch (pdfErr) {
      console.error("PDF extraction error:", pdfErr);
      throw new Error("Could not extract text from PDF. Please paste the text manually.");
    }
  };

  /* ── File upload handler ── */
  const handleFile = async (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    try {
      if (name.endsWith(".txt")) {
        const text = await file.text();
        if (text.trim().length === 0) {
          toast.error("The text file is empty.");
          return;
        }
        setResumeText(text);
        toast.success(`Loaded "${file.name}" (${text.length} chars)`);
        return;
      }
      if (name.endsWith(".pdf")) {
        toast.loading("Extracting text from PDF...", { id: "pdf-extract" });
        const buf = await file.arrayBuffer();
        const text = await extractPdfText(buf);
        toast.dismiss("pdf-extract");
        if (text.trim().length < 10) {
          toast.error("Could not extract enough text from this PDF. It may be image-based. Please paste the text manually.");
          return;
        }
        setResumeText(text);
        toast.success(`Extracted ${text.length} characters from "${file.name}"`);
        return;
      }
      toast.error("Only .txt or .pdf files are supported.");
    } catch (e) {
      toast.dismiss("pdf-extract");
      toast.error(e.message || "Failed to read file. Try pasting text instead.");
    }
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    await handleFile(f);
  };

  /* ── Main scan function: tries client-side Gemini first, backend fallback second ── */
  const scanResume = async () => {
    setLoading(true);
    try {
      let data;

      // Strategy 1: Call Gemini directly from browser (no backend needed)
      try {
        data = await callGeminiDirect(resumeText, targetCompany);
      } catch (directErr) {
        console.warn("Direct Gemini call failed, trying backend:", directErr.message);

        // Strategy 2: Call Express backend
        try {
          data = await callBackendAPI(resumeText, targetCompany);
        } catch (backendErr) {
          console.error("Backend also failed:", backendErr.message);
          throw new Error(
            directErr.message.includes("API_KEY")
              ? "Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file."
              : `AI scan failed: ${directErr.message}`
          );
        }
      }

      // Normalize score
      const score = clamp(Number(data.readinessScore) || 0, 0, 100);
      setResult({ ...data, readinessScore: score });
      toast.success("Résumé scan complete!");
    } catch (e) {
      toast.error(`Scan failed: ${e.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const insertTask = async (topicItem) => {
    if (!user?.id) {
      toast.error("Please log in to add tasks.");
      return;
    }
    const payloadFull = {
      user_id: user.id,
      title: topicItem.topic,
      priority: (topicItem.priority || "medium").toLowerCase(),
      estimated_hours: topicItem.estimatedHours,
      source: "resume_scanner",
      is_completed: false,
      scheduled_date: calcDateForWeek(topicItem.weekNumber || 1),
    };

    // Try full schema first; fallback to minimal columns if your table doesn't have extras yet.
    let { error } = await supabase.from("study_tasks").insert(payloadFull);
    if (error) {
      const minimal = {
        user_id: user.id,
        title: topicItem.topic,
        priority: (topicItem.priority || "medium").toLowerCase(),
        scheduled_date: calcDateForWeek(topicItem.weekNumber || 1),
      };
      ({ error } = await supabase.from("study_tasks").insert(minimal));
    }

    if (error) toast.error(`Failed to add: ${error.message}`);
    else toast.success("Added to Study Planner!");
  };

  const addAll = async () => {
    if (!user?.id) {
      toast.error("Please log in to add tasks.");
      return;
    }
    if (!studyPlanFlat.length) return;

    const rowsFull = studyPlanFlat.map((t) => ({
      user_id: user.id,
      title: t.topic,
      priority: (t.priority || "medium").toLowerCase(),
      estimated_hours: t.estimatedHours,
      source: "resume_scanner",
      is_completed: false,
      scheduled_date: calcDateForWeek(t.weekNumber || 1),
    }));

    let { error } = await supabase.from("study_tasks").insert(rowsFull);
    if (error) {
      const rowsMinimal = studyPlanFlat.map((t) => ({
        user_id: user.id,
        title: t.topic,
        priority: (t.priority || "medium").toLowerCase(),
        scheduled_date: calcDateForWeek(t.weekNumber || 1),
      }));
      ({ error } = await supabase.from("study_tasks").insert(rowsMinimal));
    }

    if (error) toast.error(`Failed to add all: ${error.message}`);
    else toast.success("✅ All tasks added to your Study Planner!");
  };

  const score = result?.readinessScore ?? 0;
  const col = gaugeColor(score);

  return (
    <div className="rs-root">
      <div className="rs-bg" />
      <div className="rs-wrap">
        <div className="rs-header">
          <div className="rs-pill">Résumé DSA Scanner</div>
          <h1 className="rs-title">Scan your résumé for DSA readiness</h1>
          <p className="rs-sub">
            Paste your résumé or upload a file. We'll analyze your DSA coverage and generate a 30‑day plan tailored to your target company.
          </p>
        </div>

        {/* Step 1 */}
        <div className="rs-card">
          <div className="rs-sectionTitle">Step 1 — Input</div>

          <div className="rs-grid2">
            <div>
              <div className="rs-label">Résumé text *</div>
              <textarea
                className="rs-textarea"
                placeholder="Paste your résumé content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <div className="rs-hint">{resumeText.trim().length} characters {resumeText.trim().length < 30 && resumeText.trim().length > 0 ? "(need at least 30)" : ""}</div>
            </div>

            <div>
              <div className="rs-label">Or upload (.txt, .pdf)</div>
              <div
                className={`rs-drop ${dragOver ? "over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                <div className="rs-dropIcon">📎</div>
                <div className="rs-dropTitle">Drag & drop your résumé</div>
                <div className="rs-dropSub">or click to browse</div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    handleFile(e.target.files?.[0]);
                    // Reset input so re-uploading the same file works
                    e.target.value = "";
                  }}
                />
              </div>

              <div className="rs-label" style={{ marginTop: 18 }}>
                Target company
              </div>
              <div className="rs-companyRow">
                {COMPANIES.map((c) => (
                  <button
                    key={c.id}
                    className={`rs-companyBtn ${targetCompany === c.id ? "selected" : ""}`}
                    onClick={() => setTargetCompany(c.id)}
                  >
                    <span className="rs-companyEmoji">{c.emoji}</span>
                    <span className="rs-companyName">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rs-actions">
            <button
              className="rs-primary"
              disabled={!canScan || loading}
              onClick={scanResume}
            >
              {loading ? "⏳ Scanning..." : "Scan My Résumé"}
            </button>
          </div>
        </div>

        {/* Step 2 */}
        {result && (
          <div className="rs-card" style={{ marginTop: 18 }}>
            <div className="rs-sectionTitle">Step 2 — Results</div>

            {/* A: Skill gap */}
            <div className="rs-subtitleRow">
              <div className="rs-subheading">Skill Gap Analysis</div>
              <div className="rs-summary">{result.summary}</div>
            </div>
            <div className="rs-skillGrid">
              <div className="rs-skillCol have">
                <div className="rs-skillHead">You Have ✅</div>
                <div className="rs-chipWrap">
                  {(result.hasTopics || []).map((t, i) => (
                    <span className="rs-chip ok" key={i}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rs-skillCol miss">
                <div className="rs-skillHead">You&apos;re Missing ❌</div>
                <div className="rs-chipWrap">
                  {(result.missingTopics || []).map((t, i) => (
                    <span className="rs-chip bad" key={i}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rs-skillCol partial">
                <div className="rs-skillHead">Partially Covered ⚠️</div>
                <div className="rs-chipWrap">
                  {(result.partialTopics || []).map((t, i) => (
                    <span className="rs-chip warn" key={i}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* B: Gauge */}
            <div className="rs-row">
              <div className="rs-subheading">Readiness Score</div>
              <div className="rs-muted">Interview Readiness for {targetCompany}</div>
            </div>

            <div className="rs-gaugeCard">
              <svg viewBox="0 0 120 70" className="rs-gauge">
                <path
                  d="M 10 60 A 50 50 0 0 1 110 60"
                  fill="none"
                  stroke="rgba(99,102,241,0.18)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M 10 60 A 50 50 0 0 1 110 60"
                  fill="none"
                  stroke={col}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(Math.PI * 50) * (score / 100)} ${Math.PI * 50}`}
                />
                <circle cx="60" cy="60" r="3.5" fill="rgba(226,232,240,0.9)" />
              </svg>
              <div className="rs-gaugeScore" style={{ color: col }}>
                {score}%
              </div>
            </div>

            {/* C: Plan */}
            <div className="rs-row" style={{ marginTop: 18 }}>
              <div className="rs-subheading">Generated 30‑Day Study Plan</div>
              <button className="rs-secondary" onClick={addAll}>
                Add All to Study Planner
              </button>
            </div>

            <div className="rs-weeks">
              {[
                ["week1", "Week 1"],
                ["week2", "Week 2"],
                ["week3", "Week 3"],
                ["week4", "Week 4"],
              ].map(([k, label], idx) => {
                const items = result.studyPlan?.[k] || [];
                return (
                  <div key={k} className="rs-week">
                    <div className="rs-weekHead">{label}</div>
                    <div className="rs-weekGrid">
                      {items.map((t, i) => (
                        <div key={i} className="rs-topicCard">
                          <div className="rs-topicTop">
                            <div className="rs-topicName">{t.topic}</div>
                            <span className={`rs-badge ${String(t.priority).toLowerCase()}`}>
                              {String(t.priority || "medium").toUpperCase()}
                            </span>
                          </div>
                          <div className="rs-topicMeta">
                            ⏱ {t.estimatedHours}h · {t.description}
                          </div>
                          <button
                            className="rs-addBtn"
                            onClick={() => insertTask({ ...t, weekNumber: idx + 1 })}
                          >
                            + Add to Planner
                          </button>
                        </div>
                      ))}
                      {items.length === 0 && (
                        <div className="rs-emptyWeek">No items returned for this week.</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .rs-root{min-height:100vh; position:relative; padding:0 0 80px; color:#e2e8f0;}
        .rs-bg{position:fixed; inset:0; background:
          radial-gradient(ellipse 80% 60% at 10% 0%, rgba(99,102,241,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 90% 100%, rgba(16,185,129,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 50% 55%, rgba(236,72,153,0.08) 0%, transparent 70%),
          #030712; z-index:0; }
        .rs-wrap{position:relative; z-index:1; max-width:1100px; margin:0 auto; padding:44px 18px 0;}
        .rs-header{text-align:center; margin-bottom:18px;}
        .rs-pill{display:inline-flex; padding:6px 14px; border-radius:9999px; border:1px solid rgba(99,102,241,0.35); background:rgba(99,102,241,0.12); color:#a5b4fc; font-weight:700; font-size:12px; letter-spacing:0.08em; text-transform:uppercase;}
        .rs-title{margin:14px 0 8px; font-size:clamp(28px,4vw,44px); font-weight:900; letter-spacing:-0.03em;
          background:linear-gradient(135deg,#e2e8f0 0%,#a5b4fc 55%,#34d399 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent;}
        .rs-sub{margin:0 auto; max-width:760px; color:#64748b; font-size:14px; line-height:1.7;}
        .rs-card{background:rgba(15,23,42,0.72); border:1px solid rgba(99,102,241,0.14); border-radius:22px; padding:22px; backdrop-filter:blur(18px); box-shadow:0 32px 64px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.03);}
        .rs-sectionTitle{font-size:11px; font-weight:900; letter-spacing:0.14em; text-transform:uppercase; color:#818cf8; margin-bottom:14px;}
        .rs-grid2{display:grid; grid-template-columns:1.2fr 1fr; gap:16px;}
        @media (max-width:900px){.rs-grid2{grid-template-columns:1fr;}}
        .rs-label{font-size:12px; font-weight:700; color:#94a3b8; margin-bottom:8px;}
        .rs-textarea{width:100%; min-height:220px; resize:vertical; padding:14px 14px; border-radius:14px; background:rgba(2,6,23,0.55); border:1px solid rgba(99,102,241,0.22); color:#e2e8f0; outline:none; font-size:14px; line-height:1.6; font-family:inherit;}
        .rs-textarea:focus{border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.12);}
        .rs-hint{margin-top:6px; font-size:11px; color:#475569;}
        .rs-drop{border:2px dashed rgba(99,102,241,0.25); border-radius:16px; padding:22px; text-align:center; cursor:pointer; background:rgba(2,6,23,0.35); transition:all .15s;}
        .rs-drop.over, .rs-drop:hover{border-color:#6366f1; background:rgba(99,102,241,0.06); transform:translateY(-1px);}
        .rs-dropIcon{font-size:26px; margin-bottom:8px;}
        .rs-dropTitle{font-weight:800; color:#cbd5e1; font-size:13px;}
        .rs-dropSub{margin-top:4px; color:#64748b; font-size:12px;}
        .rs-companyRow{display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:8px;}
        @media (max-width:900px){.rs-companyRow{grid-template-columns:repeat(2, minmax(0,1fr));}}
        .rs-companyBtn{display:flex; align-items:center; gap:8px; border-radius:14px; padding:10px 10px; background:rgba(30,41,59,0.55); border:1px solid rgba(99,102,241,0.12); cursor:pointer; transition:all .15s; color:#cbd5e1;}
        .rs-companyBtn:hover{border-color:rgba(99,102,241,0.45); background:rgba(99,102,241,0.08); transform:translateY(-1px);}
        .rs-companyBtn.selected{border-color:#6366f1; background:rgba(99,102,241,0.16); box-shadow:0 0 18px rgba(99,102,241,0.25);}
        .rs-companyEmoji{font-size:18px;}
        .rs-companyName{font-size:12px; font-weight:700; color:#cbd5e1;}
        .rs-actions{display:flex; justify-content:flex-end; margin-top:14px;}
        .rs-primary{border:none; border-radius:14px; padding:12px 18px; font-weight:900; color:white; cursor:pointer; font-size:14px;
          background:linear-gradient(135deg,#6366f1 0%, #8b5cf6 45%, #22c55e 120%); box-shadow:0 10px 28px rgba(99,102,241,0.35); transition:all .15s;}
        .rs-primary:disabled{opacity:.45; cursor:not-allowed; box-shadow:none; transform:none;}
        .rs-primary:not(:disabled):hover{transform:translateY(-1px); box-shadow:0 14px 34px rgba(99,102,241,0.5);}
        .rs-subtitleRow{display:flex; gap:14px; align-items:flex-start; justify-content:space-between; flex-wrap:wrap;}
        .rs-subheading{font-size:14px; font-weight:900; color:#e2e8f0;}
        .rs-summary{flex:1; min-width:260px; color:#94a3b8; font-size:13px; line-height:1.6;}
        .rs-skillGrid{display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:12px; margin-top:14px;}
        @media (max-width:900px){.rs-skillGrid{grid-template-columns:1fr;}}
        .rs-skillCol{border-radius:16px; padding:14px; border:1px solid rgba(255,255,255,0.06); background:rgba(2,6,23,0.25);}
        .rs-skillCol.have{border-color:rgba(16,185,129,0.25); background:rgba(16,185,129,0.06);}
        .rs-skillCol.miss{border-color:rgba(244,63,94,0.25); background:rgba(244,63,94,0.06);}
        .rs-skillCol.partial{border-color:rgba(245,158,11,0.25); background:rgba(245,158,11,0.06);}
        .rs-skillHead{font-size:11px; font-weight:900; letter-spacing:0.1em; text-transform:uppercase; color:#cbd5e1; margin-bottom:10px;}
        .rs-chipWrap{display:flex; flex-wrap:wrap; gap:8px;}
        .rs-chip{font-size:12px; padding:6px 10px; border-radius:9999px; border:1px solid rgba(148,163,184,0.2); color:#cbd5e1; background:rgba(15,23,42,0.35);}
        .rs-chip.ok{border-color:rgba(16,185,129,0.35); background:rgba(16,185,129,0.08); color:#6ee7b7;}
        .rs-chip.bad{border-color:rgba(244,63,94,0.35); background:rgba(244,63,94,0.08); color:#fda4af;}
        .rs-chip.warn{border-color:rgba(245,158,11,0.35); background:rgba(245,158,11,0.08); color:#fcd34d;}
        .rs-row{display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:18px; flex-wrap:wrap;}
        .rs-muted{color:#64748b; font-size:12px; font-weight:700;}
        .rs-gaugeCard{margin-top:10px; border-radius:18px; border:1px solid rgba(99,102,241,0.14); background:rgba(2,6,23,0.35); padding:18px; display:flex; align-items:center; justify-content:center; flex-direction:column;}
        .rs-gauge{width:240px; max-width:100%; height:auto;}
        .rs-gaugeScore{margin-top:8px; font-weight:1000; font-size:28px; letter-spacing:-0.02em;}
        .rs-secondary{border-radius:12px; padding:10px 14px; cursor:pointer; font-weight:900; border:1px solid rgba(99,102,241,0.25); color:#a5b4fc; background:rgba(99,102,241,0.08);}
        .rs-secondary:hover{border-color:rgba(99,102,241,0.45); background:rgba(99,102,241,0.12);}
        .rs-weeks{display:flex; flex-direction:column; gap:14px; margin-top:12px;}
        .rs-weekHead{font-size:12px; font-weight:1000; color:#cbd5e1; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:10px;}
        .rs-weekGrid{display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:10px;}
        @media (max-width:900px){.rs-weekGrid{grid-template-columns:1fr;}}
        .rs-topicCard{border-radius:16px; padding:14px; border:1px solid rgba(255,255,255,0.06); background:rgba(15,23,42,0.55); transition:transform .15s, border-color .15s;}
        .rs-topicCard:hover{transform:translateY(-1px); border-color:rgba(99,102,241,0.25);}
        .rs-topicTop{display:flex; align-items:flex-start; justify-content:space-between; gap:10px;}
        .rs-topicName{font-weight:1000; color:#e2e8f0; font-size:13px;}
        .rs-topicMeta{margin-top:8px; color:#94a3b8; font-size:12px; line-height:1.5;}
        .rs-badge{font-size:10px; font-weight:1000; border-radius:9999px; padding:4px 8px; border:1px solid rgba(148,163,184,0.18); color:#cbd5e1;}
        .rs-badge.high{border-color:rgba(239,68,68,0.35); background:rgba(239,68,68,0.08); color:#fca5a5;}
        .rs-badge.medium{border-color:rgba(245,158,11,0.35); background:rgba(245,158,11,0.08); color:#fcd34d;}
        .rs-badge.low{border-color:rgba(16,185,129,0.35); background:rgba(16,185,129,0.08); color:#6ee7b7;}
        .rs-addBtn{margin-top:12px; width:100%; border-radius:12px; padding:10px 12px; cursor:pointer; font-weight:1000; border:1px solid rgba(99,102,241,0.22); background:rgba(99,102,241,0.10); color:#c7d2fe;}
        .rs-addBtn:hover{background:rgba(99,102,241,0.16); border-color:rgba(99,102,241,0.35);}
        .rs-emptyWeek{padding:14px; border-radius:14px; color:#64748b; background:rgba(2,6,23,0.25); border:1px dashed rgba(99,102,241,0.14);}
      `}</style>
    </div>
  );
}
