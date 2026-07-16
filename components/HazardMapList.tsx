"use client";

import { useMemo } from "react";
import { Hazard, RiskLevel } from "@/lib/types";
import { formatDate, riskChartColors, statusChartColors } from "@/lib/style-helpers";
import HazardThumbnail from "@/components/HazardThumbnail";
import StatusBadge from "@/components/StatusBadge";
import RiskBadge from "@/components/RiskBadge";
import { IconMapPin } from "@tabler/icons-react";

const RISK_ORDER: Record<RiskLevel, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

type ColorMode = "status" | "risk";

interface HazardMapListProps {
  hazards: Hazard[];
  selectedId?: string | null;
  colorBy?: ColorMode;
  onSelect: (hazard: Hazard) => void;
}

export default function HazardMapList({
  hazards,
  selectedId,
  colorBy = "risk",
  onSelect,
}: HazardMapListProps) {
  const sorted = useMemo(() => {
    return [...hazards].sort((a, b) => {
      const ra = RISK_ORDER[a.riskLevel as RiskLevel] ?? 4;
      const rb = RISK_ORDER[b.riskLevel as RiskLevel] ?? 4;
      if (ra !== rb) return ra - rb;
      return new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime();
    });
  }, [hazards]);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <IconMapPin size={28} className="text-fog-300 mb-2" strokeWidth={1.5} />
        <p className="text-xs text-fog-400">No hazards match the current filter.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-fog-100 dark:border-asphalt-800 shrink-0">
        <p className="font-display font-medium text-sm text-asphalt-950 dark:text-fog-50">
          Hazard list
        </p>
        <p className="text-[11px] text-fog-400 mt-0.5">
          Click a report to zoom the map to its location
        </p>
      </div>

      <ul className="flex-1 overflow-y-auto min-h-0 divide-y divide-fog-100 dark:divide-asphalt-800">
        {sorted.map((h) => {
          const isSelected = selectedId === h.id;
          const accent =
            colorBy === "risk"
              ? riskChartColors[h.riskLevel as keyof typeof riskChartColors] || "#888"
              : statusChartColors[h.status] || "#888";

          return (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => onSelect(h)}
                className={`w-full text-left px-4 py-3 flex gap-3 transition-colors ${
                  isSelected
                    ? "bg-amber-50 dark:bg-amber-900/20"
                    : "hover:bg-fog-50 dark:hover:bg-asphalt-800/60"
                }`}
              >
                <span
                  className="w-1 shrink-0 rounded-full self-stretch"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
                <HazardThumbnail
                  imageUrl={h.imageUrl}
                  hazardType={h.hazardType}
                  size={44}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs text-asphalt-950 dark:text-fog-50 truncate">
                    {h.hazardType}
                  </p>
                  <p className="text-[11px] text-fog-500 truncate mt-0.5">
                    {h.reporterName}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <StatusBadge status={h.status} />
                    <RiskBadge risk={h.riskLevel} />
                  </div>
                  <p className="text-[10px] text-fog-400 mt-1.5">
                    {formatDate(h.createdAt)}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
