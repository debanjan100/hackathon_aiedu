import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button, message as antMessage } from 'antd';
import {
  Sparkles, BrainCircuit, Trophy, Code, Mic, Award,
  Zap, ChevronRight, Github, Twitter, Linkedin,
  LayoutDashboard, Users, BookOpen, Star, Video,
  ArrowRight, CheckCircle, MousePointer2,
  Mail, Copy, ExternalLink, ShieldCheck, Rocket, HeartHandshake, GraduationCap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion, useInView, useSpring } from 'framer-motion';

/* ══════════════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════════════ */

const FEATURES = [
  { icon: <BrainCircuit size={28} />, color: '#49eef8', title: 'AI Tutor (Gemini)', desc: 'Socratic-method AI that asks questions instead of spoon-feeding answers. Powered by Google Gemini — fast and accurate.' },
  { icon: <LayoutDashboard size={28} />, color: '#d5baff', title: 'Personalized Paths', desc: 'Smart learning paths that adapt in real-time to your skill level, goals, and interview deadlines.' },
  { icon: <Code size={28} />, color: '#4ade80', title: 'DSA Practice Room', desc: '3-panel IDE with Monaco editor, AI hints, and 500+ curated problems mapped to FAANG interviews.' },
  { icon: <Trophy size={28} />, color: '#faad14', title: 'Global Leaderboard', desc: 'Compete with 10,000+ students. Daily streak rewards, XP system, and rank progression.' },
  { icon: <Mic size={28} />, color: '#fb7185', title: 'Mock Interviews', desc: 'Real-time AI-powered mock interviews with instant feedback. Simulate Google, Amazon, Meta rounds.' },
  { icon: <Award size={28} />, color: '#60a5fa', title: 'AI Certificates', desc: 'Generate and download verified completion certificates. Shareable on LinkedIn with a QR code.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Sign Up', desc: 'Create your free account in under 30 seconds.', icon: '🚀', color: '#49eef8' },
  { step: '02', title: 'Choose Your Path', desc: 'Pick your learning track — DSA, Web Dev, AI/ML, or custom.', icon: '🗺️', color: '#d5baff' },
  { step: '03', title: 'Practice & Learn', desc: 'Solve problems, get AI hints, and track progress.', icon: '💡', color: '#4ade80' },
  { step: '04', title: 'Get Certified', desc: 'Earn certificates and land your dream tech job.', icon: '🏆', color: '#faad14' },
];

const REVIEWS = [
  { text: 'CognifyX transformed my DSA prep! Scored 90% in interviews.', name: 'Aarav Singh', major: 'Computer Science Major', stars: 5, color: '#49eef8', emoji: '🧑‍💻' },
  { text: 'AI tutor explains graphs better than my prof. Game-changer!', name: 'Priya Patel', major: 'Software Engineering', stars: 5, color: '#d5baff', emoji: '👩‍🎓' },
  { text: 'Leaderboards motivate me daily. From beginner to LeetCode top 10%.', name: 'Rohan Desai', major: 'CSE Junior', stars: 5, color: '#faad14', emoji: '🚀' },
  { text: 'Personalized paths saved my semester. Premium worth every penny.', name: 'Neha Gupta', major: 'Data Science', stars: 5, color: '#49eef8', emoji: '📊' },
  { text: 'Mock interviews feel real. Landed an internship at Google!', name: 'Vikram Rao', major: 'IT Major', stars: 5, color: '#4ade80', emoji: '💼' },
  { text: 'Fast, intuitive UI. Best DSA platform out there.', name: 'Anika Sharma', major: 'BCA Student', stars: 5, color: '#fb7185', emoji: '⚡' },
];

const MARQUEE_ITEMS = [
  '⚡ Gemini AI', '🏆 Live Leaderboard', '🎯 DSA Practice Room',
  '📊 Smart Analytics', '🎭 Mock Interviews', '📹 Learning Videos',
  '🔥 Daily Challenges', '💡 Socratic AI Mentor', '📜 AI Certificates',
  '🗺️ Personalized Roadmaps', '⏱️ Focus Timer', '🌗 Dark & Light Mode',
];

