"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AuditLogEntry } from "@/lib/types";
import AuditLogTable from "@/components/AuditLogTable";

function normalizeAuditEntry(id: string, data: Record<string, unknown>): AuditLogEntry {
  return {
    id,
    action: data.action as AuditLogEntry["action"],
    hazardId: (data.hazardId as string) || "",
    hazardType: data.hazardType as string | undefined,
    reporterName: data.reporterName as string | undefined,
    adminUid: (data.adminUid as string) || "",
    adminEmail: data.adminEmail as string | undefined,
    previousStatus: data.previousStatus as AuditLogEntry["previousStatus"],
    newStatus: data.newStatus as AuditLogEntry["newStatus"],
    details: data.details as string | undefined,
    createdAt: data.createdAt as AuditLogEntry["createdAt"],
  };
}

export default function ActivityPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "audit_log"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEntries(snap.docs.map((d) => normalizeAuditEntry(d.id, d.data())));
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-1.5">
          Accountability
        </p>
        <h1 className="font-display font-semibold text-[26px] text-asphalt-950 dark:text-fog-50 tracking-tight">
          Activity log
        </h1>
        <p className="text-xs text-fog-600 dark:text-fog-400 mt-1">
          Audit trail of admin actions — status changes, notes, and deletions
        </p>
      </div>

      <div className="lane-divider w-full mb-6" />

      <AuditLogTable entries={entries} loading={loading} />
    </div>
  );
}
