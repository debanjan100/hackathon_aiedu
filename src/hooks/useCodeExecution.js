import { useState, useCallback } from "react";

// Judge0 CE Language IDs — subset used in CognifyX
export const LANGUAGE_MAP = {
  python:     { id: 71, name: "Python 3.8",           ext: "py" },
  javascript: { id: 63, name: "JavaScript (Node 12)", ext: "js" },
  cpp:        { id: 54, name: "C++ (GCC 9.2)",        ext: "cpp" },
  java:       { id: 62, name: "Java (OpenJDK 13)",    ext: "java" },
  c:          { id: 50, name: "C (GCC 9.2)",          ext: "c"   },
};

export function useCodeExecution() {
  const [isRunning, setIsRunning]         = useState(false);
  const [output, setOutput]               = useState(null);
  const [error, setError]                 = useState(null);
  const [executionTime, setExecutionTime] = useState(null);

  const runCode = useCallback(
    async (sourceCode, language, stdin = "") => {
      if (isRunning) return;
      if (!sourceCode?.trim()) {
        setError("Your editor is empty. Write some code first!");
        return;
      }

      const langConfig = LANGUAGE_MAP[language];
      if (!langConfig) {
        setError(
          `Language "${language}" is not supported. Choose from: ${Object.keys(
            LANGUAGE_MAP
          ).join(", ")}`
        );
        return;
      }

      setIsRunning(true);
      setOutput(null);
      setError(null);
      setExecutionTime(null);

      const wallStart = Date.now();

      try {
        const res = await fetch("/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_code: sourceCode,
            language_id: langConfig.id,
            stdin,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || `Server error (HTTP ${res.status})`);
        }

        const wallElapsed = ((Date.now() - wallStart) / 1000).toFixed(2);
        setExecutionTime(data.time || wallElapsed);
        setOutput(data);
        return data;
      } catch (err) {
        setError(
          err.message ||
            "Failed to reach execution service. Check your network."
        );
      } finally {
        setIsRunning(false);
      }
    },
    [isRunning]
  );

  const clearOutput = useCallback(() => {
    setOutput(null);
    setError(null);
    setExecutionTime(null);
  }, []);

  return { runCode, isRunning, output, error, executionTime, clearOutput };
}

