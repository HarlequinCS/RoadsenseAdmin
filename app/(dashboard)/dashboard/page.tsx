"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Hazard } from "@/lib/types";
import { formatDate, getHazardTypeColor, riskChartColors, toDate } from "@/lib/style-helpers";
import { normalizeHazard } from "@/lib/firestore-helpers";
import {
  isActiveHazard,
  countActiveHighCritical,
  countNewReportsToday,
  findLatestHazard,
  formatTimeAgo,
} from "@/lib/hazard-utils";
import StatusBadge from "@/components/StatusBadge";
import RiskBadge from "@/components/RiskBadge";
import StatCard from "@/components/StatCard";
import SeedDataButton from "@/components/SeedDataButton";
import PriorityBanner from "@/components/PriorityBanner";
import EmptyState from "@/components/EmptyState";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  IconFileText, IconAlertCircle, IconRefresh, IconArrowRight, IconSearch, IconFlame,
  IconWifi,
} from "@tabler/icons-react";

const HazardMap = dynamic(() => import("@/components/HazardMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] rounded-lg bg-fog-100 dark:bg-asphalt-800 animate-pulse" />
  ),
});

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-asphalt-800 border border-fog-200 dark:border-asphalt-700 rounded-lg px-3 py-2 text-xs shadow-sm">
      <p className="font-medium mb-1">{label || payload[0]?.name}</p>
      <p className="text-fog-600 dark:text-fog-400">{payload[0]?.value} reports</p>
    </div>
  );
}

