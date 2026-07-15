import Link from "next/link";
import {
  IconMapPin, IconAlertTriangle, IconChartBar, IconUsers,
  IconArrowRight, IconBrandGithub, IconDownload,
} from "@tabler/icons-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-fog-50 dark:bg-asphalt-950 flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <IconMapPin size={18} className="text-amber-600 dark:text-amber-400" strokeWidth={2.25} />
          </div>
          <span className="font-display font-semibold text-base text-asphalt-950 dark:text-fog-50 tracking-tight">
            RoadSense
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/about"
            className="text-sm font-medium text-fog-600 dark:text-fog-400 hover:text-asphalt-950 dark:hover:text-fog-100 transition-colors"
          >
            About
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-lg border border-fog-200 dark:border-asphalt-700 hover:bg-white dark:hover:bg-asphalt-800 transition-colors text-asphalt-700 dark:text-fog-200"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto w-full px-8 py-16 grid grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-amber-600 dark:text-amber-400 uppercase mb-4">
              Crowdsourced Road Safety
            </p>
            <h1 className="font-display font-semibold text-[44px] leading-[1.1] text-asphalt-950 dark:text-fog-50 tracking-tight mb-5">
              Every pothole reported.<br />Every hazard tracked.
            </h1>
            <p className="text-base text-fog-600 dark:text-fog-400 mb-8 max-w-md">
              RoadSense lets communities report road hazards in real time with GPS
              and photos — giving administrators the tools to investigate, act, and
              resolve issues faster.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-lg bg-asphalt-950 dark:bg-fog-100 text-white dark:text-asphalt-950 hover:bg-asphalt-800 dark:hover:bg-white transition-colors"
              >
                Go to Dashboard
                <IconArrowRight size={16} />
              </Link>
              <a href="#" className="flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-lg border border-amber-400 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
                <IconDownload size={16} />
                Download App
              </a>
              <a href="https://github.com/HarlequinCS/RoadSense" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-lg border border-fog-200 dark:border-asphalt-700 hover:bg-white dark:hover:bg-asphalt-800 transition-colors text-asphalt-700 dark:text-fog-200">
                <IconBrandGithub size={16} />
                GitHub
              </a>
            </div>
            <div className="lane-divider w-40" />
          </div>

          {/* Feature cards */}
          <div className="space-y-3">
            <FeatureCard
              icon={<IconAlertTriangle size={18} />}
              tone="warning"
              title="Real-time hazard reports"
              description="GPS-tagged reports with photos, submitted straight from the mobile app."
            />
            <FeatureCard
              icon={<IconMapPin size={18} />}
              tone="info"
              title="Interactive hazard map"
              description="See exactly where issues are, color-coded by investigation status."
            />
            <FeatureCard
              icon={<IconChartBar size={18} />}
              tone="success"
              title="Analytics & trends"
              description="Track report volume by category, status, and month over time."
            />
            <FeatureCard
              icon={<IconUsers size={18} />}
              tone="default"
              title="User management"
              description="Monitor community members and their reporting activity."
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-fog-200 dark:border-asphalt-800 py-6">
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between text-xs text-fog-400">
          <span>ICT602 Mobile Technology Group Project</span>
          <span>© 2026 RoadSense</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: "warning" | "info" | "success" | "default";
}) {
  const toneMap: Record<string, string> = {
    warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    info: "bg-signal-blue-50 dark:bg-signal-blue-600/20 text-signal-blue-600 dark:text-signal-blue-100",
    success: "bg-signal-teal-50 dark:bg-signal-teal-600/20 text-signal-teal-600 dark:text-signal-teal-100",
    default: "bg-fog-100 dark:bg-asphalt-800 text-fog-600 dark:text-fog-400",
  };
  return (
    <div className="flex items-start gap-3.5 bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-xl p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${toneMap[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="font-display font-medium text-sm text-asphalt-950 dark:text-fog-50 mb-0.5">
          {title}
        </p>
        <p className="text-xs text-fog-600 dark:text-fog-400">{description}</p>
      </div>
    </div>
  );
}