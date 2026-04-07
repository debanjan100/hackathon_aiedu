import { useState, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const CATEGORIES = [
  { id: "ai_tutor", label: "AI Tutor Issue", icon: "🤖" },
  { id: "study_planner", label: "Study Planner Bug", icon: "📅" },
  { id: "analytics", label: "Analytics Error", icon: "📊" },
  { id: "payment", label: "Payment / Billing", icon: "💳" },
  { id: "auth", label: "Login / Auth", icon: "🔐" },
  { id: "performance", label: "Performance", icon: "⚡" },
  { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
  { id: "other", label: "Other", icon: "💬" },
];

const SEVERITY = [
  { id: "low", label: "Low", color: "#4ade80", desc: "Minor inconvenience" },
  { id: "medium", label: "Medium", color: "#facc15", desc: "Impacts my workflow" },
  { id: "high", label: "High", color: "#f97316", desc: "Blocking my progress" },
  { id: "critical", label: "Critical", color: "#ef4444", desc: "Platform unusable" },
];

export default function RaiseComplaint() {
  const [step, setStep] = useState(1); // 1=form, 2=review, 3=submitted
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFiles = useCallback(
    (files) => {
      const valid = Array.from(files).filter(
        (f) => f.type.startsWith("image/") && f.size < 5 * 1024 * 1024
      );
      if (valid.length + screenshots.length > 4) {
        setError("Maximum 4 screenshots allowed.");
        return;
      }
      const readers = valid.map(
        (file) =>
          new Promise((res) => {
            const reader = new FileReader();
            reader.onload = (e) =>
              res({
                name: file.name,
                url: e.target.result,
                size: (file.size / 1024).toFixed(0),
              });
            reader.readAsDataURL(file);
          })
      );
      Promise.all(readers).then((imgs) =>
        setScreenshots((prev) => [...prev, ...imgs])
      );
    },
    [screenshots]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeScreenshot = (i) =>
    setScreenshots((prev) => prev.filter((_, idx) => idx !== i));

  const canProceed =
    category &&
    severity &&
    title.trim().length >= 3 &&
    description.trim().length >= 8 &&
    /\S+@\S+\.\S+/.test(email);

  const submitComplaint = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/triage-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          severity,
          title,
          description,
          screenshotCount: screenshots.length,
          email,
        }),
      });

      const parsed = await res.json();
      if (!res.ok) {
        throw new Error(parsed?.error || "Failed to submit.");
      }

      setAiResponse(parsed);
      setStep(3);

      // Best-effort save to Supabase (requires complaints table + RLS).
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const userId = userRes?.user?.id || null;
        if (userId) {
          await supabase.from("complaints").insert({
            ticket_id: parsed.ticketId,
            user_id: userId,
            email,
            category,
            severity,
            title,
            description,
            screenshot_count: screenshots.length,
            ai_acknowledgement: parsed.acknowledgement,
            ai_analysis: parsed.analysis,
            ai_eta: parsed.eta,
            ai_self_help: parsed.selfHelp,
            status: "open",
          });
        }
      } catch {
        // ignore for hackathon/demo environments
      }
    } catch (_err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setCategory("");
    setSeverity("");
    setTitle("");
    setDescription("");
    setScreenshots([]);
    setEmail("");
    setAiResponse(null);
    setError("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cx-root {
          min-height: 100vh;
          background: #030712;
          font-family: 'DM Sans', sans-serif;
          color: #e2e8f0;
          padding: 0;
          overflow-x: hidden;
          position: relative;
        }

        .cx-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 10% 0%, rgba(99,102,241,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 90% 100%, rgba(236,72,153,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(16,185,129,0.04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .cx-grid-bg {
          position: fixed;
          inset: 0;
          background-image: linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        .cx-wrap {
          position: relative;
          z-index: 1;
          max-width: 780px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }

        /* Header */
        .cx-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .cx-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 500;
          color: #a5b4fc;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .cx-badge::before { content: '●'; color: #818cf8; font-size: 8px; }
        .cx-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #e2e8f0 0%, #a5b4fc 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
        }
        .cx-subtitle {
          color: #64748b;
          font-size: 16px;
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Progress Steps */
        .cx-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 40px;
        }
        .cx-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .cx-step-dot {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          border: 2px solid rgba(99,102,241,0.2);
          background: rgba(15,23,42,0.8);
          color: #475569;
          transition: all 0.3s;
        }
        .cx-step.active .cx-step-dot {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-color: #818cf8;
          color: white;
          box-shadow: 0 0 24px rgba(99,102,241,0.5);
        }
        .cx-step.done .cx-step-dot {
          background: linear-gradient(135deg, #10b981, #059669);
          border-color: #34d399;
          color: white;
        }
        .cx-step-label {
          font-size: 11px;
          color: #475569;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .cx-step.active .cx-step-label { color: #a5b4fc; }
        .cx-step.done .cx-step-label { color: #34d399; }
        .cx-step-line {
          width: 80px;
          height: 2px;
          background: rgba(99,102,241,0.15);
          margin: 0 4px;
          margin-bottom: 24px;
          transition: background 0.3s;
        }
        .cx-step-line.done { background: linear-gradient(90deg, #6366f1, #8b5cf6); }

        /* Card */
        .cx-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.03) inset,
                      0 32px 64px rgba(0,0,0,0.4);
        }

        /* Section labels */
        .cx-section-label {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #6366f1;
          margin-bottom: 14px;
        }

        /* Category grid */
        .cx-cat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 32px;
        }
        @media (max-width: 600px) { .cx-cat-grid { grid-template-columns: repeat(2, 1fr); } }
        .cx-cat-btn {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 14px;
          padding: 14px 10px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .cx-cat-btn:hover {
          border-color: rgba(99,102,241,0.4);
          background: rgba(99,102,241,0.08);
          transform: translateY(-2px);
        }
        .cx-cat-btn.selected {
          border-color: #6366f1;
          background: rgba(99,102,241,0.15);
          box-shadow: 0 0 16px rgba(99,102,241,0.2);
        }
        .cx-cat-icon { font-size: 22px; }
        .cx-cat-name { font-size: 11px; font-weight: 500; color: #94a3b8; line-height: 1.3; }
        .cx-cat-btn.selected .cx-cat-name { color: #a5b4fc; }

        /* Severity */
        .cx-sev-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 32px;
        }
        @media (max-width: 600px) { .cx-sev-grid { grid-template-columns: repeat(2, 1fr); } }
        .cx-sev-btn {
          background: rgba(30, 41, 59, 0.6);
          border: 2px solid transparent;
          border-radius: 14px;
          padding: 14px 10px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }
        .cx-sev-btn:hover { transform: translateY(-2px); }
        .cx-sev-label { font-size: 13px; font-weight: 700; font-family: 'Syne', sans-serif; margin-bottom: 4px; }
        .cx-sev-desc { font-size: 10px; color: #64748b; }

        /* Input */
        .cx-field { margin-bottom: 24px; }
        .cx-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 8px;
        }
        .cx-input {
          width: 100%;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 12px;
          padding: 14px 16px;
          color: #e2e8f0;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          resize: none;
        }
        .cx-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .cx-input::placeholder { color: #334155; }
        .cx-char-count { text-align: right; font-size: 11px; color: #475569; margin-top: 4px; }

        /* Drop zone */
        .cx-dropzone {
          border: 2px dashed rgba(99,102,241,0.25);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }
        .cx-dropzone:hover, .cx-dropzone.over {
          border-color: #6366f1;
          background: rgba(99,102,241,0.05);
        }
        .cx-drop-icon { font-size: 36px; margin-bottom: 12px; }
        .cx-drop-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; color: #94a3b8; margin-bottom: 6px; }
        .cx-drop-sub { font-size: 12px; color: #475569; }
        .cx-drop-sub span { color: #6366f1; font-weight: 500; }

        /* Screenshot previews */
        .cx-previews {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 16px;
        }
        @media (max-width: 500px) { .cx-previews { grid-template-columns: repeat(2, 1fr); } }
        .cx-preview-item {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(99,102,241,0.2);
          aspect-ratio: 16/10;
        }
        .cx-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .cx-preview-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(239,68,68,0.8);
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          cursor: pointer;
          font-size: 12px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          backdrop-filter: blur(4px);
        }
        .cx-preview-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 12px 6px 4px;
          font-size: 9px;
          color: #94a3b8;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Divider */
        .cx-divider {
          height: 1px;
          background: rgba(99,102,241,0.1);
          margin: 28px 0;
        }

        /* Review box */
        .cx-review-item {
          display: flex;
          gap: 12px;
          padding: 14px;
          background: rgba(30, 41, 59, 0.4);
          border-radius: 12px;
          margin-bottom: 10px;
          align-items: flex-start;
        }
        .cx-review-icon { font-size: 18px; flex-shrink: 0; }
        .cx-review-key { font-size: 11px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
        .cx-review-val { font-size: 14px; color: #e2e8f0; }

        /* Buttons */
        .cx-btn-row {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }
        .cx-btn {
          flex: 1;
          padding: 16px 24px;
          border-radius: 14px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          letter-spacing: 0.02em;
        }
        .cx-btn-ghost {
          background: transparent;
          border: 1px solid rgba(99,102,241,0.25);
          color: #64748b;
        }
        .cx-btn-ghost:hover { border-color: rgba(99,102,241,0.5); color: #94a3b8; }
        .cx-btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          box-shadow: 0 4px 24px rgba(99,102,241,0.35);
        }
        .cx-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(99,102,241,0.5); }
        .cx-btn-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .cx-btn-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 4px 24px rgba(239,68,68,0.25);
        }
        .cx-btn-danger:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(239,68,68,0.4); }

        /* Error */
        .cx-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          color: #fca5a5;
          margin-top: 12px;
        }

        /* Loading */
        .cx-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 32px;
          color: #6366f1;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          flex-direction: column;
        }
        .cx-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(99,102,241,0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Success */
        .cx-success {
          text-align: center;
          padding: 20px 0;
        }
        .cx-success-icon {
          font-size: 64px;
          margin-bottom: 20px;
          display: block;
          animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes pop {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .cx-ticket-id {
          display: inline-block;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.4);
          border-radius: 10px;
          padding: 10px 20px;
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #a5b4fc;
          letter-spacing: 0.08em;
          margin: 16px 0;
        }
        .cx-ai-card {
          background: rgba(30,41,59,0.6);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 16px;
          padding: 24px;
          margin: 24px 0;
          text-align: left;
        }
        .cx-ai-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #6366f1;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .cx-ai-ack {
          font-size: 15px;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        .cx-ai-analysis {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          border-left: 2px solid rgba(99,102,241,0.3);
          padding-left: 14px;
          margin-bottom: 16px;
        }
        .cx-eta-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 12px;
          color: #34d399;
          font-weight: 500;
          margin-bottom: 16px;
        }
        .cx-tips {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cx-tip {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
        }
        .cx-tip::before { content: '→'; color: #6366f1; flex-shrink: 0; }
      `}</style>

      <div className="cx-root">
        <div className="cx-grid-bg" />
        <div className="cx-wrap">
          {/* Header */}
          <div className="cx-header">
            <div className="cx-badge">Support Center</div>
            <h1 className="cx-title">Raise a Complaint</h1>
            <p className="cx-subtitle">
              Encountered a bug or issue? Let our AI triage your report instantly
              and route it to the right team.
            </p>
          </div>

          {/* Steps */}
          <div className="cx-steps">
            {["Report", "Review", "Done"].map((s, i) => (
              <>
                <div
                  key={s}
                  className={`cx-step ${
                    step > i + 1 ? "done" : step === i + 1 ? "active" : ""
                  }`}
                >
                  <div className="cx-step-dot">
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <div className="cx-step-label">{s}</div>
                </div>
                {i < 2 && (
                  <div
                    className={`cx-step-line ${step > i + 1 ? "done" : ""}`}
                  />
                )}
              </>
            ))}
          </div>

          {/* STEP 1: Form */}
          {step === 1 && (
            <div className="cx-card">
              <div className="cx-section-label">01 — Category</div>
              <div className="cx-cat-grid">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    className={`cx-cat-btn ${
                      category === c.id ? "selected" : ""
                    }`}
                    onClick={() => setCategory(c.id)}
                  >
                    <span className="cx-cat-icon">{c.icon}</span>
                    <span className="cx-cat-name">{c.label}</span>
                  </button>
                ))}
              </div>

              <div className="cx-section-label">02 — Severity</div>
              <div className="cx-sev-grid">
                {SEVERITY.map((s) => (
                  <button
                    key={s.id}
                    className="cx-sev-btn"
                    style={{
                      borderColor:
                        severity === s.id
                          ? s.color
                          : "rgba(99,102,241,0.12)",
                      background:
                        severity === s.id
                          ? `${s.color}15`
                          : "rgba(30,41,59,0.6)",
                      boxShadow:
                        severity === s.id ? `0 0 20px ${s.color}30` : "none",
                    }}
                    onClick={() => setSeverity(s.id)}
                  >
                    <div className="cx-sev-label" style={{ color: s.color }}>
                      {s.label}
                    </div>
                    <div className="cx-sev-desc">{s.desc}</div>
                  </button>
                ))}
              </div>

              <div className="cx-divider" />

              <div className="cx-section-label">03 — Details</div>

              <div className="cx-field">
                <label className="cx-label">Issue Title *</label>
                <input
                  className="cx-input"
                  placeholder="Brief summary of the problem..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <div className="cx-char-count">{title.length}/100</div>
              </div>

              <div className="cx-field">
                <label className="cx-label">Detailed Description *</label>
                <textarea
                  className="cx-input"
                  rows={5}
                  placeholder="Describe what happened, what you expected, and the steps to reproduce the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                />
                <div className="cx-char-count">
                  {description.length}/1000
                </div>
              </div>

              <div className="cx-field">
                <label className="cx-label">Your Email *</label>
                <input
                  className="cx-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="cx-divider" />

              <div className="cx-section-label">04 — Screenshots (optional)</div>
              <div
                className={`cx-dropzone ${dragOver ? "over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current.click()}
              >
                <div className="cx-drop-icon">📎</div>
                <div className="cx-drop-title">
                  Drag & drop screenshots here
                </div>
                <div className="cx-drop-sub">
                  or <span>click to browse</span> — PNG, JPG, WebP up to 5MB
                  (max 4)
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>

              {screenshots.length > 0 && (
                <div className="cx-previews">
                  {screenshots.map((s, i) => (
                    <div key={i} className="cx-preview-item">
                      <img src={s.url} alt={s.name} />
                      <button
                        className="cx-preview-remove"
                        onClick={() => removeScreenshot(i)}
                      >
                        ×
                      </button>
                      <div className="cx-preview-name">{s.name}</div>
                    </div>
                  ))}
                </div>
              )}

              {error && <div className="cx-error">⚠ {error}</div>}

              <div className="cx-btn-row">
                <button
                  className="cx-btn cx-btn-primary"
                  disabled={!canProceed}
                  onClick={() => setStep(2)}
                >
                  Review Before Submitting →
                </button>
              </div>
              {!canProceed && (
                <div className="cx-char-count" style={{ marginTop: 8, textAlign: 'left' }}>
                  Fill in all required fields (short title, a brief description, and a valid email) to continue.
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Review */}
          {step === 2 && (
            <div className="cx-card">
              <div className="cx-section-label">Review Your Report</div>

              <div className="cx-review-item">
                <span className="cx-review-icon">🗂</span>
                <div>
                  <div className="cx-review-key">Category</div>
                  <div className="cx-review-val">
                    {CATEGORIES.find((c) => c.id === category)?.icon}{" "}
                    {CATEGORIES.find((c) => c.id === category)?.label}
                  </div>
                </div>
              </div>
              <div className="cx-review-item">
                <span className="cx-review-icon">🚨</span>
                <div>
                  <div className="cx-review-key">Severity</div>
                  <div
                    className="cx-review-val"
                    style={{
                      color: SEVERITY.find((s) => s.id === severity)?.color,
                      fontWeight: 600,
                    }}
                  >
                    {SEVERITY.find((s) => s.id === severity)?.label} —{" "}
                    {SEVERITY.find((s) => s.id === severity)?.desc}
                  </div>
                </div>
              </div>
              <div className="cx-review-item">
                <span className="cx-review-icon">📝</span>
                <div>
                  <div className="cx-review-key">Title</div>
                  <div className="cx-review-val">{title}</div>
                </div>
              </div>
              <div className="cx-review-item">
                <span className="cx-review-icon">💬</span>
                <div>
                  <div className="cx-review-key">Description</div>
                  <div
                    className="cx-review-val"
                    style={{
                      fontSize: 13,
                      color: "#94a3b8",
                      lineHeight: 1.6,
                    }}
                  >
                    {description}
                  </div>
                </div>
              </div>
              <div className="cx-review-item">
                <span className="cx-review-icon">📧</span>
                <div>
                  <div className="cx-review-key">Contact</div>
                  <div className="cx-review-val">{email}</div>
                </div>
              </div>
              {screenshots.length > 0 && (
                <div className="cx-review-item">
                  <span className="cx-review-icon">🖼</span>
                  <div>
                    <div className="cx-review-key">Screenshots</div>
                    <div className="cx-review-val">
                      {screenshots.length} file
                      {screenshots.length > 1 ? "s" : ""} attached
                    </div>
                  </div>
                </div>
              )}

              {error && <div className="cx-error">⚠ {error}</div>}

              <div className="cx-btn-row">
                <button
                  className="cx-btn cx-btn-ghost"
                  onClick={() => setStep(1)}
                >
                  ← Edit
                </button>
                <button
                  className="cx-btn cx-btn-danger"
                  onClick={submitComplaint}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "🚀 Submit Complaint"}
                </button>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="cx-card" style={{ marginTop: 20 }}>
              <div className="cx-loading">
                <div className="cx-spinner" />
                <div>AI is analyzing your report…</div>
              </div>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === 3 && aiResponse && (
            <div className="cx-card">
              <div className="cx-success">
                <span className="cx-success-icon">✅</span>
                <h2
                  style={{
                    fontFamily: "Syne",
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#e2e8f0",
                    marginBottom: 8,
                  }}
                >
                  Complaint Submitted
                </h2>
                <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>
                  Your ticket has been created and our team has been notified.
                </p>
                <div className="cx-ticket-id">{aiResponse.ticketId}</div>
              </div>

              <div className="cx-ai-card">
                <div className="cx-ai-header">🤖 CognifyX AI — Triage Report</div>
                <div className="cx-ai-ack">{aiResponse.acknowledgement}</div>
                <div className="cx-ai-analysis">{aiResponse.analysis}</div>
                <div className="cx-eta-badge">
                  ⏱ Estimated resolution: {aiResponse.eta}
                </div>
                {aiResponse.selfHelp && aiResponse.selfHelp.length > 0 && (
                  <>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 10,
                        fontWeight: 600,
                      }}
                    >
                      While you wait — try these
                    </div>
                    <div className="cx-tips">
                      {aiResponse.selfHelp.map((tip, i) => (
                        <div key={i} className="cx-tip">
                          {tip}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="cx-btn-row">
                <button className="cx-btn cx-btn-ghost" onClick={reset}>
                  Submit Another Complaint
                </button>
                <button
                  className="cx-btn cx-btn-primary"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  Back to CognifyX →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

