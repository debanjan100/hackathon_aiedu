// api/execute.js — Vercel Serverless Function
// This proxies code execution to Judge0 CE securely.

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { source_code, language_id, stdin = "" } = req.body || {};

  if (!source_code || !language_id) {
    return res
      .status(400)
      .json({ error: "Missing source_code or language_id" });
  }

  const JUDGE0_URL =
    process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com";
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  if (!RAPIDAPI_KEY) {
    return res
      .status(500)
      .json({ error: "Server misconfigured: RAPIDAPI_KEY not set" });
  }

  const headers = {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
  };

  try {
    // Step 1: Submit
    const submitRes = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          source_code,
          language_id: Number(language_id),
          stdin,
          cpu_time_limit: 5,
          memory_limit: 128000,
        }),
      }
    );

    if (!submitRes.ok) {
      const text = await submitRes.text();
      return res.status(502).json({ error: `Judge0 submit error: ${text}` });
    }

    const { token } = await submitRes.json();
    if (!token) {
      return res.status(502).json({ error: "Judge0 returned no token" });
    }

    // Step 2: Poll for result
    let result = null;
    for (let attempt = 0; attempt < 12; attempt++) {
      await new Promise((r) => setTimeout(r, 700));

      const pollRes = await fetch(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status,time,memory,compile_output`,
        { headers }
      );

      if (!pollRes.ok) continue;
      result = await pollRes.json();

      if (result?.status?.id >= 3) break;
    }

    if (!result) {
      return res
        .status(504)
        .json({ error: "Execution timed out waiting for Judge0" });
    }

    return res.status(200).json({
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      compile_output: result.compile_output || "",
      status: result.status || { id: 0, description: "Unknown" },
      time: result.time || null,
      memory: result.memory || null,
    });
  } catch (err) {
    console.error("[/api/execute] Error:", err);
    return res.status(500).json({
      error: "Execution service error",
      details: err.message,
    });
  }
}

