import { getRiskSourceStyle } from "@/lib/style-helpers";

export default function RiskSourceBadge({ source }: { source?: string }) {
  const { bg, fg, label } = getRiskSourceStyle(source);
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-md font-medium uppercase tracking-wide"
      style={{ backgroundColor: bg, color: fg }}
      title={`Priority set by ${label.toLowerCase()}`}
    >
      {label}
    </span>
  );
}
