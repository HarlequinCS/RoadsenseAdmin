import { ReactNode } from "react";
import {
  IconCircleCheck, IconInbox, IconSearch, IconAlertTriangle,
} from "@tabler/icons-react";

type EmptyVariant = "all-clear" | "no-data" | "no-results";

interface EmptyStateProps {
  variant: EmptyVariant;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const defaults: Record<EmptyVariant, { icon: ReactNode; title: string; description: string }> = {
  "all-clear": {
    icon: <IconCircleCheck size={28} className="text-signal-teal-500" />,
    title: "All clear",
    description: "No critical hazards — roads are looking good.",
  },
  "no-data": {
    icon: <IconInbox size={28} className="text-fog-400" />,
    title: "No data yet",
    description: "Waiting for the first report from the mobile app.",
  },
  "no-results": {
    icon: <IconSearch size={28} className="text-fog-400" />,
    title: "No matches",
    description: "No reports match your filters. Try adjusting your search.",
  },
};

export default function EmptyState({
  variant,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  const preset = defaults[variant];
  return (
    <div className={`flex flex-col items-center justify-center text-center py-10 px-6 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-fog-100 dark:bg-asphalt-800 flex items-center justify-center mb-3">
        {preset.icon}
      </div>
      <p className="font-display font-medium text-sm text-asphalt-950 dark:text-fog-50 mb-1">
        {title ?? preset.title}
      </p>
      <p className="text-xs text-fog-500 dark:text-fog-400 max-w-xs">
        {description ?? preset.description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function EmptyStateInline({
  variant,
  title,
  description,
}: Pick<EmptyStateProps, "variant" | "title" | "description">) {
  const preset = defaults[variant];
  return (
    <div className="flex items-center gap-3 py-6 px-4 justify-center text-center">
      <IconAlertTriangle size={16} className="text-fog-400 shrink-0" />
      <div>
        <p className="text-xs font-medium text-fog-600 dark:text-fog-300">{title ?? preset.title}</p>
        <p className="text-[11px] text-fog-400">{description ?? preset.description}</p>
      </div>
    </div>
  );
}
