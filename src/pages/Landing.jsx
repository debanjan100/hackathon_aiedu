import React from 'react';
import { Row, Col, Typography, Button, Space } from 'antd';
import { Rocket, Sparkles, BookOpen, Code, Cloud, Network, ShieldCheck, Mail, Github, Twitter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const categories = [
  { title: 'Full Stack', desc: 'React, Node, MongoDB', icon: <Code size={28} color="#06B6D4" /> },
  { title: 'Algorithms', desc: 'Trees, Graphs, DP', icon: <Network size={28} color="#7C3AED" /> },
  { title: 'AI/ML', desc: 'Python, TensorFlow', icon: <Sparkles size={28} color="#10b981" /> },
  { title: 'Cloud', desc: 'AWS, Docker, K8s', icon: <Cloud size={28} color="#f59e0b" /> },
  { title: 'Soft Skills', desc: 'Leadership, EQ', icon: <ShieldCheck size={28} color="#ef4444" /> }
];

const paths = ['Data Scientist', 'Full Stack Developer', 'Cloud Engineer', 'Game Developer', 'Product Manager'];

const containerVariants = { 
  hidden: { opacity: 0 }, 
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } } 
};
const itemVariants = { 
  hidden: { opacity: 0, y: 20 }, 
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } 
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background ambient orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 60%)', filter: 'blur(80px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 60%)', filter: 'blur(80px)', zIndex: 0 }} />

      {/* Navbar overlay */}
      <motion.nav initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', padding: '24px 6vw', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0, display: 'flex', gap: 10, alignItems: 'center' }} className="text-gradient">
          <Sparkles size={24} color="#06B6D4" /> AI Edu Core
        </Title>
        <Space size="middle">
          <Button type="text" onClick={() => navigate('/login')} style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 500 }}>Login</Button>
          <Button className="gradient-btn" size="large" onClick={() => navigate('/signup')} style={{ borderRadius: 24, padding: '0 24px' }}>Sign Up Free</Button>
        </Space>
      </motion.nav>

      {/* Hero Section */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '0 6vw' }}>
        <Row align="middle" justify="space-between" style={{ width: '100%' }}>
          <Col xs={24} lg={12} style={{ paddingRight: 40 }}>
            <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '6px 16px', borderRadius: 20, marginBottom: 24 }}>
                <span style={{ width: 8, height: 8, background: '#06B6D4', borderRadius: '50%', boxShadow: '0 0 10px #06B6D4' }} />
                <Text style={{ color: '#06B6D4', fontWeight: 600, fontSize: 13 }}>Platform v2.0 Live</Text>
              </div>
              <Title style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1, color: '#F8FAFC', marginBottom: 24, fontWeight: 800 }}>
                Accelerate Your Core <br />
                <span className="text-gradient">Engineering Skills.</span>
              </Title>
              <Text style={{ fontSize: 18, color: 'var(--text-muted)', display: 'block', marginBottom: 40, maxWidth: 540, lineHeight: 1.6 }}>
                Stop watching tutorials. Start solving real algorithmic challenges guided by a contextual, intelligent AI Tutor built for FAANG prep.
              </Text>
              <Space size="large" wrap>
                <Button className="gradient-btn" size="large" icon={<Rocket size={18} />} onClick={() => navigate('/signup')} style={{ height: 54, fontSize: 17, borderRadius: 12, padding: '0 32px' }}>
                  Start Learning Now
                </Button>
                <Button size="large" onClick={() => {
                  document.getElementById('explore-section').scrollIntoView({ behavior: 'smooth' });
                }} style={{ height: 54, fontSize: 17, borderRadius: 12, background: 'rgba(255,255,255,0.03)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Explore Curriculums
                </Button>
              </Space>
            </motion.div>
          </Col>
          
          <Col xs={24} lg={12} style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: "easeOut", delay: 0.4 }} style={{ position: 'relative', width: '100%', maxWidth: 540 }}>
              <div className="glass-card" style={{ padding: 24, position: 'relative', zIndex: 2, background: 'rgba(10,10,10,0.6) !important' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16 }}>
                  <Sparkles color="#7C3AED" />
                  <Text style={{ color: '#fff', fontWeight: 600 }}>Mock Interview: Binary Search</Text>
                </div>
                <div className="chat-message chat-ai" style={{ maxWidth: '95%' }}>
                  Calculate the mid-point iteratively. What happens to the space complexity if you do this recursively instead? 🧐
                </div>
                <div className="chat-message chat-user" style={{ maxWidth: '90%' }}>
                  Iterative is O(1) space, recursive is O(log n) because of the call stack!
                </div>
                <div className="chat-message chat-ai" style={{ maxWidth: '95%' }}>
                  Spot on! Now write the code.
                </div>
              </div>
              {/* Floating decorative cards */}
              <motion.div animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="glass-card" style={{ position: 'absolute', top: -30, right: -40, padding: '12px 20px', zIndex: 3, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🔥</span> <Text style={{ color: '#fff', fontWeight: 'bold' }}>+10 Focus XP</Text>
              </motion.div>
            </motion.div>
          </Col>
        </Row>
      </div>

      {/* Explore Section */}
      <div id="explore-section" style={{ position: 'relative', zIndex: 1, padding: '100px 6vw', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={2} style={{ color: '#F8FAFC', marginBottom: 16 }}>Master Specialized Domains</Title>
            <Text style={{ color: 'var(--text-muted)', fontSize: 18 }}>Structured roadmaps guided entirely by personalized AI pacing.</Text>
          </div>

          <Row gutter={[24, 24]} justify="center">
            {categories.map((cat, i) => (
              <Col xs={24} sm={12} md={8} lg={4} key={i}>
                <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
                  <div className="glass-card" style={{ padding: '32px 20px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/signup')}>
                    <div style={{ marginBottom: 20, background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: '50%' }}>{cat.icon}</div>
                    <Title level={5} style={{ color: '#F8FAFC', marginBottom: 8 }}>{cat.title}</Title>
                    <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>{cat.desc}</Text>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>

          <div style={{ marginTop: 100, textAlign: 'center' }}>
            <Title level={3} style={{ color: '#F8FAFC', marginBottom: 40 }}>Direct Career Trajectories</Title>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
              {paths.map((p, i) => (
                <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.05, borderColor: '#7C3AED' }} onClick={() => navigate('/signup')} style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {p} <ChevronRight size={16} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#050505', padding: '60px 6vw 40px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Title level={4} className="text-gradient" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
            <Sparkles size={20} color="#06B6D4" /> AI Edu Core
          </Title>
          <Text style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 400 }}>
            The definitive technical interview prep engine powered by adaptive LLM context memory.
          </Text>
          <Space size="large" style={{ marginBottom: 40 }}>
            <Button type="text" style={{ color: 'var(--text-muted)' }} icon={<Mail size={18} />}>Contact</Button>
            <Button type="text" style={{ color: 'var(--text-muted)' }} icon={<Github size={18} />}>GitHub</Button>
            <Button type="text" style={{ color: 'var(--text-muted)' }} icon={<Twitter size={18} />}>Twitter</Button>
          </Space>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, width: '100%', color: 'var(--text-muted)', fontSize: 13 }}>
            © {new Date().getFullYear()} AI Edu Core. Built for Hackathon Excellence.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
