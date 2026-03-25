import React, { useState } from 'react';
import { Typography, Row, Col, Table, Tag, Input, Button, Card } from 'antd';
import { Code, BookOpen, Search, CheckCircle, Circle, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import CodeEditor from '../components/CodeEditor';
import CaseStudyEditor from '../components/CaseStudyEditor';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const PROBLEM_REPOSITORY = [
  { id: 'cs1', title: 'Two Sum', discipline: 'Computer Science', topic: 'Arrays', difficulty: 'Easy', acceptance: '51.2%', type: 'code' },
  { id: 'cs2', title: 'Reverse Linked List', discipline: 'Computer Science', topic: 'Pointers', difficulty: 'Easy', acceptance: '76.4%', type: 'code' },
  { id: 'cs3', title: 'Spiral Matrix Validation', discipline: 'Computer Science', topic: '2D Arrays', difficulty: 'Medium', acceptance: '42.1%', type: 'code' },
  { id: 'cs4', title: 'Asynchronous Fetch Retry', discipline: 'Computer Science', topic: 'System Design', difficulty: 'Hard', acceptance: '28.9%', type: 'code' },
  { id: 'law1', title: 'The Ethics of Autonomous Vehicles', discipline: 'Law', topic: 'Liability', difficulty: 'Hard', acceptance: '34.5%', type: 'case' },
  { id: 'law2', title: 'Copyright in Generative AI', discipline: 'Law', topic: 'Intellectual Property', difficulty: 'Medium', acceptance: '45.1%', type: 'case' },
  { id: 'biz1', title: 'Market Entry: FinTech SaaS', discipline: 'Business', topic: 'Strategy', difficulty: 'Medium', acceptance: '58.3%', type: 'case' },
  { id: 'biz2', title: 'Hedging Q1 Forex Exposure', discipline: 'Business', topic: 'Finance', difficulty: 'Hard', acceptance: '15.2%', type: 'case' },
  { id: 'med1', title: 'Differential Diagnosis: Tachycardia', discipline: 'Pre-Med', topic: 'Cardiology', difficulty: 'Medium', acceptance: '66.1%', type: 'case' },
  { id: 'med2', title: 'Pharmacokinetics of Propofol', discipline: 'Pre-Med', topic: 'Anesthesia', difficulty: 'Hard', acceptance: '22.8%', type: 'case' },
];

const ProblemDeck = () => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  
  // Editor Modals
  const [activeCodeParams, setActiveCodeParams] = useState(null);
  const [activeCaseParams, setActiveCaseParams] = useState(null);

  // Derive target array based on search and optional tracking
  const filteredProblems = PROBLEM_REPOSITORY.filter(p => p.title.toLowerCase().includes(searchText.toLowerCase()) || p.topic.toLowerCase().includes(searchText.toLowerCase()));
  
  // Example mock progress logic directly tied to the front-end string hash for demo persistency without database calls
  const isSolved = (title) => {
     // Simulated progress mapping. In production, this matches `progress` rows via user.id
     const solvedMock = ['Two Sum', 'Market Entry: FinTech SaaS'];
     return solvedMock.includes(title);
  };

  const openEditor = (record) => {
    if (record.type === 'code') {
      setActiveCodeParams(record.title);
    } else {
      setActiveCaseParams({ title: record.title, major: record.discipline });
    }
  };

  const columns = [
    {
      title: 'Status',
      key: 'status',
      width: 80,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          {isSolved(record.title) ? <CheckCircle size={18} color="#10b981" /> : <Circle size={18} color="var(--border-color)" />}
        </div>
      )
    },
    {
      title: 'Challenge Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div onClick={() => openEditor(record)} style={{ cursor: 'pointer' }}>
          <Text style={{ color: 'var(--text-color)', fontSize: 15, fontWeight: 500 }} className="hover-cyan">{text}</Text>
        </div>
      )
    },
    {
      title: 'Discipline',
      dataIndex: 'discipline',
      key: 'discipline',
      responsive: ['md'],
      render: (text) => {
        let color = '#00f2fe';
        if (text === 'Law') color = '#8b5cf6';
        if (text === 'Pre-Med') color = '#10b981';
        if (text === 'Business') color = '#f59e0b';
        return <Text style={{ color, fontFamily: 'monospace', letterSpacing: 0.5 }}>{text}</Text>;
      }
    },
    {
      title: 'Topic Segment',
      dataIndex: 'topic',
      key: 'topic',
      responsive: ['lg'],
      render: (text) => <Tag color="default" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>{text}</Tag>
    },
    {
      title: 'Acceptance',
      dataIndex: 'acceptance',
      key: 'acceptance',
      responsive: ['lg'],
      render: (text) => <Text style={{ color: 'var(--text-muted)' }}>{text}</Text>
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (level) => {
        const color = level === 'Easy' ? 'success' : level === 'Medium' ? 'warning' : 'error';
        return <Tag color={color} style={{ borderRadius: 12, padding: '2px 10px' }}>{level}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Button 
          type="text" 
          icon={<PlayCircle size={18} />} 
          style={{ color: 'var(--primary-color)', background: 'rgba(0,242,254,0.1)', borderRadius: 8 }}
          onClick={() => openEditor(record)}
        >
          Solve
        </Button>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Universal Header */}
      <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 32, padding: '32px 40px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(0, 242, 254, 0.05) 100%)', borderRadius: 24, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
        <Col xs={24} md={16}>
          <Title level={2} style={{ color: 'var(--heading-color)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <BookOpen color="#8b5cf6" size={32} />
            Universal Problem Deck
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            Browse and execute dynamic multi-disciplinary challenges independently of your structural roadmap.
          </Text>
        </Col>
        <Col xs={24} md={8}>
          <Input 
            size="large" 
            placeholder="Search problems or topics..." 
            prefix={<Search size={18} color="var(--text-muted)" />} 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
          />
        </Col>
      </Row>

      {/* Main Data Table */}
      <Card className="glass-card" bordered={false} bodyStyle={{ padding: 0, overflow: 'hidden' }}>
        <Table 
          columns={columns} 
          dataSource={filteredProblems} 
          pagination={{ pageSize: 15, position: ['bottomCenter'] }}
          rowKey="id"
          style={{ width: '100%' }}
          rowClassName="dark-table-row"
        />
      </Card>

      {/* Persistent AI Resolvers */}
      {activeCodeParams && (
        <CodeEditor 
          visible={!!activeCodeParams} 
          onClose={() => setActiveCodeParams(null)} 
          questionName={activeCodeParams}
        />
      )}
      
      {activeCaseParams && (
        <CaseStudyEditor 
          visible={!!activeCaseParams} 
          onClose={() => setActiveCaseParams(null)} 
          questionName={activeCaseParams.title}
          major={activeCaseParams.major}
        />
      )}
      
      {/* Global Style Override for the Ant Table in Dark Mode */}
      <style>{`
        .ant-table {
           background: transparent !important;
        }
        .ant-table-thead > tr > th {
           background: rgba(255, 255, 255, 0.02) !important;
           color: #94a3b8 !important;
           border-bottom: 1px solid var(--border-color) !important;
           font-weight: 600;
           text-transform: uppercase;
           letter-spacing: 0.5px;
           font-size: 13px;
        }
        .ant-table-tbody > tr > td {
           border-bottom: 1px solid rgba(255,255,255,0.03) !important;
           background: transparent !important;
           transition: background 0.2s;
        }
        .ant-table-tbody > tr.ant-table-row:hover > td {
           background: rgba(255,255,255,0.02) !important;
        }
        .hover-cyan:hover {
           color: #00f2fe !important;
        }
        .ant-pagination-item {
           background: transparent;
           border-color: var(--border-color);
        }
        .ant-pagination-item-active {
           border-color: var(--primary-color);
           background: rgba(0, 242, 254, 0.1);
        }
        .ant-pagination-item a {
           color: var(--text-color);
        }
      `}</style>
    </motion.div>
  );
};

export default ProblemDeck;
