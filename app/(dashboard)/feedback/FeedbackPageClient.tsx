"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FeedbackEntry } from "@/lib/types";
import { normalizeFeedback } from "@/lib/firestore-helpers";
import { toDate } from "@/lib/style-helpers";
import FeedbackTable from "@/components/FeedbackTable";
import { IconSearch } from "@tabler/icons-react";

export default function FeedbackPageClient() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "feedback"),
      (snap) => {
        const list = snap.docs.map((d) => normalizeFeedback(d.id, d.data()));
        list.sort((a, b) => {
          const da = toDate(a.createdAt)?.getTime() ?? 0;
          const db = toDate(b.createdAt)?.getTime() ?? 0;
          return db - da;
        });
        setEntries(list);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("[feedback]", err);
        setLoading(false);
        setError("Unable to load feedback. Ensure Firestore rules allow admin read on feedback.");
      }
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.message.toLowerCase().includes(q) ||
        e.userName?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q)
    );
  }, [entries, search]);

  return (
    <div>
      <div className="mb-6">
        <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-1.5">
          Community voice
        </p>
        <h1 className="font-display font-semibold text-[26px] text-asphalt-950 dark:text-fog-50 tracking-tight">
          App feedback
        </h1>
        <p className="text-xs text-fog-600 dark:text-fog-400 mt-1">
          Messages submitted from the mobile app profile screen — write-only for users, read-only for admins.
        </p>
      </div>

      <div className="lane-divider w-full mb-6" />

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fog-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback…"
            className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900"
          />
        </div>
        <p className="text-xs text-fog-400">{filtered.length} message{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {error && (
        <p className="text-xs text-signal-red-600 bg-signal-red-50 dark:bg-signal-red-600/15 border border-signal-red-200 dark:border-signal-red-800 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <FeedbackTable entries={filtered} loading={loading} />
    </div>
  );
}
