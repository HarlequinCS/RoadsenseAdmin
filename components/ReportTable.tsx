"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { Hazard, HazardStatus, HAZARD_STATUSES, HAZARD_TYPES, RISK_LEVELS, RiskLevel } from "@/lib/types";
import { formatDate } from "@/lib/style-helpers";
import { normalizeHazard } from "@/lib/firestore-helpers";
import { updateHazardStatus, deleteHazard, logBulkStatusChange } from "@/lib/hazard-service";
import { isActiveHazard } from "@/lib/hazard-utils";
import { exportHazardsCSV } from "@/lib/export-utils";
import RiskBadge from "@/components/RiskBadge";
import EmptyState from "@/components/EmptyState";
import HazardThumbnail from "@/components/HazardThumbnail";
import ReportCard from "@/components/ReportCard";
import {
  IconSearch, IconEye, IconCheck,
  IconFilter, IconX, IconDownload, IconPrinter, IconTrash,
} from "@tabler/icons-react";

const TABS: Array<HazardStatus | "All"> = ["All", ...HAZARD_STATUSES];

type UrlFilter = "new" | "critical" | "investigating" | "resolved" | "all";

const QUICK_FILTERS: { key: UrlFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "critical", label: "Critical" },
  { key: "investigating", label: "Investigating" },
  { key: "resolved", label: "Resolved" },
];

const RISK_ORDER: Record<RiskLevel, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

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

