import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PlayCircle, BookOpen, X, Search, Filter, Clock, ExternalLink } from 'lucide-react';

const VIDEOS = [
  {
    id: 'python', title: 'Python Full Course', topic: 'Python Programming', category: 'Programming',
    description: 'Learn Python from scratch — syntax, data structures, OOP, and more. Perfect for beginners.',
    videoId: '8DvywoWv6fI', duration: '4h 27m', color: '#3b82f6', icon: '🐍', level: 'Beginner',
  },
  {
    id: 'sql', title: 'SQL for Beginners', topic: 'SQL & Databases', category: 'Databases',
    description: 'Master SQL queries, joins, indexes, and database design with hands-on examples.',
    videoId: 'HXV3zeQKqGY', duration: '3h 10m', color: '#f59e0b', icon: '🗄️', level: 'Beginner',
  },
  {
    id: 'c', title: 'C Programming Full Course', topic: 'C Programming', category: 'Programming',
    description: 'A complete guide to C — memory management, pointers, structs, and systems programming.',
    videoId: 'KJgsSFOSQv0', duration: '3h 46m', color: '#10b981', icon: '⚙️', level: 'Intermediate',
  },
  {
    id: 'math', title: 'Essence of Calculus', topic: 'Calculus / Math', category: 'Math',
    description: 'An intuitive visual introduction to calculus — derivatives, integrals, and the fundamental theorem.',
    videoId: 'WUvTyaaNkzM', duration: '1h 0m', color: '#a855f7', icon: '∫', level: 'Intermediate',
  },
  /* ── Newly added videos (user request) ── */
  {
    id: 'django', title: 'Django Full Course', topic: 'Django / Web Dev', category: 'Web Dev',
    description: 'Build web applications with Django — routing, views, templates, models, and deployment. Complete course.',
    videoId: 'F5mRW0jo-U4', duration: '5h 45m', color: '#0d9488', icon: '🌐', level: 'Intermediate',
  },
  {
    id: 'networking', title: 'Computer Networking', topic: 'Computer Networks', category: 'CS Core',
    description: 'Comprehensive networking course — OSI model, TCP/IP, DNS, HTTP, firewalls, and real-world protocols.',
    videoId: 'qiQR5rTSshw', duration: '6h 32m', color: '#ef4444', icon: '🌍', level: 'Beginner',
  },
  {
    id: 'algebra', title: 'College Algebra – Full Course', topic: 'Algebra / Math', category: 'Math',
    description: 'Master algebra from basics to advanced — equations, functions, polynomials, and exam prep.',
    videoId: 'LwCRRUa8yTU', duration: '4h 12m', color: '#8b5cf6', icon: '📐', level: 'Beginner',
  },
  {
    id: 'react', title: 'React JS Full Course', topic: 'React JS', category: 'Web Dev',
    description: 'Build modern single-page apps with React — hooks, state, routing, context, and best practices.',
    videoId: 'bMknfKXIFA8', duration: '12h 0m', color: '#61dafb', icon: '⚛️', level: 'Intermediate',
  },
  {
    id: 'statistics', title: 'Statistics Full Course', topic: 'Statistics / Math', category: 'Math',
    description: 'Learn statistics from scratch — probability, distributions, hypothesis testing, and data analysis.',
    videoId: 'xxpc-HPKN28', duration: '8h 15m', color: '#f97316', icon: '📊', level: 'Beginner',
  },
  {
    id: 'genai', title: 'Generative AI Full Course', topic: 'Generative AI', category: 'AI',
    description: 'Master Generative AI — transformers, LLMs, prompt engineering, fine-tuning, and building AI apps.',
    videoId: 'mEsleV16qdo', duration: '5h 30m', color: '#ec4899', icon: '🤖', level: 'Advanced',
  },
];

const CATEGORIES = ['All', 'Programming', 'Web Dev', 'Math', 'AI', 'CS Core', 'Databases'];

const levelColor = (l) => l === 'Beginner' ? '#10b981' : l === 'Intermediate' ? '#f59e0b' : '#ef4444';

