import { TAGLINE } from "@/lib/public-site";

export default function PublicFooter() {
  return (
    <footer className="border-t border-fog-200 dark:border-asphalt-800 bg-white/50 dark:bg-asphalt-900/50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-center text-sm font-display font-medium text-asphalt-950 dark:text-fog-50 mb-1">
          {TAGLINE}
        </p>
        <p className="text-center text-xs text-fog-500 dark:text-fog-400 mb-4">
          Universiti Teknologi MARA (UiTM) · ICT602 Mobile Programming · Group Project
        </p>
        <p className="text-center text-[11px] text-fog-400">
          © 2026 RoadSense Team. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
