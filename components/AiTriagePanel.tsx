"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { TriageInput, TriageResult, PhotoAnalysisResult } from "@/lib/ai/types";
import RiskBadge from "@/components/RiskBadge";
import {
  IconSparkles,
  IconAlertTriangle,
  IconClipboard,
  IconPhoto,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

interface AiTriagePanelProps {
  hazard: TriageInput;
  adminUser: User | null;
  onInsertNote: (note: string) => void;
}

type Tab = "triage" | "photo";

export default function AiTriagePanel({
  hazard,
  adminUser,
  onInsertNote,
}: AiTriagePanelProps) {
  const [tab, setTab] = useState<Tab>("triage");
  const [triageLoading, setTriageLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [photoResult, setPhotoResult] = useState<PhotoAnalysisResult | null>(null);
  const [error, setError] = useState("");

  const hasPhoto = Boolean(hazard.imageUrl);

  async function runTriage() {
    if (!adminUser) {
      setError("Sign in required.");
      return;
    }

    setTriageLoading(true);
    setError("");

    try {
      const token = await adminUser.getIdToken();
      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hazard),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "AI analysis failed");
        setTriageResult(null);
        return;
      }

      setTriageResult(data as TriageResult);
    } catch {
      setError("Could not reach AI service.");
      setTriageResult(null);
    } finally {
      setTriageLoading(false);
    }
  }

  async function runPhotoAnalysis() {
    if (!adminUser || !hazard.imageUrl) {
      setError("Photo required for image analysis.");
      return;
    }

    setPhotoLoading(true);
    setError("");

    try {
      const token = await adminUser.getIdToken();
      const res = await fetch("/api/ai/analyze-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hazardType: hazard.hazardType,
          description: hazard.description,
          riskLevel: hazard.riskLevel,
          status: hazard.status,
          latitude: hazard.latitude,
          longitude: hazard.longitude,
          address: hazard.address,
          imageUrl: hazard.imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Photo analysis failed");
        setPhotoResult(null);
        return;
      }

      setPhotoResult(data as PhotoAnalysisResult);
    } catch {
      setError("Could not reach AI service.");
      setPhotoResult(null);
    } finally {
      setPhotoLoading(false);
    }
  }

  const loading = tab === "triage" ? triageLoading : photoLoading;

  return (
    <div className="no-print border border-fog-200 dark:border-asphalt-800 bg-white dark:bg-asphalt-900 rounded-xl p-5 text-sm h-fit">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconSparkles size={16} className="text-amber-500" />
          <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase">
            AI Assist
          </p>
        </div>
        <button
          onClick={tab === "triage" ? runTriage : runPhotoAnalysis}
          disabled={loading || !adminUser || (tab === "photo" && !hasPhoto)}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-asphalt-950 dark:bg-fog-100 text-white dark:text-asphalt-950 hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading
            ? "Analyzing…"
            : tab === "triage"
              ? triageResult
                ? "Re-analyze"
                : "Analyze report"
              : photoResult
                ? "Re-analyze photo"
                : "Analyze photo"}
        </button>
      </div>

      <div className="flex gap-1 mb-4 p-0.5 bg-fog-50 dark:bg-asphalt-800 rounded-lg">
        <button
          onClick={() => setTab("triage")}
          className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
            tab === "triage"
              ? "bg-white dark:bg-asphalt-900 text-asphalt-950 dark:text-fog-50 font-medium shadow-sm"
              : "text-fog-500"
          }`}
        >
          Triage
        </button>
        {hasPhoto && (
          <button
            onClick={() => setTab("photo")}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${
              tab === "photo"
                ? "bg-white dark:bg-asphalt-900 text-asphalt-950 dark:text-fog-50 font-medium shadow-sm"
                : "text-fog-500"
            }`}
          >
            <IconPhoto size={12} />
            Photo
          </button>
        )}
      </div>

      <p className="text-[11px] text-fog-400 mb-4">
        Powered by Groq · AI suggestion only — verify before acting
      </p>

      {error && (
        <div className="mb-3 flex items-start gap-2 text-xs bg-signal-red-50 dark:bg-signal-red-600/15 border border-signal-red-100 dark:border-signal-red-600/30 rounded-lg px-3 py-2.5 text-signal-red-600 dark:text-signal-red-100">
          <IconAlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {tab === "triage" && !triageResult && !triageLoading && !error && (
        <p className="text-xs text-fog-400">
          Get a quick summary, priority suggestion, and draft admin note for this report.
        </p>
      )}

      {tab === "photo" && !photoResult && !photoLoading && !error && hasPhoto && (
        <p className="text-xs text-fog-400">
          AI will inspect the hazard photo and compare it with the reported type and risk level.
        </p>
      )}

      {tab === "triage" && triageResult && (
        <div className="space-y-4">
          <div>
            <p className="text-fog-600 dark:text-fog-400 text-xs mb-1">Summary</p>
            <p className="text-asphalt-950 dark:text-fog-100 text-sm leading-relaxed">
              {triageResult.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-fog-500">Suggested priority:</p>
            <RiskBadge risk={triageResult.suggestedPriority} />
          </div>

          <div>
            <p className="text-fog-600 dark:text-fog-400 text-xs mb-1">Recommended action</p>
            <p className="text-asphalt-950 dark:text-fog-100 text-sm">{triageResult.suggestedAction}</p>
          </div>

          {triageResult.reasoning && (
            <div>
              <p className="text-fog-600 dark:text-fog-400 text-xs mb-1">Reasoning</p>
              <p className="text-xs text-fog-500 leading-relaxed">{triageResult.reasoning}</p>
            </div>
          )}

          <div>
            <p className="text-fog-600 dark:text-fog-400 text-xs mb-1">Draft admin note</p>
            <p className="text-sm text-asphalt-950 dark:text-fog-100 bg-fog-50 dark:bg-asphalt-800 rounded-lg px-3 py-2.5 leading-relaxed">
              {triageResult.draftNote}
            </p>
            <button
              onClick={() => onInsertNote(triageResult.draftNote)}
              className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline"
            >
              <IconClipboard size={13} />
              Insert into admin notes
            </button>
          </div>
        </div>
      )}

      {tab === "photo" && photoResult && (
        <div className="space-y-4">
          <div>
            <p className="text-fog-600 dark:text-fog-400 text-xs mb-1">Visible damage</p>
            <p className="text-asphalt-950 dark:text-fog-100 text-sm leading-relaxed">
              {photoResult.visibleDamage}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-fog-500">AI severity:</p>
            <RiskBadge risk={photoResult.severityAssessment} />
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1 text-fog-600 dark:text-fog-400">
              Type match:
              {photoResult.matchesReportedType ? (
                <IconCheck size={14} className="text-signal-teal-500" />
              ) : (
                <IconX size={14} className="text-signal-red-500" />
              )}
            </span>
            <span className="flex items-center gap-1 text-fog-600 dark:text-fog-400">
              Risk match:
              {photoResult.matchesReportedRisk ? (
                <IconCheck size={14} className="text-signal-teal-500" />
              ) : (
                <IconX size={14} className="text-signal-red-500" />
              )}
            </span>
          </div>

          {photoResult.additionalObservations && (
            <div>
              <p className="text-fog-600 dark:text-fog-400 text-xs mb-1">Additional observations</p>
              <p className="text-xs text-fog-500 leading-relaxed">{photoResult.additionalObservations}</p>
            </div>
          )}

          {photoResult.confidenceNote && (
            <p className="text-[11px] text-fog-400 italic">{photoResult.confidenceNote}</p>
          )}
        </div>
      )}
    </div>
  );
}
