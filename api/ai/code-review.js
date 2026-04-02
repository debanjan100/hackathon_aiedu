import { askAI } from '../../src/services/aiService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { code, language, problemTitle } = req.body || {};

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
    res.status(200).json({ review });

  } catch (error) {
    console.error('Code Review API error:', error);
    if (error.message && error.message.includes('429')) {
      return res.status(429).json({ error: 'AI is temporarily busy (Quota Exceeded). Please try again in a minute.' });
    }
    res.status(500).json({ error: 'Code review unavailable. Try again.' });
  }
}
