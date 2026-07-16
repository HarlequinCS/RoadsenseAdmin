"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileAdminHeader from "@/components/MobileAdminHeader";
import GlobalSearch from "@/components/GlobalSearch";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen bg-fog-50 dark:bg-asphalt-950">
      {drawerOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <Sidebar
        mobileOpen={drawerOpen}
        onNavigate={() => setDrawerOpen(false)}
        onSearchOpenChange={setSearchOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <MobileAdminHeader
          onMenuOpen={() => setDrawerOpen(true)}
          onSearchOpen={() => setSearchOpen(true)}
        />
        <main className="flex-1 min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-7 max-w-[1400px]">
          {children}
        </main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} showTrigger={false} />
    </div>
  );
}
