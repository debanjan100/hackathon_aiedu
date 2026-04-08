import { askAI } from '../src/services/aiService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { algorithm, stepIndex, totalSteps, stepData, array } = req.body || {};
    const sys = `You are an engaging DSA teacher explaining algorithm steps to a student.
For the given algorithm step, write a 1-2 sentence plain-English narration that:
1. Says WHAT is happening at this exact step (mention specific indices and values)
2. Says WHY (what rule/condition triggered this action)
Keep it conversational, use "we" language. No markdown. Max 40 words.
Examples:
- "We compare index 2 (value: 34) and index 3 (value: 7). Since 34 > 7, we swap them to move the larger element rightward."
- "Index 0 (value: 11) is already in the right place — it's the smallest remaining element so we mark it as sorted."`;
    const payload = {
      algorithm: algorithm || '',
      stepIndex: Number(stepIndex) || 0,
      totalSteps: Number(totalSteps) || 0,
      array: Array.isArray(array) ? array : null,
      step: stepData || {},
    };
    const prompt = `Algorithm: ${payload.algorithm}
Step: ${payload.stepIndex + 1} of ${payload.totalSteps}
Array: ${payload.array ? JSON.stringify(payload.array) : 'N/A'}
StepData: ${JSON.stringify(payload.step).slice(0, 1200)}
Write the narration now.`;
    const narration = await askAI(prompt, sys, 120);
    res.status(200).json({ narration });
  } catch (e) {
    res.status(200).json({ narration: 'We examine the highlighted elements and apply the algorithm’s rule to progress toward the goal.' });
  }
}