const PRICING = [
  {
    plan: 'Free', price: '₹0', period: '/forever',
    features: ['5 AI Tutor chats/day', '10 practice problems', 'Basic leaderboard', 'Progress tracking'],
    cta: 'Start Free', highlight: false,
  },
  {
    plan: 'Premium', price: '₹199', period: '/month',
    features: ['Unlimited AI Tutor', '500+ problems', 'Mock interviews', 'AI Certificates', 'Priority support'],
    cta: 'Go Premium', highlight: true,
  },
];

const WHY_CHOOSE_US = [
  { icon: <ShieldCheck size={28} />, color: '#49eef8', title: 'Trusted by 10K+', desc: 'Join thousands of students who have accelerated their careers with CognifyX AI.' },
  { icon: <Rocket size={28} />, color: '#d5baff', title: '10x Faster Learning', desc: 'AI-powered personalized paths adapt to you in real-time — no wasted effort.' },
  { icon: <HeartHandshake size={28} />, color: '#4ade80', title: 'Mentor-Grade AI', desc: 'Socratic-method AI that teaches you how to think, not just how to solve.' },
  { icon: <GraduationCap size={28} />, color: '#faad14', title: 'Career Ready', desc: 'Mock interviews, certificates, and company-tagged problems to land your dream job.' },
];

const TECH_STACK = [
  { name: 'React', color: '#61dafb', emoji: '⚛️' },
  { name: 'Supabase', color: '#3ecf8e', emoji: '🟢' },
  { name: 'Gemini AI', color: '#8b5cf6', emoji: '🤖' },
  { name: 'Monaco', color: '#007acc', emoji: '📝' },
  { name: 'Framer Motion', color: '#ff0055', emoji: '🎞️' },
  { name: 'Recharts', color: '#8884d8', emoji: '📊' },
  { name: 'Vite', color: '#646cff', emoji: '⚡' },
  { name: 'Node.js', color: '#68a063', emoji: '🟩' },
];

const CONTACT_LINKS = [
  { icon: <Mail size={24} />, label: 'ghoruideabanjan@gmail.com', href: 'mailto:ghoruideabanjan@gmail.com', color: '#49eef8', copy: true },
  { icon: <Github size={24} />, label: 'debanjan100', href: 'https://github.com/debanjan100', color: '#d5baff', external: true },
  { icon: <Linkedin size={24} />, label: 'Debanjan Ghorui', href: 'https://www.linkedin.com/in/debanjanghorui5567/', color: '#60a5fa', external: true },
];

const STATS = [
  { target: 500, suffix: '+', label: 'Problems', icon: '🧩' },
  { target: 10000, suffix: '+', label: 'Students', icon: '👩‍💻' },
  { target: 15, suffix: '+', label: 'Topics', icon: '📚' },
  { target: 98, suffix: '%', label: 'Satisfaction', icon: '⭐' },
];

const NAV_LINKS = [
  { label: 'Features', target: 'features-section' },
  { label: 'How It Works', target: 'hiw-section' },
  { label: 'Testimonials', target: 'testimonials-section' },
  { label: 'Pricing', target: 'pricing-section' },
  { label: 'Connect', target: 'connect-section' },
];

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════ */

/* ── Animated Counter ── */
const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ── Typing Effect Hook ── */
const useTypingEffect = (words, speed = 100, pause = 2000) => {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(currentWord.substring(0, text.length + 1));
        if (text === currentWord) {
          setTimeout(() => setIsDeleting(true), pause);
          return;
        }
      } else {
        setText(currentWord.substring(0, text.length - 1));
        if (text === '') {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, speed, pause]);

  return text;
};

/* ── 3D Tilt Card ── */
const TiltCard = ({ children, style, className = '' }) => {
  const cardRef = useRef(null);
  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale3d(1.02,1.02,1.02)`;
  }, []);
  const handleMouseLeave = useCallback(() => {
    cardRef.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
  }, []);
  return (
    <div
      ref={cardRef}
      className={`tilt-card-inner ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.15s ease-out', ...style }}
    >
      {children}
    </div>
  );
};

