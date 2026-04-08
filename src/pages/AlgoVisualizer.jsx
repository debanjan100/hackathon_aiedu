import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Slider, Input, Button, message } from 'antd';
import { Play, Pause, ChevronsLeft, ChevronsRight, SkipBack, SkipForward } from 'lucide-react';
import { sendChatMessage } from '../lib/chatApi';

const SPEEDS = [
  { key: 'slow', label: 'Slow', ms: 800 },
  { key: 'medium', label: 'Medium', ms: 450 },
  { key: 'fast', label: 'Fast', ms: 200 },
];

function parseArray(input) {
  if (!input || typeof input !== 'string') return [];
  return input
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(Number)
    .filter(n => !Number.isNaN(n))
    .slice(0, 30);
}

function generateBubbleSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({ type: 'array', array: [...a], comparing: [j, j + 1], swapped: false, sorted: Array.from({ length: i }, (_, k) => a.length - 1 - k) });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ type: 'array', array: [...a], comparing: [j, j + 1], swapped: true, sorted: Array.from({ length: i }, (_, k) => a.length - 1 - k) });
      }
    }
  }
  steps.push({ type: 'array', array: [...a], comparing: [], swapped: false, sorted: a.map((_, i) => i) });
  return steps;
}

function generateMergeSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  function merge(l, m, r) {
    const left = a.slice(l, m + 1);
    const right = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      steps.push({ type: 'array', array: [...a], comparing: [k], swapped: false, sorted: [] });
      if (left[i] <= right[j]) {
        a[k++] = left[i++];
      } else {
        a[k++] = right[j++];
      }
      steps.push({ type: 'array', array: [...a], comparing: [k - 1], swapped: true, sorted: [] });
    }
    while (i < left.length) {
      a[k] = left[i];
      steps.push({ type: 'array', array: [...a], comparing: [k], swapped: true, sorted: [] });
      i++; k++;
    }
    while (j < right.length) {
      a[k] = right[j];
      steps.push({ type: 'array', array: [...a], comparing: [k], swapped: true, sorted: [] });
      j++; k++;
    }
  }
  function sort(l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
  }
  sort(0, a.length - 1);
  steps.push({ type: 'array', array: [...a], comparing: [], swapped: false, sorted: a.map((_, i) => i) });
  return steps;
}

