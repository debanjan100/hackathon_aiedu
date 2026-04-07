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

    const systemPrompt = `
You are a senior technical recruiter at ${targetCompany} who also has deep DSA expertise.
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
- readinessScore must be a number between 0 and 100.
- Output ONLY the JSON object. No markdown code fences. No explanatory text.
`.trim();

    const prompt = `Resume:\n${resumeText}\n\nTarget company: ${targetCompany}\n\nReturn ONLY JSON.`;

    // Try models in order of preference
    const modelNames = [
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    let lastError = null;
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          { text: `Instructions:\n${systemPrompt}\n\n${prompt}` },
        ]);

        const text = result?.response?.text?.() || "";
        let clean = text.replace(/```json|```/g, "").trim();

        // Extract JSON object with regex if there's surrounding text
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (jsonMatch) clean = jsonMatch[0];

        try {
          const parsed = JSON.parse(clean);
          return res.status(200).json(parsed);
        } catch {
          lastError = new Error("Failed to parse AI response");
        }
      } catch (modelErr) {
        lastError = modelErr;
      }
    }

    return res.status(500).json({
      error: "Resume scanning failed",
      details: lastError?.message || "All models failed",
    });
  } catch (err) {
    console.error("[/api/scan-resume] Error:", err);
    return res.status(500).json({ error: "Resume scanning failed", details: err.message });
  }
}