export default function ReportTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlFilter = (searchParams.get("filter") as UrlFilter) || "all";

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);

  useEffect(() => {
    if (urlFilter === "new") setTab("New");
    else if (urlFilter === "investigating") setTab("Under Investigation");
    else if (urlFilter === "resolved") setTab("Resolved");
    else if (urlFilter === "critical" || urlFilter === "all") setTab("All");
  }, [urlFilter]);

  const setUrlFilter = useCallback(
    (filter: UrlFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (filter === "all") params.delete("filter");
      else params.set("filter", filter);
      const qs = params.toString();
      router.replace(qs ? `/reports?${qs}` : "/reports");
    },
    [router, searchParams]
  );

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
    let list = reports.filter((r) => {
      const matchSearch =
        r.reporterName?.toLowerCase().includes(search.toLowerCase()) ||
        r.hazardType?.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "All" || r.hazardType === typeFilter;
      const matchRisk = riskFilter === "All" || r.riskLevel === riskFilter;
      const reportDate = new Date(r.createdAt as string);
      const matchFrom = !dateFrom || reportDate >= new Date(dateFrom);
      const matchTo = !dateTo || reportDate <= new Date(`${dateTo}T23:59:59`);
      return matchSearch && matchType && matchRisk && matchFrom && matchTo;
    });

    if (urlFilter === "critical") {
      list = list.filter(
        (r) => isActiveHazard(r) && (r.riskLevel === "High" || r.riskLevel === "Critical")
      );
    } else if (urlFilter === "new") {
      list = list.filter((r) => r.status === "New");
    } else if (urlFilter === "investigating") {
      list = list.filter((r) => r.status === "Under Investigation");
    } else if (urlFilter === "resolved") {
      list = list.filter((r) => r.status === "Resolved");
    } else {
      list = list.filter((r) => tab === "All" || r.status === tab);
    }

    return [...list].sort((a, b) => {
      const ra = RISK_ORDER[a.riskLevel as RiskLevel] ?? 4;
      const rb = RISK_ORDER[b.riskLevel as RiskLevel] ?? 4;
      if (ra !== rb) return ra - rb;
      return new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime();
    });
  }, [reports, search, tab, typeFilter, riskFilter, dateFrom, dateTo, urlFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: reports.length };
    HAZARD_STATUSES.forEach((s) => { c[s] = reports.filter((r) => r.status === s).length; });
    return c;
  }, [reports]);

  async function handleBulkInvestigation() {
    if (!adminUser || selectedIds.size === 0) return;
    const targets = filtered.filter(
      (r) => selectedIds.has(r.id) && r.status === "New"
    );
    if (targets.length === 0) {
      setToast("No selected reports are in New status");
      return;
    }
    if (!confirm(`Mark ${targets.length} report(s) as Under Investigation?`)) return;

    setBulkUpdating(true);
    try {
      const { syncUserStats } = await import("@/lib/hazard-service");
      for (const r of targets) {
        await updateHazardStatus(r.id, "Under Investigation", adminUser.uid, {
          adminUid: adminUser.uid,
          adminEmail: adminUser.email ?? undefined,
          hazardId: r.id,
          hazardType: r.hazardType,
          reporterName: r.reporterName,
          previousStatus: r.status,
        });
        if (r.userId) await syncUserStats(r.userId);
      }
      await logBulkStatusChange(adminUser.uid, targets.length, "Under Investigation", {
        adminEmail: adminUser.email ?? undefined,
      });
      setSelectedIds(new Set());
      setToast(`${targets.length} report(s) marked Under Investigation`);
    } finally {
      setBulkUpdating(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const newIds = filtered.filter((r) => r.status === "New").map((r) => r.id);
    if (newIds.every((id) => selectedIds.has(id))) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        newIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => new Set([...prev, ...newIds]));
    }
  }

  const selectableNew = filtered.filter((r) => r.status === "New");
  const allNewSelected =
    selectableNew.length > 0 && selectableNew.every((r) => selectedIds.has(r.id));

  async function handleStatusChange(id: string, status: HazardStatus, userId: string) {
    if (!adminUser) return;
    const report = reports.find((r) => r.id === id);
    await updateHazardStatus(id, status, adminUser.uid, {
      adminUid: adminUser.uid,
      adminEmail: adminUser.email ?? undefined,
      hazardId: id,
      hazardType: report?.hazardType,
      reporterName: report?.reporterName,
      previousStatus: report?.status,
    });
    if (userId) {
      const { syncUserStats } = await import("@/lib/hazard-service");
      await syncUserStats(userId);
    }
    setToast(`Status updated to "${status}"`);
  }

  async function handleDelete(id: string, userId: string) {
    if (!adminUser || !confirm("Delete this hazard report? This cannot be undone.")) return;
    const report = reports.find((r) => r.id === id);
    await deleteHazard(id, userId, {
      adminUid: adminUser.uid,
      adminEmail: adminUser.email ?? undefined,
      hazardId: id,
      hazardType: report?.hazardType,
      reporterName: report?.reporterName,
    });
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

      <div className="no-print -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto mb-4">
        <div className="flex gap-1.5 flex-nowrap min-w-max sm:flex-wrap sm:min-w-0">
          {QUICK_FILTERS.map(({ key, label }) => (
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
      </div>

      <div className="no-print overflow-x-auto mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 min-w-max sm:min-w-0 sm:flex-wrap border-b border-fog-200 dark:border-asphalt-800">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                if (t === "All") setUrlFilter("all");
                else if (t === "New") setUrlFilter("new");
                else if (t === "Under Investigation") setUrlFilter("investigating");
                else if (t === "Resolved") setUrlFilter("resolved");
              }}
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

      {selectedIds.size > 0 && (
        <div className="no-print fixed bottom-0 left-0 right-0 z-40 md:static md:z-auto flex items-center gap-3 mb-3 px-4 py-3 md:px-3 md:py-2.5 rounded-none md:rounded-lg bg-amber-50 dark:bg-amber-900/15 border-t md:border border-amber-200 dark:border-amber-900/40 shadow-lg md:shadow-none">
          <span className="text-xs font-medium text-asphalt-950 dark:text-fog-50">
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleBulkInvestigation}
            disabled={bulkUpdating || !adminUser}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-asphalt-950 dark:bg-fog-100 text-white dark:text-asphalt-950 hover:opacity-90 disabled:opacity-50"
          >
            {bulkUpdating ? "Updating…" : "Mark as Under Investigation"}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-fog-500 hover:text-fog-700 dark:hover:text-fog-300"
          >
            Clear selection
          </button>
        </div>
      )}

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
            onClick={() => exportHazardsCSV(filtered)}
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

      <div className="border border-fog-200 dark:border-asphalt-800 rounded-xl overflow-hidden bg-white dark:bg-asphalt-900 hidden md:block">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="bg-fog-50 dark:bg-asphalt-800 text-left text-fog-600 dark:text-fog-400 text-xs">
              <th className="no-print px-3 py-2.5 font-medium w-[4%]">
                <input
                  type="checkbox"
                  checked={allNewSelected}
                  onChange={toggleSelectAll}
                  disabled={selectableNew.length === 0}
                  className="rounded"
                  aria-label="Select all new reports"
                />
              </th>
              <th className="px-3 py-2.5 font-medium w-[6%]">Photo</th>
              <th className="px-4 py-2.5 font-medium w-[8%]">ID</th>
              <th className="px-4 py-2.5 font-medium w-[11%]">Reporter</th>
              <th className="px-4 py-2.5 font-medium w-[12%]">Type</th>
              <th className="px-4 py-2.5 font-medium w-[7%]">Risk</th>
              <th className="px-4 py-2.5 font-medium w-[18%]">Description</th>
              <th className="px-4 py-2.5 font-medium w-[10%]">Date</th>
              <th className="px-4 py-2.5 font-medium w-[12%]">Status</th>
              <th className="no-print px-4 py-2.5 font-medium w-[7%] text-right">Act.</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-t border-fog-100 dark:border-asphalt-800">
                  {[...Array(10)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-fog-100 dark:bg-asphalt-800 rounded animate-pulse" style={{ width: `${50 + (j % 3) * 15}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && reports.length === 0 && (
              <tr>
                <td colSpan={10}>
                  <EmptyState variant="no-data" />
                </td>
              </tr>
            )}
            {!loading && reports.length > 0 && filtered.length === 0 && (
              <tr>
                <td colSpan={10}>
                  <EmptyState variant="no-results" />
                </td>
              </tr>
            )}
            {!loading && filtered.map((r) => (
              <tr key={r.id} className="border-t border-fog-100 dark:border-asphalt-800 hover:bg-fog-50 dark:hover:bg-asphalt-800/40 transition-colors group">
                <td className="no-print px-3 py-2.5">
                  {r.status === "New" ? (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded"
                      aria-label={`Select ${r.hazardType}`}
                    />
                  ) : null}
                </td>
                <td className="px-3 py-2.5">
                  <HazardThumbnail imageUrl={r.imageUrl} hazardType={r.hazardType} size={40} />
                </td>
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

      <div className="md:hidden border border-fog-200 dark:border-asphalt-800 rounded-xl overflow-hidden bg-white dark:bg-asphalt-900">
        {loading &&
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border-t border-fog-100 dark:border-asphalt-800 first:border-t-0">
              <div className="h-16 bg-fog-100 dark:bg-asphalt-800 rounded animate-pulse" />
            </div>
          ))}
        {!loading && reports.length === 0 && <EmptyState variant="no-data" />}
        {!loading && reports.length > 0 && filtered.length === 0 && <EmptyState variant="no-results" />}
        {!loading &&
          filtered.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              selected={selectedIds.has(r.id)}
              onToggleSelect={() => toggleSelect(r.id)}
              onDelete={() => handleDelete(r.id, r.userId)}
              statusSelect={
                <StatusSelect
                  value={r.status}
                  onChange={(s) => handleStatusChange(r.id, s, r.userId)}
                />
              }
            />
          ))}
      </div>
      {selectedIds.size > 0 && <div className="md:hidden h-16" aria-hidden />}
    </div>
  );
}
