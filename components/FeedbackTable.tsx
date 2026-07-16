"use client";

import { FeedbackEntry } from "@/lib/types";
import { formatDateTime } from "@/lib/style-helpers";
import EmptyState from "@/components/EmptyState";
import { IconStar } from "@tabler/icons-react";

interface FeedbackTableProps {
  entries: FeedbackEntry[];
  loading?: boolean;
}

export default function FeedbackTable({ entries, loading }: FeedbackTableProps) {
  if (loading) {
    return (
      <div className="border border-fog-200 dark:border-asphalt-800 rounded-xl overflow-hidden bg-white dark:bg-asphalt-900">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 border-t border-fog-100 dark:border-asphalt-800 animate-pulse bg-fog-50 dark:bg-asphalt-800/40"
          />
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
            <th className="px-4 py-2.5 font-medium">User</th>
            <th className="px-4 py-2.5 font-medium">Rating</th>
            <th className="px-4 py-2.5 font-medium">Message</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="border-t border-fog-100 dark:border-asphalt-800 hover:bg-fog-50 dark:hover:bg-asphalt-800/40 transition-colors align-top"
            >
              <td className="px-4 py-3 text-xs text-fog-400 whitespace-nowrap">
                {formatDateTime(entry.createdAt)}
              </td>
              <td className="px-4 py-3 text-xs">
                <p className="text-asphalt-950 dark:text-fog-100 font-medium">
                  {entry.userName || "Anonymous"}
                </p>
                {entry.email && (
                  <p className="text-fog-400 mt-0.5 truncate max-w-[160px]">{entry.email}</p>
                )}
                {entry.category && (
                  <p className="text-[10px] text-fog-400 mt-1 uppercase tracking-wide">
                    {entry.category}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-xs">
                {entry.rating != null ? (
                  <span className="inline-flex items-center gap-1 text-amber-600">
                    <IconStar size={12} fill="currentColor" />
                    {entry.rating}/5
                  </span>
                ) : (
                  <span className="text-fog-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-fog-600 dark:text-fog-300 leading-relaxed">
                {entry.message || "—"}
                {entry.appVersion && (
                  <p className="text-[10px] text-fog-400 mt-2">App v{entry.appVersion}</p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
