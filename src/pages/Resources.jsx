import React, { useState } from 'react';
import { Typography, Input, Tag, Button } from 'antd';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  BookOpen, Code, FileText, Cpu, FlaskConical, Calculator,
  Download, Search, Star, ExternalLink, Filter,
  BrainCircuit, Database, Network, Layers
} from 'lucide-react';

const { Title, Text } = Typography;

/* ── Resource Data ────────────────────────────────────────── */
const RESOURCES = [
  {
    id: 1, category: 'DSA',
    icon: <Code size={22} />, color: '#49eef8',
    title: 'Advanced Graph Algorithms',
    desc: 'DFS, BFS, Dijkstra, Bellman-Ford, Floyd-Warshall — with annotated code examples.',
    type: 'PDF Notes', size: '2.4 MB', downloads: '4.2k', stars: 4.9,
    tags: ['Graphs', 'BFS/DFS', 'Shortest Path'],
  },
  {
    id: 2, category: 'Physics',
    icon: <FlaskConical size={22} />, color: '#60a5fa',
    title: 'Physics Formula Cheat Sheet',
    desc: 'Complete reference for Mechanics, Thermodynamics, Waves, Electromagnetism and Optics.',
    type: 'PDF Cheat Sheet', size: '1.1 MB', downloads: '6.8k', stars: 4.8,
    tags: ['Mechanics', 'Electro', 'Optics'],
  },
  {
    id: 3, category: 'System Design',
    icon: <Network size={22} />, color: '#d5baff',
    title: 'System Design Case Studies',
    desc: 'Scalable architecture patterns for Twitter, Uber, YouTube, WhatsApp and more.',
    type: 'PDF Book', size: '5.7 MB', downloads: '9.1k', stars: 5.0,
    tags: ['Architecture', 'Scaling', 'Case Study'],
  },
  {
    id: 4, category: 'Math',
    icon: <Calculator size={22} />, color: '#faad14',
    title: 'Discrete Mathematics Essentials',
    desc: 'Logic, sets, relations, graph theory, combinatorics and probability for CS students.',
    type: 'PDF Notes', size: '3.2 MB', downloads: '3.5k', stars: 4.7,
    tags: ['Logic', 'Combinatorics', 'Graph Theory'],
  },
  {
    id: 5, category: 'DSA',
    icon: <Layers size={22} />, color: '#4ade80',
    title: 'Dynamic Programming Patterns',
    desc: '30+ DP problem patterns with memoization and tabulation templates. LeetCode ready.',
    type: 'PDF Notes', size: '1.8 MB', downloads: '7.3k', stars: 4.9,
    tags: ['DP', 'Memoization', 'LeetCode'],
  },
  {
    id: 6, category: 'Code Snippets',
    icon: <BrainCircuit size={22} />, color: '#fb7185',
    title: 'AI/ML Starter Snippets (Python)',
    desc: 'Numpy, Pandas, Scikit-learn, and PyTorch boilerplate for common ML workflows.',
    type: 'Code Pack (.zip)', size: '0.8 MB', downloads: '5.6k', stars: 4.8,
    tags: ['Python', 'ML', 'PyTorch'],
  },
  {
    id: 7, category: 'System Design',
    icon: <Database size={22} />, color: '#a78bfa',
    title: 'Database Design & SQL Mastery',
    desc: 'Schema design, normalization, complex JOINs, indexing, and query optimization.',
    type: 'PDF Book', size: '4.1 MB', downloads: '4.9k', stars: 4.6,
    tags: ['SQL', 'Schema', 'Optimization'],
  },
  {
    id: 8, category: 'Math',
    icon: <Cpu size={22} />, color: '#f97316',
    title: 'Linear Algebra for ML Engineers',
    desc: 'Vectors, matrices, eigenvalues, SVD, and PCA explained with code and visualization.',
    type: 'PDF Notes', size: '2.9 MB', downloads: '3.8k', stars: 4.7,
    tags: ['Vectors', 'PCA', 'SVD'],
  },
  {
    id: 9, category: 'Code Snippets',
    icon: <FileText size={22} />, color: '#38bdf8',
    title: 'React Interview Patterns',
    desc: 'Hooks, context, memoization, performance optimizations and common interview questions.',
    type: 'Code Pack (.zip)', size: '0.5 MB', downloads: '8.2k', stars: 5.0,
    tags: ['React', 'Hooks', 'Interview'],
  },
];

const CATEGORIES = ['All', 'DSA', 'Math', 'Physics', 'System Design', 'Code Snippets'];

