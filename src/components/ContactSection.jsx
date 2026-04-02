import React from 'react';
import { Row, Col, Typography } from 'antd';
import { Mail, Github, Linkedin, ArrowRight, MessageSquare } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const { Title, Text } = Typography;

const contactLinks = [
  {
    icon: <Mail size={32} color="#00f2fe" />,
    label: "ghoruidebanjan@gmail.com",
    link: "mailto:ghoruidebanjan@gmail.com",
    external: false
  },
  {
    icon: <Github size={32} color="#6366f1" />,
    label: "debanjan100",
    link: "https://github.com/debanjan100",
    external: true
  },
  {
    icon: <Linkedin size={32} color="#0ea5e9" />,
    label: "Debanjan Ghorui",
    link: "https://www.linkedin.com/in/debanjanghorui5567/",
    external: true
  }
];

const ContactSection = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section style={{ backgroundColor: '#0f172a', padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Blurs */}
      <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,242,254,0.15) 0%, transparent 60%)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)', filter: 'blur(40px)' }} />

      <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(99,102,241,0.1)', borderRadius: 999, border: '1px solid rgba(99,102,241,0.2)', marginBottom: 24 }}
          >
            <MessageSquare size={16} color="#00f2fe" />
            <Text style={{ color: '#00f2fe', fontWeight: 600, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Get In Touch</Text>
          </motion.div>
          <Title level={2} style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(2.5rem, 5vw, 4rem)', margin: '0 0 16px 0', lineHeight: 1.1 }}>
            Let's build something <br/> <span style={{ background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>extraordinary together.</span>
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: 18, maxWidth: 600, margin: '0 auto', display: 'block', lineHeight: 1.6 }}>
            Whether you have a question about the platform, want to share some feedback, or just want to say hi, my inbox is always open!
          </Text>
        </div>

        <Row gutter={[24, 24]} justify="center">
          {contactLinks.map((item, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <motion.a
                href={item.link}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 32,
                  padding: '48px 24px',
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease'
                }}
                whileHover={shouldReduceMotion ? {} : { y: -8, borderColor: 'rgba(0,242,254,0.3)', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              >
                {/* Glow behind icon */}
                <div style={{ position: 'absolute', top: 40, background: item.icon.props.color, width: 60, height: 60, filter: 'blur(30px)', opacity: 0.2, borderRadius: '50%' }} />
                
                <div style={{ background: 'rgba(15,23,42,0.5)', padding: 16, borderRadius: 24, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 2 }}>
                  {item.icon}
                </div>
                
                <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: 700, marginBottom: 8, position: 'relative', zIndex: 2 }}>
                  {item.label}
                </Text>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.7, zIndex: 2 }}>
                  <Text style={{ color: item.icon.props.color, fontSize: 13, fontWeight: 600 }}>Connect</Text>
                  <ArrowRight size={14} color={item.icon.props.color} />
                </div>
              </motion.a>
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ marginTop: 120, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 40, textAlign: 'center' }}>
        <Text style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 700 }}>CognifyX AI</Text>
        <br/>
        <Text style={{ color: '#64748b', fontSize: 14, marginTop: 12, display: 'inline-block' }}>
          © 2026. Designed with passion for the Hackathon.
        </Text>
      </div>
    </section>
  );
};

export default ContactSection;
