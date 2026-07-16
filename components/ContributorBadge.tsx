import { ContributorBadge } from "@/lib/types";
import { getContributorStyle } from "@/lib/style-helpers";

export default function ContributorBadgePill({ badge }: { badge: ContributorBadge | string }) {
  const { bg, fg } = getContributorStyle(badge);
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: bg, color: fg }}
    >
      {badge || "New Reporter"}
    </span>
  );
}
