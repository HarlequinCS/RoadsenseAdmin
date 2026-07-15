"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DashboardStats, Hazard } from "@/lib/types";
import { formatDate, hazardTypeColors, statusChartColors } from "@/lib/style-helpers";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import SeedDataButton from "@/components/SeedDataButton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  IconUsers, IconFileText, IconAlertCircle, IconCircleCheck,
  IconRefresh, IconArrowRight,
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
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalReports: 0, newReports: 0, resolvedReports: 0 });
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setStats((s) => ({ ...s, totalUsers: snap.size }));
    });
    const unsubHazards = onSnapshot(collection(db, "hazards"), (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Hazard));
      setHazards(all);
      setStats((s) => ({
        ...s,
        totalReports: all.length,
        newReports: all.filter((h) => h.status === "New").length,
        resolvedReports: all.filter((h) => h.status === "Resolved").length,
      }));
      setLastUpdated(new Date());
    });
    return () => { unsubUsers(); unsubHazards(); };
  }, []);

  const byType = Object.entries(
    hazards.reduce((acc, h) => { acc[h.hazardType] = (acc[h.hazardType] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const byStatus = Object.entries(
    hazards.reduce((acc, h) => { acc[h.status] = (acc[h.status] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const recent = [...hazards]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-1.5">
            Dashboard
          </p>
          <h1 className="font-display font-semibold text-[26px] text-asphalt-950 dark:text-fog-50 tracking-tight">
            Overview
          </h1>
          <p className="text-xs text-fog-600 dark:text-fog-400 mt-1" suppressHydrationWarning>
            Last updated {lastUpdated.toLocaleTimeString()}
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

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3.5 mb-7">
        <StatCard label="Total users" value={stats.totalUsers} icon={<IconUsers size={16} />} tone="info" delta="+12%" animate />
        <StatCard label="Total reports" value={stats.totalReports} icon={<IconFileText size={16} />} tone="default" animate />
        <StatCard label="New reports" value={stats.newReports} icon={<IconAlertCircle size={16} />} tone="warning" delta="Active" animate />
        <StatCard label="Resolved" value={stats.resolvedReports} icon={<IconCircleCheck size={16} />} tone="success" delta="90%" animate />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4 mb-7">
        <div className="bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-xl p-4">
          <p className="font-display font-medium text-sm mb-3 text-asphalt-950 dark:text-fog-50">Reports by hazard type</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byType} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {byType.map((entry) => (
                  <Cell key={entry.name} fill={hazardTypeColors[entry.name as keyof typeof hazardTypeColors] || "#888"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-xl p-4">
          <p className="font-display font-medium text-sm mb-3 text-asphalt-950 dark:text-fog-50">Reports by status</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {byStatus.map((entry) => (
                  <Cell key={entry.name} fill={statusChartColors[entry.name as keyof typeof statusChartColors] || "#ccc"} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hazard map */}
      <div className="bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-xl p-4 mb-7">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display font-medium text-sm text-asphalt-950 dark:text-fog-50">Hazard map</p>
          <div className="flex items-center gap-3 text-[11px] text-fog-600 dark:text-fog-400">
            {(["New", "Under Investigation", "Resolved"] as const).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: statusChartColors[s] }}
                />
                {s}
              </span>
            ))}
          </div>
        </div>
        <HazardMap hazards={hazards} />
      </div>

      {/* Recent reports table */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="font-display font-medium text-sm text-asphalt-950 dark:text-fog-50">Recent reports</p>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="text-xs rounded-lg border border-fog-200 dark:border-asphalt-700 px-2.5 py-1.5 w-36 bg-white dark:bg-asphalt-900"
            />
            <Link href="/reports" className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline">
              View all <IconArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-fog-50 dark:bg-asphalt-800 text-left text-fog-600 dark:text-fog-400 text-xs">
                <th className="px-4 py-2.5 font-medium">Reporter</th>
                <th className="px-4 py-2.5 font-medium">Hazard</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-fog-400 text-xs">No reports found</td></tr>
              )}
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-fog-100 dark:border-asphalt-800 hover:bg-fog-50 dark:hover:bg-asphalt-800/50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/reports/${r.id}`}
                >
                  <td className="px-4 py-2.5 font-medium text-xs text-asphalt-950 dark:text-fog-100">{r.reporterName}</td>
                  <td className="px-4 py-2.5 text-xs text-fog-600 dark:text-fog-400">{r.hazardType}</td>
                  <td className="px-4 py-2.5 text-xs text-fog-400">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}