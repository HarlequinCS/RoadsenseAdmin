"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppUser } from "@/lib/types";
import StatCard from "@/components/StatCard";
import {
  IconSearch, IconUsers, IconFileText,
  IconCircleCheck, IconChevronDown, IconChevronUp,
} from "@tabler/icons-react";

type SortKey = "fullName" | "totalReports" | "resolvedReports";

function SortIcon({ active, asc }: { active: boolean; asc: boolean }) {
  if (!active) return <IconChevronDown size={12} className="opacity-30" />;
  return asc ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("totalReports");
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const rows = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AppUser));
      setUsers(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const va = sortKey === "fullName" ? a.fullName : (a[sortKey] ?? 0);
        const vb = sortKey === "fullName" ? b.fullName : (b[sortKey] ?? 0);
        if (va < vb) return sortAsc ? -1 : 1;
        if (va > vb) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [users, search, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  const totalReports = users.reduce((s, u) => s + (u.totalReports || 0), 0);
  const totalResolved = users.reduce((s, u) => s + (u.resolvedReports || 0), 0);
  const avgReports = users.length ? Math.round(totalReports / users.length) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-1.5">
          Administration
        </p>
        <h1 className="font-display font-semibold text-[26px] text-asphalt-950 dark:text-fog-50 tracking-tight">
          Users
        </h1>
        <p className="text-xs text-fog-600 dark:text-fog-400 mt-1">
          All registered users and their report activity
        </p>
      </div>
      <div className="lane-divider w-full mb-6" />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-7">
        <StatCard label="Total users" value={users.length} icon={<IconUsers size={15} />} tone="info" />
        <StatCard label="Total reports submitted" value={totalReports} icon={<IconFileText size={15} />} tone="default" />
        <StatCard label="Total resolved" value={totalResolved} icon={<IconCircleCheck size={15} />} tone="success" />
        <StatCard label="Avg reports / user" value={avgReports} icon={<IconFileText size={15} />} tone="warning" />
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative w-64">
          <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fog-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900"
          />
        </div>
        <span className="ml-auto text-xs text-fog-400">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="border border-fog-200 dark:border-asphalt-800 rounded-xl overflow-hidden bg-white dark:bg-asphalt-900">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="bg-fog-50 dark:bg-asphalt-800 text-left text-fog-600 dark:text-fog-400 text-xs">
              <th className="px-4 py-2.5 font-medium w-[30%]">
                <button onClick={() => toggleSort("fullName")} className="flex items-center gap-1 hover:text-asphalt-950 dark:hover:text-fog-100 transition-colors">
                  Name <SortIcon active={sortKey === "fullName"} asc={sortAsc} />
                </button>
              </th>
              <th className="px-4 py-2.5 font-medium w-[30%]">Email</th>
              <th className="px-4 py-2.5 font-medium w-[12%]">Role</th>
              <th className="px-4 py-2.5 font-medium w-[14%]">
                <button onClick={() => toggleSort("totalReports")} className="flex items-center gap-1 hover:text-asphalt-950 dark:hover:text-fog-100 transition-colors">
                  Reports <SortIcon active={sortKey === "totalReports"} asc={sortAsc} />
                </button>
              </th>
              <th className="px-4 py-2.5 font-medium w-[14%]">
                <button onClick={() => toggleSort("resolvedReports")} className="flex items-center gap-1 hover:text-asphalt-950 dark:hover:text-fog-100 transition-colors">
                  Resolved <SortIcon active={sortKey === "resolvedReports"} asc={sortAsc} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-fog-100 dark:border-asphalt-800">
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-fog-100 dark:bg-asphalt-800 rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-fog-400 text-xs">
                  No users found
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((u) => {
                const resolveRate = u.totalReports ? Math.round((u.resolvedReports / u.totalReports) * 100) : 0;
                const isExpanded = expanded === u.uid;
                return (
                  <Fragment key={u.uid}>
                    <tr
                      onClick={() => setExpanded(isExpanded ? null : u.uid)}
                      className="border-t border-fog-100 dark:border-asphalt-800 hover:bg-fog-50 dark:hover:bg-asphalt-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-signal-blue-50 dark:bg-signal-blue-600/25 flex items-center justify-center text-[10px] font-medium text-signal-blue-600 dark:text-signal-blue-100 shrink-0">
                            {u.fullName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-xs font-medium text-asphalt-950 dark:text-fog-100 truncate">{u.fullName || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-fog-600 dark:text-fog-400 truncate">{u.email}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          u.role === "admin"
                            ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                            : "bg-fog-100 dark:bg-asphalt-800 text-fog-600 dark:text-fog-400"
                        }`}>
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-asphalt-950 dark:text-fog-100">{u.totalReports || 0}</td>
                      <td className="px-4 py-2.5 text-xs text-asphalt-950 dark:text-fog-100">{u.resolvedReports || 0}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-t border-fog-100 dark:border-asphalt-800 bg-fog-50 dark:bg-asphalt-800/30">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-[10px] text-fog-400 mb-0.5">Resolve rate</p>
                              <div className="flex items-center gap-2">
                                <div className="w-32 h-1.5 bg-fog-200 dark:bg-asphalt-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-signal-teal-500 rounded-full transition-all" style={{ width: `${resolveRate}%` }} />
                                </div>
                                <span className="text-xs font-medium text-signal-teal-500 dark:text-signal-teal-100">{resolveRate}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-fog-400 mb-0.5">Pending</p>
                              <p className="text-xs font-medium text-asphalt-950 dark:text-fog-100">{(u.totalReports || 0) - (u.resolvedReports || 0)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-fog-400 mb-0.5">User ID</p>
                              <p className="text-xs font-mono text-fog-400">{u.uid?.slice(0, 12)}…</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}