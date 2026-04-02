import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    text: 'Cognify transformed my DSA prep! Scored 90% in interviews.',
    name: 'Aarav Singh',
    major: 'Computer Science Major',
    stars: 5,
    color: '#49eef8',
    emoji: '🧑‍💻',
  },
  {
    text: 'AI tutor explains graphs better than my prof. Game-changer!',
    name: 'Priya Patel',
    major: 'Software Engineering',
    stars: 5,
    color: '#d5baff',
    emoji: '👩‍🎓',
  },
  {
    text: 'Leaderboards motivate me daily. From beginner to LeetCode top 10%.',
    name: 'Rohan Desai',
    major: 'CSE Junior',
    stars: 5,
    color: '#faad14',
    emoji: '🚀',
  },
  {
    text: 'Personalized paths saved my semester. Premium worth every penny.',
    name: 'Neha Gupta',
    major: 'Data Science',
    stars: 5,
    color: '#49eef8',
    emoji: '📊',
  },
  {
    text: 'Mock interviews feel real. Landed internship at Google!',
    name: 'Vikram Rao',
    major: 'IT Major',
    stars: 5,
    color: '#4ade80',
    emoji: '💼',
  },
  {
    text: 'Fast, intuitive UI. Best DSA platform out there.',
    name: 'Anika Sharma',
    major: 'BCA Student',
    stars: 5,
    color: '#fb7185',
    emoji: '⚡',
  },
];

const StarRating = ({ count = 5, color = '#faad14' }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} size={14} fill={color} stroke="none" />
    ))}
  </div>
);

const TestimonialCard = ({ review, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
    whileHover={{ y: -4, boxShadow: `0 12px 40px ${review.color}20` }}
    style={{
      background: 'rgba(19,19,19,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${review.color}30`,
      borderRadius: 20,
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      position: 'relative',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s ease',
      cursor: 'default',
    }}
  >
    {/* Ambient glow */}
    <div style={{
      position: 'absolute', top: -30, right: -30,
      width: 120, height: 120,
      background: `radial-gradient(circle, ${review.color}18 0%, transparent 70%)`,
      pointerEvents: 'none',
    }} />

    {/* Stars */}
    <StarRating count={review.stars} color={review.color} />

    {/* Quote */}
    <p style={{
      margin: 0, lineHeight: 1.65, fontStyle: 'italic',
      color: 'rgba(226,226,226,0.9)', fontSize: 15,
    }}>
      "{review.text}"
    </p>

    {/* Author */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${review.color}40, ${review.color}20)`,
        border: `2px solid ${review.color}60`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>
        {review.emoji}
      </div>
      <div>
        <div style={{ color: '#e2e2e2', fontWeight: 700, fontSize: 14 }}>
          {review.name}
        </div>
        <div style={{ color: review.color, fontSize: 12, fontWeight: 500 }}>
          {review.major}
        </div>
      </div>
    </div>
  </motion.div>
);

const Testimonials = () => (
  <section style={{ padding: '80px 6vw', maxWidth: 1200, margin: '0 auto' }}>
    {/* Section Heading */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: 'center', marginBottom: 56 }}
    >
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(73,238,248,0.06)', border: '1px solid rgba(73,238,248,0.2)',
        borderRadius: 9999, padding: '6px 18px', marginBottom: 20,
      }}>
        <Star size={14} fill="#faad14" stroke="none" />
        <span style={{ color: '#49eef8', fontWeight: 600, fontSize: 13 }}>10,000+ Students Love It</span>
      </div>
      <h2 style={{
        margin: '0 0 12px 0',
        fontSize: 'clamp(2rem, 4vw, 2.8rem)',
        fontWeight: 800, letterSpacing: '-0.02em', color: '#fff',
        lineHeight: 1.15,
      }}>
        Real stories from<br />
        <span style={{ background: 'linear-gradient(135deg, #49eef8, #d5baff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          real students
        </span>
      </h2>
      <p style={{ color: '#7a8a8b', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
        Thousands of learners have accelerated their careers with CognifyX AI.
      </p>
    </motion.div>

    {/* Review Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: 20,
    }}>
      {REVIEWS.map((review, i) => (
        <TestimonialCard key={review.name} review={review} index={i} />
      ))}
    </div>
  </section>
);

export default Testimonials;