/* ── Video Card with Thumbnail ── */
const VideoCard = ({ video, onWatch, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.35 }}
    whileHover={{ y: -6, boxShadow: `0 20px 50px ${video.color}22` }}
    style={{
      background: 'var(--surface-container-lowest, #111827)',
      border: `1px solid ${video.color}22`,
      borderRadius: '1.5rem',
      overflow: 'hidden',
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.3s ease',
    }}
    onClick={() => onWatch(video)}
  >
    {/* Thumbnail with real YouTube thumbnail */}
    <div style={{
      height: 180,
      background: `url(https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg) center/cover`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      {/* Big icon watermark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, opacity: 0.15, pointerEvents: 'none' }}>{video.icon}</div>
      {/* Play button overlay */}
      <motion.div
        whileHover={{ scale: 1.2 }}
        style={{
          width: 60, height: 60, borderRadius: '50%', zIndex: 2,
          background: `${video.color}cc`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 32px ${video.color}66`, transition: 'all 0.3s ease',
        }}
      >
        <PlayCircle size={28} color="#fff" fill="#fff" />
      </motion.div>
      {/* Duration badge */}
      <div style={{ position: 'absolute', bottom: 10, right: 12, background: 'rgba(0,0,0,0.8)', borderRadius: 6, padding: '2px 9px', fontSize: 11, fontWeight: 700, color: '#fff', zIndex: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Clock size={10} /> {video.duration}
      </div>
    </div>

    {/* Card body */}
    <div style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ background: `${video.color}18`, color: video.color, borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{video.category}</span>
        <span style={{ background: `${levelColor(video.level)}14`, color: levelColor(video.level), borderRadius: 9999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{video.level}</span>
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: 'var(--on-surface)', lineHeight: 1.3 }}>{video.title}</h3>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--on-surface-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.description}</p>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, color: video.color, fontWeight: 700, fontSize: 13 }}>
        <BookOpen size={14} /> Watch Now →
      </div>
    </div>
  </motion.div>
);

/* ── Video Player (Modal-style popup) ── */
const VideoPlayer = ({ video, onBack }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.97 }}
    transition={{ duration: 0.3 }}
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
    onClick={(e) => { if (e.target === e.currentTarget) onBack(); }}
  >
    <motion.div
      initial={{ y: 30 }} animate={{ y: 0 }} exit={{ y: 20 }}
      style={{ width: '100%', maxWidth: 960, position: 'relative' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Close + header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontSize: 28 }}>{video.icon}</span>
          <div>
            <h2 style={{ color: '#fff', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{video.title}</h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ background: `${video.color}18`, color: video.color, borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{video.topic}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {video.duration}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, color: '#e2e2e2', fontSize: 12, fontWeight: 600,
              textDecoration: 'none', transition: 'all 0.2s',
            }}
          >
            <ExternalLink size={13} /> YouTube
          </motion.a>
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.08, background: 'rgba(255,255,255,0.12)' }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </motion.button>
        </div>
      </div>

      {/* 16:9 Responsive embed */}
      <div style={{
        position: 'relative', width: '100%', paddingTop: '56.25%',
        borderRadius: '1.25rem', overflow: 'hidden', background: '#000',
        boxShadow: `0 20px 60px ${video.color}33`, border: `1px solid ${video.color}25`,
      }}>
        <iframe
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1&color=white`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>

      {/* Video info */}
      <div style={{ marginTop: 16 }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{video.description}</p>
      </div>
    </motion.div>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
const LearningVideos = () => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = VIDEOS.filter(v => {
    if (activeCategory !== 'All' && v.category !== activeCategory) return false;
    if (searchQuery && !v.title.toLowerCase().includes(searchQuery.toLowerCase()) && !v.topic.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, margin: '0 0 8px', color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
          📹 Learning Videos
        </h1>
        <p style={{ color: 'var(--on-surface-muted)', fontSize: 15, margin: 0 }}>
          Curated video lessons for core CS topics — watch them right here, no redirects. <strong style={{ color: 'var(--primary)' }}>{VIDEOS.length} courses</strong> available.
        </p>
      </motion.div>

      {/* Search + Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}
      >
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface-container-highest)', border: '1px solid var(--border-color)',
          borderRadius: 12, padding: '0 14px', height: 42, flex: '1 1 240px', maxWidth: 360,
        }}>
          <Search size={16} color="var(--on-surface-muted)" />
          <input
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--on-surface)', fontSize: 13, width: '100%',
              fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 16px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                border: '1px solid',
                background: activeCategory === cat ? 'rgba(73,238,248,0.1)' : 'transparent',
                borderColor: activeCategory === cat ? 'rgba(73,238,248,0.4)' : 'rgba(255,255,255,0.08)',
                color: activeCategory === cat ? '#49eef8' : 'var(--on-surface-muted)',
                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {filteredVideos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--on-surface-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)', margin: '0 0 8px' }}>No videos found</h3>
          <p style={{ fontSize: 14 }}>Try a different search or category.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 22 }}>
          {filteredVideos.map((v, i) => (
            <VideoCard key={v.id} video={v} onWatch={setActiveVideo} index={i} />
          ))}
        </div>
      )}

      {/* Modal Player */}
      <AnimatePresence>
        {activeVideo && (
          <VideoPlayer video={activeVideo} onBack={() => setActiveVideo(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningVideos;
