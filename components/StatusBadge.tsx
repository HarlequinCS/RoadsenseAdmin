import { HazardStatus } from "@/lib/types";
import { statusStyles } from "@/lib/style-helpers";

export default function StatusBadge({ status }: { status: HazardStatus }) {
  const { bg, fg } = statusStyles[status];
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-md font-medium"
      style={{ backgroundColor: bg, color: fg }}
    >
      {status}
    </span>
  );
}
