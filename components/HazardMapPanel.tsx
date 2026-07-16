"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Hazard } from "@/lib/types";
import { formatDate } from "@/lib/style-helpers";
import { updateHazardStatus } from "@/lib/hazard-service";
import HazardThumbnail from "@/components/HazardThumbnail";
import StatusBadge from "@/components/StatusBadge";
import RiskBadge from "@/components/RiskBadge";
import { IconX, IconSearch, IconArrowRight, IconChevronLeft } from "@tabler/icons-react";

interface HazardMapPanelProps {
  hazard: Hazard;
  onClose: () => void;
  onUpdated?: (hazard: Hazard) => void;
  onBackToList?: () => void;
}

export default function HazardMapPanel({ hazard, onClose, onUpdated, onBackToList }: HazardMapPanelProps) {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setAdminUser);
    return () => unsub();
  }, []);

  async function startInvestigation() {
    if (!adminUser || hazard.status !== "New") return;
    setUpdating(true);
    try {
      await updateHazardStatus(hazard.id, "Under Investigation", adminUser.uid, {
        adminUid: adminUser.uid,
        adminEmail: adminUser.email ?? undefined,
        hazardId: hazard.id,
        hazardType: hazard.hazardType,
        reporterName: hazard.reporterName,
        previousStatus: hazard.status,
      });
      if (hazard.userId) {
        const { syncUserStats } = await import("@/lib/hazard-service");
        await syncUserStats(hazard.userId);
      }
      onUpdated?.({ ...hazard, status: "Under Investigation" });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <aside className="w-full flex flex-col h-full min-h-0 overflow-y-auto bg-white dark:bg-asphalt-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-fog-100 dark:border-asphalt-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="p-1 rounded-md text-fog-400 hover:text-fog-600 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors shrink-0"
              aria-label="Back to list"
            >
              <IconChevronLeft size={16} />
            </button>
          )}
          <p className="font-display font-medium text-sm text-asphalt-950 dark:text-fog-50 truncate">
            Hazard details
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-fog-400 hover:text-fog-600 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors"
          aria-label="Close panel"
        >
          <IconX size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <HazardThumbnail
          imageUrl={hazard.imageUrl}
          hazardType={hazard.hazardType}
          size={120}
        />

        <div>
          <p className="font-display font-semibold text-base text-asphalt-950 dark:text-fog-50">
            {hazard.hazardType}
          </p>
          <p className="text-xs text-fog-500 mt-0.5">{hazard.reporterName}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={hazard.status} />
          <RiskBadge risk={hazard.riskLevel} />
        </div>

        {hazard.description && (
          <p className="text-xs text-fog-600 dark:text-fog-400 leading-relaxed">
            {hazard.description}
          </p>
        )}

        <div className="text-[11px] text-fog-400 space-y-1">
          <p>Reported {formatDate(hazard.createdAt)}</p>
          <p>
            {hazard.latitude.toFixed(5)}, {hazard.longitude.toFixed(5)}
          </p>
          {hazard.verificationCount > 0 && (
            <p>{hazard.verificationCount} community verification{hazard.verificationCount !== 1 ? "s" : ""}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {hazard.status === "New" && (
            <button
              onClick={startInvestigation}
              disabled={updating || !adminUser}
              className="flex items-center justify-center gap-1.5 w-full text-xs font-medium px-4 py-2.5 rounded-lg bg-asphalt-950 dark:bg-fog-100 text-white dark:text-asphalt-950 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <IconSearch size={14} />
              {updating ? "Updating…" : "Start investigation"}
            </button>
          )}
          <Link
            href={`/reports/${hazard.id}`}
            className="flex items-center justify-center gap-1.5 w-full text-xs font-medium px-4 py-2.5 rounded-lg border border-fog-200 dark:border-asphalt-700 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors text-asphalt-700 dark:text-fog-200"
          >
            View full report
            <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
