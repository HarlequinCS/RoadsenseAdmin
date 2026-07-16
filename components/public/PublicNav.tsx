"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import DownloadCta from "@/components/public/DownloadCta";
import { IconMenu2, IconX } from "@tabler/icons-react";

export default function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-fog-200/80 dark:border-asphalt-800/80 bg-fog-50/90 dark:bg-asphalt-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="shrink-0">
          <Logo href="/" size="md" className="sm:hidden" />
          <Logo href="/" size="lg" className="hidden sm:flex" />
        </div>

        <nav className="hidden md:flex items-center gap-4 sm:gap-6">
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
            Admin Sign in
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="md:hidden flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-asphalt-700 dark:text-fog-200 hover:bg-fog-100 dark:hover:bg-asphalt-800 transition-colors"
          aria-label="Open menu"
          aria-expanded={open}
        >
          <IconMenu2 size={22} />
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-[min(100%,280px)] bg-fog-50 dark:bg-asphalt-950 border-l border-fog-200 dark:border-asphalt-800 shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-fog-200 dark:border-asphalt-800">
              <Logo href="/" size="md" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-11 h-11 rounded-lg text-fog-500 hover:bg-fog-100 dark:hover:bg-asphalt-800 transition-colors"
                aria-label="Close menu"
              >
                <IconX size={20} />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1">
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="text-sm font-medium px-4 py-3 rounded-lg text-asphalt-700 dark:text-fog-200 hover:bg-white dark:hover:bg-asphalt-900 transition-colors min-h-[44px] flex items-center"
              >
                About
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium px-4 py-3 rounded-lg text-asphalt-700 dark:text-fog-200 hover:bg-white dark:hover:bg-asphalt-900 transition-colors min-h-[44px] flex items-center"
              >
                Admin Sign in
              </Link>
              <div className="pt-4 mt-2 border-t border-fog-200 dark:border-asphalt-800">
                <DownloadCta className="w-full justify-center" />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
