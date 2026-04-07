import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { resumeText, targetCompany } = req.body || {};
  if (!resumeText?.trim() || !targetCompany?.trim()) {
    return res.status(400).json({ error: "Missing resumeText or targetCompany" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Server misconfigured: GEMINI_API_KEY not set" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    const systemPrompt = `
You are a senior technical recruiter at ${targetCompany} who also has deep DSA expertise.
Analyze the provided résumé and respond ONLY with valid JSON:
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
  "summary": "Your profile shows strong fundamentals but significant gaps in graph algorithms and DP — the two most tested areas at ${targetCompany}."
}
`.trim();

    const prompt = `Resume:\n${resumeText}\n\nTarget company: ${targetCompany}\n\nReturn ONLY JSON.`;

    const result = await model.generateContent([
      { text: `Instructions:\n${systemPrompt}\n\n${prompt}` },
    ]);

    const text = result?.response?.text?.() || "";
    const clean = text.replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(clean);
      return res.status(200).json(parsed);
    } catch {
      return res.status(500).json({
        error: "Failed to parse AI response",
        raw: clean.slice(0, 2000),
      });
    }
  } catch (err) {
    console.error("[/api/scan-resume] Error:", err);
    return res.status(500).json({ error: "Resume scanning failed", details: err.message });
  }
}