export default function DashboardPage() {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "hazards"), (snap) => {
      setHazards(snap.docs.map((d) => normalizeHazard(d.id, d.data())));
      setLastUpdated(new Date());
    });
    return () => unsub();
  }, []);

  const activeHazards = hazards.filter(isActiveHazard);
  const newReports = hazards.filter((h) => h.status === "New").length;
  const underInvestigation = hazards.filter((h) => h.status === "Under Investigation").length;
  const highCritical = countActiveHighCritical(hazards);
  const newToday = countNewReportsToday(hazards);
  const lastReport = useMemo(() => findLatestHazard(hazards), [hazards]);
  const lastReportDate = lastReport ? toDate(lastReport.createdAt) : null;

  const byType = Object.entries(
    hazards.reduce((acc, h) => { acc[h.hazardType] = (acc[h.hazardType] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const recent = [...hazards]
    .sort((a, b) => {
      const da = toDate(a.createdAt)?.getTime() ?? 0;
      const db = toDate(b.createdAt)?.getTime() ?? 0;
      return db - da;
    })
    .slice(0, 6);

  const filtered = recent.filter(
    (r) =>
      r.reporterName?.toLowerCase().includes(search.toLowerCase()) ||
      r.hazardType?.toLowerCase().includes(search.toLowerCase())
  );

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-1.5">
            Dashboard
          </p>
          <h1 className="font-display font-semibold text-[26px] text-asphalt-950 dark:text-fog-50 tracking-tight">
            Overview
          </h1>
          <p className="text-xs text-fog-600 dark:text-fog-400 mt-1">
            What needs your attention right now — your action queue for road safety
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SeedDataButton />
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-fog-200 dark:border-asphalt-700 hover:bg-white dark:hover:bg-asphalt-800 transition-colors text-asphalt-700 dark:text-fog-200"
          >
            <IconRefresh size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="lane-divider w-full mb-6" />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-end gap-4">
          <p className="font-display font-bold text-[40px] sm:text-[56px] leading-none text-asphalt-950 dark:text-fog-50 tabular-nums">
            {activeHazards.length}
          </p>
          <div className="pb-1">
            <p className="font-display font-semibold text-lg text-asphalt-950 dark:text-fog-50">
              Active hazards
            </p>
            <p className="text-xs text-fog-500 dark:text-fog-400 mt-0.5">
              {highCritical > 0
                ? `${highCritical} high or critical need priority review`
                : "No high-risk hazards in the queue"}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-fog-400 shrink-0" suppressHydrationWarning>
          Updated {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      {lastReportDate && (
        <div className="mb-6 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-signal-teal-50 dark:bg-signal-teal-500/10 border border-signal-teal-100 dark:border-signal-teal-500/20">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-teal-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-teal-500" />
          </span>
          <IconWifi size={14} className="text-signal-teal-600 dark:text-signal-teal-100 shrink-0" />
          <p className="text-xs text-signal-teal-600 dark:text-signal-teal-100" suppressHydrationWarning>
            Connected to RoadSense mobile · Last report {formatTimeAgo(lastReportDate)}
          </p>
        </div>
      )}

      <PriorityBanner hazards={hazards} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        <StatCard
          label="New reports"
          value={newReports}
          icon={<IconAlertCircle size={16} />}
          tone="warning"
          animate
          delta={newToday > 0 ? `+${newToday} today` : undefined}
        />
        <StatCard label="Active hazards" value={activeHazards.length} icon={<IconAlertCircle size={16} />} tone="warning" animate />
        <StatCard label="High / Critical" value={highCritical} icon={<IconFlame size={16} />} tone="danger" animate />
        <StatCard label="Under investigation" value={underInvestigation} icon={<IconFileText size={16} />} tone="default" animate />
      </div>

      <div className="bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-xl p-4 mb-7">
        <p className="font-display font-medium text-sm mb-1 text-asphalt-950 dark:text-fog-50">
          Reports by hazard type
        </p>
        <p className="text-[11px] text-fog-400 mb-3">
          Quick snapshot — see Analytics for full trends and breakdowns
        </p>
        {byType.length === 0 ? (
          <EmptyState variant="no-data" className="py-8" />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byType} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {byType.map((entry) => (
                  <Cell key={entry.name} fill={getHazardTypeColor(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-xl p-4 mb-7">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display font-medium text-sm text-asphalt-950 dark:text-fog-50">Active hazard map</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-[11px] text-fog-600 dark:text-fog-400">
              {(["Low", "Medium", "High", "Critical"] as const).map((r) => (
                <span key={r} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: riskChartColors[r] }} />
                  {r}
                </span>
              ))}
            </div>
            <Link href="/map" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
              Full map →
            </Link>
          </div>
        </div>
        <HazardMap hazards={hazards} activeOnly colorBy="risk" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="font-display font-medium text-sm text-asphalt-950 dark:text-fog-50">Recent reports</p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fog-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="text-xs rounded-lg border border-fog-200 dark:border-asphalt-700 pl-8 pr-2.5 py-1.5 w-36 bg-white dark:bg-asphalt-900"
              />
            </div>
            <Link href="/reports" className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline">
              View all <IconArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-xl overflow-hidden">
          {hazards.length === 0 ? (
            <EmptyState variant="no-data" />
          ) : filtered.length === 0 ? (
            <EmptyState variant="no-results" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-fog-50 dark:bg-asphalt-800 text-left text-fog-600 dark:text-fog-400 text-xs">
                  <th className="px-4 py-2.5 font-medium">Reporter</th>
                  <th className="px-4 py-2.5 font-medium">Hazard</th>
                  <th className="px-4 py-2.5 font-medium">Risk</th>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-fog-100 dark:border-asphalt-800 hover:bg-fog-50 dark:hover:bg-asphalt-800/50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/reports/${r.id}`}
                  >
                    <td className="px-4 py-2.5 font-medium text-xs text-asphalt-950 dark:text-fog-100">{r.reporterName}</td>
                    <td className="px-4 py-2.5 text-xs text-fog-600 dark:text-fog-400">{r.hazardType}</td>
                    <td className="px-4 py-2.5"><RiskBadge risk={r.riskLevel} /></td>
                    <td className="px-4 py-2.5 text-xs text-fog-400">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
