import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Input, Spin, Select, Tag, Tooltip } from 'antd';
import { Send, Lightbulb, CheckCircle, Circle, Maximize2, Minimize2, Play, XCircle, Bookmark, BookmarkCheck, Clock, StickyNote, Trophy, Flame, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { sendChatMessage } from '../lib/chatApi';
import Editor from '@monaco-editor/react';
import AICodeReview from '../components/AICodeReview';
import { PROBLEMS, TOPICS, LANGUAGES, STARTER_TEMPLATES, DIFF_COLORS, DIFF_BG } from '../data/PracticeRoomProblems';

const { Option } = Select;

/* ── Piston / backend execution helper (original behavior) ── */
const runCode = async (code, language) => {
  const lang = LANGUAGES[language];
  // Try Piston API first
  try {
    const res = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: lang.pistonId,
        version: lang.version,
        files: [{ name: `main.${lang.ext}`, content: code }],
      }),
    });
    if (!res.ok) throw new Error(`Piston HTTP ${res.status}`);
    const data = await res.json();
    return { stdout: data.run?.stdout || '', stderr: data.run?.stderr || '' };
  } catch {
    // Fallback: try local server
    try {
      const url = import.meta.env.DEV ? 'http://localhost:5000/run-code' : '/api/run-code';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      if (!res.ok) throw new Error(`Local HTTP ${res.status}`);
      return await res.json();
    } catch {
      // Final fallback: AI simulation
      const reply = await sendChatMessage({
        message: `Execute this ${language} code and return ONLY the terminal output (no markdown, no explanation):\n\`\`\`${language}\n${code}\n\`\`\``,
        context: `You are a strict ${language} runtime. Output only what the program prints to stdout. If there are errors, output only the error message.`,
      });
      const isError = /error|exception|traceback/i.test(reply);
      return { stdout: isError ? '' : reply, stderr: isError ? reply : '' };
    }
  }
};

/* ── Test Case Result ── */

