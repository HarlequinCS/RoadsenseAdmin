"use client";

import { useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AnalyticsSummaryInput, AnalyticsSummaryResult } from "@/lib/ai/types";
import { IconSparkles, IconAlertTriangle, IconClipboard } from "@tabler/icons-react";
import { useEffect } from "react";

interface AiAnalyticsSummaryProps {
  data: AnalyticsSummaryInput;
}

export default function AiAnalyticsSummary({ data }: AiAnalyticsSummaryProps) {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyticsSummaryResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setAdminUser);
    return () => unsub();
  }, []);

  async function generateSummary() {
    if (!adminUser) {
      setError("Sign in required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = await adminUser.getIdToken();
      const res = await fetch("/api/ai/analytics-summary", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "AI summary failed");
        setResult(null);
        return;
      }

      setResult(json as AnalyticsSummaryResult);
    } catch {
      setError("Could not reach AI service.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function copySummary() {
    if (!result) return;
    const text = [
      result.narrative,
      "",
      "Highlights:",
      ...result.highlights.map((h) => `• ${h}`),
      "",
      result.concerns.length ? "Concerns:" : "",
      ...result.concerns.map((c) => `• ${c}`),
      "",
      `Recommendation: ${result.recommendation}`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(text);
  }

  return (
    <div className="no-print border border-fog-200 dark:border-asphalt-800 bg-white dark:bg-asphalt-900 rounded-xl p-5 mb-7">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconSparkles size={16} className="text-amber-500" />
          <p className="font-display font-medium text-sm text-asphalt-950 dark:text-fog-50">
            AI stakeholder summary
          </p>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button
              onClick={copySummary}
              className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"
            >
              <IconClipboard size={13} />
              Copy
            </button>
          )}
          <button
            onClick={generateSummary}
            disabled={loading || !adminUser}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-asphalt-950 dark:bg-fog-100 text-white dark:text-asphalt-950 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Generating…" : result ? "Regenerate" : "Generate summary"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 text-xs bg-signal-red-50 dark:bg-signal-red-600/15 border border-signal-red-100 dark:border-signal-red-600/30 rounded-lg px-3 py-2.5 text-signal-red-600 dark:text-signal-red-100">
          <IconAlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!result && !loading && !error && (
        <p className="text-xs text-fog-400">
          Generate an executive narrative from current analytics for reports and stakeholders.
        </p>
      )}

      {result && (
        <div className="space-y-4 text-sm">
          <p className="text-asphalt-950 dark:text-fog-100 leading-relaxed">{result.narrative}</p>

          {result.highlights.length > 0 && (
            <div>
              <p className="text-xs font-medium text-fog-500 mb-1.5">Highlights</p>
              <ul className="text-xs text-fog-600 dark:text-fog-400 space-y-1 list-disc pl-4">
                {result.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {result.concerns.length > 0 && (
            <div>
              <p className="text-xs font-medium text-signal-red-500 mb-1.5">Concerns</p>
              <ul className="text-xs text-fog-600 dark:text-fog-400 space-y-1 list-disc pl-4">
                {result.concerns.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg px-3 py-2.5 text-amber-700 dark:text-amber-300">
            <span className="font-medium">Recommendation: </span>
            {result.recommendation}
          </div>
        </div>
      )}
    </div>
  );
}
