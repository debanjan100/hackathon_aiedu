import React, { useState, useMemo } from 'react';
import { Typography, Card, Tag, Select, Row, Col, Button, Input, message } from 'antd';
import { BookOpen, AlertCircle, PlayCircle, Download, Search, Filter, Mic } from 'lucide-react';
import { useParams, useOutletContext } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import CodeEditor from '../components/CodeEditor';
import CaseStudyEditor from '../components/CaseStudyEditor';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const Course = () => {
  const { topicId } = useParams();
  const { openMockInterview } = useOutletContext() || {};
  const { user } = useAuth();
  
  const major = user?.user_metadata?.course || 'Computer Science';

  const domainData = useMemo(() => {
    if (major.includes('Pre-Med')) {
      return {
        topics: ['All', 'Anatomy', 'Pharmacology', 'Diagnostics', 'Ethics'],
        questions: [
          { id: 'm1', topic: 'Anatomy', q: 'Skeletal System Identification', difficulty: 'Easy' },
          { id: 'm2', topic: 'Anatomy', q: 'Cardiovascular Pathways', difficulty: 'Medium' },
          { id: 'p1', topic: 'Pharmacology', q: 'Antibiotic Prescriptions', difficulty: 'Hard' },
          { id: 'd1', topic: 'Diagnostics', q: 'Type 1 Diabetes Symptoms', difficulty: 'Medium' }
        ],
        title: 'Medical Training Arena',
        subtitle: 'Diagnose patients and perfect your medical knowledge.',
        iconColor: '#10b981'
      };
    } else if (major.includes('Business')) {
      return {
        topics: ['All', 'Macroeconomics', 'Startups', 'Corporate Finance', 'Marketing'],
        questions: [
          { id: 'b1', topic: 'Macroeconomics', q: 'Inflation Impact Analysis', difficulty: 'Hard' },
          { id: 'b2', topic: 'Startups', q: 'Seed Funding Pitch Deck', difficulty: 'Medium' },
          { id: 'b3', topic: 'Corporate Finance', q: 'Q3 Earnings Interpretation', difficulty: 'Medium' }
        ],
        title: 'Business Strategy Arena',
        subtitle: 'Resolve corporate crises and analyze macroeconomic market trends.',
        iconColor: '#f59e0b'
      };
    } else if (major.includes('Law')) {
      return {
        topics: ['All', 'Constitutional Law', 'Contracts', 'Criminal Defense'],
        questions: [
          { id: 'l1', topic: 'Constitutional Law', q: 'First Amendment Rights', difficulty: 'Hard' },
          { id: 'l2', topic: 'Contracts', q: 'Breach of NDA', difficulty: 'Medium' }
        ],
        title: 'Legal Defense Arena',
        subtitle: 'Defend your clients and deconstruct classical constitutional lawsuits.',
        iconColor: '#8b5cf6'
      };
    } else if (major.includes('Humanities')) {
       return {
        topics: ['All', 'Philosophy', 'Literature', 'History'],
        questions: [
          { id: 'h1', topic: 'Philosophy', q: 'The Allegory of the Cave', difficulty: 'Medium' },
          { id: 'h2', topic: 'Literature', q: 'Shakespearean Motifs', difficulty: 'Easy' }
        ],
        title: 'Humanities Arena',
        subtitle: 'Deconstruct philosophy and engage in classical literary analysis.',
        iconColor: '#ec4899'
      };
    }
    return {
      topics: ['All', 'Arrays', 'Matrix', 'String', 'Searching & Sorting', 'Linked List', 'Stack/Queue', 'Tree', 'Graph', 'DP & Greedy'],
      questions: [
        { id: 'a1', topic: 'Arrays', q: 'Pair with given Sum', difficulty: 'Easy' },
        { id: 'a2', topic: 'Arrays', q: 'Best Time to Buy and Sell Stock', difficulty: 'Easy' },
        { id: 's1', topic: 'String', q: 'Longest Palindromic Substring', difficulty: 'Medium' },
        { id: 'll1', topic: 'Linked List', q: 'Reverse Linked List', difficulty: 'Easy' },
        { id: 'sq1', topic: 'Stack/Queue', q: 'Next Greater Element', difficulty: 'Medium' },
        { id: 't1', topic: 'Tree', q: 'Maximum Depth', difficulty: 'Easy' },
        { id: 'g1', topic: 'Graph', q: 'Number of Islands', difficulty: 'Medium' },
        { id: 'dp1', topic: 'DP & Greedy', q: 'Knapsack', difficulty: 'Medium' }
      ],
      title: 'DSA Master Practice Room',
      subtitle: 'Solve hand-picked questions across crucial algorithmic topics to guarantee your interview success.',
      iconColor: 'var(--primary-color)'
    };
  }, [major]);

  const isSandboxMode = topicId?.startsWith('sandbox-');
  const sandboxTitle = isSandboxMode ? decodeURIComponent(topicId.replace('sandbox-', '')).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

  const topics = isSandboxMode ? ['All', 'Generative Module'] : domainData.topics;
  const allQuestions = isSandboxMode ? [
    { id: 'sbx1', topic: 'Generative Module', q: sandboxTitle + ' Mastery Challenge', difficulty: 'Adaptive' }
  ] : domainData.questions;

  const initialTopic = isSandboxMode ? 'Generative Module' : (topicId && topicId !== 'practice' 
    ? topics.find(t => t.toLowerCase().includes(topicId)) || 'All' 
    : 'All');

  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState(initialTopic);
  const [filterDiff, setFilterDiff] = useState('All');
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);

  const handleOpenEditor = (questionName) => {
    setActiveQuestion(questionName);
    if (major.includes('Computer Science')) {
      setIsEditorOpen(true);
    } else {
      setIsCaseStudyOpen(true);
    }
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'Easy': return '#52c41a';
      case 'Medium': return '#faad14';
      case 'Hard': return '#ff4d4f';
      default: return '#1677ff';
    }
  };

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(item => {
      const matchSearch = item.q.toLowerCase().includes(search.toLowerCase());
      const matchTopic = filterTopic === 'All' || item.topic === filterTopic;
      const matchDiff = filterDiff === 'All' || item.difficulty === filterDiff;
      return matchSearch && matchTopic && matchDiff;
    });
  }, [search, filterTopic, filterDiff, allQuestions]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header section with Glassmorphism */}
      <div style={{ background: 'var(--card-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 32, marginBottom: 32 }}>
        <Row justify="space-between" align="middle" style={{ flexWrap: 'wrap', gap: 16 }}>
          <Col xs={24} md={14}>
            <Title level={2} style={{ color: 'var(--heading-color)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <BookOpen color={domainData.iconColor} size={32} /> 
              {isSandboxMode ? 'AI Generative Sandbox' : domainData.title}
            </Title>
            <Text style={{ color: 'var(--text-secondary)' }}>
              {isSandboxMode ? `Llama-3 architecture dynamically provisioning environment for: ${sandboxTitle}` : domainData.subtitle}
            </Text>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Button icon={<Download size={16}/>} type="primary" className="gradient-btn" style={{ borderRadius: 8, padding: '0 24px', height: 40 }} onClick={() => message.success('Downloading Master DSA PDF Notes...')}>
              Download Notes
            </Button>
          </Col>
        </Row>
      </div>

      {/* Filters & Search section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={10}>
          <Input 
            size="large" 
            placeholder="Search questions..." 
            prefix={<Search size={18} color="#94a3b8" />} 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: 12 }}
          />
        </Col>
        <Col xs={12} md={7}>
          <Select 
            value={filterTopic} 
            onChange={setFilterTopic} 
            size="large" 
            style={{ width: '100%' }}
            dropdownStyle={{ background: '#1e293b', border: '1px solid #334155' }}
          >
            {topics.map(t => <Option key={t} value={t} style={{ color: '#e2e8f0' }}>Topic: {t}</Option>)}
          </Select>
        </Col>
        <Col xs={12} md={7}>
          <Select 
            value={filterDiff} 
            onChange={setFilterDiff} 
            size="large" 
            style={{ width: '100%' }}
            dropdownStyle={{ background: '#1e293b', border: '1px solid #334155' }}
          >
            <Option value="All" style={{ color: '#e2e8f0' }}>Difficulty: All</Option>
            <Option value="Easy" style={{ color: '#e2e8f0' }}>Easy</Option>
            <Option value="Medium" style={{ color: '#e2e8f0' }}>Medium</Option>
            <Option value="Hard" style={{ color: '#e2e8f0' }}>Hard</Option>
          </Select>
        </Col>
      </Row>

      {/* Questions Grid using Framer Motion */}
      <Row gutter={[16, 16]}>
        <AnimatePresence>
          {filteredQuestions.map((item, index) => (
            <Col xs={24} sm={12} md={8} key={item.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
                whileHover={{ scale: 1.03, y: -5 }} // Smooth hover scaling requested
                style={{ height: '100%' }}
              >
                <Card 
                  className="glass-card" 
                  bordered={false} 
                  style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px 8px', overflow: 'hidden' }}
                  bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                  <div style={{ width: 'calc(100% + 16px)', margin: '-16px -8px 16px -8px', height: 120, backgroundImage: 'url("https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid var(--border-color)' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Tag style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 12, padding: '2px 10px' }}>
                      {item.topic}
                    </Tag>
                    <Tag color={getDifficultyColor(item.difficulty)} style={{ background: 'transparent', border: `1px solid ${getDifficultyColor(item.difficulty)}`, borderRadius: 12 }}>
                      {item.difficulty}
                    </Tag>
                  </div>
                  
                  <Title level={5} style={{ color: '#e2e8f0', margin: '0 0 24px 0', flex: 1, fontSize: 16, lineHeight: 1.4 }}>
                    {item.q}
                  </Title>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                     <Button 
                       type="primary" 
                       ghost 
                       icon={<PlayCircle size={16} />}
                       style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)', borderRadius: 8, flex: 1 }}
                       onClick={() => handleOpenEditor(item.q)}
                     >
                       Solve
                     </Button>
                     <Button 
                       style={{ background: '#faad14', color: '#000', border: 'none', borderRadius: 8, flex: 1 }}
                       icon={<Mic size={16} />}
                       onClick={() => openMockInterview ? openMockInterview(item.q) : message.info("Opening Interview Mode...")}
                     >
                       Interview
                     </Button>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </AnimatePresence>
        
        {filteredQuestions.length === 0 && (
          <Col span={24}>
            <div style={{ padding: 60, textAlign: 'center', background: 'var(--card-bg)', borderRadius: 24, border: '1px dashed var(--border-color)' }}>
              <Filter size={48} color="#475569" style={{ marginBottom: 16 }} />
              <Title level={4} style={{ color: '#94a3b8', margin: 0 }}>No questions match your filters</Title>
              <Button type="link" onClick={() => { setSearch(''); setFilterTopic('All'); setFilterDiff('All'); }} style={{ marginTop: 8 }}>
                Clear Filters
              </Button>
            </div>
          </Col>
        )}
      </Row>

      {/* Embedded Code Sandbox */}
      {isEditorOpen && (
        <CodeEditor
          visible={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          questionName={activeQuestion}
        />
      )}

      {/* Embedded Essay/Diagnostic Sandbox for Non-CS Majors */}
      {isCaseStudyOpen && (
        <CaseStudyEditor
          visible={isCaseStudyOpen}
          onClose={() => setIsCaseStudyOpen(false)}
          questionName={activeQuestion}
          major={major}
        />
      )}

      <style>{`
         .ant-select-selector {
           background: var(--bg-secondary) !important;
           color: var(--text-color) !important;
           border: 1px solid var(--border-color) !important;
           border-radius: 12px !important;
           height: 40px !important;
           display: flex;
           align-items: center;
         }
         .ant-select-arrow { color: #94a3b8 !important; }
      `}</style>
    </div>
  );
};

export default Course;
