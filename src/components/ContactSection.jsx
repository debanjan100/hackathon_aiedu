import React from 'react';
import { Row, Col, Typography } from 'antd';
import { Mail, Github, Linkedin } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const { Title, Text } = Typography;

const contactLinks = [
  {
    icon: <Mail size={32} color="#00FFFF" />,
    label: "ghoruidebanjan@gmail.com",
    link: "mailto:ghoruidebanjan@gmail.com",
    external: false
  },
  {
    icon: <Github size={32} color="#00FFFF" />,
    label: "debanjan100",
    link: "https://github.com/debanjan100",
    external: true
  },
  {
    icon: <Linkedin size={32} color="#00FFFF" />,
    label: "Debanjan Ghorui",
    link: "https://www.linkedin.com/in/debanjanghorui5567/",
    external: true
  }
];

const ContactSection = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section style={{ backgroundColor: '#0a0a0f', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Title level={2} className="text-gradient" style={{ fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '0 0 16px 0' }}>
          Let's Connect
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 18, marginBottom: 56, display: 'block' }}>
          Have questions, ideas, or want to collaborate? Reach out directly.
        </Text>

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
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: '40px 24px',
                  backdropFilter: 'blur(8px)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.04, borderColor: '#00FFFF', boxShadow: '0 0 20px rgba(0,255,255,0.2)' }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ marginBottom: 16 }}>
                  {item.icon}
                </div>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                  {item.label}
                </Text>
              </motion.a>
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ marginTop: 80, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 32 }}>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          © 2025 AI Edu. Built with ❤️ for the Hackathon.
        </Text>
      </div>
    </section>
  );
};

export default ContactSection;
