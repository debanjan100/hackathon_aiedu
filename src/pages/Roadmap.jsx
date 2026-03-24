import React from 'react';
import { Row, Col, Card, Typography, Button, Tag, Divider, message } from 'antd';
import { motion } from 'framer-motion';
import { Sparkles, Map, Target, Briefcase, Code, Database, Compass, GraduationCap, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';

const { Title, Text } = Typography;

const careerPaths = [
  {
    title: 'Data Scientist',
    icon: <Database size={24} color="#faad14" />,
    color: '#faad14',
    steps: ['Python Basics', 'Statistics & Probability', 'Pandas & NumPy', 'Machine Learning Models', 'Deep Learning', 'Capstone Projects']
  },
  {
    title: 'Full Stack Developer',
    icon: <Code size={24} color="#00f2fe" />,
    color: '#00f2fe',
    steps: ['HTML / CSS', 'JavaScript (ES6+)', 'React.js', 'Node.js & Express', 'MongoDB / SQL', 'System Design']
  },
  {
    title: 'Cloud Engineer',
    icon: <Cpu size={24} color="#1890ff" />,
    color: '#1890ff',
    steps: ['Linux Foundation', 'Computer Networking', 'Cloud Platforms (AWS/Azure)', 'Docker Containers', 'Kubernetes Orchestration', 'CI/CD Pipelines']
  },
  {
    title: 'Game Developer',
    icon: <Target size={24} color="#722ed1" />,
    color: '#722ed1',
    steps: ['C++ / C# Fundamentals', 'Unity / Unreal Engine', 'Game Physics', '3D Graphics', 'AI in Gaming', 'Multiplayer Networking']
  }
];

const genAiTools = [
  { title: 'Chatbot Tutor', desc: 'Ask doubts in real-time instantly.' },
  { title: 'Code Generator', desc: 'Get AI to bootstrap your next project.' },
  { title: 'Notes Summarizer', desc: 'Upload PDFs to get bullet-point summaries.' },
  { title: 'Quiz Generator', desc: 'Dynamic test generation based on weak topics.' }
];

const Roadmap = () => {
  const { user } = useAuth();
  
  const handleEnroll = async (pathTitle) => {
    if (!user) return message.error('You must log in to enroll in a path.');
    
    const { error } = await supabase
      .from('users')
      .update({ current_roadmap: pathTitle })
      .eq('id', user.id);
      
    if (error && !error.message.includes('fetch')) {
      message.error('Database connection failed: ' + error.message);
    } else {
      message.success(`Successfully enrolled in ${pathTitle}! 🚀 Learning path activated.`);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Smart Path Header */}
      <div style={{ background: 'var(--card-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-color)', borderRadius: 24, padding: '40px 32px', marginBottom: 32, textAlign: 'center' }}>
        <Title level={2} style={{ color: 'var(--text-color)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Compass color="#00f2fe" size={36} /> 
          Smart Path Engine
        </Title>
        <Text style={{ color: '#94a3b8', fontSize: 16, maxWidth: 600, display: 'inline-block' }}>
          Your personalized AI Curriculum Transformation. We analyze your skill level, identify weak topics, and build your exact career roadmap from zero to professional.
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* GenAI Tools Section */}
        <Col xs={24} lg={8}>
          <Card className="glass-card" bordered={false} title={<><Sparkles color="#722ed1" size={18} style={{ marginRight: 8 }}/> <span style={{ color: 'var(--text-color)' }}>GenAI Learning Tools</span></>} style={{ height: '100%' }}>
            {genAiTools.map((tool, idx) => (
              <motion.div key={idx} whileHover={{ x: 10 }} style={{ marginBottom: 16, padding: 16, background: 'var(--card-bg)', borderRadius: 12, borderLeft: '4px solid #722ed1' }}>
                <Title level={5} style={{ color: '#e2e8f0', margin: '0 0 4px 0' }}>{tool.title}</Title>
                <Text style={{ color: '#94a3b8', fontSize: 13 }}>{tool.desc}</Text>
              </motion.div>
            ))}
          </Card>
        </Col>

        {/* Personalized Learning System */}
        <Col xs={24} lg={16}>
          <Card className="glass-card" bordered={false} title={<><GraduationCap color="#52c41a" size={18} style={{ marginRight: 8 }}/> <span style={{ color: 'var(--text-color)' }}>Personalized Learning System</span></>}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div style={{ padding: 20, textAlign: 'center', background: 'rgba(82, 196, 26, 0.1)', borderRadius: 16, border: '1px solid rgba(82, 196, 26, 0.3)' }}>
                  <Title level={3} style={{ color: '#52c41a', margin: 0 }}>Adaptive</Title>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>Difficulty Scaling</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ padding: 20, textAlign: 'center', background: 'rgba(250, 173, 20, 0.1)', borderRadius: 16, border: '1px solid rgba(250, 173, 20, 0.3)' }}>
                  <Title level={3} style={{ color: '#faad14', margin: 0 }}>Detection</Title>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>Weak Topics Identified</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ padding: 20, textAlign: 'center', background: 'rgba(0, 242, 254, 0.1)', borderRadius: 16, border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                  <Title level={3} style={{ color: '#00f2fe', margin: 0 }}>Daily</Title>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>Recommendations</Text>
                </div>
              </Col>
            </Row>
            <Divider style={{ borderColor: 'var(--border-color)' }} />
            <Text style={{ color: '#94a3b8' }}>Based on your baseline Assessment, the AI has generated the following Career Roadmaps just for you.</Text>
          </Card>
        </Col>
      </Row>

      {/* AI Career Roadmaps */}
      <Title level={3} style={{ color: 'var(--text-color)', marginTop: 48, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Briefcase color="#faad14" /> AI Career Roadmaps
      </Title>

      <Row gutter={[24, 24]}>
        {careerPaths.map((path, idx) => (
          <Col xs={24} md={12} key={idx}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={{ scale: 1.02 }}>
              <Card 
                className="glass-card" 
                bordered={false}
                style={{ height: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `rgba(${path.color === '#00f2fe' ? '0,242,254' : path.color === '#1890ff' ? '24,144,255' : path.color === '#722ed1' ? '114,46,209' : '250,173,20'}, 0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {path.icon}
                  </div>
                  <Title level={4} style={{ color: 'var(--text-color)', margin: 0 }}>{path.title}</Title>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {path.steps.map((step, sIdx) => (
                    <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-secondary)', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold' }}>
                        {sIdx + 1}
                      </div>
                      <Text style={{ color: '#e2e8f0', fontSize: 14 }}>{step}</Text>
                    </div>
                  ))}
                </div>

                <Button type="primary" block style={{ marginTop: 24, background: path.color, borderColor: path.color, borderRadius: 8 }} onClick={() => handleEnroll(path.title)}>
                  Enroll in Path
                </Button>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Roadmap;
