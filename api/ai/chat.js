import { askAI } from '../../src/services/aiService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, context } = req.body || {};
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are CognifyX AI, a helpful coding 
tutor and learning assistant. You help students learn 
programming, solve coding problems, and prepare for 
technical interviews. Be concise, friendly, and educational.
Context: ${context || 'General coding help'}`;

    const reply = await askAI(message, systemPrompt, 600);
    res.status(200).json({ reply });

  } catch (error) {
    console.error('Chat API error:', error);
    if (error.message && error.message.includes('429')) {
      return res.status(429).json({ error: 'AI is temporarily busy (Quota Exceeded). Please try again in a minute.' });
    }
    res.status(500).json({ error: 'AI is temporarily unavailable. Please try again.' });
  }
}
