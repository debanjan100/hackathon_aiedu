import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { askAI } from './src/services/aiService.js';

dotenv.config();
console.log("Dotenv parsed. API KEY is:", process.env.GEMINI_API_KEY ? "EXISTS" : "UNDEFINED");

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 5000;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', model: 'gemini-flash-lite-latest', service: 'Google Gemini' });
});




app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are CognifyX AI, a helpful coding 
tutor and learning assistant. You help students learn 
programming, solve coding problems, and prepare for 
technical interviews. Be concise, friendly, and educational.
Context: ${context || 'General coding help'}`;

    const reply = await askAI(message, systemPrompt, 600);
    res.json({ reply });

  } catch (err) {
    if (err.message && err.message.includes('429')) {
      return res.status(429).json({ error: 'AI is temporarily unavailable (Quota Exceeded). Please refresh later.' });
    }
    console.error('Chat API Error:', err);
    res.status(500).json({ error: 'AI is temporarily unavailable. Please try again later.' });
  }
});

/* ── Run Code via Piston API ── */
app.post('/run-code', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) {
      return res.status(400).json({ error: 'code and language are required' });
    }

    const LANG_MAP = {
      python:     { id: 'python',     version: '3.10.0',  ext: 'py' },
      c:          { id: 'c',          version: '10.2.0',  ext: 'c' },
      cpp:        { id: 'cpp',        version: '10.2.0',  ext: 'cpp' },
      java:       { id: 'java',       version: '15.0.2',  ext: 'java' },
      javascript: { id: 'javascript', version: '18.15.0', ext: 'js' },
    };

    const lang = LANG_MAP[language];
    if (!lang) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    const pistonRes = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: lang.id,
        version: lang.version,
        files: [{ name: `main.${lang.ext}`, content: code }],
      }),
    });

    if (!pistonRes.ok) {
      throw new Error(`Piston API error: ${pistonRes.status}`);
    }

    const data = await pistonRes.json();
    res.json({
      stdout: data.run?.stdout || '',
      stderr: data.run?.stderr || '',
    });

  } catch (err) {
    console.error('Run-code Error:', err.message);
    // Fallback to AI simulation
    try {
      const reply = await askAI(
        `Execute this ${req.body.language} code and return ONLY the terminal output:\n\`\`\`\n${req.body.code}\n\`\`\``,
        'You are a strict runtime. Output only what the program prints to stdout. If errors, output only the error.',
        400
      );
      const isError = /error|exception|traceback/i.test(reply);
      res.json({ stdout: isError ? '' : reply, stderr: isError ? reply : '' });
    } catch (aiErr) {
      res.status(500).json({ error: 'Code execution unavailable. Please try again.' });
    }
  }
});

app.post('/api/ai/hint', async (req, res) => {
  try {
    const { problemTitle, problemDescription, userCode } = req.body;

    const systemPrompt = `You are a coding interview coach. 
Give helpful hints without revealing the full solution. 
Guide the student toward the answer step by step.`;

    const prompt = `Problem: ${problemTitle}
Description: ${problemDescription}
Student's current code: ${userCode || 'No code written yet'}

Give a helpful hint (2-3 sentences max) that guides them 
toward the solution without giving it away directly.`;

    const hint = await askAI(prompt, systemPrompt, 300);
    res.json({ hint });

  } catch (err) {
    if (err.message && err.message.includes('429')) {
      return res.status(429).json({ error: 'AI is temporarily unavailable (Quota Exceeded). Please refresh later.' });
    }
    console.error('Hint API Error:', err);
    res.status(500).json({ error: 'Could not generate hint. Try again.' });
  }
});

app.post('/api/ai/code-review', async (req, res) => {
  try {
    const { code, language, problemTitle } = req.body;

    const systemPrompt = `You are an expert code reviewer 
specializing in algorithms and data structures.`;

    const prompt = `Review this ${language} solution for: 
"${problemTitle}"

Code:
${code}

Provide:
1. Time complexity (Big O)
2. Space complexity (Big O)  
3. Two specific improvement suggestions
4. Overall rating (1-10)
Keep the review concise and educational.`;

    const review = await askAI(prompt, systemPrompt, 500);
    res.json({ review });

  } catch (err) {
    if (err.message && err.message.includes('429')) {
      return res.status(429).json({ error: 'AI is temporarily unavailable (Quota Exceeded). Please refresh later.' });
    }
    console.error('Code Review API Error:', err);
    res.status(500).json({ error: 'Code review unavailable. Try again.' });
  }
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n✅  CognifyX AI Backend → http://localhost:${PORT}`);
  console.log(`✅  Google Gemini API ready\n`);
});
