"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun, IconDeviceDesktop } from "@tabler/icons-react";
import { Theme, cycleTheme, getStoredTheme, setTheme, themeLabel } from "@/lib/theme";

const icons: Record<Theme, typeof IconSun> = {
  light: IconSun,
  dark: IconMoon,
  system: IconDeviceDesktop,
};

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    setThemeState(getStoredTheme());

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getStoredTheme() === "system") setTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function handleToggle() {
    const next = cycleTheme(theme);
    setTheme(next);
    setThemeState(next);
  }

  const Icon = icons[theme];

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-fog-400 hover:text-fog-100 hover:bg-asphalt-900 transition-colors w-full"
      title={`Theme: ${themeLabel(theme)}`}
    >
      <Icon size={14} />
      {themeLabel(theme)} mode
    </button>
  );
}
