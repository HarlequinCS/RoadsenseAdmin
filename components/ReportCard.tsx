import Link from "next/link";
import { Hazard } from "@/lib/types";
import { formatDate } from "@/lib/style-helpers";
import HazardThumbnail from "@/components/HazardThumbnail";
import RiskBadge from "@/components/RiskBadge";
import { IconEye, IconTrash } from "@tabler/icons-react";

interface ReportCardProps {
  report: Hazard;
  selected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  statusSelect: React.ReactNode;
}

export default function ReportCard({
  report,
  selected,
  onToggleSelect,
  onDelete,
  statusSelect,
}: ReportCardProps) {
  return (
    <article className="border-t border-fog-100 dark:border-asphalt-800 first:border-t-0 p-4">
      <div className="flex gap-3">
        {report.status === "New" && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="rounded mt-1 shrink-0"
            aria-label={`Select ${report.hazardType}`}
          />
        )}
        <HazardThumbnail imageUrl={report.imageUrl} hazardType={report.hazardType} size={52} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-medium text-sm text-asphalt-950 dark:text-fog-50 truncate">
              {report.hazardType}
            </p>
            <RiskBadge risk={report.riskLevel} />
          </div>
          <p className="text-xs text-fog-500 truncate">{report.reporterName}</p>
          <p className="text-[11px] text-fog-400 mt-1">{formatDate(report.createdAt)}</p>
          {report.description && (
            <p className="text-xs text-fog-500 mt-2 line-clamp-2">{report.description}</p>
          )}
          <p className="text-[10px] font-mono text-fog-400 mt-1">#{report.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-3 pl-0 sm:pl-[calc(52px+0.75rem)]">
        <div className="min-w-0 flex-1">{statusSelect}</div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/reports/${report.id}`}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-fog-200 dark:border-asphalt-700 text-fog-500 hover:text-signal-blue-500 transition-colors"
            aria-label="View report"
          >
            <IconEye size={16} />
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-fog-200 dark:border-asphalt-700 text-fog-500 hover:text-signal-red-500 transition-colors"
            aria-label="Delete report"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
