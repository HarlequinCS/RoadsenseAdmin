"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Hazard } from "@/lib/types";
import { normalizeHazard } from "@/lib/firestore-helpers";
import { isActiveHazard } from "@/lib/hazard-utils";
import { riskChartColors, statusChartColors } from "@/lib/style-helpers";
import StatCard from "@/components/StatCard";
import { IconMap2, IconAlertTriangle, IconFlame } from "@tabler/icons-react";

const HazardMap = dynamic(() => import("@/components/HazardMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-280px)] min-h-[400px] rounded-lg bg-fog-100 dark:bg-asphalt-800 animate-pulse" />
  ),
});

type ColorMode = "status" | "risk";
type MapFilter = "all" | "new" | "critical" | "investigating";

const MAP_FILTERS: { key: MapFilter; label: string }[] = [
  { key: "all", label: "All active" },
  { key: "new", label: "New" },
  { key: "critical", label: "Critical" },
  { key: "investigating", label: "Investigating" },
];

function MapPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlFilter = (searchParams.get("filter") as MapFilter) || "all";

  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [colorBy, setColorBy] = useState<ColorMode>("risk");
  const [showResolved, setShowResolved] = useState(false);
  const [mapHeight, setMapHeight] = useState(500);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "hazards"), (snap) => {
      setHazards(snap.docs.map((d) => normalizeHazard(d.id, d.data())));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setMapHeight(Math.max(400, window.innerHeight - 320));
  }, []);

  const setUrlFilter = useCallback(
    (filter: MapFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (filter === "all") params.delete("filter");
      else params.set("filter", filter);
      const qs = params.toString();
      router.replace(qs ? `/map?${qs}` : "/map");
    },
    [router, searchParams]
  );

  const filtered = useMemo(() => {
    let list = showResolved ? hazards : hazards.filter(isActiveHazard);

    if (urlFilter === "new") {
      list = list.filter((h) => h.status === "New");
    } else if (urlFilter === "critical") {
      list = list.filter(
        (h) => isActiveHazard(h) && (h.riskLevel === "High" || h.riskLevel === "Critical")
      );
    } else if (urlFilter === "investigating") {
      list = list.filter((h) => h.status === "Under Investigation");
    }

    return list;
  }, [hazards, showResolved, urlFilter]);

  const activeCount = hazards.filter(isActiveHazard).length;
  const highCritical = hazards.filter(
    (h) => isActiveHazard(h) && (h.riskLevel === "High" || h.riskLevel === "Critical")
  ).length;

  const legendColors = colorBy === "risk"
    ? (["Low", "Medium", "High", "Critical"] as const).map((r) => ({ label: r, color: riskChartColors[r] }))
    : (["New", "Under Investigation", "Resolved"] as const).map((s) => ({ label: s, color: statusChartColors[s] }));

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-1.5">
            Map view
          </p>
          <h1 className="font-display font-semibold text-[26px] text-asphalt-950 dark:text-fog-50 tracking-tight">
            Hazard map
          </h1>
          <p className="text-xs text-fog-600 dark:text-fog-400 mt-1">
            Select a hazard from the list to zoom in, or click a marker on the map
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex rounded-lg border border-fog-200 dark:border-asphalt-700 overflow-hidden text-xs">
            <button
              onClick={() => setColorBy("risk")}
              className={`px-3 py-1.5 transition-colors ${colorBy === "risk" ? "bg-asphalt-950 text-white dark:bg-fog-100 dark:text-asphalt-950" : "text-fog-600 hover:bg-fog-50 dark:hover:bg-asphalt-800"}`}
            >
              Colour by risk
            </button>
            <button
              onClick={() => setColorBy("status")}
              className={`px-3 py-1.5 transition-colors ${colorBy === "status" ? "bg-asphalt-950 text-white dark:bg-fog-100 dark:text-asphalt-950" : "text-fog-600 hover:bg-fog-50 dark:hover:bg-asphalt-800"}`}
            >
              Colour by status
            </button>
          </div>
          <label className="flex items-center gap-1.5 text-xs text-fog-600 dark:text-fog-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded"
            />
            Show resolved
          </label>
        </div>
      </div>

      <div className="lane-divider w-full mb-6" />

      <div className="flex gap-1.5 flex-wrap mb-4">
        {MAP_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setUrlFilter(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              urlFilter === key
                ? "bg-asphalt-950 dark:bg-fog-100 text-white dark:text-asphalt-950 border-transparent"
                : "border-fog-200 dark:border-asphalt-700 text-fog-600 dark:text-fog-400 hover:bg-fog-50 dark:hover:bg-asphalt-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        <StatCard label="Active hazards" value={activeCount} icon={<IconMap2 size={16} />} tone="warning" animate />
        <StatCard label="High / Critical" value={highCritical} icon={<IconFlame size={16} />} tone="danger" animate />
        <StatCard label="Showing on map" value={filtered.length} icon={<IconAlertTriangle size={16} />} tone="info" animate />
      </div>

      <div className="bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-xl p-4">
        <div className="flex items-center gap-4 mb-3 text-[11px] text-fog-600 dark:text-fog-400">
          {legendColors.map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
        <HazardMap
          hazards={filtered}
          activeOnly={false}
          colorBy={colorBy}
          height={mapHeight}
          layout="with-panel"
        />
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="h-96 rounded-xl bg-fog-100 dark:bg-asphalt-800 animate-pulse" />}>
      <MapPageContent />
    </Suspense>
  );
}
