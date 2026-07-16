"use client";

import { usePathname } from "next/navigation";
import { IconMenu2, IconSearch } from "@tabler/icons-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/reports": "Reports",
  "/map": "Map",
  "/users": "Users",
  "/analytics": "Analytics",
  "/activity": "Activity",
};

interface MobileAdminHeaderProps {
  onMenuOpen: () => void;
  onSearchOpen: () => void;
}

export default function MobileAdminHeader({ onMenuOpen, onSearchOpen }: MobileAdminHeaderProps) {
  const pathname = usePathname();
  const basePath = pathname?.split("/").slice(0, 2).join("/") || "/dashboard";
  const title =
    pathname?.startsWith("/reports/") && pathname !== "/reports"
      ? "Report detail"
      : PAGE_TITLES[basePath] || "Admin";

  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 border-b border-fog-200 dark:border-asphalt-800 bg-fog-50/95 dark:bg-asphalt-950/95 backdrop-blur-md">
      <button
        type="button"
        onClick={onMenuOpen}
        className="flex items-center justify-center w-11 h-11 -ml-2 rounded-lg text-asphalt-700 dark:text-fog-200 hover:bg-fog-100 dark:hover:bg-asphalt-800 transition-colors"
        aria-label="Open menu"
      >
        <IconMenu2 size={22} />
      </button>

      <p className="font-display font-semibold text-sm text-asphalt-950 dark:text-fog-50 truncate flex-1 text-center">
        {title}
      </p>

      <button
        type="button"
        onClick={onSearchOpen}
        className="flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-asphalt-700 dark:text-fog-200 hover:bg-fog-100 dark:hover:bg-asphalt-800 transition-colors"
        aria-label="Search reports"
      >
        <IconSearch size={20} />
      </button>
    </header>
  );
}
