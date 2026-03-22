import React, { useState } from 'react';
import { Card, Typography, Radio, Button, Steps, Result } from 'antd';
import { BrainCircuit, CheckCircle } from 'lucide-react';

const { Title, Paragraph } = Typography;

const questions = [
  { id: 1, subject: 'Python', text: 'Which of the following is a mutable data type in Python?', options: ['Tuple', 'List', 'String'], answer: 1 },
  { id: 2, subject: 'Maths', text: 'What is the sum of the angles in a triangle?', options: ['180 degrees', '360 degrees', '90 degrees'], answer: 0 },
  { id: 3, subject: 'Physics', text: 'Which equation represents Newtons Second Law of Motion?', options: ['E = mc²', 'F = ma', 'V = IR'], answer: 1 },
  { id: 4, subject: 'Chemistry', text: 'What is the atomic number of Carbon?', options: ['6', '12', '8'], answer: 0 },
  { id: 5, subject: 'English', text: 'Identify the synonym for "Ubiquitous":', options: ['Rare', 'Omnipresent', 'Obsolete'], answer: 1 },
];

const Assessment = () => {
  const [current, setCurrent] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleNext = () => {
    if (selectedOption === questions[current].answer) {
      setScore(score + 1);
    }
    setSelectedOption(null);
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  };

  const currentLevel = score === 3 ? 'Advanced' : score === 2 ? 'Intermediate' : 'Beginner';

  if (finished) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <Card className="glass-card" bordered={false} style={{ textAlign: 'center' }}>
          <Result
            icon={<CheckCircle color="#00f2fe" size={64} />}
            title={<span style={{ color: '#fff' }}>Assessment Complete!</span>}
            subTitle={<span style={{ color: '#94a3b8' }}>You scored {score} out of {questions.length}.</span>}
            extra={[
              <div key="level" style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#fff' }}>
                  Assigned Skill Level: <span style={{ color: '#00f2fe' }}>{currentLevel}</span>
                </Title>
                <Paragraph style={{ color: '#e2e8f0' }}>Your learning path has been dynamically updated based on these results.</Paragraph>
              </div>,
              <Button className="gradient-btn" size="large" key="console" onClick={() => window.location.href = '/'}>
                Go to Dashboard
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, color: '#fff' }}>
        <BrainCircuit color="#00f2fe" /> Initial Skill Assessment
      </Title>
      
      <Steps current={current} items={questions.map(() => ({ title: '' }))} style={{ marginBottom: 32 }} />

      <Card className="glass-card" bordered={false}>
        <Title level={4} style={{ color: '#fff', marginBottom: 24 }}>
          {current + 1}. <span style={{ color: '#00f2fe', fontSize: 16 }}>[{questions[current].subject}]</span> {questions[current].text}
        </Title>
        <Radio.Group onChange={(e) => setSelectedOption(e.target.value)} value={selectedOption} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {questions[current].options.map((opt, idx) => (
            <Radio key={idx} value={idx} style={{ fontSize: 16, color: '#e2e8f0' }}>
              {opt}
            </Radio>
          ))}
        </Radio.Group>
        <div style={{ marginTop: 32, textAlign: 'right' }}>
          <Button className="gradient-btn" size="large" onClick={handleNext} disabled={selectedOption === null}>
            {current === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Assessment;
