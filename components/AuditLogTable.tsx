"use client";

import Link from "next/link";
import { AuditLogEntry } from "@/lib/types";
import { formatDateTime } from "@/lib/style-helpers";
import { describeAuditAction } from "@/lib/audit-service";
import EmptyState from "@/components/EmptyState";
import { IconArrowRight } from "@tabler/icons-react";

interface AuditLogTableProps {
  entries: AuditLogEntry[];
  loading?: boolean;
}

export default function AuditLogTable({ entries, loading }: AuditLogTableProps) {
  if (loading) {
    return (
      <div className="border border-fog-200 dark:border-asphalt-800 rounded-xl overflow-hidden bg-white dark:bg-asphalt-900">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 border-t border-fog-100 dark:border-asphalt-800 animate-pulse bg-fog-50 dark:bg-asphalt-800/40" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="border border-fog-200 dark:border-asphalt-800 rounded-xl bg-white dark:bg-asphalt-900">
        <EmptyState variant="no-data" />
      </div>
    );
  }

  return (
    <div className="border border-fog-200 dark:border-asphalt-800 rounded-xl overflow-hidden bg-white dark:bg-asphalt-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-fog-50 dark:bg-asphalt-800 text-left text-fog-600 dark:text-fog-400 text-xs">
            <th className="px-4 py-2.5 font-medium">When</th>
            <th className="px-4 py-2.5 font-medium">Action</th>
            <th className="px-4 py-2.5 font-medium">Hazard</th>
            <th className="px-4 py-2.5 font-medium">Admin</th>
            <th className="px-4 py-2.5 font-medium text-right">Report</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="border-t border-fog-100 dark:border-asphalt-800 hover:bg-fog-50 dark:hover:bg-asphalt-800/40 transition-colors"
            >
              <td className="px-4 py-2.5 text-xs text-fog-400 whitespace-nowrap">
                {formatDateTime(entry.createdAt)}
              </td>
              <td className="px-4 py-2.5 text-xs text-asphalt-950 dark:text-fog-100">
                {describeAuditAction(entry)}
              </td>
              <td className="px-4 py-2.5 text-xs">
                <p className="text-asphalt-950 dark:text-fog-100">{entry.hazardType || "—"}</p>
                {entry.reporterName && (
                  <p className="text-fog-400 mt-0.5">{entry.reporterName}</p>
                )}
              </td>
              <td className="px-4 py-2.5 text-xs text-fog-500">
                {entry.adminEmail || entry.adminUid.slice(0, 10) + "…"}
              </td>
              <td className="px-4 py-2.5 text-right">
                {entry.hazardId !== "bulk" ? (
                  <Link
                    href={`/reports/${entry.hazardId}`}
                    className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    View
                    <IconArrowRight size={12} />
                  </Link>
                ) : (
                  <span className="text-xs text-fog-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
