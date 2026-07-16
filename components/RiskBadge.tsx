import { RiskLevel } from "@/lib/types";
import { getRiskStyle } from "@/lib/style-helpers";

export default function RiskBadge({ risk }: { risk: RiskLevel | string }) {
  const { bg, fg } = getRiskStyle(risk);
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-md font-medium"
      style={{ backgroundColor: bg, color: fg }}
    >
      {risk || "—"}
    </span>
  );
}
