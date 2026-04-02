import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { BrainCircuit, Sparkles, Zap, Trophy, Code, BookOpen, Shield } from 'lucide-react';

const FEATURES = [
  { icon: <Zap size={14} />, label: 'AI-Powered Smart Paths' },
  { icon: <BrainCircuit size={14} />, label: 'Gemini AI Tutor' },
  { icon: <Trophy size={14} />, label: 'Global Leaderboards' },
  { icon: <Code size={14} />, label: 'DSA Practice Room' },
  { icon: <BookOpen size={14} />, label: 'Mock Interviews' },
  { icon: <Shield size={14} />, label: 'Verified Certificates' },
];

/* ── Floating Particle ── */
const FloatingParticle = ({ delay, x, y, size, color, duration }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0.5],
      y: [0, -60, -120],
      x: [0, Math.random() * 40 - 20],
    }}
    transition={{ repeat: Infinity, duration, delay, ease: 'easeInOut' }}
    style={{
      position: 'absolute', top: `${y}%`, left: `${x}%`,
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle, ${color}, transparent 70%)`,
      pointerEvents: 'none',
    }}
  />
);

const AuthLayout = () => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const isLogin = location.pathname === '/login';

  return (
    <div className="auth-split-layout">
      {/* ── Left Panel: Hero ── */}
      <div className="auth-hero-panel">
        {/* Animated gradient background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #0d0d2e 0%, #1a0940 30%, #0a1a3e 70%, #050d1f 100%)',
        }} />

        {/* Animated orbs */}
        <motion.div
          animate={shouldReduceMotion ? {} : { x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '5%', left: '10%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(73,238,248,0.2) 0%, transparent 70%)',
            filter: 'blur(70px)', pointerEvents: 'none',
          }}
        />
        <motion.div
          animate={shouldReduceMotion ? {} : { x: [0, -20, 0], y: [0, 25, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 3 }}
          style={{
            position: 'absolute', bottom: '15%', right: '10%',
            width: 320, height: 320,
            background: 'radial-gradient(circle, rgba(213,186,255,0.18) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }}
        />

        {/* Floating particles */}
        {!shouldReduceMotion && (
          <>
            <FloatingParticle delay={0} x={20} y={30} size={6} color="rgba(73,238,248,0.5)" duration={6} />
            <FloatingParticle delay={1} x={70} y={50} size={4} color="rgba(213,186,255,0.5)" duration={8} />
            <FloatingParticle delay={2} x={40} y={70} size={5} color="rgba(74,222,128,0.4)" duration={7} />
            <FloatingParticle delay={3.5} x={85} y={20} size={3} color="rgba(251,113,133,0.4)" duration={9} />
            <FloatingParticle delay={4} x={15} y={80} size={4} color="rgba(96,165,250,0.4)" duration={6.5} />
          </>
        )}

        {/* Logo */}
        <div style={{ position: 'absolute', top: 32, left: 40, display: 'flex', alignItems: 'center', gap: 10, zIndex: 2 }}>
          <motion.div
            animate={shouldReduceMotion ? {} : { rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            <Sparkles size={26} color="#49eef8" />
          </motion.div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
            <span style={{ color: '#49eef8' }}>Cognify</span>X AI
          </span>
        </div>

        {/* 3D Illustration */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ position: 'absolute', top: '10%', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none', zIndex: 1 }}
        >
          <img
            src="/images/ai-learning.png"
            alt="AI Learning"
            onError={(e) => { e.target.style.display = 'none'; }}
            style={{ maxWidth: '88%', maxHeight: '55vh', objectFit: 'contain', filter: 'drop-shadow(0 0 40px rgba(73,238,248,0.3))' }}
          />
        </motion.div>

        {/* Bottom text block */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ position: 'relative', zIndex: 2 }}
        >
          <h1 style={{
            margin: '0 0 16px 0',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#fff',
          }}>
            <span style={{ color: '#49eef8' }}>CognifyX AI:</span> Master DSA<br />with Intelligence.
          </h1>
          <p style={{ margin: '0 0 28px 0', color: '#a0aec0', fontSize: 16, lineHeight: 1.6, maxWidth: 440 }}>
            Personalized paths, real-time tutoring, and career-ready skills.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {FEATURES.map((f, i) => (
              <motion.span
                key={i}
                className="auth-feature-pill"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                {f.icon} {f.label}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="auth-form-panel" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute', top: '20%', right: '-20%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(73,238,248,0.04) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -20, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthLayout;
