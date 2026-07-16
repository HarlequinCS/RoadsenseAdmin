"use client";

import Link from "next/link";
import { Hazard } from "@/lib/types";
import { isActiveHazard, countActiveHighCritical } from "@/lib/hazard-utils";
import { IconFlame, IconAlertCircle, IconCircleCheck, IconArrowRight } from "@tabler/icons-react";

interface PriorityBannerProps {
  hazards: Hazard[];
}

export default function PriorityBanner({ hazards }: PriorityBannerProps) {
  const newCount = hazards.filter((h) => h.status === "New").length;
  const criticalCount = countActiveHighCritical(hazards);
  const needsAttention = newCount > 0 || criticalCount > 0;

  if (!needsAttention) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-signal-teal-100 dark:border-signal-teal-600/30 bg-signal-teal-50 dark:bg-signal-teal-600/10 px-5 py-4">
        <div className="w-9 h-9 rounded-lg bg-signal-teal-100 dark:bg-signal-teal-600/25 flex items-center justify-center shrink-0">
          <IconCircleCheck size={18} className="text-signal-teal-600 dark:text-signal-teal-100" />
        </div>
        <div>
          <p className="font-display font-medium text-sm text-asphalt-950 dark:text-fog-50">
            All clear — no urgent hazards
          </p>
          <p className="text-xs text-fog-600 dark:text-fog-400 mt-0.5">
            No new or high-risk reports need your attention right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/15 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
            Needs attention
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {criticalCount > 0 && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-asphalt-950 dark:text-fog-50">
                <IconFlame size={16} className="text-signal-red-500" />
                {criticalCount} high / critical hazard{criticalCount !== 1 ? "s" : ""}
              </span>
            )}
            {newCount > 0 && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-asphalt-950 dark:text-fog-50">
                <IconAlertCircle size={16} className="text-amber-600" />
                {newCount} new report{newCount !== 1 ? "s" : ""} awaiting review
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {criticalCount > 0 && (
            <Link
              href="/reports?filter=critical"
              className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-signal-red-500 text-white hover:bg-signal-red-600 transition-colors"
            >
              Review critical
              <IconArrowRight size={14} />
            </Link>
          )}
          {newCount > 0 && (
            <Link
              href="/reports?filter=new"
              className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-asphalt-950 dark:bg-fog-100 text-white dark:text-asphalt-950 hover:opacity-90 transition-opacity"
            >
              View new reports
              <IconArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
