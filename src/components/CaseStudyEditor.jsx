import React, { useState } from 'react';
import { Modal, Button, Typography, Spin, Row, Col, Input, Tag } from 'antd';
import { PlayCircle, FileText, Cpu, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { sendChatMessage } from '../lib/chatApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CaseStudyEditor = ({ visible, onClose, questionName, major }) => {
  const [essay, setEssay] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [grade, setGrade] = useState(null);
  const [feedback, setFeedback] = useState('');

  const getThemeColor = () => {
    if (major.includes('Pre-Med')) return '#10b981';
    if (major.includes('Business')) return '#f59e0b';
    if (major.includes('Law')) return '#8b5cf6';
    if (major.includes('Humanities')) return '#ec4899';
    return '#00f2fe';
  };

  const themeColor = getThemeColor();

  const xaiChat = (systemContent, userContent) =>
    sendChatMessage({ message: userContent, context: systemContent });

  const handleEvaluate = async () => {
    if (!essay.trim()) return;
    setIsEvaluating(true);
    setGrade(null);
    setFeedback('');
    
    try {
      const prompt = `You are a strict Ivy League Ivy-League Professor in ${major}.
The student is answering this specific Case Study Scenario: "${questionName}".
The student wrote the following argumentative essay / diagnostic report:
\n"${essay}"\n
Evaluate their argument rigidly. Point out any logical flaws.
Respond EXCLUSIVELY in pure JSON format with no backticks, markdown, or chat text. 
Use this exact schema:
{
  "score": "A number between 0 and 100",
  "feedback": "A concise 3-4 sentence evaluation explaining why they received this score."
}`;

      const reply = await xaiChat(
        'You are an automated university grading system. Output strict JSON only.',
        prompt
      );
      
      const payloadString = reply.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
      const payload = JSON.parse(payloadString);
      
      setGrade(payload.score);
      setFeedback(payload.feedback);
    } catch(err) {
      setFeedback(`Evaluation System Failure: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FileText color={themeColor} size={24} />
          <span style={{ color: '#fff' }}>Case Study: {questionName}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      styles={{ body: { padding: 0 } }}
      className="glass-modal"
    >
      <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tag color="purple" style={{ padding: '6px 16px', fontSize: 14, borderRadius: 12, border: 'none', background: `${themeColor}22`, color: themeColor }}>
           {major} Assessment Engine
        </Tag>
        <div style={{ display: 'flex', gap: 12 }}>
          <Tag color="purple" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 12, border: 'none', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', marginRight: 8 }}>
            <Cpu size={14} /> Subject Matter AI Expert
          </Tag>
          <Button 
            type="primary" 
            icon={isEvaluating ? <Spin size="small" /> : <PlayCircle size={16} />} 
            onClick={handleEvaluate} 
            disabled={isEvaluating || !essay} 
            style={{ background: themeColor, borderColor: themeColor, color: '#000', fontWeight: 'bold', borderRadius: 8, padding: '0 24px' }}
          >
            Submit for AI Evaluation
          </Button>
        </div>
      </div>
      
      <Row>
        <Col span={14} style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: 24, background: '#0d1117' }}>
          <Title level={5} style={{ margin: '0 0 16px 0', color: '#8b949e', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Submit Your Written Thesis</Title>
          <TextArea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Type your essay, diagnosis, or business resolution here..."
            autoSize={false}
            style={{ 
              height: '50vh', 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid #30363d', 
              color: '#fff', 
              borderRadius: 12, 
              padding: 16, 
              fontSize: 16, 
              lineHeight: 1.6,
              resize: 'none'
            }}
          />
        </Col>
        <Col span={10}>
          <div style={{ padding: 24, height: '100%', background: '#010409', display: 'flex', flexDirection: 'column' }}>
            <Title level={5} style={{ margin: '0 0 16px 0', color: '#8b949e', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Professor's Evaluation</Title>
            
            {grade && (
               <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 20, background: `${themeColor}15`, borderRadius: 16, border: `1px solid ${themeColor}44` }}>
                 <div style={{ width: 64, height: 64, borderRadius: 32, background: themeColor, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 24, fontWeight: 'bold', color: '#000', boxShadow: `0 0 20px ${themeColor}66` }}>
                   {grade}
                 </div>
                 <div>
                   <Title level={4} style={{ color: '#fff', margin: 0 }}>Final Grade</Title>
                   <Text style={{ color: themeColor, fontWeight: 'bold' }}>Scored by Grok AI</Text>
                 </div>
               </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(255,255,255,0.02)', border: '1px solid #30363d', borderRadius: 12, padding: 20, color: '#e2e8f0', whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.6 }}>
              {feedback ? (
                <>
                  <CheckCircle size={20} color={themeColor} style={{ marginBottom: 12 }} />
                  <div>{feedback}</div>
                </>
              ) : (
                <span style={{ color: '#484f58' }}>Awaiting your thesis submission... The AI module will automatically compute your logical accuracy and grade your work.</span>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default CaseStudyEditor;