const TestResult = ({ example, index, result }) => {
  const passed = result && result.stdout?.trim() === example.output.trim();
  return (
    <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 8, background: 'var(--surface-container-high)', border: `1px solid ${result ? (passed ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)') : 'var(--border-color)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: 13 }}>Example {index + 1}</span>
        {result && (
          <span style={{ fontSize: 12, fontWeight: 700, color: passed ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
            {passed ? <CheckCircle size={13} /> : <XCircle size={13} />}
            {passed ? 'PASSED' : 'FAILED'}
          </span>
        )}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--on-surface-variant)' }}>
        <div><strong style={{ color: 'var(--on-surface)' }}>Input:</strong> {example.input}</div>
        <div style={{ marginTop: 4 }}><strong style={{ color: 'var(--on-surface)' }}>Expected:</strong> {example.output}</div>
        {result && (
          <div style={{ marginTop: 4, color: passed ? '#10b981' : '#ef4444' }}>
            <strong>Actual:</strong> {result.stderr ? result.stderr.split('\n')[0] : (result.stdout || '(no output)')}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── XP Badges ── */
const BADGES = [
  { emoji: '🌱', label: 'First Solve', threshold: 1 },
  { emoji: '🔥', label: '5 Solved', threshold: 5 },
  { emoji: '⚡', label: '10 Solved', threshold: 10 },
  { emoji: '💎', label: '15 Solved', threshold: 15 },
  { emoji: '🏆', label: 'Master', threshold: 20 },
];

/* ── Timer Component ── */
const PracticeTimer = ({ running }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = () => { setSeconds(0); };
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="practice-timer">
      <Clock size={14} />
      <span>{mins}:{secs}</span>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
const PracticeRoom = () => {
  const { user } = useAuth();
  const [activeTopic, setActiveTopic] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);
  const [solved, setSolved] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(`solved-${user?.id || 'guest'}`) || '[]')); } catch { return new Set(); }
  });
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(PROBLEMS[0].starterCode['python']);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [activeTab, setActiveTab] = useState('0');
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: '💡 Welcome! Select a problem and start coding. I\'m here to help with hints and explanations.' }
  ]);
  const [mobileShowList, setMobileShowList] = useState(false);
  const [showCodeReview, setShowCodeReview] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const messagesEndRef = useRef(null);

  // XP system
  const xpKey = `xp-${user?.id || 'guest'}`;
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem(xpKey) || '0'));

  // Notes per problem
  const notesKey = `notes-${user?.id || 'guest'}`;
  const [allNotes, setAllNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(notesKey) || '{}'); } catch { return {}; }
  });

  // Bookmarks
  const bookmarkKey = `bookmarks-${user?.id || 'guest'}`;
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(bookmarkKey) || '[]'); } catch { return []; }
  });

  const toggleBookmark = (problemId, e) => {
    e.stopPropagation();
    setBookmarks(prev => {
      const next = prev.includes(problemId) ? prev.filter(id => id !== problemId) : [...prev, problemId];
      localStorage.setItem(bookmarkKey, JSON.stringify(next));
      return next;
    });
  };

  const updateNotes = (text) => {
    const updated = { ...allNotes, [selectedProblem.id]: text };
    setAllNotes(updated);
    localStorage.setItem(notesKey, JSON.stringify(updated));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isTyping]);

  // Save solved to localStorage
  useEffect(() => {
    localStorage.setItem(`solved-${user?.id || 'guest'}`, JSON.stringify([...solved]));
  }, [solved, user]);

  // Save XP
  useEffect(() => {
    localStorage.setItem(xpKey, String(xp));
  }, [xp, xpKey]);

  // Filter problems
  const filteredProblems = PROBLEMS.filter(p => {
    if (activeTopic === 'Saved') return bookmarks.includes(p.id);
    if (activeTopic !== 'All' && p.topic !== activeTopic) return false;
    if (activeDifficulty !== 'All' && p.difficulty !== activeDifficulty) return false;
    return true;
  });

  // Progress stats
  const totalEasy = PROBLEMS.filter(p => p.difficulty === 'Easy').length;
  const totalMedium = PROBLEMS.filter(p => p.difficulty === 'Medium').length;
  const totalHard = PROBLEMS.filter(p => p.difficulty === 'Hard').length;
  const solvedEasy = PROBLEMS.filter(p => p.difficulty === 'Easy' && solved.has(p.id)).length;
  const solvedMedium = PROBLEMS.filter(p => p.difficulty === 'Medium' && solved.has(p.id)).length;
  const solvedHard = PROBLEMS.filter(p => p.difficulty === 'Hard' && solved.has(p.id)).length;
  const earnedBadges = BADGES.filter(b => solved.size >= b.threshold);

  const handleSelectProblem = (p) => {
    setSelectedProblem(p);
    setCode(p.starterCode[language] || STARTER_TEMPLATES[language]);
    setRunResults(null);
    setTestResults([]);
    setShowCodeReview(false);
    setTimerRunning(true);
    setAiMessages([{ sender: 'ai', text: `Let's tackle **${p.title}**! ${p.difficulty === 'Hard' ? 'This is a tough one — think carefully about the algorithm.' : 'You can do this! Start by thinking about edge cases.'}` }]);
    setMobileShowList(false);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(selectedProblem.starterCode[lang] || STARTER_TEMPLATES[lang]);
    setRunResults(null);
    setTestResults([]);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setRunResults(null);
    setTestResults([]);
    setShowCodeReview(false);
    try {
      const result = await runCode(code, language);
      setRunResults(result);
      const results = selectedProblem.examples.map(() => ({
        stdout: result.stdout,
        stderr: result.stderr,
      }));
      setTestResults(results);
      setActiveTab('0');
    } catch (err) {
      setRunResults({ stdout: '', stderr: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSolve = () => {
    const wasAlreadySolved = solved.has(selectedProblem.id);
    setSolved(prev => new Set([...prev, selectedProblem.id]));
    setTimerRunning(false);
    if (!wasAlreadySolved) {
      const xpGain = selectedProblem.difficulty === 'Easy' ? 20 : selectedProblem.difficulty === 'Medium' ? 40 : 80;
      setXp(prev => prev + xpGain);
      setAiMessages(prev => [...prev, { sender: 'ai', text: `🎉 Solved! +${xpGain} XP earned. Total XP: ${xp + xpGain}` }]);
      if (user?.id) {
        supabase.from('progress').insert({ user_id: user.id, xp_gained: xpGain }).then(() => {});
      }
    }
  };

  const handleAiSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user', text: chatInput };
    setChatInput('');
    setAiMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    try {
      const reply = await sendChatMessage({
        message: chatInput,
        context: `You are a DSA mentor helping a student solve "${selectedProblem.title}" (${selectedProblem.difficulty}) in ${LANGUAGES[language].label}. The problem: ${selectedProblem.description}. Use the Socratic method — ask questions instead of giving direct answers. Be concise (2-3 sentences).`
      });
      setIsTyping(false);
      setAiMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      setIsTyping(false);
      setAiMessages(prev => [...prev, { sender: 'ai', text: `Error: ${err.message}` }]);
    }
  };

  /* ── Editor Panel ── */
  const editorPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Editor Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface-container-high)', borderBottom: '1px solid var(--border-color)', flexShrink: 0, gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {['#ff5f56', '#ffbd2e', '#27c93f'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
          </div>
          <Select value={language} onChange={handleLanguageChange} size="small" style={{ width: 130, fontSize: 12 }} popupMatchSelectWidth={false}>
            {Object.entries(LANGUAGES).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
          </Select>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <PracticeTimer running={timerRunning} />
          <Button
            type="primary" size="small" icon={<Play size={13} />}
            loading={isRunning} onClick={handleRunCode}
            style={{ background: '#10b981', border: 'none', borderRadius: 8, fontWeight: 700, height: 30, fontSize: 12 }}
          >
            {isRunning ? 'Running…' : 'Run Code'}
          </Button>
          <Button
            type="text" size="small"
            icon={isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            onClick={() => setIsFullScreen(!isFullScreen)}
            style={{ color: 'var(--on-surface-muted)', height: 30, width: 30, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1, minHeight: 260 }}>
        <Editor
          height="100%"
          language={LANGUAGES[language].monacoId}
          value={code}
          onChange={v => setCode(v || '')}
          theme="vs-dark"
          options={{
            fontSize: 13, minimap: { enabled: false },
            scrollBeyondLastLine: false, padding: { top: 10, bottom: 10 },
            lineNumbers: 'on', renderLineHighlight: 'all',
            fontFamily: "'Fira Code', 'JetBrains Mono', 'Courier New', monospace",
            fontLigatures: true, roundedSelection: true, wordWrap: 'on',
          }}
        />
      </div>

      {/* AI Hint Button */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <Button
          className="gradient-btn" size="small"
          style={{ borderRadius: 9999, fontWeight: 700, height: 34, display: 'flex', alignItems: 'center', gap: 5 }}
          icon={<Lightbulb size={13} />}
          onClick={async () => {
            const isELI5 = localStorage.getItem('cognifyx_eli5') === 'true';
            setAiMessages(prev => [...prev, { sender: 'user', text: 'Give me a hint without spoiling the answer.' }]);
            setIsTyping(true);
            try {
              const response = await fetch('/api/ai/hint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  problemTitle: selectedProblem?.title, 
                  problemDescription: selectedProblem?.description, 
                  userCode: code,
                  isELI5
                })
              });
              const data = await response.json();
              setAiMessages(prev => [...prev, { sender: 'ai', text: data.error || data.hint || 'No hint available.' }]);
            } catch {
              // Fallback: use problem hints
              const hint = selectedProblem.hints?.[Math.floor(Math.random() * (selectedProblem.hints?.length || 1))] || 'Think about the data structure that would make this efficient.';
              setAiMessages(prev => [...prev, { sender: 'ai', text: `💡 ${hint}` }]);
            } finally {
              setIsTyping(false);
            }
          }}
        >
          AI Hint
        </Button>
      </div>

      {/* Test Cases Panel */}
      <div style={{ borderTop: '1px solid var(--border-color)', flexShrink: 0, maxHeight: 220, overflowY: 'auto' }}>
        <div style={{ padding: '8px 12px 4px', fontWeight: 600, fontSize: 12, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Test Cases</span>
          {runResults && (
            <span style={{ fontSize: 11, color: testResults.every((r, i) => r.stdout?.trim() === selectedProblem.examples[i]?.output.trim()) ? '#10b981' : '#f59e0b' }}>
              {testResults.filter((r, i) => r.stdout?.trim() === selectedProblem.examples[i]?.output.trim()).length}/{testResults.length} passed
            </span>
          )}
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: 2, padding: '0 8px' }}>
          {selectedProblem.examples.map((_, i) => (
            <button
              key={i} onClick={() => setActiveTab(String(i))}
              style={{ padding: '4px 12px', fontSize: 12, fontWeight: 500, border: 'none', background: activeTab === String(i) ? 'var(--surface-container-high)' : 'transparent', color: activeTab === String(i) ? 'var(--primary)' : 'var(--on-surface-muted)', cursor: 'pointer', borderRadius: '6px 6px 0 0', borderBottom: activeTab === String(i) ? '2px solid var(--primary)' : 'none', fontFamily: 'Inter, sans-serif' }}
            >
              Case {i + 1}
              {testResults[i] && (
                <span style={{ marginLeft: 4 }}>
                  {testResults[i].stdout?.trim() === selectedProblem.examples[i].output.trim() ? '✓' : '✗'}
                </span>
              )}
            </button>
          ))}
        </div>
        <div style={{ padding: '8px 12px 12px' }}>
          {selectedProblem.examples.map((ex, i) => (
            <div key={i} style={{ display: activeTab === String(i) ? 'block' : 'none' }}>
              <TestResult example={ex} index={i} result={testResults[i] || null} />
            </div>
          ))}
          {runResults?.stderr && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, color: '#ef4444', marginTop: 8 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Runtime Error:</div>
              {runResults.stderr}
            </div>
          )}
          {runResults && !runResults.stderr && (
            <div style={{ padding: '8px 0 0' }}>
              <Button
                size="small" onClick={() => setShowCodeReview(v => !v)}
                style={{ borderRadius: 9999, fontSize: 11, fontWeight: 700, border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7', background: 'rgba(168,85,247,0.08)', height: 28 }}
              >
                🤖 {showCodeReview ? 'Hide' : 'Get'} AI Code Review
              </Button>
            </div>
          )}
          <AICodeReview code={code} language={LANGUAGES[language].label} problemTitle={selectedProblem?.title} visible={showCodeReview} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Full Screen Overlay */}
      {isFullScreen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 14px', background: '#252526', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Select value={language} onChange={handleLanguageChange} size="small" style={{ width: 140 }} popupMatchSelectWidth={false}>
                {Object.entries(LANGUAGES).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
              </Select>
              <span style={{ color: '#aaa', fontSize: 12 }}>{selectedProblem.title}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="small" type="primary" icon={<Play size={12} />} loading={isRunning} onClick={handleRunCode} style={{ background: '#10b981', border: 'none' }}>Run</Button>
              <Button size="small" type="text" icon={<Minimize2 size={14} />} onClick={() => setIsFullScreen(false)} style={{ color: '#aaa' }}>Exit</Button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <Editor height="100%" language={LANGUAGES[language].monacoId} value={code} onChange={v => setCode(v || '')} theme="vs-dark" options={{ fontSize: 14, minimap: { enabled: true }, fontFamily: "'Fira Code', monospace", fontLigatures: true, wordWrap: 'on' }} />
          </div>
          {runResults && (
            <div style={{ background: '#1a1a2e', padding: '10px 16px', fontFamily: 'monospace', fontSize: 13, color: runResults.stderr ? '#ef4444' : '#4ade80', maxHeight: 160, overflow: 'auto' }}>
              <div style={{ color: '#888', marginBottom: 4, fontSize: 11 }}>▶ Output</div>
              {runResults.stderr || runResults.stdout || '(no output)'}
            </div>
          )}
        </div>
      )}

      {/* Mobile Filter Button */}
      <button
        className="mobile-only"
        onClick={() => setMobileShowList(!mobileShowList)}
        style={{ position: 'fixed', bottom: 80, left: 16, zIndex: 100, background: 'var(--primary)', color: '#003333', border: 'none', borderRadius: 9999, padding: '10px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        ☰ Problems
      </button>

      <div className="practice-room-layout">
        {/* ── LEFT: Problem List ── */}
        <div className={`practice-panel${mobileShowList ? ' mobile-show' : ''}`} style={{ borderRight: 'none' }}>
          <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--on-surface)', fontWeight: 700, fontSize: 15 }}>Problems</span>
            <span style={{ color: 'var(--on-surface-muted)', fontSize: 12 }}>{solved.size}/{PROBLEMS.length} solved</span>
          </div>

          {/* XP & Badges */}
          <div style={{ background: 'var(--surface-container-high)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: 'var(--on-surface)', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Flame size={14} color="#faad14" /> {xp} XP
              </span>
              <span style={{ color: 'var(--on-surface-muted)', fontSize: 11 }}>
                Level {Math.floor(xp / 100) + 1}
              </span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${(xp % 100)}%` }} />
            </div>
            {earnedBadges.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                {earnedBadges.map(b => (
                  <Tooltip key={b.label} title={b.label}>
                    <div className="badge-icon" style={{ background: 'var(--surface-container)', width: 28, height: 28, fontSize: 14 }}>
                      {b.emoji}
                    </div>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>

          {/* Progress bars */}
          <div style={{ background: 'var(--surface-container-high)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ color: 'var(--on-surface)', fontWeight: 600, fontSize: 12, marginBottom: 10 }}>Progress</div>
            {[
              { label: 'Easy', solved: solvedEasy, total: totalEasy, color: '#4ade80' },
              { label: 'Medium', solved: solvedMedium, total: totalMedium, color: '#faad14' },
              { label: 'Hard', solved: solvedHard, total: totalHard, color: '#ff6b6b' },
            ].map(d => (
              <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 50, color: 'var(--on-surface-variant)', fontSize: 11, fontWeight: 500 }}>{d.label}</span>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--surface-container-highest)' }}>
                  <motion.div style={{ height: '100%', borderRadius: 2, background: d.color }} initial={{ width: 0 }} animate={{ width: d.total > 0 ? `${(d.solved / d.total) * 100}%` : '0%' }} transition={{ duration: 0.8, delay: 0.2 }} />
                </div>
                <span style={{ width: 30, color: 'var(--on-surface-variant)', fontSize: 11, textAlign: 'right' }}>{d.solved}/{d.total}</span>
              </div>
            ))}
          </div>

          {/* Difficulty filter */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                className={`diff-filter-btn${activeDifficulty === d ? ` active-${d.toLowerCase()}` : ''}`}
                onClick={() => setActiveDifficulty(d)}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Topic filter */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8 }}>Topics</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {TOPICS.map(t => (
                <span key={t} className={`topic-chip${activeTopic === t ? ' active' : ''}`} onClick={() => setActiveTopic(t)}>{t}</span>
              ))}
            </div>
          </div>

          {/* Problem list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredProblems.length === 0 && (
              <div style={{ color: 'var(--on-surface-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No problems match filters</div>
            )}
            {filteredProblems.map(p => {
              const isSelected = selectedProblem?.id === p.id;
              const isSolved = solved.has(p.id);
              const isBookmarked = bookmarks.includes(p.id);
              return (
                <motion.div key={p.id} className={`problem-list-item${isSelected ? ' selected' : ''}`} onClick={() => handleSelectProblem(p)} whileHover={{ x: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                    <div style={{ marginTop: 2 }}>{isSolved ? <CheckCircle size={14} color="#4ade80" /> : <Circle size={14} color="var(--surface-container-highest)" />}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--on-surface)', fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{p.title}</div>
                      <div style={{ color: 'var(--on-surface-muted)', fontSize: 11, marginTop: 2 }}>
                        {p.topic}
                        {p.companies && <span style={{ marginLeft: 6, color: 'var(--on-surface-muted)', fontSize: 10 }}>• {p.companies.slice(0, 2).join(', ')}</span>}
                      </div>
                    </div>
                    <span style={{ background: DIFF_BG[p.difficulty], color: DIFF_COLORS[p.difficulty], borderRadius: 9999, padding: '2px 7px', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{p.difficulty}</span>
                    <div onClick={(e) => toggleBookmark(p.id, e)} style={{ cursor: 'pointer', flexShrink: 0, color: isBookmarked ? '#faad14' : 'var(--on-surface-muted)', padding: 2 }}>
                      {isBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── CENTER: Problem Description ── */}
        <div className="practice-panel-center">
          <AnimatePresence mode="wait">
            {selectedProblem && (
              <motion.div key={selectedProblem.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ background: DIFF_BG[selectedProblem.difficulty], color: DIFF_COLORS[selectedProblem.difficulty], borderRadius: 9999, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
                    {selectedProblem.difficulty}
                  </span>
                  {selectedProblem.companies?.map(c => (
                    <Tag key={c} style={{ fontSize: 10, borderRadius: 9999, background: 'var(--surface-container-high)', color: 'var(--on-surface-muted)', border: 'none', margin: 0 }}>{c}</Tag>
                  ))}
                </div>

                <h2 style={{ color: 'var(--on-surface)', fontSize: 22, fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{selectedProblem.title}</h2>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{selectedProblem.description}</p>

                {selectedProblem.examples.map((ex, i) => (
                  <div key={i} style={{ background: 'var(--surface-container-high)', borderRadius: 12, padding: '12px 14px', marginBottom: 10, fontFamily: 'monospace', fontSize: 12 }}>
                    <div style={{ color: '#4ade80', fontWeight: 700, marginBottom: 5 }}>Example {i + 1}:</div>
                    <div style={{ color: 'var(--on-surface-variant)' }}><strong style={{ color: 'var(--on-surface)' }}>Input:</strong> {ex.input}</div>
                    <div style={{ color: 'var(--on-surface-variant)', marginTop: 3 }}><strong style={{ color: 'var(--on-surface)' }}>Output:</strong> {ex.output}</div>
                    {ex.explanation && <div style={{ color: 'var(--on-surface-muted)', marginTop: 3, fontSize: 11 }}><strong>Explanation:</strong> {ex.explanation}</div>}
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <Button className="gradient-btn" size="large" style={{ flex: 1, borderRadius: 9999, height: 46, fontWeight: 700, fontSize: 14 }} onClick={handleSolve}>
                    {solved.has(selectedProblem.id) ? '✓ Solved!' : 'Mark Solved'}
                  </Button>
                  <Button size="large" style={{ borderRadius: 9999, height: 46, fontWeight: 600, fontSize: 14, background: 'var(--surface-container-high)', border: 'none', color: 'var(--on-surface)' }}
                    onClick={() => setShowNotes(!showNotes)}
                    icon={<StickyNote size={14} />}
                  >
                    Notes
                  </Button>
                </div>

                {/* Notes Section */}
                <AnimatePresence>
                  {showNotes && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 16, overflow: 'hidden' }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StickyNote size={13} /> Personal Notes
                      </div>
                      <textarea
                        className="problem-notes-area"
                        placeholder="Write your approach, observations, or key insights here..."
                        value={allNotes[selectedProblem.id] || ''}
                        onChange={(e) => updateNotes(e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Editor + AI Chat ── */}
        <div className="practice-panel-right">
          <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {editorPanel}
          </div>

          {/* AI Chat */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 200 }}>
            <div style={{ padding: '8px 14px', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', flexShrink: 0 }}>
              <span style={{ fontSize: 15 }}>🤖</span> AI Chat Mentor
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column' }}>
              {aiMessages.map((msg, i) => (
                <div key={i} className={msg.sender === 'user' ? 'chat-message chat-user' : 'chat-message chat-ai'} style={{ fontSize: 13 }}>
                  {msg.sender === 'ai' && <strong style={{ color: 'var(--primary)', fontSize: 11 }}>AI Tutor: </strong>}
                  {msg.text}
                </div>
              ))}
              {isTyping && <div className="chat-message chat-ai" style={{ width: 50 }}><Spin size="small" /></div>}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(59,73,74,0.15)', display: 'flex', gap: 7, flexShrink: 0 }}>
              <Input
                style={{ borderRadius: 9999, fontSize: 12, height: 34 }}
                placeholder="Ask for a hint..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onPressEnter={handleAiSend}
                disabled={isTyping}
              />
              <Button className="gradient-btn" shape="circle" size="small" icon={<Send size={13} />} onClick={handleAiSend} disabled={!chatInput.trim() || isTyping} style={{ height: 34, width: 34, flexShrink: 0 }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PracticeRoom;
