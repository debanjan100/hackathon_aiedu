// src/services/aiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Universal function to get AI responses using Gemini Flash Lite
 * @param {string} prompt - The user's query
 * @param {string} systemPrompt - Instructions for the AI's behavior
 * @param {number} maxTokens - Maximum length of the response
 * @returns {Promise<string>} - The AI's text response
 */
export async function askAI(
  prompt,
  systemPrompt = '',
  maxTokens = 800
) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in environment variables");
    }

    // Initialize lazily so env can be loaded by the host (e.g. `.env.local`)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Using gemini-flash-lite-latest to avoid Quota Exceeded errors on 2.0-flash
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
    });

    // Combine system prompt and user prompt for absolute reliability
    const fullPrompt = systemPrompt 
      ? `Instructions: ${systemPrompt}\n\nUser: ${prompt}`
      : prompt;

    // Standard generation call
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      },
    });

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return text;

  } catch (error) {
    console.error("Gemini AI Service error:", error);
    
    // Auto-retry once for common connectivity issues
    if (error.message && (error.message.includes('429') || error.message.includes('QUOTA_EXCEEDED'))) {
      throw new Error('429: AI is temporarily busy. Please try again in 30 seconds.');
    }
    
    throw new Error(`AI Service Error: ${error.message || 'Unknown error occurred'}`);
  }
}