function generateBinarySearchSteps(arr) {
  const steps = [];
  const a = [...arr].sort((x, y) => x - y);
  const target = a.length ? a[a.length - 1] : null;
  let low = 0, high = a.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({ type: 'array', array: [...a], comparing: [mid], range: [low, high], target, found: false });
    if (a[mid] === target) {
      steps.push({ type: 'array', array: [...a], comparing: [mid], range: [low, high], target, found: true, sorted: [mid] });
      break;
    } else if (a[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return steps;
}

function generateBfsSteps() {
  const nodes = Array.from({ length: 6 }, (_, i) => i);
  const edges = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [3, 5], [4, 5]
  ];
  const adj = new Map();
  nodes.forEach(n => adj.set(n, []));
  edges.forEach(([u, v]) => { adj.get(u).push(v); adj.get(v).push(u); });
  const steps = [];
  const visited = new Set();
  const q = [0];
  visited.add(0);
  steps.push({ type: 'graph', nodes, edges, current: 0, queue: [...q], visited: Array.from(visited) });
  while (q.length) {
    const u = q.shift();
    for (const v of adj.get(u)) {
      if (!visited.has(v)) {
        visited.add(v);
        q.push(v);
        steps.push({ type: 'graph', nodes, edges, current: v, queue: [...q], visited: Array.from(visited) });
      }
    }
  }
  return steps;
}

function generateDijkstraSteps() {
  const nodes = [0, 1, 2, 3, 4];
  const edges = [
    [0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 7], [2, 4, 3], [3, 4, 1]
  ];
  const adj = new Map();
  nodes.forEach(n => adj.set(n, []));
  edges.forEach(([u, v, w]) => { adj.get(u).push([v, w]); adj.get(v).push([u, w]); });
  const dist = new Map(nodes.map(n => [n, Infinity]));
  const prev = new Map(nodes.map(n => [n, null]));
  const visited = new Set();
  dist.set(0, 0);
  const steps = [{ type: 'graph', nodes, edges, weighted: true, current: 0, visited: [], dist: Object.fromEntries(dist), prev: Object.fromEntries(prev) }];
  while (visited.size < nodes.length) {
    let u = null, best = Infinity;
    for (const n of nodes) {
      if (!visited.has(n) && dist.get(n) < best) { best = dist.get(n); u = n; }
    }
    if (u === null) break;
    visited.add(u);
    steps.push({ type: 'graph', nodes, edges, weighted: true, current: u, visited: Array.from(visited), dist: Object.fromEntries(dist), prev: Object.fromEntries(prev) });
    for (const [v, w] of adj.get(u)) {
      if (visited.has(v)) continue;
      const alt = dist.get(u) + w;
      steps.push({ type: 'graph', nodes, edges, weighted: true, current: u, relaxing: [u, v], weight: w, candidate: alt, visited: Array.from(visited), dist: Object.fromEntries(dist), prev: Object.fromEntries(prev) });
      if (alt < dist.get(v)) {
        dist.set(v, alt);
        prev.set(v, u);
        steps.push({ type: 'graph', nodes, edges, weighted: true, current: v, updated: true, relaxing: [u, v], dist: Object.fromEntries(dist), prev: Object.fromEntries(prev), visited: Array.from(visited) });
      }
    }
  }
  const path = [];
  let t = nodes[nodes.length - 1];
  while (t !== null) { path.unshift(t); t = prev.get(t); if (t === 0) { path.unshift(0); break; } }
  steps.push({ type: 'graph', nodes, edges, weighted: true, current: null, visited: Array.from(visited), dist: Object.fromEntries(dist), prev: Object.fromEntries(prev), shortestPath: path });
  return steps;
}

function generateStackEvalSteps(tokens) {
  const steps = [];
  const stack = [];
  const ops = new Set(['+', '-', '*', '/']);
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (!ops.has(tok)) {
      const val = Number(tok);
      if (!Number.isNaN(val)) {
        stack.push(val);
        steps.push({ type: 'stack', action: 'push', token: tok, stack: [...stack] });
      }
    } else {
      const b = stack.pop();
      const a = stack.pop();
      let r = 0;
      if (tok === '+') r = a + b;
      else if (tok === '-') r = a - b;
      else if (tok === '*') r = a * b;
      else if (tok === '/') r = Math.trunc(a / b);
      steps.push({ type: 'stack', action: 'apply', token: tok, a, b, result: r, stack: [...stack] });
      stack.push(r);
      steps.push({ type: 'stack', action: 'push', token: String(r), stack: [...stack] });
    }
  }
  return steps;
}

const ALGORITHMS = [
  { key: 'bubble', label: 'Bubble Sort', generator: generateBubbleSortSteps, kind: 'array' },
  { key: 'binary', label: 'Binary Search', generator: generateBinarySearchSteps, kind: 'array' },
  { key: 'merge', label: 'Merge Sort', generator: generateMergeSortSteps, kind: 'array' },
  { key: 'bfs', label: 'BFS Graph', generator: generateBfsSteps, kind: 'graph' },
  { key: 'dijkstra', label: "Dijkstra's", generator: generateDijkstraSteps, kind: 'graph' },
  { key: 'stack', label: 'Stack Eval', generator: generateStackEvalSteps, kind: 'stack' },
];

