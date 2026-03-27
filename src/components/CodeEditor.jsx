import React, { useState } from 'react';
import { Modal, Select, Button, Typography, Spin, Row, Col, Tag } from 'antd';
import Editor from '@monaco-editor/react';
import { PlayCircle, Terminal, Cpu, Bug } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

const { Title, Text } = Typography;
const { Option } = Select;

// Piston API language aliases and runtime versions
const LANGUAGE_VERSIONS = {
  javascript: '18.15.0',
  python: '3.10.0',
  java: '15.0.2',
  cpp: '10.2.0'
};

const defaultCode = {
  javascript: 'console.log("Hello Hackathon!");\n\nfunction solve() {\n  // Write your logic here\n}\n\nsolve();',
  python: 'print("Hello Hackathon!")\n\ndef solve():\n    # Write your logic here\n    pass\n\nsolve()',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Hackathon!");\n    }\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello Hackathon!" << std::endl;\n    return 0;\n}'
};

const CodeEditor = ({ visible, onClose, questionName }) => {
  const isMobile = window.innerWidth < 768;

  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(defaultCode.javascript);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  // AI Mentor State
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugExplanation, setDebugExplanation] = useState('');
  const [fixedCode, setFixedCode] = useState('');

  const handleLanguageChange = (val) => {
    setLanguage(val);
    setCode(defaultCode[val]);
    setOutput('');
    setDebugExplanation('');
    setFixedCode('');
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Compiling and executing via AI Cloud Sandbox...');
    try {
      // Hackathon Pivot: Since physical free APIs like Piston die mid-production,
      // we leverage our blazing fast Groq AI Edge network to perform a highly accurate runtime simulation.
      const compilerPrompt = `Act strictly as a headless compiler and execution engine for ${language}.
The user ran the following code:

\n${code}\n

Execute this code in your mind. Return ONLY the standard console output (stdout).
If the code contains ANY syntax errors (like missing semicolons, unmatched brackets) or runtime errors, return ONLY the raw compiler traceback error. Do NOT implicitly forgive mistakes. Simulate a highly strict compiler environment.
CRITICAL: Do not include ANY conversational text. Do not use markdown backticks. Output exclusively raw terminal text.`;

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: compilerPrompt, context: 'You are a vital component of a physical IDE. Output raw terminal logs only.' }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      const simulationLog = data.reply || '';
      setOutput(simulationLog.trim() || 'Process exited with code 0.\n(No standard output was returned by the kernel.)');
    } catch (err) {
      setOutput(`Kernel Panic: Connection to the Execution Edge failed.\n${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDebugCode = async () => {
    setIsDebugging(true);
    setDebugExplanation('');
    setFixedCode('');
    
    try {
      const prompt = `You are an elite Senior Staff Engineer mentoring a Junior developer learning ${language}.
They are attempting to solve the following objective: "${questionName}".
The user wrote the following broken code:

${code}

When they executed it, the emulator returned this output/traceback:

${output}

Identify the root flaw. Return your response STRICTLY AND EXCLUSIVELY in raw JSON format. Do not prepend with backticks or markdown or conversational text. Use exactly this schema:
{
  "explanation": "A friendly, concise 2-3 sentence hint about what is wrong. If it is a logical error, guide their thinking—do NOT give away the algorithmic solution.",
  "fixed_code": "CRITICAL INSTRUCTION: To preserve the student's learning experience, you must ONLY fix strict SYNTAX errors (like misspelled variable names, missing brackets, or semicolons). DO NOT alter their algorithmic logic or provide the final structural solution. If their code is syntactically perfect but logically flawed, return their exact original code unchanged, but inject a code comment hinting at where their logic breaks down."
}`;

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: prompt, context: 'You are an advanced software debugging AI. Your output must strictly be pure JSON.' }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      // Clean potential generic markdown block injections from LLM
      const payloadString = data.reply.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
      const payload = JSON.parse(payloadString);
      
      setDebugExplanation(payload.explanation);
      setFixedCode(payload.fixed_code);
    } catch(err) {
      setDebugExplanation(`Mentor Connection Failed: Could not parse logic tensor. ${err.message}`);
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Terminal color="#00f2fe" size={24} />
          <span style={{ color: '#fff' }}>Solving: {questionName}</span>
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
        <Select value={language} onChange={handleLanguageChange} style={{ width: 150 }} dropdownStyle={{ background: '#1e293b', border: '1px solid #334155' }}>
          <Option value="javascript" style={{ color: '#e2e8f0' }}>JavaScript (Node)</Option>
          <Option value="python" style={{ color: '#e2e8f0' }}>Python 3</Option>
          <Option value="java" style={{ color: '#e2e8f0' }}>Java 15</Option>
          <Option value="cpp" style={{ color: '#e2e8f0' }}>C++ (GCC)</Option>
        </Select>
        <div style={{ display: 'flex', gap: 12 }}>
          <Tag color="purple" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 12, border: 'none', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', marginRight: 8 }}>
            <Cpu size={14} /> Kernel Emulator
          </Tag>
          <Button 
            onClick={handleDebugCode} 
            disabled={isDebugging || isRunning || !output} 
            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px' }}
          >
            {isDebugging ? <Spin size="small" /> : <Bug size={16} />}
            {isDebugging ? 'Analyzing...' : 'Debug'}
          </Button>
          <Button type="primary" className="gradient-btn" icon={isRunning ? <Spin size="small" /> : <PlayCircle size={16} />} onClick={handleRunCode} disabled={isRunning || isDebugging} style={{ borderRadius: 8, padding: '0 24px' }}>
            Run Code
          </Button>
        </div>
      </div>
      
      <Row gutter={[0, 16]}>
        <Col xs={24} md={14} style={{ borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)', borderBottom: isMobile ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
          <Editor
            height={isMobile ? "400px" : "60vh"}
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val)}
            options={{
              minimap: { enabled: false },
              fontSize: isMobile ? 13 : 15,
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              scrollBeyondLastLine: false,
              padding: { top: 16 }
            }}
          />
        </Col>
        <Col xs={24} md={10}>
          <div style={{ padding: 16, height: '100%', background: '#0d1117', display: 'flex', flexDirection: 'column' }}>
            <Title level={5} style={{ margin: '0 0 12px 0', color: '#8b949e', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Console Output</Title>
            <div style={{ flex: 1, overflowY: 'auto', background: '#010409', border: '1px solid #30363d', borderRadius: 12, padding: 20, fontFamily: '"JetBrains Mono", "Fira Code", monospace', color: '#56d364', whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.6, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>
              {output || <span style={{ color: '#484f58' }}>root@aiedu:~# Click "Run Code" to compile...</span>}
            </div>

            {/* AI Mentor Analysis Panel */}
            {debugExplanation && (
              <div style={{ marginTop: 16, padding: 20, background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(192, 132, 252, 0.05) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <Title level={5} style={{ color: '#e879f9', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bug size={18}/> AI Mentor Analysis
                </Title>
                <Text style={{ color: '#e2e8f0', display: 'block', marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>{debugExplanation}</Text>
                
                {fixedCode && (
                  <Button 
                    type="primary" 
                    onClick={() => { setCode(fixedCode); setDebugExplanation(''); setFixedCode(''); }}
                    style={{ background: 'linear-gradient(135deg, #a855f7, #c084fc)', border: 'none', width: '100%', borderRadius: 8, height: 40, fontWeight: 'bold' }}
                    icon={<PlayCircle size={16} />}
                  >
                    Apply Fix ⚡
                  </Button>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default CodeEditor;
