"use client";

import { useEffect, useRef, useState } from "react";
import { IconTrendingUp } from "@tabler/icons-react";

type Tone = "default" | "warning" | "danger" | "success" | "info";

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  tone?: Tone;
  delta?: string;
  animate?: boolean;
}

const toneMap: Record<Tone, { card: string; icon: string; badge: string }> = {
  default: {
    card: "bg-fog-100 dark:bg-asphalt-800",
    icon: "bg-fog-200 dark:bg-asphalt-700 text-asphalt-700 dark:text-fog-200",
    badge: "text-fog-600 dark:text-fog-400",
  },
  warning: {
    card: "bg-amber-50 dark:bg-amber-900/20",
    icon: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    badge: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    card: "bg-signal-red-50 dark:bg-signal-red-600/15",
    icon: "bg-signal-red-100 dark:bg-signal-red-600/25 text-signal-red-600 dark:text-signal-red-100",
    badge: "text-signal-red-600 dark:text-signal-red-100",
  },
  success: {
    card: "bg-signal-teal-50 dark:bg-signal-teal-600/15",
    icon: "bg-signal-teal-100 dark:bg-signal-teal-600/25 text-signal-teal-600 dark:text-signal-teal-100",
    badge: "text-signal-teal-600 dark:text-signal-teal-100",
  },
  info: {
    card: "bg-signal-blue-50 dark:bg-signal-blue-600/15",
    icon: "bg-signal-blue-100 dark:bg-signal-blue-600/25 text-signal-blue-600 dark:text-signal-blue-100",
    badge: "text-signal-blue-600 dark:text-signal-blue-100",
  },
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const diff = value - start;
    const duration = 600;
    const startTime = performance.now();
    function step(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * ease));
      if (progress < 1) requestAnimationFrame(step);
      else prev.current = value;
    }
    requestAnimationFrame(step);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

export default function StatCard({
  label,
  value,
  icon,
  tone = "default",
  delta,
  animate = false,
}: StatCardProps) {
  const t = toneMap[tone];
  return (
    <div className={`rounded-xl px-4 py-4 transition-all hover:scale-[1.015] ${t.card}`}>
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.icon}`}>
            {icon}
          </div>
        )}
        {delta && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${t.badge}`}>
            <IconTrendingUp size={12} />
            {delta}
          </span>
        )}
      </div>
      <p className="font-display font-semibold text-[26px] leading-none text-asphalt-950 dark:text-fog-50 mb-1.5">
        {animate && typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </p>
      <p className="text-xs text-fog-600 dark:text-fog-400">{label}</p>
    </div>
  );
}