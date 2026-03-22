import React from 'react';
import { Row, Col, Card, Typography, Button, Space } from 'antd';
import { Rocket, Sparkles, BookOpen, Code, Cloud, Network, ShieldCheck, Mail, Github, Twitter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const categories = [
  { title: 'Web Development', desc: 'React, JS, Node, Angular', icon: <Code size={32} color="#00f2fe" /> },
  { title: 'Data Structures & Algorithms', desc: 'Arrays, Trees, Graphs, DP', icon: <Network size={32} color="#faad14" /> },
  { title: 'AI & Machine Learning', desc: 'Python, TensorFlow, Deep Learning', icon: <Sparkles size={32} color="#722ed1" /> },
  { title: 'Cloud & DevOps', desc: 'AWS, Azure, Docker, K8s', icon: <Cloud size={32} color="#1890ff" /> },
  { title: 'Leadership & Soft Skills', desc: 'Management, EQ, Productivity', icon: <ShieldCheck size={32} color="#52c41a" /> }
];

const paths = ['Data Scientist', 'Full Stack Developer', 'Cloud Engineer', 'Game Developer', 'Project Manager'];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      
      {/* Navbar overlay */}
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 48px', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0, color: 'var(--primary-color)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Sparkles /> AI Edu
        </Title>
        <Space size="large">
          <Button type="text" onClick={() => navigate('/login')} style={{ color: '#fff', fontSize: 16 }}>Login</Button>
          <Button className="gradient-btn" size="large" onClick={() => navigate('/signup')} style={{ borderRadius: 20 }}>Getting Started</Button>
        </Space>
      </motion.div>

      {/* Hero Section */}
      <Row align="middle" justify="center" style={{ minHeight: '70vh', padding: '0 48px' }}>
        <Col xs={24} md={12}>
          <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <Title style={{ fontSize: 56, lineHeight: 1.2, color: '#fff', marginBottom: 24 }}>
              Master Skills with <br />
              <span style={{ background: 'linear-gradient(90deg, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                AI-Powered Learning.
              </span>
            </Title>
            <Text style={{ fontSize: 18, color: '#94a3b8', display: 'block', marginBottom: 32, maxWidth: 500 }}>
              Personalized learning + AI chatbot
            </Text>
            <Space size="large">
              <Button className="gradient-btn" size="large" icon={<Rocket size={18} />} onClick={() => navigate('/signup')} style={{ height: 56, fontSize: 18, borderRadius: 28, padding: '0 32px' }}>
                Get Started
              </Button>
              <Button size="large" icon={<BookOpen size={18} />} onClick={() => document.getElementById('categories').scrollIntoView({ behavior: 'smooth' })} style={{ height: 56, fontSize: 18, borderRadius: 28, borderColor: '#00f2fe', color: '#00f2fe' }}>
                Explore Courses
              </Button>
            </Space>
          </motion.div>
        </Col>
        <Col xs={24} md={12} style={{ textAlign: 'center' }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: "anticipate" }} style={{ position: 'relative', display: 'inline-block' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} style={{ position: 'absolute', inset: -30, background: 'linear-gradient(135deg, #00f2fe, #4facfe)', opacity: 0.2, filter: 'blur(50px)', borderRadius: '50%' }} />
            <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop" alt="AI Learning Visualization" style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))', borderRadius: 24, padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </motion.div>
        </Col>
      </Row>

      {/* Features Section */}
      <div style={{ padding: '60px 48px', background: 'rgba(255,255,255,0.02)' }}>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Row gutter={[24, 24]} justify="center">
            {['AI Chatbot Tutor', 'Personalized Learning Paths', 'Real-time Skill Tracking', 'Smart Job Recommendations'].map((feat, i) => (
              <Col xs={12} md={6} key={i}>
                <motion.div variants={itemVariants}>
                  <Card className="glass-card" bordered={false} style={{ textAlign: 'center', height: '100%', background: 'rgba(255,255,255,0.05)' }}>
                    <Text strong style={{ color: '#fff', fontSize: 16 }}>✨ {feat}</Text>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      </div>

      {/* Explore Skills & Categories */}
      <div id="categories" style={{ padding: '80px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={2} style={{ color: '#fff' }}>Invest In Your Education</Title>
          <Text style={{ color: '#94a3b8', fontSize: 16 }}>Explore Top Courses & Certifications</Text>
        </div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Row gutter={[24, 24]} justify="center">
            {categories.map((cat, i) => (
              <Col xs={24} md={8} lg={4} key={i}>
                <motion.div variants={itemVariants} whileHover={{ y: -10 }}>
                  <Card className="glass-card" bordered={false} style={{ textAlign: 'center', padding: 20, height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ marginBottom: 16 }}>{cat.icon}</div>
                    <Title level={5} style={{ color: '#fff' }}>{cat.title}</Title>
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>{cat.desc}</Text>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>

        <div style={{ marginTop: 80, textAlign: 'center' }}>
          <Title level={3} style={{ color: '#fff', marginBottom: 32 }}>Explore Popular Career Paths</Title>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            {paths.map((p, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.1 }} style={{ padding: '14px 28px', background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.3)', borderRadius: 30, color: '#00f2fe', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 242, 254, 0.2)' }}>
                {p}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#020617', padding: '40px 48px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Title level={4} style={{ color: '#fff', display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
          <Sparkles size={20} color="#00f2fe" /> AI Edu Core
        </Title>
        <Text style={{ color: '#64748b', display: 'block', marginBottom: 24 }}>Empowering students with AI-driven personalization.</Text>
        <Space size="large">
          <Button type="text" href="mailto:contact@aiedu.com" icon={<Mail color="#94a3b8" />}>Contact</Button>
          <Button type="text" href="https://github.com" target="_blank" icon={<Github color="#94a3b8" />}>GitHub</Button>
          <Button type="text" href="https://linkedin.com" target="_blank" icon={<Twitter color="#94a3b8" />}>LinkedIn</Button>
        </Space>
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', color: '#475569', fontSize: 12 }}>
          © {new Date().getFullYear()} AI Edu Core. All rights reserved. Hackathon Final Edition.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
