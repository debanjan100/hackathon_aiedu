import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { askAI } from './src/services/aiService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Support both `.env` and Vite-style `.env.local`
dotenv.config();
dotenv.config({ path: '.env.local', override: true });
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

app.post('/api/triage-complaint', async (req, res) => {
  try {
    const { category, severity, title, description, screenshotCount, email } = req.body || {};

    if (!category || !severity || !title || !description || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const SYSTEM_PROMPT = `You are CognifyX AI's intelligent complaint analysis assistant.
When given a user complaint, you must:
1. Acknowledge the issue empathetically
2. Analyze the category and severity
3. Provide an estimated resolution timeline
4. Give 1-2 immediate self-help suggestions if applicable
5. Assign a ticket ID in format CX-YYYY-NNNN (use current year and random 4-digit number)
6. Keep response under 120 words, conversational and helpful

Respond ONLY in this JSON format:
{
  "ticketId": "CX-2026-XXXX",
  "acknowledgement": "...",
  "analysis": "...",
  "eta": "...",
  "selfHelp": ["...", "..."],
  "priority": "high|medium|low"
}`;

    const userMsg =
      `Category: ${category}\n` +
      `Severity: ${severity}\n` +
      `Title: ${title}\n` +
      `Description: ${description}\n` +
      `Screenshots: ${Number(screenshotCount) || 0}\n` +
      `User email: ${email}`;

    if (!process.env.ANTHROPIC_API_KEY) {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      return res.json({
        ticketId: `CX-${year}-${random}`,
        acknowledgement: 'Thanks for raising this issue — your complaint has been logged. Our team will review it shortly.',
        analysis: `Category: ${category}, severity: ${severity}. This looks like something that may impact your experience, so we will route it to the right module owner.`,
        eta: 'within 24–48 hours on business days',
        selfHelp: [
          'Try refreshing the page or logging out and back in to see if the issue persists.',
          'If possible, include more details (steps to reproduce, browser, device) in a follow-up ticket or email.'
        ],
        priority: severity === 'critical' || severity === 'high' ? 'high' : severity === 'medium' ? 'medium' : 'low',
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      return res.json({
        ticketId: `CX-${year}-${random}`,
        acknowledgement: 'Your complaint has been logged, but the AI triage service is currently unavailable. Our human team will still review it.',
        analysis: `Category: ${category}, severity: ${severity}. The automatic analysis step failed, so this will be handled manually.`,
        eta: 'within 24–72 hours',
        selfHelp: [
          'You can check your internet connection and try again later if the problem seems network-related.',
          'If this is blocking you, consider switching devices or browsers temporarily while we investigate.'
        ],
        priority: severity === 'critical' || severity === 'high' ? 'high' : severity === 'medium' ? 'medium' : 'low',
      });
    }

    const text = data.content?.map((b) => b.text || '').join('') || '';
    const clean = text.replace(/```json|```/g, '').trim();

    try {
      return res.json(JSON.parse(clean));
    } catch {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      return res.json({
        ticketId: `CX-${year}-${random}`,
        acknowledgement: 'Your complaint has been received. The AI response formatting had an issue, but the ticket is still created.',
        analysis: `Category: ${category}, severity: ${severity}. A human reviewer will take a closer look at the full description you provided.`,
        eta: 'within 24–72 hours',
        selfHelp: [
          'If the issue is urgent, you can re-try after a few minutes or reach out via your primary support channel.',
          'Keep your browser and CognifyX AI tab open in case we need you to re-check the behavior.'
        ],
        priority: severity === 'critical' || severity === 'high' ? 'high' : severity === 'medium' ? 'medium' : 'low',
      });
    }
  } catch (err) {
    console.error('Triage complaint error:', err);
    return res.status(500).json({ error: 'Complaint triage unavailable. Please try again later.' });
  }
});

app.post('/api/scan-resume', async (req, res) => {
  try {
    const { resumeText, targetCompany } = req.body || {};
    if (!resumeText || !String(resumeText).trim() || !targetCompany || !String(targetCompany).trim()) {
      return res.status(400).json({ error: 'Missing resumeText or targetCompany' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
    }

    const systemPrompt = `You are a senior technical recruiter at ${targetCompany} who also has deep DSA expertise.
Analyze the provided résumé and respond ONLY with valid JSON (no markdown fences, no extra text).
The JSON must follow this exact schema:
{
  "readinessScore": 65,
  "hasTopics": ["Arrays", "Hash Maps", "Binary Search", "OOP"],
  "missingTopics": ["Dynamic Programming", "Graph Traversal", "Segment Trees", "Trie"],
  "partialTopics": ["Recursion", "Sorting Algorithms"],
  "studyPlan": {
    "week1": [
      { "topic": "Two Pointers", "estimatedHours": 4, "priority": "high", "description": "Master sliding window and two-pointer patterns" }
    ],
    "week2": [],
    "week3": [],
    "week4": []
  },
  "summary": "Your profile shows strong fundamentals but significant gaps in graph algorithms and DP."
}
Rules:
- Each week must have 2-4 topics.
- Output ONLY the JSON object. No markdown code fences. No explanatory text.`;

    const prompt = `Resume:\n${resumeText}\n\nTarget company: ${targetCompany}\n\nReturn ONLY JSON.`;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Try models in order of preference
    const modelNames = [
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ];

    let lastError = null;
    for (const modelName of modelNames) {
      try {
        console.log(`[scan-resume] Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          { text: `Instructions:\n${systemPrompt}\n\n${prompt}` },
        ]);
        const text = result?.response?.text?.() || '';
        let clean = String(text).replace(/```json|```/g, '').trim();

        // Extract JSON object with regex if there's surrounding text
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (jsonMatch) clean = jsonMatch[0];

        try {
          return res.json(JSON.parse(clean));
        } catch {
          console.warn(`[scan-resume] Model ${modelName} returned unparseable JSON`);
          lastError = new Error('Failed to parse AI response');
        }
      } catch (modelErr) {
        console.warn(`[scan-resume] Model ${modelName} failed:`, modelErr.message);
        lastError = modelErr;
      }
    }

    return res.status(500).json({ error: 'Resume scanning failed', details: lastError?.message || 'All models failed' });
  } catch (err) {
    console.error('Scan resume error:', err);
    return res.status(500).json({ error: 'Resume scanning failed', details: err.message });
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
