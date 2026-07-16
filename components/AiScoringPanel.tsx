"use client";

import { useEffect, useState } from "react";
import { Hazard, RISK_LEVELS, RiskLevel } from "@/lib/types";
import { aiScoringStatusLabels, formatDateTime } from "@/lib/style-helpers";
import { isAiScoringPending, isAiScoringStuck } from "@/lib/hazard-utils";
import RiskBadge from "@/components/RiskBadge";
import RiskSourceBadge from "@/components/RiskSourceBadge";
import { IconLoader2, IconAlertTriangle } from "@tabler/icons-react";

interface AiScoringPanelProps {
  hazard: Hazard;
  overrideRisk: RiskLevel;
  onOverrideRiskChange: (risk: RiskLevel) => void;
  onOverrideSave: () => void;
  savingOverride: boolean;
}

export default function AiScoringPanel({
  hazard,
  overrideRisk,
  onOverrideRiskChange,
  onOverrideSave,
  savingOverride,
}: AiScoringPanelProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!isAiScoringPending(hazard)) return;
    const id = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, [hazard]);

  const hasAiFields =
    hazard.ruleBasedRiskLevel ||
    hazard.aiRiskLevel ||
    hazard.aiReason ||
    hazard.riskSource ||
    hazard.aiScoringStatus;

  if (!hasAiFields) {
    return (
      <div className="border border-fog-200 dark:border-asphalt-800 bg-white dark:bg-asphalt-900 rounded-xl p-5 text-sm">
        <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-2">
          AI priority
        </p>
        <p className="text-xs text-fog-500">
          No AI scoring metadata on this report (legacy hazard or pre-AI app version).
        </p>
      </div>
    );
  }

  const status = hazard.aiScoringStatus;
  const statusLabel = status ? aiScoringStatusLabels[status as keyof typeof aiScoringStatusLabels] : null;
  const pending = isAiScoringPending(hazard);
  const stuck = isAiScoringStuck(hazard);
  const confidencePct =
    typeof hazard.aiConfidence === "number"
      ? `${Math.round(hazard.aiConfidence <= 1 ? hazard.aiConfidence * 100 : hazard.aiConfidence)}%`
      : null;

  return (
    <div className="border border-fog-200 dark:border-asphalt-800 bg-white dark:bg-asphalt-900 rounded-xl p-5 text-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-1">
            AI priority (mobile)
          </p>
          <p className="text-xs text-fog-500">
            Groq AI scores hazards when the admin dashboard is open (or via Cloud Function when deployed). Matches the mobile app&apos;s rules-first, AI-second priority model.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hazard.riskSource && !pending && <RiskSourceBadge source={hazard.riskSource} />}
          {pending && (
            <span className="inline-flex items-center gap-1 text-[10px] text-signal-blue-600 dark:text-signal-blue-400">
              <IconLoader2 size={12} className="animate-spin" />
              {statusLabel ?? "AI reviewing…"}
            </span>
          )}
          {status === "complete" && !pending && (
            <span className="text-[10px] text-signal-teal-600 dark:text-signal-teal-400">
              {statusLabel ?? "AI scored"}
            </span>
          )}
          {status === "failed" && (
            <span className="inline-flex items-center gap-1 text-[10px] text-signal-red-600">
              <IconAlertTriangle size={12} />
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      {stuck && (
        <div className="flex items-start gap-2 text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2.5 text-amber-700 dark:text-amber-400">
          <IconAlertTriangle size={14} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">AI scoring is taking longer than expected</p>
            <p className="mt-1 text-[11px] leading-relaxed">
              Firestore still shows <code className="text-[10px]">aiScoringStatus: pending</code>.
              Deploy the Cloud Function <code className="text-[10px]">scoreHazardRisk</code> and set the{" "}
              <code className="text-[10px]">GROQ_API_KEYS</code> secret in Firebase (see{" "}
              <code className="text-[10px]">docs/GROQ_HAZARD_SCORING.md</code>).
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-fog-500 mb-1">Final priority</p>
          <RiskBadge risk={hazard.riskLevel} />
        </div>
        {hazard.ruleBasedRiskLevel && (
          <div>
            <p className="text-fog-500 mb-1">Rule-based (phone)</p>
            <RiskBadge risk={hazard.ruleBasedRiskLevel} />
          </div>
        )}
        {hazard.aiRiskLevel && (
          <div>
            <p className="text-fog-500 mb-1">AI suggestion</p>
            <RiskBadge risk={hazard.aiRiskLevel} />
          </div>
        )}
        {confidencePct && (
          <div>
            <p className="text-fog-500 mb-1">AI confidence</p>
            <p className="font-medium text-asphalt-950 dark:text-fog-100">{confidencePct}</p>
          </div>
        )}
      </div>

      {hazard.aiReason && (
        <div>
          <p className="text-fog-500 mb-1 text-xs">AI reason</p>
          <p className="text-xs text-asphalt-950 dark:text-fog-100 leading-relaxed">
            {hazard.aiReason}
          </p>
        </div>
      )}

      {hazard.aiScoredAt && (
        <p className="text-[11px] text-fog-400">
          Scored at {formatDateTime(hazard.aiScoredAt)}
        </p>
      )}

      <div className="no-print pt-2 border-t border-fog-100 dark:border-asphalt-800">
        <p className="text-fog-500 mb-2 text-xs">Admin override</p>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={overrideRisk}
            onChange={(e) => onOverrideRiskChange(e.target.value as RiskLevel)}
            className="text-sm rounded-md border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2"
          >
            {RISK_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <button
            onClick={onOverrideSave}
            disabled={savingOverride || overrideRisk === hazard.riskLevel}
            className="text-sm px-3 py-2 rounded-md bg-asphalt-950 text-white dark:bg-fog-100 dark:text-asphalt-950 hover:bg-asphalt-800 transition-colors disabled:opacity-50"
          >
            {savingOverride ? "Saving…" : "Set priority"}
          </button>
        </div>
        <p className="text-[11px] text-fog-400 mt-2">
          Sets <code className="text-[10px]">riskSource: admin</code> — mobile app updates via real-time sync.
        </p>
      </div>
    </div>
  );
}
