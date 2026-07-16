"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { Hazard, HazardStatus, HAZARD_STATUSES, HAZARD_TYPES, RISK_LEVELS } from "@/lib/types";
import { formatDate } from "@/lib/style-helpers";
import { normalizeHazard } from "@/lib/firestore-helpers";
import { updateHazardStatus, deleteHazard } from "@/lib/hazard-service";
import RiskBadge from "@/components/RiskBadge";
import {
  IconSearch, IconEye, IconCheck,
  IconFilter, IconX, IconDownload, IconPrinter, IconTrash,
} from "@tabler/icons-react";

const TABS: Array<HazardStatus | "All"> = ["All", ...HAZARD_STATUSES];

const STATUS_STYLES: Record<HazardStatus, string> = {
  New: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  "Under Investigation": "bg-signal-red-50 dark:bg-signal-red-600/15 text-signal-red-600 dark:text-signal-red-100",
  Resolved: "bg-signal-teal-50 dark:bg-signal-teal-600/15 text-signal-teal-600 dark:text-signal-teal-100",
};

function StatusSelect({ value, onChange }: { value: HazardStatus; onChange: (s: HazardStatus) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as HazardStatus)}
      onClick={(e) => e.stopPropagation()}
      className={`no-print text-xs font-medium px-2.5 py-1 rounded-full border-none outline-none cursor-pointer appearance-none ${STATUS_STYLES[value]}`}
    >
      {HAZARD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-asphalt-950 dark:bg-white text-white dark:text-asphalt-950 text-xs px-4 py-2.5 rounded-xl shadow-lg">
      <IconCheck size={14} className="text-signal-teal-500 dark:text-signal-teal-600" />
      {message}
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100"><IconX size={12} /></button>
    </div>
  );
}

