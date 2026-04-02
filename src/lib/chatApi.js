// chatApi.js — Shared utility for all AI chat calls
// In development: calls local Express server at localhost:5000
// In production (Vercel): calls the serverless /api/chat endpoint

const CHAT_URL = '/api/ai/chat';

export async function sendChatMessage({ message, context, history = [] }) {
  let res;
  try {
    res = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, history }),
    });
  } catch (networkErr) {
    throw new Error('Network error — please check your internet connection.');
  }

  // Validate response status first
  if (!res.ok) {
    // Try to read error body
    let errMsg = `API Error: ${res.status}`;
    try {
      const errText = await res.text();
      if (errText) {
        const errJson = JSON.parse(errText);
        if (errJson.error) errMsg = errJson.error;
      }
    } catch { /* ignore parse failures on error responses */ }
    throw new Error(errMsg);
  }

  // Safe JSON parsing — never call res.json() directly
  const text = await res.text();

  if (!text || text.trim() === '') {
    throw new Error('⚠️ AI returned an empty response. Please try again.');
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (parseErr) {
    console.error('[chatApi] Invalid JSON response:', text.slice(0, 200));
    throw new Error('⚠️ Invalid response from AI. Please try again.');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.reply) {
    throw new Error('⚠️ AI returned no reply. Please try again.');
  }

  return data.reply;
}