/* ── Feature Card ── */
const FeatureCard = ({ f, i }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, delay: i * 0.08 }}
    className="tilt-card"
  >
    <TiltCard
      className="gradient-border-card"
      style={{
        background: 'linear-gradient(145deg, rgba(22,22,28,0.95), rgba(15,15,22,0.9))',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${f.color}20`,
        borderRadius: 20,
        padding: '32px 26px',
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 160, height: 160,
        background: `radial-gradient(circle, ${f.color}18, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        width: 54, height: 54, borderRadius: 16, marginBottom: 20,
        background: `linear-gradient(135deg, ${f.color}18, ${f.color}08)`,
        border: `1px solid ${f.color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: f.color,
        boxShadow: `0 0 24px ${f.color}20`,
      }}>
        {f.icon}
      </div>
      <h3 style={{ margin: '0 0 10px 0', color: '#f0f0f0', fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em' }}>
        {f.title}
      </h3>
      <p style={{ margin: 0, color: '#788a8b', fontSize: 14, lineHeight: 1.65 }}>
        {f.desc}
      </p>
    </TiltCard>
  </motion.div>
);

/* ── How It Works Step ── */
const HowItWorksStep = ({ step, i, total }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.5, delay: i * 0.12 }}
    style={{ position: 'relative', textAlign: 'center' }}
  >
    {/* Connector line */}
    {i < total - 1 && (
      <div style={{
        position: 'absolute', top: 30, left: '55%', right: '-45%', height: 2,
        background: `linear-gradient(90deg, ${step.color}40, transparent)`,
        zIndex: 0,
      }} className="desktop-only" />
    )}
    {/* Step circle */}
    <motion.div
      whileHover={{ scale: 1.1, boxShadow: `0 0 30px ${step.color}40` }}
      style={{
        width: 60, height: 60, borderRadius: '50%', margin: '0 auto 18px',
        background: `linear-gradient(135deg, ${step.color}20, ${step.color}08)`,
        border: `2px solid ${step.color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, position: 'relative', zIndex: 1,
        boxShadow: `0 0 20px ${step.color}15`,
        transition: 'all 0.3s ease',
      }}
    >
      {step.icon}
    </motion.div>
    <div style={{ color: step.color, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>
      STEP {step.step}
    </div>
    <h3 style={{ color: '#f0f0f0', fontSize: 18, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
      {step.title}
    </h3>
    <p style={{ color: '#7a8a8b', fontSize: 14, lineHeight: 1.6, maxWidth: 220, margin: '0 auto' }}>
      {step.desc}
    </p>
  </motion.div>
);

/* ── Testimonial Card ── */
const TestimonialCard = ({ review }) => (
  <div style={{
    flexShrink: 0, width: 320,
    background: 'rgba(19,19,19,0.85)',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${review.color}25`,
    borderRadius: 20, padding: '28px 24px',
    display: 'flex', flexDirection: 'column', gap: 14,
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: `radial-gradient(circle, ${review.color}15, transparent 70%)`, pointerEvents: 'none' }} />
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: review.stars }).map((_, i) => (
        <Star key={i} size={14} fill={review.color} stroke="none" />
      ))}
    </div>
    <p style={{ margin: 0, lineHeight: 1.65, fontStyle: 'italic', color: 'rgba(226,226,226,0.9)', fontSize: 15 }}>
      "{review.text}"
    </p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
      <div style={{
        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${review.color}40, ${review.color}20)`,
        border: `2px solid ${review.color}60`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>
        {review.emoji}
      </div>
      <div>
        <div style={{ color: '#e2e2e2', fontWeight: 700, fontSize: 14 }}>{review.name}</div>
        <div style={{ color: review.color, fontSize: 12, fontWeight: 500 }}>{review.major}</div>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN LANDING COMPONENT
   ══════════════════════════════════════════════════════════════ */
const Landing = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, shouldReduceMotion ? 0 : 100]);
  const heroScale = useTransform(scrollY, [0, 500], [1, shouldReduceMotion ? 1 : 0.95]);
  const heroOpacity = useTransform(scrollY, [0, 350], [1, shouldReduceMotion ? 1 : 0.2]);

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Cursor glow
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const handleMouseMove = useCallback((e) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  }, []);

  // Active nav section
  const [activeSection, setActiveSection] = useState('');
  useEffect(() => {
    const targets = NAV_LINKS.map(l => document.getElementById(l.target));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { threshold: 0.3 });
    targets.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Typing effect
  const typedText = useTypingEffect(
    ['Programming', 'Mathematics', 'Data Structures', 'Algorithms', 'Machine Learning'],
    80, 1800
  );

  const btnHover = shouldReduceMotion ? {} : { whileHover: { scale: 1.04 }, whileTap: { scale: 0.96 } };
  const sectionFade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #05080f 0%, #080d18 25%, #0a0f1e 50%, #060c14 75%, #030609 100%)',
        color: '#fff',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Scroll progress bar */}
      <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #2563eb, #49eef8, #d5baff)', transformOrigin: '0%', scaleX, zIndex: 9999 }} />

      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: cursorPos.x, top: cursorPos.y }} />

      {/* Global ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '-5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.06) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 6vw', height: 64,
          background: 'rgba(5,8,15,0.8)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(73,238,248,0.08)',
          boxShadow: '0 1px 30px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={22} color="#49eef8" />
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em' }}>
            <span style={{ color: '#49eef8' }}>Cognify</span>X AI
          </span>
        </div>

        {/* Center nav links */}
        <div className="desktop-only" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {NAV_LINKS.map(link => (
            <span
              key={link.target}
              className={`landing-nav-link${activeSection === link.target ? ' active' : ''}`}
              onClick={() => scrollTo(link.target)}
            >
              {link.label}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button type="text" onClick={() => navigate('/login')} style={{ color: '#bac9ca', fontWeight: 500 }}>
            Log In
          </Button>
          <motion.div {...btnHover}>
            <Button
              type="primary"
              onClick={() => navigate('/signup')}
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f89ff)', border: 'none', borderRadius: 9999, fontWeight: 700, height: 38, padding: '0 22px' }}
            >
              Start Free
            </Button>
          </motion.div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <div ref={heroRef} style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Animated background orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <motion.div
            animate={shouldReduceMotion ? {} : { x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '5%', left: '5%', width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.28) 0%, transparent 65%)', filter: 'blur(70px)' }}
          />
          <motion.div
            animate={shouldReduceMotion ? {} : { x: [0, -25, 0], y: [0, 35, 0] }}
            transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 3 }}
            style={{ position: 'absolute', top: '25%', right: '5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.22) 0%, transparent 65%)', filter: 'blur(60px)' }}
          />
          <motion.div
            animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 5 }}
            style={{ position: 'absolute', bottom: '5%', left: '22%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(73,238,248,0.14) 0%, transparent 65%)', filter: 'blur(55px)' }}
          />
          <motion.div
            animate={shouldReduceMotion ? {} : { x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
            transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut', delay: 7 }}
            style={{ position: 'absolute', top: '60%', left: '60%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,113,133,0.1) 0%, transparent 65%)', filter: 'blur(50px)' }}
          />
        </div>

        <motion.div
          style={{ y: heroY, scale: heroScale, opacity: heroOpacity, textAlign: 'center', maxWidth: 880, padding: '0 24px', position: 'relative', zIndex: 2 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(73,238,248,0.06)', border: '1px solid rgba(73,238,248,0.25)', borderRadius: 9999, padding: '7px 18px', marginBottom: 28 }}
          >
            <motion.span
              animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#49eef8', display: 'inline-block', boxShadow: '0 0 8px #49eef8' }}
            />
            <span style={{ color: '#49eef8', fontWeight: 600, fontSize: 13 }}>🚀 10,000+ students enrolled worldwide</span>
          </motion.div>

          {/* Headline with typing */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              margin: '0 0 24px 0',
              fontSize: 'clamp(2.6rem, 6.5vw, 5.2rem)',
              fontWeight: 900, lineHeight: 1.05,
              letterSpacing: '-0.03em', color: '#fff',
            }}
          >
            Master{' '}
            <span style={{
              background: 'linear-gradient(135deg, #49eef8 0%, #d5baff 55%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {typedText}
            </span>
            <span className="typing-cursor" />
            <br />
            <span style={{ fontSize: '0.65em', fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>
              with AI-Powered Intelligence.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#7a8a8b', lineHeight: 1.6, marginBottom: 40, maxWidth: 640, margin: '0 auto 40px auto' }}
          >
            Personalized AI tutoring, a full coding IDE, mock interviews, and smart analytics — everything you need to crack tech interviews in one platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.05, boxShadow: '0 0 60px rgba(73,238,248,0.5)' }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              style={{ borderRadius: 14, transition: 'all 0.3s ease' }}
            >
              <Button
                size="large"
                onClick={() => navigate('/signup')}
                style={{
                  height: 56, fontSize: 17, fontWeight: 700,
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb, #49eef8)',
                  border: 'none', color: '#fff', borderRadius: 14, padding: '0 36px',
                  boxShadow: '0 0 40px rgba(73,238,248,0.35), 0 4px 24px rgba(37,99,235,0.4)',
                }}
              >
                Get Started Free ✦
              </Button>
            </motion.div>
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.03, boxShadow: '0 0 30px rgba(213,186,255,0.2)' }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              style={{ borderRadius: 14, transition: 'all 0.3s ease' }}
            >
              <Button
                size="large"
                onClick={() => scrollTo('features-section')}
                style={{
                  height: 56, fontSize: 17, fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(213,186,255,0.3)',
                  color: '#e2e2e2', borderRadius: 14, padding: '0 36px',
                }}
              >
                Explore Features →
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating UI cards */}
          <div className="desktop-only" style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 50, flexWrap: 'wrap' }}>
            {[
              { icon: <BrainCircuit size={18} />, label: 'AI Tutor', color: '#49eef8', delay: 0.4 },
              { icon: <Code size={18} />, label: 'Code IDE', color: '#4ade80', delay: 0.5 },
              { icon: <Trophy size={18} />, label: 'Leaderboard', color: '#faad14', delay: 0.6 },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: card.delay }}
                whileHover={{ y: -4, boxShadow: `0 10px 30px ${card.color}25` }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${card.color}30`,
                  color: card.color, fontSize: 13, fontWeight: 600,
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s ease',
                }}
              >
                {card.icon} {card.label}
              </motion.div>
            ))}
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 32 }}
          >
            <div style={{ display: 'flex' }}>
              {['🧑‍💻', '👩‍🎓', '👨‍🔬', '👩‍💼', '👨‍🏫'].map((emoji, i) => (
                <div key={i} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(37,99,235,0.15)', border: '2px solid rgba(5,8,15,0.9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, marginLeft: i > 0 ? -10 : 0,
                }}>
                  {emoji}
                </div>
              ))}
            </div>
            <span style={{ color: '#7a8a8b', fontSize: 14 }}>
              Trusted by <strong style={{ color: '#49eef8' }}>10,000+</strong> students
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features-section" style={{ padding: '100px 6vw', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div {...sectionFade} style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(213,186,255,0.06)', border: '1px solid rgba(213,186,255,0.2)',
            borderRadius: 9999, padding: '6px 18px', marginBottom: 20,
          }}>
            <Zap size={14} color="#d5baff" />
            <span style={{ color: '#d5baff', fontWeight: 600, fontSize: 13 }}>Everything you need to crack FAANG</span>
          </div>
          <h2 style={{
            margin: '0 0 14px 0',
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.15,
          }}>
            A complete platform for<br />
            <span style={{ background: 'linear-gradient(135deg, #d5baff, #49eef8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              serious learners
            </span>
          </h2>
          <p style={{ color: '#7a8a8b', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Everything from first principles to mock interviews, in one intelligent platform.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="hiw-section" style={{ padding: '80px 6vw', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...sectionFade} style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: 9999, padding: '6px 18px', marginBottom: 20,
          }}>
            <MousePointer2 size={14} color="#4ade80" />
            <span style={{ color: '#4ade80', fontWeight: 600, fontSize: 13 }}>Simple 4-Step Process</span>
          </div>
          <h2 style={{
            margin: '0 0 14px', fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.15,
          }}>
            How{' '}
            <span style={{ background: 'linear-gradient(135deg, #4ade80, #49eef8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              CognifyX
            </span>{' '}works
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
          {HOW_IT_WORKS.map((step, i) => (
            <HowItWorksStep key={step.step} step={step} i={i} total={HOW_IT_WORKS.length} />
          ))}
        </div>
      </section>

      {/* ── ANIMATED STATS ── */}
      <section style={{ padding: '64px 6vw', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, maxWidth: 900, margin: '0 auto', textAlign: 'center' }}
        >
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#49eef8', lineHeight: 1 }}>
                <AnimatedCounter target={s.target} suffix={s.suffix} />
              </div>
              <div style={{ color: '#7a8a8b', fontSize: 14, marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── MARQUEE ── */}
      <section style={{ padding: '40px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <div key={i} style={{
                flexShrink: 0, padding: '8px 24px', margin: '0 8px',
                background: 'rgba(73,238,248,0.04)', border: '1px solid rgba(73,238,248,0.15)',
                borderRadius: 9999, color: '#bac9ca', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
              }}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS CAROUSEL ── */}
      <section id="testimonials-section" style={{ padding: '80px 6vw', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div {...sectionFade} style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(73,238,248,0.06)', border: '1px solid rgba(73,238,248,0.2)',
            borderRadius: 9999, padding: '6px 18px', marginBottom: 20,
          }}>
            <Star size={14} fill="#faad14" stroke="none" />
            <span style={{ color: '#49eef8', fontWeight: 600, fontSize: 13 }}>10,000+ Students Love It</span>
          </div>
          <h2 style={{
            margin: '0 0 12px', fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.15,
          }}>
            Real stories from{' '}
            <span style={{ background: 'linear-gradient(135deg, #49eef8, #d5baff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              real students
            </span>
          </h2>
          <p style={{ color: '#7a8a8b', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            Thousands of learners have accelerated their careers with CognifyX AI.
          </p>
        </motion.div>

        {/* Auto-scroll carousel */}
        <div className="testimonial-carousel-wrapper">
          <div className="testimonial-carousel-track">
            {[...REVIEWS, ...REVIEWS].map((review, i) => (
              <TestimonialCard key={`${review.name}-${i}`} review={review} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing-section" style={{ padding: '80px 6vw', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div {...sectionFade} style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ margin: '0 0 12px 0', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            Simple,{' '}
            <span style={{ background: 'linear-gradient(135deg, #faad14, #fb7185)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              transparent pricing
            </span>
          </h2>
          <p style={{ color: '#7a8a8b', fontSize: 16 }}>No hidden fees. Cancel anytime.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 700, margin: '0 auto' }}>
          {PRICING.map((p, i) => (
            <motion.div
              key={p.plan}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: p.highlight ? '0 0 50px rgba(73,238,248,0.15)' : '0 8px 30px rgba(0,0,0,0.3)' }}
              style={{
                background: p.highlight ? 'linear-gradient(160deg, rgba(37,99,235,0.15), rgba(73,238,248,0.06))' : 'rgba(19,19,19,0.9)',
                border: p.highlight ? '1px solid rgba(73,238,248,0.4)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24, padding: '36px 30px',
                boxShadow: p.highlight ? '0 0 40px rgba(73,238,248,0.1)' : 'none',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              {p.highlight && (
                <div style={{
                  position: 'absolute', top: 16, right: 20,
                  background: 'linear-gradient(135deg, #faad14, #fb7185)',
                  borderRadius: 9999, padding: '3px 14px',
                  fontSize: 11, fontWeight: 700, color: '#000',
                }}>
                  POPULAR
                </div>
              )}
              <div style={{ fontSize: 14, color: p.highlight ? '#49eef8' : '#7a8a8b', fontWeight: 600, marginBottom: 12 }}>{p.plan}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: '#fff' }}>{p.price}</span>
                <span style={{ color: '#7a8a8b', fontSize: 14 }}>{p.period}</span>
              </div>
              {p.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <CheckCircle size={16} color={p.highlight ? '#49eef8' : '#4ade80'} />
                  <span style={{ color: '#bac9ca', fontSize: 14 }}>{f}</span>
                </div>
              ))}
              <motion.div {...btnHover} style={{ marginTop: 28 }}>
                <Button
                  block size="large"
                  onClick={() => navigate('/signup')}
                  style={{
                    height: 50, fontWeight: 700, fontSize: 15, borderRadius: 12,
                    background: p.highlight ? 'linear-gradient(135deg, #2563eb, #49eef8)' : 'rgba(255,255,255,0.06)',
                    border: p.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    color: p.highlight ? '#fff' : '#e2e2e2',
                    boxShadow: p.highlight ? '0 0 20px rgba(73,238,248,0.3)' : 'none',
                  }}
                >
                  {p.cta}
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ padding: '100px 6vw', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 700, height: 350,
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <motion.div {...sectionFade} style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
            Ready to land your<br />dream tech job?
          </h2>
          <p style={{ color: '#7a8a8b', fontSize: 16, marginBottom: 36 }}>
            Join 10,000+ students already using CognifyX AI to prepare smarter.
          </p>
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.05, boxShadow: '0 0 70px rgba(73,238,248,0.5)' }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
            style={{ display: 'inline-block', transition: 'all 0.3s ease' }}
          >
            <Button
              size="large"
              onClick={() => navigate('/signup')}
              style={{
                height: 60, fontSize: 18, fontWeight: 800,
                background: 'linear-gradient(135deg, #2563eb, #49eef8)',
                border: 'none', color: '#fff', borderRadius: 16, padding: '0 48px',
                boxShadow: '0 0 50px rgba(73,238,248,0.35)',
              }}
            >
              Get Started Free ✦
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section style={{ padding: '80px 6vw', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div {...sectionFade} style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(73,238,248,0.06)', border: '1px solid rgba(73,238,248,0.2)', borderRadius: 9999, padding: '6px 18px', marginBottom: 20 }}>
            <ShieldCheck size={14} color="#49eef8" />
            <span style={{ color: '#49eef8', fontWeight: 600, fontSize: 13 }}>Why CognifyX?</span>
          </div>
          <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.15 }}>
            Built for students who{' '}
            <span style={{ background: 'linear-gradient(135deg, #49eef8, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>mean business</span>
          </h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {WHY_CHOOSE_US.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="tilt-card"
            >
              <TiltCard style={{
                background: 'rgba(19,19,19,0.85)', backdropFilter: 'blur(16px)',
                border: `1px solid ${item.color}20`, borderRadius: 20, padding: '32px 26px',
                position: 'relative', overflow: 'hidden', textAlign: 'center',
              }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140, background: `radial-gradient(circle, ${item.color}15, transparent 70%)`, pointerEvents: 'none' }} />
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} style={{
                  width: 60, height: 60, borderRadius: '50%', margin: '0 auto 18px',
                  background: `linear-gradient(135deg, ${item.color}20, ${item.color}08)`,
                  border: `1px solid ${item.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.color, boxShadow: `0 0 24px ${item.color}20`, transition: 'all 0.3s ease',
                }}>
                  {item.icon}
                </motion.div>
                <h3 style={{ margin: '0 0 10px', color: '#f0f0f0', fontWeight: 700, fontSize: 17 }}>{item.title}</h3>
                <p style={{ margin: 0, color: '#788a8b', fontSize: 14, lineHeight: 1.65 }}>{item.desc}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TECH STACK SHOWCASE ── */}
      <section style={{ padding: '60px 6vw', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.div {...sectionFade} style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Powered by Modern Tech</h2>
          <p style={{ color: '#7a8a8b', fontSize: 14 }}>Built with the tools that power the world's best products.</p>
        </motion.div>
        <div className="marquee-wrapper">
          <div className="marquee-track" style={{ animation: 'marquee 20s linear infinite' }}>
            {[...TECH_STACK, ...TECH_STACK, ...TECH_STACK].map((tech, i) => (
              <motion.div key={i} whileHover={{ y: -4, boxShadow: `0 8px 24px ${tech.color}30` }} style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', margin: '0 10px',
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${tech.color}25`, borderRadius: 16,
                transition: 'all 0.3s ease',
              }}>
                <span style={{ fontSize: 22 }}>{tech.emoji}</span>
                <span style={{ color: tech.color, fontWeight: 700, fontSize: 14 }}>{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LET'S CONNECT ── */}
      <section id="connect-section" style={{ padding: '80px 6vw', maxWidth: 1000, margin: '0 auto' }}>
        <motion.div {...sectionFade} style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 9999, padding: '6px 18px', marginBottom: 20 }}>
            <Mail size={14} color="#60a5fa" />
            <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: 13 }}>Get In Touch</span>
          </div>
          <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            Let's build something{' '}
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #d5baff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>extraordinary together.</span>
          </h2>
          <p style={{ color: '#7a8a8b', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Whether you have a question, feedback, or just want to say hi — my inbox is always open!
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {CONTACT_LINKS.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: `0 20px 50px ${link.color}20`, borderColor: `${link.color}50` }}
              onClick={(e) => {
                if (link.copy) {
                  e.preventDefault();
                  navigator.clipboard.writeText(link.label);
                  antMessage.success('Email copied to clipboard! ✓');
                }
              }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                background: 'rgba(19,19,19,0.85)', backdropFilter: 'blur(16px)',
                border: `1px solid ${link.color}20`, borderRadius: 24, padding: '40px 24px',
                textDecoration: 'none', position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s ease', cursor: 'pointer',
              }}
            >
              <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: `radial-gradient(circle, ${link.color}15, transparent 70%)`, pointerEvents: 'none' }} />
              <motion.div whileHover={{ scale: 1.15, rotate: 5 }} style={{
                width: 56, height: 56, borderRadius: '50%',
                background: `linear-gradient(135deg, ${link.color}20, ${link.color}08)`,
                border: `1px solid ${link.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: link.color, boxShadow: `0 0 20px ${link.color}20`,
              }}>
                {link.icon}
              </motion.div>
              <span style={{ color: '#e2e2e2', fontWeight: 700, fontSize: 15 }}>{link.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: link.color, fontSize: 13, fontWeight: 600 }}>
                {link.copy ? <><Copy size={13} /> Click to Copy</> : <><ExternalLink size={13} /> Open Link</>}
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '56px 6vw 28px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Sparkles size={18} color="#49eef8" />
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
                <span style={{ color: '#49eef8' }}>Cognify</span>X AI
              </span>
            </div>
            <p style={{ color: '#4a5568', fontSize: 13, lineHeight: 1.7, margin: 0 }}>The AI-powered coding & skill validation platform for serious learners.</p>
          </div>
          <div>
            <div style={{ color: '#7a8a8b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Features</div>
            {['Practice Room', 'AI Tutor', 'Mock Interviews', 'Learning Videos', 'Analytics'].map(f => (
              <div key={f} style={{ color: '#4a5568', fontSize: 13, marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#49eef8'} onMouseLeave={e => e.target.style.color = '#4a5568'}>{f}</div>
            ))}
          </div>
          <div>
            <div style={{ color: '#7a8a8b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Resources</div>
            {['Documentation', 'Study Planner', 'Roadmap', 'Leaderboard', 'Certificates'].map(r => (
              <div key={r} style={{ color: '#4a5568', fontSize: 13, marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#49eef8'} onMouseLeave={e => e.target.style.color = '#4a5568'}>{r}</div>
            ))}
          </div>
          <div>
            <div style={{ color: '#7a8a8b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Connect</div>
            <div style={{ display: 'flex', gap: 14 }}>
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <motion.div key={i} whileHover={{ y: -2, color: '#49eef8' }} style={{ color: '#4a5568', cursor: 'pointer' }}>
                  <Icon size={20} />
                </motion.div>
              ))}
            </div>
            <div style={{ marginTop: 20, fontSize: 12, color: '#4a5568', lineHeight: 1.8 }}>
              Built with ❤️ for<br />Hackathon 2026 ⚡
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: '#4a5568', fontSize: 12 }}>© 2026 CognifyX AI. All rights reserved.</span>
          <span style={{ color: '#4a5568', fontSize: 12 }}>Powered by Google Gemini 🤖</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
