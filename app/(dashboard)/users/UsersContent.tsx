"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppUser, Hazard } from "@/lib/types";
import { normalizeHazard, normalizeUser } from "@/lib/firestore-helpers";
import { getContributorBadge } from "@/lib/hazard-utils";
import StatCard from "@/components/StatCard";
import ContributorBadgePill from "@/components/ContributorBadge";
import StatusBadge from "@/components/StatusBadge";
import RiskBadge from "@/components/RiskBadge";
import { formatDate } from "@/lib/style-helpers";
import {
  IconSearch, IconUsers, IconFileText,
  IconCircleCheck, IconChevronDown, IconChevronUp,
} from "@tabler/icons-react";

type SortKey = "fullName" | "totalReports" | "resolvedReports" | "verifiedReports";

function SortIcon({ active, asc }: { active: boolean; asc: boolean }) {
  if (!active) return <IconChevronDown size={12} className="opacity-30" />;
  return asc ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />;
}

export default function UsersContent() {
  const searchParams = useSearchParams();
  const highlightUid = searchParams.get("uid");

  const [users, setUsers] = useState<AppUser[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("totalReports");
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(highlightUid);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => normalizeUser(d.id, d.data())));
      setLoading(false);
    });
    const unsubHazards = onSnapshot(collection(db, "hazards"), (snap) => {
      setHazards(snap.docs.map((d) => normalizeHazard(d.id, d.data())));
    });
    return () => { unsubUsers(); unsubHazards(); };
  }, []);

  useEffect(() => {
    if (highlightUid) setExpanded(highlightUid);
  }, [highlightUid]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter((u) => u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
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

  function getUserHazards(uid: string) {
    return hazards
      .filter((h) => h.userId === uid)
      .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
  }

  const totalReports = users.reduce((s, u) => s + (u.totalReports || 0) + (u.resolvedReports || 0), 0);
  const totalResolved = users.reduce((s, u) => s + (u.resolvedReports || 0), 0);
  const topReporter = [...users].sort((a, b) =>
    (b.totalReports + b.resolvedReports) - (a.totalReports + a.resolvedReports)
  )[0];

  return (
    <div>
      <div className="mb-6">
        <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-1.5">
          Administration
        </p>
        <h1 className="font-display font-semibold text-[26px] text-asphalt-950 dark:text-fog-50 tracking-tight">
          Users
        </h1>
        <p className="text-xs text-fog-600 dark:text-fog-400 mt-1">
          Registered mobile app users and their report activity
        </p>
      </div>
      <div className="lane-divider w-full mb-6" />

      <div className="grid grid-cols-4 gap-3.5 mb-7">
        <StatCard label="Total users" value={users.length} icon={<IconUsers size={15} />} tone="info" />
        <StatCard label="Total reports" value={totalReports} icon={<IconFileText size={15} />} tone="default" />
        <StatCard label="Total resolved" value={totalResolved} icon={<IconCircleCheck size={15} />} tone="success" />
        <StatCard
          label="Top reporter"
          value={topReporter?.fullName?.split(" ")[0] || "—"}
          icon={<IconUsers size={15} />}
          tone="warning"
        />
      </div>

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

      <div className="border border-fog-200 dark:border-asphalt-800 rounded-xl overflow-hidden bg-white dark:bg-asphalt-900">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="bg-fog-50 dark:bg-asphalt-800 text-left text-fog-600 dark:text-fog-400 text-xs">
              <th className="px-4 py-2.5 font-medium w-[26%]">
                <button onClick={() => toggleSort("fullName")} className="flex items-center gap-1 hover:text-asphalt-950 dark:hover:text-fog-100 transition-colors">
                  Name <SortIcon active={sortKey === "fullName"} asc={sortAsc} />
                </button>
              </th>
              <th className="px-4 py-2.5 font-medium w-[24%]">Email</th>
              <th className="px-4 py-2.5 font-medium w-[16%]">Badge</th>
              <th className="px-4 py-2.5 font-medium w-[10%]">
                <button onClick={() => toggleSort("totalReports")} className="flex items-center gap-1 hover:text-asphalt-950 dark:hover:text-fog-100 transition-colors">
                  Active <SortIcon active={sortKey === "totalReports"} asc={sortAsc} />
                </button>
              </th>
              <th className="px-4 py-2.5 font-medium w-[10%]">
                <button onClick={() => toggleSort("resolvedReports")} className="flex items-center gap-1 hover:text-asphalt-950 dark:hover:text-fog-100 transition-colors">
                  Resolved <SortIcon active={sortKey === "resolvedReports"} asc={sortAsc} />
                </button>
              </th>
              <th className="px-4 py-2.5 font-medium w-[10%]">
                <button onClick={() => toggleSort("verifiedReports")} className="flex items-center gap-1 hover:text-asphalt-950 dark:hover:text-fog-100 transition-colors">
                  Verified <SortIcon active={sortKey === "verifiedReports"} asc={sortAsc} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-fog-100 dark:border-asphalt-800">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-fog-100 dark:bg-asphalt-800 rounded animate-pulse" style={{ width: `${50 + (j % 3) * 15}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-fog-400 text-xs">No users found</td>
              </tr>
            )}
            {!loading && filtered.map((u) => {
              const badge = u.contributorBadge || getContributorBadge((u.totalReports || 0) + (u.resolvedReports || 0));
              const userHazards = getUserHazards(u.uid);
              const isExpanded = expanded === u.uid;
              return (
                <Fragment key={u.uid}>
                  <tr
                    onClick={() => setExpanded(isExpanded ? null : u.uid)}
                    className={`border-t border-fog-100 dark:border-asphalt-800 hover:bg-fog-50 dark:hover:bg-asphalt-800/40 transition-colors cursor-pointer ${highlightUid === u.uid ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {u.photoUrl ? (
                          <img src={u.photoUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-signal-blue-50 dark:bg-signal-blue-600/25 flex items-center justify-center text-[10px] font-medium text-signal-blue-600 dark:text-signal-blue-100 shrink-0">
                            {u.fullName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="text-xs font-medium text-asphalt-950 dark:text-fog-100 truncate">{u.fullName || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-fog-600 dark:text-fog-400 truncate">{u.email}</td>
                    <td className="px-4 py-2.5"><ContributorBadgePill badge={badge} /></td>
                    <td className="px-4 py-2.5 text-xs text-asphalt-950 dark:text-fog-100">{u.totalReports || 0}</td>
                    <td className="px-4 py-2.5 text-xs text-asphalt-950 dark:text-fog-100">{u.resolvedReports || 0}</td>
                    <td className="px-4 py-2.5 text-xs text-asphalt-950 dark:text-fog-100">{u.verifiedReports ?? 0}</td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-t border-fog-100 dark:border-asphalt-800 bg-fog-50 dark:bg-asphalt-800/30">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
                          <div>
                            <p className="text-[10px] text-fog-400 mb-0.5">User ID</p>
                            <p className="font-mono text-fog-600">{u.uid}</p>
                          </div>
                          {u.birthday && (
                            <div>
                              <p className="text-[10px] text-fog-400 mb-0.5">Birthday</p>
                              <p>{u.birthday}</p>
                            </div>
                          )}
                          {u.gender && (
                            <div>
                              <p className="text-[10px] text-fog-400 mb-0.5">Gender</p>
                              <p>{u.gender}</p>
                            </div>
                          )}
                          {u.highRiskReports !== undefined && (
                            <div>
                              <p className="text-[10px] text-fog-400 mb-0.5">High-risk active reports</p>
                              <p>{u.highRiskReports}</p>
                            </div>
                          )}
                          {u.fcmToken && (
                            <div className="col-span-2">
                              <p className="text-[10px] text-fog-400 mb-0.5">FCM token (last device)</p>
                              <p className="font-mono text-[10px] text-fog-500 truncate">{u.fcmToken.slice(0, 40)}…</p>
                            </div>
                          )}
                        </div>
                        {userHazards.length > 0 ? (
                          <div>
                            <p className="text-[10px] font-medium text-fog-400 uppercase tracking-wider mb-2">
                              Reports by this user ({userHazards.length})
                            </p>
                            <div className="space-y-1.5">
                              {userHazards.map((h) => (
                                <Link
                                  key={h.id}
                                  href={`/reports/${h.id}`}
                                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-700 hover:border-amber-400 transition-colors"
                                >
                                  <span className="text-xs font-medium">{h.hazardType}</span>
                                  <span className="text-[11px] text-fog-400 truncate flex-1 mx-2">{h.description?.slice(0, 50)}</span>
                                  <RiskBadge risk={h.riskLevel} />
                                  <StatusBadge status={h.status} />
                                  <span className="text-[10px] text-fog-400">{formatDate(h.createdAt)}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-fog-400">No reports from this user</p>
                        )}
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
