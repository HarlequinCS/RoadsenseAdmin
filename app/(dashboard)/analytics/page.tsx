"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Hazard } from "@/lib/types";
import { hazardTypeColors, statusChartColors, toDate } from "@/lib/style-helpers";
import StatCard from "@/components/StatCard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  LineChart, Line, CartesianGrid,
} from "recharts";
import {
  IconFileText, IconCircleCheck, IconAlertTriangle, IconCalendarStats,
} from "@tabler/icons-react";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-asphalt-800 border border-fog-200 dark:border-asphalt-700 rounded-lg px-3 py-2 text-xs shadow-sm">
      <p className="font-medium mb-0.5">{label || payload[0]?.name}</p>
      <p className="text-fog-600 dark:text-fog-400">{payload[0]?.value} reports</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-fog-200 dark:border-asphalt-800 bg-white dark:bg-asphalt-900 rounded-xl p-4">
      <p className="font-display font-medium text-sm mb-4 text-asphalt-950 dark:text-fog-50">{title}</p>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "hazards"), (snap) => {
      setHazards(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Hazard)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const byType = useMemo(() => {
    const acc: Record<string, number> = {};
    hazards.forEach((h) => { acc[h.hazardType] = (acc[h.hazardType] || 0) + 1; });
    return Object.entries(acc).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [hazards]);

  const byStatus = useMemo(() => {
    const acc: Record<string, number> = {};
    hazards.forEach((h) => { acc[h.status] = (acc[h.status] || 0) + 1; });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [hazards]);

  const monthlyTrend = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-MY", { month: "short", year: "2-digit" });
      months[key] = 0;
    }
    hazards.forEach((h) => {
      const d = toDate(h.createdAt);
      if (!d) return;
      const key = d.toLocaleString("en-MY", { month: "short", year: "2-digit" });
      if (key in months) months[key]++;
    });
    return Object.entries(months).map(([name, value]) => ({ name, value }));
  }, [hazards]);

  const resolveRate = hazards.length
    ? Math.round((hazards.filter((h) => h.status === "Resolved").length / hazards.length) * 100)
    : 0;

  const mostCommon = byType[0]?.name || "—";

  const thisMonth = useMemo(() => {
    const now = new Date();
    return hazards.filter((h) => {
      const d = toDate(h.createdAt);
      return d ? d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() : false;
    }).length;
  }, [hazards]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-fog-200 dark:border-asphalt-800 rounded-xl p-4 h-56 animate-pulse bg-fog-50 dark:bg-asphalt-800" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-1.5">
          Insights
        </p>
        <h1 className="font-display font-semibold text-[26px] text-asphalt-950 dark:text-fog-50 tracking-tight">
          Analytics
        </h1>
        <p className="text-xs text-fog-600 dark:text-fog-400 mt-1">
          Report trends and breakdown across all hazard data
        </p>
      </div>
      <div className="lane-divider w-full mb-6" />

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3.5 mb-7">
        <StatCard
          label="Total reports"
          value={hazards.length}
          icon={<IconFileText size={16} />}
          tone="info"
        />
        <StatCard
          label="Resolve rate"
          value={`${resolveRate}%`}
          icon={<IconCircleCheck size={16} />}
          tone="success"
        />
        <StatCard
          label="Most common hazard"
          value={mostCommon}
          icon={<IconAlertTriangle size={16} />}
          tone="warning"
        />
        <StatCard
          label="Reports this month"
          value={thisMonth}
          icon={<IconCalendarStats size={16} />}
          tone="default"
          animate
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <ChartCard title="Reports by hazard type">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byType} barSize={26} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {byType.map((entry) => (
                  <Cell key={entry.name} fill={hazardTypeColors[entry.name as keyof typeof hazardTypeColors] || "#888"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Reports by status">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={byStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
                labelLine={false}
              >
                {byStatus.map((entry) => (
                  <Cell key={entry.name} fill={statusChartColors[entry.name as keyof typeof statusChartColors] || "#ccc"} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Line — monthly trend (full width) */}
      <ChartCard title="Monthly report trend (last 6 months)">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={monthlyTrend} margin={{ top: 0, right: 12, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#EF9F27"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#EF9F27", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Breakdown table */}
      <div className="mt-4 border border-fog-200 dark:border-asphalt-800 bg-white dark:bg-asphalt-900 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-fog-50 dark:bg-asphalt-800 text-fog-600 dark:text-fog-400 text-left">
              <th className="px-4 py-2.5 font-medium">Hazard type</th>
              <th className="px-4 py-2.5 font-medium">Count</th>
              <th className="px-4 py-2.5 font-medium w-[40%]">Share</th>
              <th className="px-4 py-2.5 font-medium text-right">% of total</th>
            </tr>
          </thead>
          <tbody>
            {byType.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-fog-400 text-xs">
                  No hazard data yet
                </td>
              </tr>
            )}
            {byType.map((row) => {
              const pct = hazards.length ? Math.round((row.value / hazards.length) * 100) : 0;
              const color = hazardTypeColors[row.name as keyof typeof hazardTypeColors] || "#888";
              return (
                <tr key={row.name} className="border-t border-fog-100 dark:border-asphalt-800">
                  <td className="px-4 py-2.5 flex items-center gap-2 text-asphalt-950 dark:text-fog-100">
                    <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: color }} />
                    {row.name}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-asphalt-950 dark:text-fog-100">{row.value}</td>
                  <td className="px-4 py-2.5">
                    <div className="w-full h-1.5 bg-fog-100 dark:bg-asphalt-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-fog-600 dark:text-fog-400">{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}