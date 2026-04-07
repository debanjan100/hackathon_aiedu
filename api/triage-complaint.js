export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { category, severity, title, description, screenshotCount, email } = req.body || {};
  if (!category || !severity || !title || !description || !email) {
    return res.status(400).json({ error: "Missing required fields" });
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

  if (!process.env.ANTHROPIC_API_KEY) {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return res.json({
      ticketId: `CX-${year}-${random}`,
      acknowledgement:
        "Thanks for raising this issue — your complaint has been logged. Our team will review it shortly.",
      analysis: `Category: ${category}, severity: ${severity}. This looks like something that may impact your experience, so we will route it to the right module owner.`,
      eta: "within 24–48 hours on business days",
      selfHelp: [
        "Try refreshing the page or logging out and back in to see if the issue persists.",
        "If possible, include more details (steps to reproduce, browser, device) in a follow-up ticket or email.",
      ],
      priority:
        severity === "critical" || severity === "high"
          ? "high"
          : severity === "medium"
          ? "medium"
          : "low",
    });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:
            `Category: ${category}\n` +
            `Severity: ${severity}\n` +
            `Title: ${title}\n` +
            `Description: ${description}\n` +
            `Screenshots: ${Number(screenshotCount) || 0}\n` +
            `User email: ${email}`,
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return res.json({
      ticketId: `CX-${year}-${random}`,
      acknowledgement:
        "Your complaint has been logged, but the AI triage service is currently unavailable. Our human team will still review it.",
      analysis: `Category: ${category}, severity: ${severity}. The automatic analysis step failed, so this will be handled manually.`,
      eta: "within 24–72 hours",
      selfHelp: [
        "You can check your internet connection and try again later if the problem seems network-related.",
        "If this is blocking you, consider switching devices or browsers temporarily while we investigate.",
      ],
      priority:
        severity === "critical" || severity === "high"
          ? "high"
          : severity === "medium"
          ? "medium"
          : "low",
    });
  }

  const text = data.content?.map((b) => b.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return res.json(JSON.parse(clean));
  } catch {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return res.json({
      ticketId: `CX-${year}-${random}`,
      acknowledgement:
        "Your complaint has been received. The AI response formatting had an issue, but the ticket is still created.",
      analysis: `Category: ${category}, severity: ${severity}. A human reviewer will take a closer look at the full description you provided.`,
      eta: "within 24–72 hours",
      selfHelp: [
        "If the issue is urgent, you can re-try after a few minutes or reach out via your primary support channel.",
        "Keep your browser and CognifyX AI tab open in case we need you to re-check the behavior.",
      ],
      priority:
        severity === "critical" || severity === "high"
          ? "high"
          : severity === "medium"
          ? "medium"
          : "low",
    });
  }
}

