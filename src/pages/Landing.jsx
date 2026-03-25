import React from 'react';
import { Row, Col, Typography, Button, Space, Card } from 'antd';
import { Sparkles, BrainCircuit, Microscope, Scale, TrendingUp, Cpu, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const disciplines = [
  { title: 'Computer Science', icon: <Cpu size={24} color="var(--primary-color)" />, path: 'monaco-engine' },
  { title: 'Pre-Medicine', icon: <Microscope size={24} color="#10b981" />, path: 'case-study' },
  { title: 'Law & Ethics', icon: <Scale size={24} color="#f59e0b" />, path: 'case-study' },
  { title: 'Business Strategy', icon: <TrendingUp size={24} color="#6366f1" />, path: 'case-study' },
];

const bentoVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', transition: 'background 0.3s ease' }}>
      
      {/* Premium Navbar */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', padding: '20px 6vw', alignItems: 'center', background: 'var(--header-bg)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)' }}>
        <Title level={4} style={{ margin: 0, display: 'flex', gap: 10, alignItems: 'center' }} className="text-gradient">
          <Sparkles size={24} color="var(--primary-color)" /> AI Edu
        </Title>
        <Space size="middle">
          <Button type="text" onClick={() => navigate('/login')} style={{ color: 'var(--text-color)', fontWeight: 500 }}>Log In</Button>
          <Button type="primary" onClick={() => navigate('/signup')} style={{ borderRadius: 8, background: 'var(--text-color)', color: 'var(--bg-primary)', fontWeight: 600, border: 'none', padding: '0 20px', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>Start Free</Button>
        </Space>
      </motion.nav>

      <main style={{ padding: '80px 6vw', maxWidth: 1400, margin: '0 auto' }}>
        
        {/* Stark Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ textAlign: 'center', marginBottom: 80, maxWidth: 800, margin: '0 auto 80px auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '6px 16px', borderRadius: 20, marginBottom: 32 }}>
            <Sparkles size={14} color="var(--primary-color)" />
            <Text style={{ color: 'var(--text-color)', fontWeight: 600, fontSize: 13 }}>Introducing the Universal Engine</Text>
          </div>
          <Title style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.05, color: 'var(--text-color)', marginBottom: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>
            The Operating System for <span className="text-gradient">Higher Education.</span>
          </Title>
          <Text style={{ fontSize: 20, color: 'var(--text-muted)', display: 'block', marginBottom: 40, lineHeight: 1.5 }}>
            A modular AI-powered campus. Seamlessly switch between writing code, diagnosing patients in clinical case studies, and building financial models.
          </Text>
          <Space size="middle" wrap justify="center" style={{ display: 'flex' }}>
            <Button size="large" onClick={() => navigate('/signup')} style={{ height: 56, fontSize: 17, borderRadius: 12, background: 'var(--text-color)', color: 'var(--bg-primary)', border: 'none', padding: '0 32px', fontWeight: 600, transition: 'transform 0.2s', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              Build Your Profile
            </Button>
            <Button size="large" onClick={() => document.getElementById('bento-grid').scrollIntoView({ behavior: 'smooth' })} style={{ height: 56, fontSize: 17, borderRadius: 12, background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)', padding: '0 32px' }}>
              Explore Architecture
            </Button>
          </Space>
        </motion.div>

        {/* Bento Grid Architecture */}
        <div id="bento-grid">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <Row gutter={[24, 24]}>
              
              {/* Massive Main Feature */}
              <Col xs={24} lg={16}>
                <motion.div variants={bentoVariants} style={{ height: '100%' }}>
                  <div className="glass-card" style={{ padding: 48, height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, background: 'radial-gradient(circle, var(--primary-color) 0%, transparent 70%)', opacity: 0.1, filter: 'blur(40px)' }} />
                    <BrainCircuit size={48} color="var(--primary-color)" style={{ marginBottom: 24 }} />
                    <Title level={2} style={{ color: 'var(--text-color)', marginTop: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>Llama-3 Powered Tutor</Title>
                    <Text style={{ color: 'var(--text-muted)', fontSize: 18, maxWidth: 500, lineHeight: 1.6 }}>
                      An ultra-low latency groq-accelerated intelligence that reads your active workspace. It debugs your code, evaluates your essays, and forces you to learn via the Socratic method instead of spoonfeeding answers.
                    </Text>
                  </div>
                </motion.div>
              </Col>

              {/* Top Right Feature */}
              <Col xs={24} lg={8}>
                <motion.div variants={bentoVariants} style={{ height: '100%' }}>
                  <div className="glass-card" style={{ padding: 32, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Zap size={36} color="var(--accent-color)" style={{ marginBottom: 24 }} />
                    <Title level={3} style={{ color: 'var(--text-color)', marginTop: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>Instant Context Engine</Title>
                    <Text style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6 }}>
                      State hydration happens at the Edge. Swap your major from Computer Science to Pre-Med and watch the entire UI instantly reshape itself.
                    </Text>
                  </div>
                </motion.div>
              </Col>

              {/* Bottom Multi-Disciplinary Grid */}
              <Col xs={24}>
                <motion.div variants={bentoVariants}>
                  <div className="glass-card" style={{ padding: 40 }}>
                    <Row align="middle" justify="space-between" style={{ marginBottom: 32 }}>
                      <Col xs={24} md={18}>
                        <Title level={3} style={{ color: 'var(--text-color)', margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>Universal Disciplines</Title>
                        <Text style={{ color: 'var(--text-muted)', fontSize: 16 }}>Dynamically routed workspaces built for every field.</Text>
                      </Col>
                      <Col xs={24} md={6} style={{ textAlign: 'right' }}>
                        <Button type="link" onClick={() => navigate('/signup')} style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: 16 }}>Explore All <ChevronRight size={18} /></Button>
                      </Col>
                    </Row>
                    
                    <Row gutter={[16, 16]}>
                      {disciplines.map((d, i) => (
                        <Col xs={24} sm={12} md={6} key={i}>
                          <div style={{ padding: 24, border: '1px solid var(--border-color)', borderRadius: 16, background: 'var(--bg-secondary)', transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease', cursor: 'pointer' }} 
                               onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)'; }} 
                               onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                               onClick={() => navigate('/signup')}>
                            <div style={{ marginBottom: 16 }}>{d.icon}</div>
                            <Title level={5} style={{ color: 'var(--text-color)', margin: '0 0 8px 0', fontWeight: 600 }}>{d.title}</Title>
                            <Text style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'monospace' }}>Workspace: {d.path}</Text>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </motion.div>
              </Col>

            </Row>
          </motion.div>
        </div>
      </main>

      {/* Stark Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '40px 6vw', marginTop: 100, background: 'var(--bg-secondary)' }}>
        <Row justify="space-between" align="middle" style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Col>
            <Title level={5} style={{ margin: 0, color: 'var(--text-color)' }}>AI Edu Core</Title>
            <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>Universal Education Canvas</Text>
          </Col>
          <Col>
            <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>© {new Date().getFullYear()} AI Edu Core. Built meticulously.</Text>
          </Col>
        </Row>
      </footer>
      
    </div>
  );
};

export default Landing;
