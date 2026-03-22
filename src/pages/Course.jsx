import React, { useState, useMemo } from 'react';
import { Typography, Card, Tag, Select, Row, Col, Button, Input, message } from 'antd';
import { BookOpen, AlertCircle, PlayCircle, Download, Search, Filter } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;

const allQuestions = [
  // ARRAYS
  { id: 'a1', topic: 'Arrays', q: 'Pair with given Sum', difficulty: 'Easy' },
  { id: 'a2', topic: 'Arrays', q: 'Best Time to Buy and Sell Stock', difficulty: 'Easy' },
  { id: 'a3', topic: 'Arrays', q: 'Product of Array Except Self', difficulty: 'Medium' },
  { id: 'a4', topic: 'Arrays', q: 'Maximum Subarray', difficulty: 'Medium' },
  { id: 'a5', topic: 'Arrays', q: 'Container With Most Water', difficulty: 'Medium' },
  { id: 'a6', topic: 'Arrays', q: 'Trapping Rain Water', difficulty: 'Hard' },
  { id: 'a7', topic: 'Arrays', q: 'Merge Intervals', difficulty: 'Medium' },

  // MATRIX
  { id: 'm1', topic: 'Matrix', q: 'Spiral Matrix', difficulty: 'Medium' },
  { id: 'm2', topic: 'Matrix', q: 'Transpose Matrix', difficulty: 'Easy' },
  { id: 'm3', topic: 'Matrix', q: 'Word Search', difficulty: 'Medium' },

  // STRING
  { id: 's1', topic: 'String', q: 'Longest Substring Without Repeating', difficulty: 'Medium' },
  { id: 's2', topic: 'String', q: 'Longest Palindromic Substring', difficulty: 'Medium' },
  { id: 's3', topic: 'String', q: 'Palindromic Substrings', difficulty: 'Medium' },
  { id: 's4', topic: 'String', q: 'Sentence Palindrome', difficulty: 'Easy' },

  // SEARCHING & SORTING
  { id: 'ss1', topic: 'Searching & Sorting', q: 'Search in Rotated Sorted Array', difficulty: 'Medium' },
  { id: 'ss2', topic: 'Searching & Sorting', q: 'Peak Element', difficulty: 'Medium' },
  { id: 'ss3', topic: 'Searching & Sorting', q: 'Count Inversions', difficulty: 'Hard' },
  { id: 'ss4', topic: 'Searching & Sorting', q: 'Sort 0s, 1s, 2s', difficulty: 'Medium' },

  // LINKED LIST
  { id: 'll1', topic: 'Linked List', q: 'Reverse Linked List', difficulty: 'Easy' },
  { id: 'll2', topic: 'Linked List', q: 'Detect Cycle', difficulty: 'Easy' },
  { id: 'll3', topic: 'Linked List', q: 'Merge Sorted Lists', difficulty: 'Easy' },

  // STACK / QUEUE
  { id: 'sq1', topic: 'Stack/Queue', q: 'Next Greater Element', difficulty: 'Medium' },
  { id: 'sq2', topic: 'Stack/Queue', q: 'Largest Histogram Area', difficulty: 'Hard' },
  { id: 'sq3', topic: 'Stack/Queue', q: 'Infix to Postfix', difficulty: 'Medium' },

  // TREE
  { id: 't1', topic: 'Tree', q: 'Maximum Depth', difficulty: 'Easy' },
  { id: 't2', topic: 'Tree', q: 'Validate BST', difficulty: 'Medium' },
  { id: 't3', topic: 'Tree', q: 'Lowest Common Ancestor', difficulty: 'Medium' },
  { id: 't4', topic: 'Tree', q: 'Level Order Traversal', difficulty: 'Medium' },

  // GRAPH
  { id: 'g1', topic: 'Graph', q: 'Number of Islands', difficulty: 'Medium' },
  { id: 'g2', topic: 'Graph', q: 'Topological Sort', difficulty: 'Medium' },
  { id: 'g3', topic: 'Graph', q: 'Cycle Detection', difficulty: 'Hard' },

  // DP & GREEDY
  { id: 'dp1', topic: 'DP & Greedy', q: 'Knapsack', difficulty: 'Medium' },
  { id: 'dp2', topic: 'DP & Greedy', q: 'LIS', difficulty: 'Medium' },
  { id: 'dp3', topic: 'DP & Greedy', q: 'Coin Change', difficulty: 'Medium' },
  { id: 'dp4', topic: 'DP & Greedy', q: 'Jump Game', difficulty: 'Medium' }
];

const topics = ['All', 'Arrays', 'Matrix', 'String', 'Searching & Sorting', 'Linked List', 'Stack/Queue', 'Tree', 'Graph', 'DP & Greedy'];

const Course = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  
  const initialTopic = topicId && topicId !== 'practice' 
    ? topics.find(t => t.toLowerCase().includes(topicId)) || 'All' 
    : 'All';

  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState(initialTopic);
  const [filterDiff, setFilterDiff] = useState('All');

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
  }, [search, filterTopic, filterDiff]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header section with Glassmorphism */}
      <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 24, padding: 32, marginBottom: 32 }}>
        <Row justify="space-between" align="middle" style={{ flexWrap: 'wrap', gap: 16 }}>
          <Col xs={24} md={14}>
            <Title level={2} style={{ color: 'var(--heading-color)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <BookOpen color="var(--primary-color)" size={32} /> 
              DSA Master Practice Room
            </Title>
            <Text style={{ color: 'var(--text-secondary)' }}>Solve hand-picked questions across 9 crucial algorithmic topics to guarantee your interview success.</Text>
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
            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
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
                  <div style={{ width: 'calc(100% + 16px)', margin: '-16px -8px 16px -8px', height: 120, backgroundImage: 'url("https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
                  
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
                  
                  <Button 
                    type="primary" 
                    ghost 
                    icon={<PlayCircle size={16} />}
                    style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)', borderRadius: 8, width: '100%' }}
                  >
                    Start Solving
                  </Button>
                </Card>
              </motion.div>
            </Col>
          ))}
        </AnimatePresence>
        
        {filteredQuestions.length === 0 && (
          <Col span={24}>
            <div style={{ padding: 60, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Filter size={48} color="#475569" style={{ marginBottom: 16 }} />
              <Title level={4} style={{ color: '#94a3b8', margin: 0 }}>No questions match your filters</Title>
              <Button type="link" onClick={() => { setSearch(''); setFilterTopic('All'); setFilterDiff('All'); }} style={{ marginTop: 8 }}>
                Clear Filters
              </Button>
            </div>
          </Col>
        )}
      </Row>

      <style>{`
         .ant-select-selector {
           background: rgba(255,255,255,0.05) !important;
           color: #fff !important;
           border: 1px solid rgba(255,255,255,0.1) !important;
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
