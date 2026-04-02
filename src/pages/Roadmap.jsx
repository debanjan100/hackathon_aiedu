import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Card, Button, Drawer, Tag, Spin, Space, Badge, message } from 'antd';
import { 
  Network, Sparkles, CheckCircle, Lock, BrainCircuit,
  MonitorPlay, Code, FileText, Beaker, Factory, Shield, 
  LineChart, Rocket, Palette, Globe, Activity, ArrowRight, BookOpen, Database, Target, Cpu, Layers
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const { Title, Text, Paragraph } = Typography;

// 1. Broad Majors & Nested Derivatives
const STREAMS = [
  { 
    id: 'cs', title: 'Computer Science', icon: <Code size={24} />, color: '#06B6D4',
    subs: [
      { id: 'se', title: 'Software Engineering', noun: 'Systems' },
      { id: 'ds', title: 'Data Science', noun: 'Data' },
      { id: 'cy', title: 'Cybersecurity', noun: 'Threat' },
      { id: 'cl', title: 'Cloud Computing', noun: 'Infrastructure' },
      { id: 'ux', title: 'Spatial Computing', noun: 'Interface' }
    ]
  },
  { 
    id: 'eng', title: 'Hardware Engineering', icon: <Factory size={24} />, color: '#f59e0b',
    subs: [
      { id: 'me', title: 'Mechanical', noun: 'Hardware' },
      { id: 'ee', title: 'Electrical', noun: 'Circuit' },
      { id: 'ae', title: 'Aerospace', noun: 'Orbital' },
      { id: 'cv', title: 'Civil', noun: 'Structural' },
      { id: 'ch', title: 'Chemical', noun: 'Materials' }
    ]
  },
  { 
    id: 'med', title: 'Medicine & Biosciences', icon: <Activity size={24} />, color: '#10b981',
    subs: [
      { id: 'an', title: 'Surgery & Anatomy', noun: 'Surgical' },
      { id: 'ph', title: 'Pharmacology', noun: 'Therapeutics' },
      { id: 'bi', title: 'Bioinformatics', noun: 'Genomic' },
      { id: 'cn', title: 'Neuroscience', noun: 'Cognitive' },
      { id: 'pu', title: 'Epidemiology', noun: 'Population' }
    ]
  },
  { 
    id: 'biz', title: 'Business & Finance', icon: <LineChart size={24} />, color: '#6366f1',
    subs: [
      { id: 'qf', title: 'Quants & Trading', noun: 'Algorithmic' },
      { id: 'vc', title: 'Venture Capital', noun: 'Capital' },
      { id: 'sc', title: 'Global Logistics', noun: 'Supply Chain' },
      { id: 'pm', title: 'Product Management', noun: 'Product' },
      { id: 'st', title: 'Corporate Strategy', noun: 'Strategic' }
    ]
  },
  { 
    id: 'law', title: 'Law & Governance', icon: <Shield size={24} />, color: '#ec4899',
    subs: [
      { id: 'ip', title: 'Intellectual Property', noun: 'Digital Asset' },
      { id: 'it', title: 'International Treaties', noun: 'Global' },
      { id: 'cr', title: 'Civil Rights', noun: 'Advocacy' },
      { id: 'en', title: 'Environmental Law', noun: 'Conservation' },
      { id: 'cl', title: 'Criminal Litigation', noun: 'Litigation' }
    ]
  }
];

// 2. Orthogonal Minors
const MINORS = [
  { id: 'ai', title: 'Artificial Intelligence', modifier: 'AI', icon: <BrainCircuit size={24} />, color: '#8b5cf6' },
  { id: 'qm', title: 'Quantitative Math', modifier: 'Quantitative', icon: <Network size={24} />, color: '#14b8a6' },
  { id: 'su', title: 'Sustainable Tech', modifier: 'Zero-Emission', icon: <Beaker size={24} />, color: '#10b981' },
  { id: 'hp', title: 'Human Psychology', modifier: 'Behavioral', icon: <Sparkles size={24} />, color: '#f43f5e' },
  { id: 'gp', title: 'Global Policy', modifier: 'Regulatory', icon: <Globe size={24} />, color: '#f59e0b' },
];

// 3. Flexible Heuristic Matrix Generator
// Accommodates 1Z0M, 1Z1M, 2Z0M, and 2Z1M scenarios cleanly.
const generateCareers = (stream, selectedZones, minor) => {
  const z1 = selectedZones[0];
  const z2 = selectedZones[1] || null;
  const hasMinor = !!minor;

  let companies = ['FAANG Alliance', 'Venture-Backed Startup', 'Global Research Institute', 'Big Law / Fortune 500'];
  if (hasMinor && minor.id === 'ai') companies = ['OpenAI / DeepMind', 'Anthropic Labs', 'Tesla Autopilot'];
  if (hasMinor && minor.id === 'qm') companies = ['Jane Street', 'Citadel Securities', 'Renaissance Tech'];
  if (hasMinor && minor.id === 'su') companies = ['Rivian / Tesla', 'Global ESG Fund', 'US Dept of Energy'];

  const outputs = [];

  // Scenario A: Purist (1 Zone, No Minor)
  if (!z2 && !hasMinor) {
    outputs.push({ id: 'sc-a-1', title: `Core ${z1.title} Engineer`, xp: 12000, company: companies[0], desc: `Master the absolute foundational principles scaling purely across ${z1.title} architectures.` });
    outputs.push({ id: 'sc-a-2', title: `Principal ${z1.noun} Lead`, xp: 15000, company: companies[1], desc: `Direct top-level operations focusing explicitly on deep ${z1.noun.toLowerCase()} mastery.` });
    outputs.push({ id: 'sc-a-3', title: `${z1.noun} Systems Architect`, xp: 18000, company: companies[3], desc: `Architect the overarching layout for structural ${z1.noun.toLowerCase()} paradigms in production.` });
  }
  // Scenario B: Augmented Purist (1 Zone, 1 Minor)
  else if (!z2 && hasMinor) {
    outputs.push({ id: 'sc-b-1', title: `${minor.modifier} ${z1.noun} Architect`, xp: 20000, company: companies[0], desc: `Lead the direct fusion of ${minor.title.toLowerCase()} inside foundational ${z1.noun.toLowerCase()} frameworks.` });
    outputs.push({ id: 'sc-b-2', title: `${minor.modifier} ${z1.title} Developer`, xp: 16000, company: companies[1], desc: `Implement cutting edge ${minor.modifier.toLowerCase()} applications bridging basic ${z1.title.toLowerCase()} data outputs.` });
    outputs.push({ id: 'sc-b-3', title: `Advanced ${minor.modifier} Analytics Lead`, xp: 22000, company: companies[0], desc: `Oversee ${minor.modifier.toLowerCase()} algorithmic progression targeted squarely at ${z1.noun.toLowerCase()} verticals.` });
  }
  // Scenario C: Interdisciplinary Matrix (2 Zones, No Minor)
  else if (z2 && !hasMinor) {
    outputs.push({ id: 'sc-c-1', title: `${z1.noun}-${z2.noun} Integration Engineer`, xp: 18000, company: companies[2], desc: `Pioneer the exact intersection coupling ${z1.title.toLowerCase()} data with ${z2.title.toLowerCase()} operational pipelines.` });
    outputs.push({ id: 'sc-c-2', title: `${z1.noun} Domain Automation Lead`, xp: 15000, company: companies[1], desc: `Develop seamless internal workflows utilizing heavy ${z2.noun.toLowerCase()} mechanics atop ${z1.noun.toLowerCase()} systems.` });
    outputs.push({ id: 'sc-c-3', title: `Interdisciplinary ${z2.noun} Analyst`, xp: 16000, company: companies[3], desc: `Extract critical analysis by leveraging pure ${z1.noun.toLowerCase()} pipelines directly applied to ${z2.noun.toLowerCase()} verticals.` });
  }
  // Scenario D: The God-Matrix (2 Zones, 1 Minor)
  else if (z2 && hasMinor) {
    outputs.push({ id: 'sc-d-1', title: `${minor.modifier} ${z1.noun}-${z2.noun} Architect`, xp: 25000, company: companies[0], desc: `Lead extreme ${minor.title.toLowerCase()} integrations across highly volatile tri-brid ${z1.noun.toLowerCase()}-${z2.noun.toLowerCase()} infrastructures.` });
    outputs.push({ id: 'sc-d-2', title: `${z1.noun} ${minor.modifier} Consultant`, xp: 20000, company: companies[1], desc: `Act as a principal hybrid translating deeply complex ${z1.noun.toLowerCase()} assets using aggressive ${minor.modifier.toLowerCase()} computational pipelines.` });
    outputs.push({ id: 'sc-d-3', title: `Interdisciplinary ${z2.noun} ${minor.modifier} Engineer`, xp: 22000, company: companies[0], desc: `Map raw ${z2.noun.toLowerCase()} schemas explicitly into robust ${minor.modifier.toLowerCase()} frameworks.` });
  }

  return outputs;
};

// 4. Mapped Nodes dynamically assigned via Regex matching
const buildCareerTree = (career, stream) => {
  const nodes = [];
  
  if (career.title.includes('AI') || career.title.includes('Cyber') || career.title.includes('Systems')) {
    nodes.push({ id: 'n1', title: 'Neural Architectures & Transformers', type: 'Core Hub', status: 'completed', xp: 500, est: '3 Weeks', iconName: 'Network', lockReason: null });
    nodes.push({ id: 'n2', title: 'Edge Hardware Deployment Pipelines', type: 'Major Milestone', status: 'active', xp: 1500, est: '4 Weeks', iconName: 'BrainCircuit', lockReason: null });
    nodes.push({ id: 'n3', title: 'Kubernetes Orchestration', type: 'Specialization', status: 'locked', xp: 3500, est: '3 Weeks', iconName: 'MonitorPlay', lockReason: 'Requires Deployment Competency' });
  } 
  else if (career.title.includes('Quantitative') || career.title.includes('Trading') || career.title.includes('Data')) {
    nodes.push({ id: 'n1', title: 'Stochastic Calculus Foundation', type: 'Core Hub', status: 'completed', xp: 500, est: '2 Weeks', iconName: 'LineChart', lockReason: null });
    nodes.push({ id: 'n2', title: 'C++ Low-Latency Logic', type: 'Major Milestone', status: 'active', xp: 2000, est: '6 Weeks', iconName: 'Code', lockReason: null });
    nodes.push({ id: 'n3', title: 'Order Book Micro-structuring', type: 'Specialization', status: 'locked', xp: 4000, est: '4 Weeks', iconName: 'Database', lockReason: 'Requires Low-Latency Algorithm Speed' });
  }
  else if (stream && (stream.id === 'law' || career.title.includes('Policy') || career.title.includes('Consultant') || career.title.includes('Regulatory'))) {
    nodes.push({ id: 'n1', title: 'Constitutional Precedents', type: 'Core Hub', status: 'completed', xp: 500, est: '2 Weeks', iconName: 'BookOpen', lockReason: null });
    nodes.push({ id: 'n2', title: 'Global Compliance Frameworks', type: 'Major Milestone', status: 'active', xp: 1200, est: '4 Weeks', iconName: 'Shield', lockReason: null });
    nodes.push({ id: 'n3', title: 'Trial Litigation Simulation', type: 'Specialization', status: 'locked', xp: 3000, est: '5 Weeks', iconName: 'Target', lockReason: 'Requires Framework Mastery' });
  }
  else {
    nodes.push({ id: 'n1', title: 'Domain Core Fundamentals', type: 'Core Hub', status: 'completed', xp: 500, est: '2 Weeks', iconName: 'BookOpen', lockReason: null });
    nodes.push({ id: 'n2', title: 'Applied Hybrid Methodologies', type: 'Major Milestone', status: 'active', xp: 1200, est: '3 Weeks', iconName: 'Network', lockReason: null });
    nodes.push({ id: 'n3', title: 'Advanced Technical Synthesis', type: 'Specialization', status: 'locked', xp: 3500, est: '4 Weeks', iconName: 'MonitorPlay', lockReason: 'Requires Methodologies Clearance' });
  }

  nodes.push({ id: 'n4', title: `${career.company} Capstone Evaluation`, type: 'Capstone Board', status: 'locked', xp: 5000, est: '2 Weeks', iconName: 'Rocket', lockReason: 'Clearance of Specialization Required for Corporate Interview Phase' });

  return nodes;
};

const Roadmap = () => {
  // State Machine: 1=Stream, 2=Derivatives, 3=Minor, 4=LoadingMatrix, 5=Careers, 6=SkillTree
  const [step, setStep] = useState(1);
  const [stream, setStream] = useState(null);
  const [selectedSubTracks, setSelectedSubTracks] = useState([]); // Array of 1 or 2
  const [minor, setMinor] = useState(null); // Optional
  
  const [careers, setCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [treeNodes, setTreeNodes] = useState([]);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inspectedNode, setInspectedNode] = useState(null);
  const navigate = useNavigate();
  const { openMockInterview } = useOutletContext() || {};
  const { user } = useAuth();

  useEffect(() => {
    if (user?.user_metadata?.roadmap_nodes && user?.user_metadata?.roadmap_career) {
      setTreeNodes(user.user_metadata.roadmap_nodes);
      setSelectedCareer(user.user_metadata.roadmap_career);
      setStep(6);
    }
  }, [user]);

  const handleStreamSelect = (s) => {
    setStream(s);
    setSelectedSubTracks([]);
    setStep(2);
  };

  const toggleSubTrack = (sub) => {
    if (selectedSubTracks.find(t => t.id === sub.id)) {
      setSelectedSubTracks(selectedSubTracks.filter(t => t.id !== sub.id));
    } else {
      if (selectedSubTracks.length < 2) {
        setSelectedSubTracks([...selectedSubTracks, sub]);
      }
    }
  };

  const confirmDerivatives = () => {
    if (selectedSubTracks.length >= 1) setStep(3);
  };

  const handleMinorSelect = (m) => {
    setMinor(m);
    setStep(4);
    
    // Simulate Semantic LLM cross-pollination
    setTimeout(() => {
      setCareers(generateCareers(stream, selectedSubTracks, m));
      setStep(5);
    }, 2800);
  };

  const handleCareerSelect = async (c) => {
    const newNodes = buildCareerTree(c, stream);
    setSelectedCareer(c);
    setTreeNodes(newNodes);
    setStep(6);

    if (user) {
      await supabase.auth.updateUser({
        data: { roadmap_nodes: newNodes, roadmap_career: c }
      });
      
      // Sync strictly structural milestones to the native Study Planner Postgres Schema
      await supabase.from('tasks').delete().eq('user_id', user.id).like('text', 'Complete AI Node:%');
      
      const payload = newNodes.map(n => ({
        user_id: user.id,
        text: `Complete AI Node: ${n.title}`,
        date: null,
        color: 'processing'
      }));
      await supabase.from('tasks').insert(payload);

      message.success("Semantic Trajectory synced to Database! Roadmap & Planner are now active.");
    }
  };

  const resetEngine = async () => {
    setStream(null);
    setSelectedSubTracks([]);
    setMinor(null);
    setSelectedCareer(null);
    setStep(1);

    if (user) {
      await supabase.auth.updateUser({
        data: { roadmap_nodes: null, roadmap_career: null }
      });
      await supabase.from('tasks').delete().eq('user_id', user.id).like('text', 'Complete AI Node:%');
      
      message.info("Semantic Logic Engine Reset. Calendar Trajectories flushed.");
    }
  };

  // Shared Animation Variants
  const fadeSlide = {
    hidden: { opacity: 0, x: -30 },
    shape: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: 30, transition: { duration: 0.3 } }
  };
  
  const bentoVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60, minHeight: '80vh' }}>
      
      {/* Dynamic Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={2} style={{ color: 'var(--text-color)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, letterSpacing: '-0.02em' }}>
          <Layers color={stream ? stream.color : "var(--primary-color)"} size={32} /> 
          Flexible Combinatorics Engine
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 16 }}>
          Layered semantic generation adapting seamlessly to purist or maximalist combinations.
        </Text>
        
        {/* Deep Breadcrumb Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
          {stream && <Tag color="var(--primary-color)" style={{ borderRadius: 12, px: 12, fontSize: 13 }}>{stream.title}</Tag>}
          {selectedSubTracks.map(sub => (
            <Tag key={sub.id} color="cyan" style={{ borderRadius: 12, px: 12, fontSize: 13 }}>| {sub.title}</Tag>
          ))}
          {minor && <Tag color="var(--accent-color)" style={{ borderRadius: 12, px: 12, fontSize: 13 }}>+ {minor.title}</Tag>}
          {selectedCareer && <Tag color="#10b981" style={{ borderRadius: 12, px: 12, fontSize: 13 }}>= {selectedCareer.title}</Tag>}
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: Broad Major */}
        {step === 1 && (
          <motion.div key="step1" variants={fadeSlide} initial="hidden" animate="shape" exit="exit">
            <Title level={4} style={{ color: 'var(--text-color)', textAlign: 'center', marginBottom: 32 }}>1. Select Your Broad Domain Umbrella</Title>
            <Row gutter={[24, 24]} justify="center">
              {STREAMS.map((s) => (
                <Col xs={24} sm={12} md={8} key={s.id}>
                  <Card
                    hoverable
                    onClick={() => handleStreamSelect(s)}
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, height: '100%', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
                    bodyStyle={{ padding: 32 }}
                    className="roadmap-card"
                  >
                    <div style={{ color: s.color, marginBottom: 16 }}>{s.icon}</div>
                    <Title level={5} style={{ color: 'var(--text-color)', margin: 0 }}>{s.title}</Title>
                  </Card>
                </Col>
              ))}
            </Row>
          </motion.div>
        )}

        {/* STEP 2: Dual Derivatives */}
        {step === 2 && stream && (
          <motion.div key="step2" variants={fadeSlide} initial="hidden" animate="shape" exit="exit">
            <Button type="text" onClick={() => setStep(1)} style={{ color: 'var(--text-muted)', marginBottom: 24 }}>← Back to Umbrella Selection</Button>
            <Title level={4} style={{ color: 'var(--text-color)', textAlign: 'center', marginBottom: 8 }}>2. Select One or Two Structural Directives</Title>
            <Text style={{ color: 'var(--text-muted)', textAlign: 'center', display: 'block', marginBottom: 32 }}>A single choice keeps paths generalized; a dual choice forcibly intersects them.</Text>
            
            <Row gutter={[16, 16]} justify="center">
              {stream.subs.map((sub) => {
                const isSelected = selectedSubTracks.find(t => t.id === sub.id) !== undefined;
                return (
                  <Col xs={24} sm={12} md={8} key={sub.id}>
                    <div 
                      onClick={() => toggleSubTrack(sub)}
                      style={{ 
                        padding: 24, 
                        border: isSelected ? `2px solid ${stream.color}` : '1px solid var(--border-color)', 
                        borderRadius: 16, 
                        background: 'var(--bg-secondary)', 
                        textAlign: 'center', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? `0 8px 20px -5px ${stream.color}40` : 'none',
                        position: 'relative'
                      }}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: -10, right: -10, background: stream.color, borderRadius: '50%', padding: 4, display: 'flex' }}>
                          <CheckCircle size={16} color="#fff" />
                        </div>
                      )}
                      <Title level={5} style={{ color: 'var(--text-color)', margin: 0 }}>{sub.title}</Title>
                    </div>
                  </Col>
                );
              })}
            </Row>
            
            <div style={{ textAlign: 'center', marginTop: 40, height: 60 }}>
              <AnimatePresence>
                {selectedSubTracks.length >= 1 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <Button className="gradient-btn" size="large" type="primary" onClick={confirmDerivatives} style={{ borderRadius: 12, padding: '0 40px', fontSize: 16, height: 48, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                      Confirm Structural Vectors
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Minor (OPTIONAL) */}
        {step === 3 && (
          <motion.div key="step3" variants={fadeSlide} initial="hidden" animate="shape" exit="exit">
            <Button type="text" onClick={() => { setSelectedSubTracks([]); setStep(2); }} style={{ color: 'var(--text-muted)', marginBottom: 24 }}>← Re-roll Structural Directives</Button>
            <Title level={4} style={{ color: 'var(--text-color)', textAlign: 'center', marginBottom: 32 }}>3. Optional Orthogonal Specialization (Minor)</Title>
            <Row gutter={[24, 24]} justify="center">
              {MINORS.map((m) => (
                <Col xs={24} sm={12} md={8} key={m.id}>
                  <Card
                    hoverable
                    onClick={() => handleMinorSelect(m)}
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, height: '100%', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
                    bodyStyle={{ padding: 32 }}
                    className="roadmap-card"
                  >
                    <div style={{ color: m.color, marginBottom: 16 }}>{m.icon}</div>
                    <Title level={5} style={{ color: 'var(--text-color)', margin: 0 }}>{m.title}</Title>
                  </Card>
                </Col>
              ))}
            </Row>

            <div style={{ textAlign: 'center', marginTop: 40 }}>
               <Button type="default" size="large" onClick={() => handleMinorSelect(null)} style={{ background: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-muted)', borderRadius: 12, padding: '0 40px', fontSize: 16, height: 48 }}>
                  Skip Specialization (Keep Course Purist)
               </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Loading Semantic Hybridization */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 24 }}>
              <Text style={{ color: 'var(--primary-color)', fontFamily: 'monospace', letterSpacing: '1px', fontSize: 16 }}>
                Synthesizing Dynamic Output Matrix...
              </Text>
              <br/>
              <Text style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12, display: 'block' }}>
                Evaluating {selectedSubTracks.length} domain parameter(s)
                {minor ? ` against Orthogonal [${minor.modifier}] mechanics.` : ` directly in a native purist vacuum.`}
              </Text>
            </div>
          </motion.div>
        )}

        {/* STEP 5: Career Outputs */}
        {step === 5 && (
          <motion.div key="step5" variants={fadeSlide} initial="hidden" animate="shape" exit="exit">
            <Button type="text" onClick={() => setStep(3)} style={{ color: 'var(--text-muted)', marginBottom: 24 }}>← Abort Generator Loop</Button>
            <Title level={4} style={{ color: 'var(--text-color)', textAlign: 'center', marginBottom: 40 }}>4. Confirm Heuristically Generated Trajectory</Title>
            <Row gutter={[24, 24]} justify="center">
              {careers.map((c, i) => (
                <Col xs={24} md={12} lg={10} key={c.id}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
                    <div 
                      className="glass-card" 
                      onClick={() => handleCareerSelect(c)}
                      style={{ padding: 32, height: '100%', cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: 16, background: 'var(--bg-secondary)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,242,254,0.1)'; e.currentTarget.style.borderColor = 'var(--primary-color)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
                    >
                      <Layers color="var(--primary-color)" size={24} style={{ marginBottom: 16 }} />
                      <Title level={3} style={{ color: 'var(--text-color)', marginTop: 0, letterSpacing: '-0.02em', marginBottom: 8, lineHeight: 1.3 }}>{c.title}</Title>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Tag color="purple" style={{ border: 'none', margin: 0 }}>Target: {c.company}</Tag>
                      </div>

                      <Text style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, flexGrow: 1, marginBottom: 24 }}>
                        {c.desc}
                      </Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                        <Text style={{ color: 'var(--primary-color)', fontFamily: 'monospace', fontWeight: 600 }}>{c.xp} XP Baseline</Text>
                        <ArrowRight size={18} color="var(--text-muted)" />
                      </div>
                    </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        )}

        {/* STEP 6: The Final Skill Tree */}
        {step === 6 && (
          <motion.div key="step6" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } }} initial="hidden" animate="visible" style={{ position: 'relative', marginTop: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
              <Button type="default" onClick={resetEngine} style={{ background: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-color)', borderRadius: 20 }}>
                Reset Structural Engine
              </Button>
            </div>
            
            {/* The Central Glowing SVG Backbone */}
            <div style={{ position: 'absolute', top: 60, bottom: 0, left: '50%', width: 2, background: 'linear-gradient(to bottom, #10b981 0%, var(--primary-color) 100%)', transform: 'translateX(-50%)', zIndex: 0, opacity: 0.5, filter: 'blur(1px)' }} />

            {/* Render Nodes in a Winding Flow */}
            {treeNodes.map((node, i) => {
              const isLeft = i % 2 === 0;
              const isLocked = node.status === 'locked';
              const isCompleted = node.status === 'completed';
              const isActive = node.status === 'active';
              
              const nodeColor = isCompleted ? '#10b981' : isActive ? 'var(--primary-color)' : 'var(--border-color)';
              
              const IconDict = { Network, BrainCircuit, MonitorPlay, LineChart, Code, Database, BookOpen, Shield, Target, Rocket };
              const DynamicIcon = IconDict[node.iconName] || BookOpen;
              
              return (
                <motion.div variants={bentoVariants} key={node.id} style={{ display: 'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end', alignItems: 'center', position: 'relative', margin: '40px 0', zIndex: 1, width: '100%' }}>
                  
                  <div style={{ width: '45%', display: 'flex', justifyContent: isLeft ? 'flex-end' : 'flex-start' }}>
                    <Card
                      hoverable={!isLocked}
                      onClick={() => { setInspectedNode(node); setDrawerOpen(true); }}
                      style={{ 
                        width: '100%', maxWidth: 380, 
                        background: isLocked ? 'var(--bg-primary)' : 'var(--bg-secondary)', 
                        borderColor: isActive ? 'var(--primary-color)' : 'var(--border-color)',
                        opacity: isLocked ? 0.6 : 1,
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        transform: isActive ? 'scale(1.02)' : 'none',
                        boxShadow: isActive ? '0 0 24px rgba(6,182,212,0.15)' : 'none'
                      }}
                      bodyStyle={{ padding: '20px' }}
                    >
                      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                        <Tag color={isCompleted ? 'success' : isActive ? 'processing' : 'default'} style={{ borderRadius: 12, margin: 0, border: 'none', px: 12, background: 'var(--bg-primary)' }}>
                          {node.type}
                        </Tag>
                        {isCompleted && <CheckCircle size={18} color="#10b981" />}
                        {isLocked && <Lock size={18} color="var(--text-muted)" />}
                        {isActive && <Badge status="processing" color="var(--primary-color)" />}
                      </Row>
                      
                      <Title level={4} style={{ color: isLocked ? 'var(--text-muted)' : 'var(--text-color)', margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>
                        {node.title}
                      </Title>
                      
                      <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                        <Text style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'monospace' }}>+{node.xp} XP</Text>
                        <Text style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'monospace' }}>~{node.est}</Text>
                      </div>
                    </Card>
                  </div>

                  <div style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, 0)', width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-primary)', border: `3px solid ${nodeColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: isActive ? `0 0 15px ${nodeColor}` : 'none' }}>
                    {isCompleted ? <CheckCircle size={20} color={nodeColor} /> : isLocked ? <Lock size={18} color={nodeColor} /> : <DynamicIcon size={20} color={nodeColor} />}
                  </div>

                  <div style={{ position: 'absolute', left: isLeft ? '45%' : '50%', width: '5%', height: 2, background: nodeColor, zIndex: 0, opacity: 0.5 }} />
                  
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Node Inspection Drawer */}
      <Drawer
        title={<span style={{ color: 'var(--text-color)' }}>Industry Execution Node</span>}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={400}
        rootClassName="glass-drawer"
        styles={{ body: { background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' } }}
      >
        {inspectedNode && selectedCareer && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-color)', marginBottom: 16 }}>
                {(() => {
                  const IconDict = { Network, BrainCircuit, MonitorPlay, LineChart, Code, Database, BookOpen, Shield, Target, Rocket };
                  const DrawerIcon = IconDict[inspectedNode.iconName] || BookOpen;
                  return <DrawerIcon size={32} color="var(--primary-color)" />;
                })()}
              </div>
              <Title level={3} style={{ color: 'var(--text-color)', margin: '0 0 8px 0', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{inspectedNode.title}</Title>
              <Tag color="purple" style={{ border: 'none', background: 'var(--bg-primary)' }}>{inspectedNode.type}</Tag>
            </div>

            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: 'var(--text-muted)' }}>Status</Text>
                  <Text style={{ color: 'var(--text-color)', fontWeight: 600, textTransform: 'capitalize' }}>{inspectedNode.status}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: 'var(--text-muted)' }}>XP Reward</Text>
                  <Text style={{ color: 'var(--primary-color)', fontWeight: 700, fontFamily: 'monospace' }}>+{inspectedNode.xp}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: 'var(--text-muted)' }}>Target Infrastructure</Text>
                  <Text style={{ color: 'var(--text-color)', fontWeight: 600 }}>{selectedCareer.company}</Text>
                </div>
              </Space>
            </div>

            <Paragraph style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 16 }}>
              This specific operational node is a hard compliance requirement for the <strong>{selectedCareer.title}</strong> pipeline. Clearing this module unlocks the downstream practical assessments generated by the Semantic Parser.
            </Paragraph>

            <div style={{ marginTop: 'auto', paddingTop: 24 }}>
              {inspectedNode.status === 'locked' ? (
                <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
                  <Lock size={20} color="#ef4444" style={{ marginBottom: 8 }} />
                  <Text style={{ color: '#ef4444', display: 'block', fontWeight: 600 }}>Prerequisite Missing</Text>
                  <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>{inspectedNode.lockReason}</Text>
                </div>
              ) : inspectedNode.status === 'completed' ? (
                <Button block size="large" type="default" style={{ height: 50, borderRadius: 12, background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                  Review Material
                </Button>
              ) : (
                <Button 
                  className="gradient-btn" block size="large" type="primary" 
                  style={{ height: 50, borderRadius: 12, fontSize: 16 }}
                  onClick={() => {
                    if (inspectedNode.type === 'Capstone Board') {
                      if (openMockInterview) {
                        openMockInterview(inspectedNode.title + " for the role of " + selectedCareer.title);
                        setDrawerOpen(false);
                      } else {
                        message.warning('Interview system unresponsive.');
                      }
                    } else {
                      navigate('/dashboard/course/sandbox-' + encodeURIComponent(inspectedNode.title.toLowerCase().replace(/\s+/g, '-')));
                    }
                  }}
                >
                  {inspectedNode.type === 'Capstone Board' ? 'Commence FAANG Interview' : 'Initialize Node Sandbox'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
};

export default Roadmap;