export default function AlgoVisualizer() {
  const [algo, setAlgo] = useState(ALGORITHMS[0].key);
  const [input, setInput] = useState('64, 34, 25, 12, 22, 11, 90');
  const [steps, setSteps] = useState([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState('medium');
  const [narration, setNarration] = useState('');
  const [prevNarration, setPrevNarration] = useState('');
  const [askText, setAskText] = useState('');
  const narrationCache = useRef(new Map());
  const timerRef = useRef(null);
  const typingRef = useRef(null);

  const currentAlgo = useMemo(() => ALGORITHMS.find(a => a.key === algo), [algo]);
  const delay = useMemo(() => SPEEDS.find(s => s.key === speed)?.ms || 450, [speed]);
  const currentStep = steps[idx] || null;

  useEffect(() => {
    if (!playing) return;
    if (idx >= steps.length - 1) { setPlaying(false); return; }
    timerRef.current = setTimeout(() => setIdx(i => Math.min(i + 1, steps.length - 1)), delay);
    return () => clearTimeout(timerRef.current);
  }, [playing, idx, steps.length, delay]);

  useEffect(() => {
    if (!currentStep) return;
    const key = `${algo}|${idx}|${JSON.stringify(currentStep).slice(0, 200)}`;
    const cached = narrationCache.current.get(key);
    if (cached) {
      setPrevNarration(narration);
      typeOut(cached);
      return;
    }
    fetch('/api/narrate-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        algorithm: currentAlgo.label,
        stepIndex: idx,
        totalSteps: steps.length,
        stepData: currentStep,
        array: currentStep.array || null,
      }),
    })
      .then(async r => {
        if (!r.ok) throw new Error('Narration API error');
        const t = await r.text();
        const j = JSON.parse(t);
        const text = j.narration || '';
        narrationCache.current.set(key, text);
        setPrevNarration(narration);
        typeOut(text);
      })
      .catch(() => {
        const fallback = 'Step updated. Focus on the highlighted elements and the operation in progress.';
        narrationCache.current.set(key, fallback);
        setPrevNarration(narration);
        typeOut(fallback);
      });
  }, [algo, idx, steps.length]);

  useEffect(() => () => { if (typingRef.current) clearInterval(typingRef.current); }, []);

  function typeOut(text) {
    if (typingRef.current) clearInterval(typingRef.current);
    setNarration('');
    let i = 0;
    typingRef.current = setInterval(() => {
      i += 1;
      setNarration(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(typingRef.current);
      }
    }, 18);
  }

  function onGenerate() {
    try {
      let newSteps = [];
      if (currentAlgo.kind === 'array') {
        const arr = parseArray(input);
        if (!arr.length) {
          message.warning('Please enter a valid comma-separated numeric array.');
          return;
        }
        newSteps = currentAlgo.generator(arr);
      } else if (currentAlgo.key === 'stack') {
        const tokens = input.split(',').map(s => s.trim()).filter(Boolean);
        if (!tokens.length) {
          message.warning('Provide a postfix expression as comma-separated tokens, e.g. "2, 3, 4, *, +".');
          return;
        }
        newSteps = currentAlgo.generator(tokens);
      } else {
        newSteps = currentAlgo.generator();
      }
      setSteps(newSteps);
      setIdx(0);
      setPlaying(false);
      setPrevNarration('');
      setNarration('');
    } catch {
      message.error('Failed to generate steps.');
    }
  }

  function stepTo(i) {
    if (!steps.length) return;
    setIdx(Math.max(0, Math.min(i, steps.length - 1)));
  }

  function renderBars(step) {
    const arr = step.array || [];
    const max = Math.max(...arr, 1);
    const isSorted = new Set(step.sorted || []);
    const comparing = new Set(step.comparing || []);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 260, padding: 16, borderRadius: 14, background: 'rgba(2,6,23,0.6)', border: '1px solid rgba(99,102,241,0.25)' }}>
        {arr.map((val, i) => {
          const h = Math.max(8, Math.round((val / max) * 220));
          const isCmp = comparing.has(i);
          const isDone = isSorted.has(i);
          const bg = isDone ? '#4ade80' : isCmp ? '#6366f1' : '#0ea5e9';
          const glow = isCmp ? '0 0 20px rgba(99,102,241,0.8)' : '0 0 10px rgba(14,165,233,0.45)';
          const pulse = step.swapped && isCmp ? 'pulse 0.6s ease-out' : 'none';
          return (
            <div key={i} style={{ width: 20, height: h, background: bg, borderRadius: 6, boxShadow: glow, transition: 'height 180ms ease, background 180ms ease', animation: pulse, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, color: '#cbd5e1', opacity: 0.8, marginBottom: 6 }}>{val}</span>
            </div>
          );
        })}
      </div>
    );
  }

  function renderGraph(step) {
    const nodes = step.nodes || [];
    const edges = step.edges || [];
    const visited = new Set(step.visited || []);
    const current = step.current;
    const shortest = new Set((step.shortestPath || []).map((_, i, arr) => (i < arr.length - 1 ? `${arr[i]}-${arr[i + 1]}` : null)).filter(Boolean));
    const cx = 360, cy = 150, R = 110;
    const pos = nodes.reduce((m, n, i) => {
      const angle = (2 * Math.PI * i) % (2 * Math.PI);
      const x = cx + R * Math.cos(angle);
      const y = cy + R * Math.sin(angle);
      m[n] = { x, y };
      return m;
    }, {});
    return (
      <svg width="720" height="320" style={{ background: 'rgba(2,6,23,0.6)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 14 }}>
        {edges.map((e, i) => {
          const [u, v, w] = e;
          const key = `${u}-${v}`;
          const inShortest = shortest.has(key) || shortest.has(`${v}-${u}`);
          return (
            <g key={i}>
              <line x1={pos[u].x} y1={pos[u].y} x2={pos[v].x} y2={pos[v].y} stroke={inShortest ? '#10b981' : '#64748b'} strokeWidth={inShortest ? 4 : 2} />
              {typeof w === 'number' && (
                <text x={(pos[u].x + pos[v].x) / 2} y={(pos[u].y + pos[v].y) / 2} fill="#e2e8f0" fontSize="12" textAnchor="middle" dy="-4">{w}</text>
              )}
            </g>
          );
        })}
        {nodes.map(n => {
          const x = pos[n].x, y = pos[n].y;
          const isCur = n === current;
          const isVis = visited.has(n);
          const fill = isCur ? '#ffffff' : isVis ? '#6366f1' : '#0ea5e9';
          const glow = isCur ? '0 0 16px rgba(255,255,255,0.9)' : isVis ? '0 0 14px rgba(99,102,241,0.8)' : '0 0 10px rgba(14,165,233,0.45)';
          return (
            <g key={n}>
              <circle cx={x} cy={y} r="18" fill={fill} style={{ filter: `drop-shadow(${glow})` }} />
              <text x={x} y={y + 4} fontSize="12" textAnchor="middle" fill={isCur ? '#0f172a' : '#e2e8f0'} fontWeight="700">{n}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  function renderStack(step) {
    const items = step.stack || [];
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 260, padding: 16, borderRadius: 14, background: 'rgba(2,6,23,0.6)', border: '1px solid rgba(99,102,241,0.25)' }}>
        {items.map((val, i) => (
          <div key={i} style={{ minWidth: 46, padding: '8px 10px', borderRadius: 10, background: '#22d3ee', color: '#0c4a6e', fontWeight: 700, boxShadow: '0 0 12px rgba(34,211,238,0.6)' }}>
            {val}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: 20, color: '#e2e8f0', minHeight: '100vh', background: 'radial-gradient(1200px 600px at 50% -50%, rgba(99,102,241,0.15), transparent)' }}>
      <style>
        {`@keyframes pulse{0%{filter:brightness(1)}50%{filter:brightness(1.8)}100%{filter:brightness(1)}}`}
      </style>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {ALGORITHMS.map(a => {
          const active = a.key === algo;
          return (
            <button key={a.key} onClick={() => setAlgo(a.key)} style={{ padding: '8px 14px', borderRadius: 9999, border: '1px solid rgba(99,102,241,0.35)', background: active ? 'rgba(99,102,241,0.2)' : 'transparent', color: active ? '#7dd3fc' : '#cbd5e1', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {a.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 360, flex: '1 1 420px' }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Enter array (comma-separated)</div>
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="64, 34, 25, 12, 22, 11, 90" />
        </div>
        <div style={{ width: 220 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Speed</div>
          <Slider min={0} max={2} value={SPEEDS.findIndex(s => s.key === speed)} onChange={i => setSpeed(SPEEDS[i].key)} tooltip={{ formatter: () => SPEEDS.find(s => s.key === speed)?.label }} />
        </div>
        <Button onClick={onGenerate} type="primary">Generate Steps</Button>
      </div>

      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 960, display: 'flex', justifyContent: 'center' }}>
          {currentStep ? (
            currentStep.type === 'graph'
              ? renderGraph(currentStep)
              : currentStep.type === 'stack'
              ? renderStack(currentStep)
              : renderBars(currentStep)
          ) : (
            <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14, background: 'rgba(2,6,23,0.6)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <span style={{ opacity: 0.8 }}>No steps yet — generate to begin.</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
        <Button icon={<ChevronsLeft size={16} />} onClick={() => stepTo(0)} disabled={!steps.length} />
        <Button icon={<SkipBack size={16} />} onClick={() => stepTo(idx - 1)} disabled={!steps.length || idx === 0} />
        <Button icon={playing ? <Pause size={16} /> : <Play size={16} />} onClick={() => setPlaying(p => !p)} disabled={!steps.length} />
        <Button icon={<SkipForward size={16} />} onClick={() => stepTo(idx + 1)} disabled={!steps.length || idx >= steps.length - 1} />
        <Button icon={<ChevronsRight size={16} />} onClick={() => stepTo(steps.length - 1)} disabled={!steps.length} />
        <div style={{ marginLeft: 12, fontSize: 13 }}>{steps.length ? `Step ${idx + 1} of ${steps.length}` : 'Step 0 of 0'}</div>
        <div style={{ flex: 1, maxWidth: 420, height: 6, background: 'rgba(30,58,138,0.4)', borderRadius: 9999, overflow: 'hidden', marginLeft: 12 }}>
          <div style={{ width: steps.length ? `${((idx + 1) / steps.length) * 100}%` : '0%', height: '100%', background: 'linear-gradient(90deg, #22d3ee, #6366f1)' }} />
        </div>
      </div>

      <div style={{ marginTop: 18, borderRadius: 14, background: '#0b1220', border: '1px solid rgba(99,102,241,0.25)', padding: 16 }}>
        {prevNarration && (
          <div style={{ color: '#94a3b8', opacity: 0.4, marginBottom: 10 }}>{prevNarration}</div>
        )}
        <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 14, lineHeight: 1.5, color: '#e2e8f0', minHeight: 42 }}>
          {narration || 'Narration will appear here as you step through.'}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Input value={askText} onChange={e => setAskText(e.target.value)} placeholder="Ask AI about this step" onPressEnter={async () => {
            if (!askText.trim()) return;
            const context = `We are visualizing ${currentAlgo?.label}. Current step index ${idx + 1}/${steps.length}. Step data: ${JSON.stringify(currentStep).slice(0, 400)}.`;
            try {
              const reply = await sendChatMessage({ message: askText, context });
              message.success('AI replied — check drawer chat for full conversation.');
            } catch (err) {
              message.error(err.message || 'Failed to ask AI.');
            } finally {
              setAskText('');
            }
          }} />
          <Button onClick={async () => {
            if (!askText.trim()) return;
            const context = `We are visualizing ${currentAlgo?.label}. Current step index ${idx + 1}/${steps.length}. Step data: ${JSON.stringify(currentStep).slice(0, 400)}.`;
            try {
              const reply = await sendChatMessage({ message: askText, context });
              message.success('AI replied — check drawer chat for full conversation.');
            } catch (err) {
              message.error(err.message || 'Failed to ask AI.');
            } finally {
              setAskText('');
            }
          }}>Ask</Button>
        </div>
      </div>
    </div>
  );
}