/* ── Resource Card Component ─────────────────────────────── */
const ResourceCard = ({ r, i }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-30px' }}
    transition={{ duration: 0.4, delay: i * 0.06 }}
    whileHover={{ y: -6, boxShadow: `0 20px 60px ${r.color}20, 0 0 0 1px ${r.color}30` }}
    style={{
      background: 'linear-gradient(145deg, var(--surface-container), var(--surface-container-low))',
      border: `1px solid ${r.color}18`,
      borderRadius: 20,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
      transition: 'box-shadow 0.3s ease, transform 0.3s ease',
    }}
  >
    {/* Top accent line */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${r.color}60, transparent)` }} />

    {/* Corner glow */}
    <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: `radial-gradient(circle, ${r.color}15, transparent 70%)`, pointerEvents: 'none' }} />

    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: `linear-gradient(135deg, ${r.color}18, ${r.color}08)`,
          border: `1px solid ${r.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: r.color, boxShadow: `0 0 16px ${r.color}20`,
        }}>
          {r.icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--on-surface)', lineHeight: 1.3 }}>{r.title}</div>
          <div style={{ fontSize: 11, color: r.color, fontWeight: 600, marginTop: 2 }}>{r.type}</div>
        </div>
      </div>
      {/* Star rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        <Star size={12} fill="#faad14" color="#faad14" />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#faad14' }}>{r.stars.toFixed(1)}</span>
      </div>
    </div>

    {/* Description */}
    <p style={{ margin: 0, fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{r.desc}</p>

    {/* Tags */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {r.tags.map(tag => (
        <span key={tag} style={{
          padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
          background: `${r.color}12`, color: r.color, border: `1px solid ${r.color}25`,
        }}>
          {tag}
        </span>
      ))}
    </div>

    {/* Footer */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid rgba(59,73,74,0.15)' }}>
      <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', display: 'flex', gap: 12 }}>
        <span>📦 {r.size}</span>
        <span>⬇️ {r.downloads}</span>
      </div>
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${r.color}40` }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (r.title === 'Advanced Graph Algorithms') {
            toast.success("Downloading...");
            window.open("https://web4.ensiie.fr/~stefania.dumbrava/GraphAlgorithms.pdf", "_blank");
          } else if (r.title === 'Physics Formula Cheat Sheet') {
            toast.success("Downloading...");
            window.open("https://chadsreviews.com/wp-content/uploads/2020/07/Chads-Ultimate-Physics-Equation-Cheat-Sheet.pdf", "_blank");
          } else if (r.title === 'System Design Case Studies') {
            toast.success("Downloading...");
            window.open("https://bytes.usc.edu/~saty/courses/docs/data/SystemDesignInterview.pdf", "_blank");
          } else if (r.title === 'Discrete Mathematics Essentials') {
            toast.success("Downloading...");
            window.open("https://discrete.openmathbooks.org/pdfs/dmoi-tablet.pdf", "_blank");
          } else if (r.title === 'Dynamic Programming Patterns') {
            toast.success("Downloading...");
            window.open("https://web.mit.edu/15.053/www/AMP-Chapter-11.pdf", "_blank");
          } else if (r.title === 'React Interview Patterns') {
            toast.success("Downloading...");
            window.open("https://www.newline.co/fullstack-react/assets/media/sGEMe/MNzue/30-days-of-react-ebook-fullstackio.pdf", "_blank");
          } else {
             alert(`Download: ${r.title}\n(Connect to Supabase Storage or a CDN URL to enable real downloads)`);
          }
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 9999,
          background: `linear-gradient(135deg, ${r.color}20, ${r.color}10)`,
          border: `1px solid ${r.color}40`, color: r.color,
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <Download size={13} />
        Download
      </motion.button>
    </div>
  </motion.div>
);

/* ── Main Resources Page ─────────────────────────────────── */
const Resources = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = RESOURCES.filter(r => {
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    const matchesSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 40 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(73,238,248,0.15), rgba(73,238,248,0.05))',
            border: '1px solid rgba(73,238,248,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(73,238,248,0.15)',
          }}>
            <BookOpen size={24} color="var(--primary)" />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, color: 'var(--on-surface)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Learning Resources
            </Title>
            <Text style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>
              PDFs, cheat sheets, code snippets and reference books — curated for you.
            </Text>
          </div>
        </div>
      </motion.div>

      {/* ── Search + Filter Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 36 }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-muted)', zIndex: 1, pointerEvents: 'none' }} />
          <input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', height: 42, paddingLeft: 36, paddingRight: 16,
              background: 'var(--surface-container)',
              border: '1px solid rgba(59,73,74,0.4)',
              borderRadius: 9999,
              color: 'var(--on-surface)', fontSize: 14,
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(73,238,248,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(59,73,74,0.4)'}
          />
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '7px 16px', borderRadius: 9999,
                background: activeCategory === cat ? 'rgba(73,238,248,0.15)' : 'var(--surface-container)',
                border: `1px solid ${activeCategory === cat ? 'rgba(73,238,248,0.4)' : 'rgba(59,73,74,0.35)'}`,
                color: activeCategory === cat ? 'var(--primary)' : 'var(--on-surface-variant)',
                fontSize: 13, fontWeight: activeCategory === cat ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Stats strip ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: 28, color: 'var(--on-surface-muted)', fontSize: 13 }}
      >
        Showing <strong style={{ color: 'var(--primary)' }}>{filtered.length}</strong> resource{filtered.length !== 1 ? 's' : ''}
        {activeCategory !== 'All' && <> in <strong style={{ color: 'var(--on-surface)' }}>{activeCategory}</strong></>}
        {searchQuery && <> matching "<strong style={{ color: 'var(--on-surface)' }}>{searchQuery}</strong>"</>}
      </motion.div>

      {/* ── Resource Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg m-0">No resources found for "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r, i) => (
            <ResourceCard key={r.id} r={r} i={i} />
          ))}
        </div>
      )}

      {/* ── Upload CTA banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{
          marginTop: 60,
          padding: '32px 40px',
          background: 'linear-gradient(135deg, rgba(73,238,248,0.08), rgba(109,40,217,0.08))',
          border: '1px solid rgba(73,238,248,0.2)',
          borderRadius: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 20,
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--on-surface)', marginBottom: 6 }}>
            Have a great resource to share?
          </div>
          <Text style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>
            Upload PDFs, notes, or code snippets and help the community learn faster.
          </Text>
        </div>
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(73,238,248,0.35)' }}
          whileTap={{ scale: 0.96 }}
          onClick={() => alert('Upload feature coming soon!')}
          style={{
            padding: '12px 28px', borderRadius: 9999,
            background: 'linear-gradient(135deg, #2563eb, #49eef8)',
            border: 'none', color: '#fff', fontWeight: 700,
            fontSize: 14, cursor: 'pointer',
            boxShadow: '0 0 24px rgba(73,238,248,0.3)',
          }}
        >
          + Upload Resource
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Resources;