function exportToCSV(reports: Hazard[]) {
  const headers = ["Report ID", "Reporter", "Hazard Type", "Risk", "Description", "Date", "Status", "Verifications"];
  const rows = reports.map((r) => [
    r.id,
    r.reporterName || "",
    r.hazardType || "",
    r.riskLevel || "",
    (r.description || "").replace(/"/g, '""'),
    formatDate(r.createdAt),
    r.status,
    String(r.verificationCount ?? 0),
  ]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `roadsense-reports-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportTable() {
  const [reports, setReports] = useState<Hazard[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<HazardStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [adminUser, setAdminUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setAdminUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "hazards"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setReports(snap.docs.map((d) => normalizeHazard(d.id, d.data())));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.reporterName?.toLowerCase().includes(search.toLowerCase()) ||
        r.hazardType?.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase());
      const matchTab = tab === "All" || r.status === tab;
      const matchType = typeFilter === "All" || r.hazardType === typeFilter;
      const matchRisk = riskFilter === "All" || r.riskLevel === riskFilter;
      const reportDate = new Date(r.createdAt as string);
      const matchFrom = !dateFrom || reportDate >= new Date(dateFrom);
      const matchTo = !dateTo || reportDate <= new Date(`${dateTo}T23:59:59`);
      return matchSearch && matchTab && matchType && matchRisk && matchFrom && matchTo;
    });
  }, [reports, search, tab, typeFilter, riskFilter, dateFrom, dateTo]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: reports.length };
    HAZARD_STATUSES.forEach((s) => { c[s] = reports.filter((r) => r.status === s).length; });
    return c;
  }, [reports]);

  async function handleStatusChange(id: string, status: HazardStatus, userId: string) {
    if (!adminUser) return;
    await updateHazardStatus(id, status, adminUser.uid);
    if (userId) {
      const { syncUserStats } = await import("@/lib/hazard-service");
      await syncUserStats(userId);
    }
    setToast(`Status updated to "${status}"`);
  }

  async function handleDelete(id: string, userId: string) {
    if (!confirm("Delete this hazard report? This cannot be undone.")) return;
    await deleteHazard(id, userId);
    setToast("Report deleted");
  }

  const tabColors: Record<string, string> = {
    All: "text-asphalt-700 dark:text-fog-200",
    New: "text-amber-600 dark:text-amber-400",
    "Under Investigation": "text-signal-red-500 dark:text-signal-red-100",
    Resolved: "text-signal-teal-500 dark:text-signal-teal-100",
  };

  return (
    <div>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <div className="no-print flex items-center justify-between mb-4 border-b border-fog-200 dark:border-asphalt-800">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px ${
                tab === t
                  ? `border-amber-400 ${tabColors[t]}`
                  : "border-transparent text-fog-400 hover:text-fog-600 dark:hover:text-fog-300"
              }`}
            >
              {t}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab === t ? "bg-fog-100 dark:bg-asphalt-800" : "bg-fog-100 dark:bg-asphalt-800 opacity-60"}`}>
                {counts[t] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="no-print flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fog-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reporter, hazard…"
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <IconFilter size={14} className="text-fog-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs rounded-lg border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2"
          >
            <option value="All">All types</option>
            {HAZARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs rounded-lg border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2"
          >
            <option value="All">All risks</option>
            {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-xs rounded-lg border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2"
          />
          <span className="text-xs text-fog-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-xs rounded-lg border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2"
          />
        </div>
        {(search || typeFilter !== "All" || riskFilter !== "All" || dateFrom || dateTo) && (
          <button
            onClick={() => { setSearch(""); setTypeFilter("All"); setRiskFilter("All"); setDateFrom(""); setDateTo(""); }}
            className="text-xs text-fog-400 hover:text-fog-600 flex items-center gap-1"
          >
            <IconX size={12} /> Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-fog-400">{filtered.length} report{filtered.length !== 1 ? "s" : ""}</span>
          <button
            onClick={() => exportToCSV(filtered)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-fog-200 dark:border-asphalt-700 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors text-asphalt-700 dark:text-fog-200"
          >
            <IconDownload size={14} />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-fog-200 dark:border-asphalt-700 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors text-asphalt-700 dark:text-fog-200"
          >
            <IconPrinter size={14} />
            Print
          </button>
        </div>
      </div>

      <div className="border border-fog-200 dark:border-asphalt-800 rounded-xl overflow-hidden bg-white dark:bg-asphalt-900">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="bg-fog-50 dark:bg-asphalt-800 text-left text-fog-600 dark:text-fog-400 text-xs">
              <th className="px-4 py-2.5 font-medium w-[9%]">ID</th>
              <th className="px-4 py-2.5 font-medium w-[12%]">Reporter</th>
              <th className="px-4 py-2.5 font-medium w-[14%]">Type</th>
              <th className="px-4 py-2.5 font-medium w-[8%]">Risk</th>
              <th className="px-4 py-2.5 font-medium w-[22%]">Description</th>
              <th className="px-4 py-2.5 font-medium w-[11%]">Date</th>
              <th className="px-4 py-2.5 font-medium w-[12%]">Status</th>
              <th className="no-print px-4 py-2.5 font-medium w-[8%] text-right">Act.</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-t border-fog-100 dark:border-asphalt-800">
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-fog-100 dark:bg-asphalt-800 rounded animate-pulse" style={{ width: `${50 + (j % 3) * 15}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-fog-400 text-xs">
                  No reports match your filters
                </td>
              </tr>
            )}
            {!loading && filtered.map((r) => (
              <tr key={r.id} className="border-t border-fog-100 dark:border-asphalt-800 hover:bg-fog-50 dark:hover:bg-asphalt-800/40 transition-colors group">
                <td className="px-4 py-2.5 text-xs font-mono text-fog-400 truncate">{r.id.slice(0, 8)}</td>
                <td className="px-4 py-2.5 text-xs font-medium text-asphalt-950 dark:text-fog-100 truncate">{r.reporterName}</td>
                <td className="px-4 py-2.5 text-xs text-fog-600 dark:text-fog-400 truncate">{r.hazardType}</td>
                <td className="px-4 py-2.5"><RiskBadge risk={r.riskLevel} /></td>
                <td className="px-4 py-2.5 text-xs text-fog-400 truncate">{r.description || "—"}</td>
                <td className="px-4 py-2.5 text-xs text-fog-400">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-2.5">
                  <StatusSelect value={r.status} onChange={(s) => handleStatusChange(r.id, s, r.userId)} />
                </td>
                <td className="no-print px-4 py-2.5">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={`/reports/${r.id}`} aria-label="View" className="hover:text-signal-blue-500 transition-colors">
                      <IconEye size={15} className="text-fog-400" />
                    </a>
                    <button onClick={() => handleDelete(r.id, r.userId)} aria-label="Delete" className="hover:text-signal-red-500 transition-colors">
                      <IconTrash size={15} className="text-fog-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
