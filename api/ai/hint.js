import { askAI } from '../../src/services/aiService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { problemTitle, problemDescription, userCode } = req.body || {};

    const systemPrompt = `You are a coding interview coach. 
Give helpful hints without revealing the full solution. 
Guide the student toward the answer step by step.`;

    const prompt = `Problem: ${problemTitle}
Description: ${problemDescription}
Student's current code: ${userCode || 'No code written yet'}

Give a helpful hint (2-3 sentences max) that guides them 
toward the solution without giving it away directly.`;

    const hint = await askAI(prompt, systemPrompt, 300);
    res.status(200).json({ hint });

  } catch (error) {
    console.error('Hint API error:', error);
    if (error.message && error.message.includes('429')) {
      return res.status(429).json({ error: 'AI is temporarily busy (Quota Exceeded). Please try again in a minute.' });
    }
    res.status(500).json({ error: 'Could not generate hint. Try again.' });
  }
}
