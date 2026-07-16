"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { getAdminDisplayName } from "@/lib/auth";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationToggle from "@/components/NotificationToggle";
import {
  IconLayoutDashboard,
  IconAlertTriangle,
  IconUsers,
  IconChartBar,
  IconLogout,
  IconMap2,
  IconHistory,
  IconMessage,
  IconBell,
  IconX,
  IconSearch,
} from "@tabler/icons-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/reports", label: "Reports", icon: IconAlertTriangle, badge: true },
  { href: "/map", label: "Map", icon: IconMap2 },
  { href: "/users", label: "Users", icon: IconUsers },
  { href: "/feedback", label: "Feedback", icon: IconMessage },
  { href: "/notifications", label: "Notifications", icon: IconBell },
  { href: "/analytics", label: "Analytics", icon: IconChartBar },
  { href: "/activity", label: "Activity", icon: IconHistory },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onNavigate?: () => void;
  onSearchOpenChange?: (open: boolean) => void;
}

export default function Sidebar({
  mobileOpen = false,
  onNavigate,
  onSearchOpenChange,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [newCount, setNewCount] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("Admin");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "hazards"), (snap) => {
      setNewCount(snap.docs.filter((d) => d.data().status === "New").length);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) setDisplayName(await getAdminDisplayName(u));
    });
    return () => unsub();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      // Continue signing out locally even if cookie clear fails
    }
    await signOut(auth);
    router.replace("/login");
  }

  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside
      className={`no-print fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-full lg:h-screen w-[260px] lg:w-[220px] shrink-0 bg-asphalt-950 text-fog-100 flex flex-col transition-transform duration-200 ease-out ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="flex items-center justify-between px-5 pt-6 pb-5 lg:block">
        <Logo size="md" variant="onDark" subtitle="Admin Dashboard" href="/dashboard" />
        <button
          type="button"
          onClick={onNavigate}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-fog-400 hover:text-fog-100 hover:bg-asphalt-800 transition-colors"
          aria-label="Close menu"
        >
          <IconX size={20} />
        </button>
      </div>

      <div className="mx-5 lane-divider" />

      <nav className="px-3 pt-5 flex flex-col gap-1 flex-1 overflow-y-auto">
        <p className="text-[10px] font-medium text-fog-400/80 uppercase tracking-wider px-2.5 mb-1.5">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`relative flex items-center justify-between pl-3.5 pr-2.5 py-2.5 rounded-lg text-sm transition-colors min-h-[44px] ${
                active
                  ? "bg-asphalt-800 text-white"
                  : "text-fog-400 hover:bg-asphalt-900 hover:text-fog-100"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 lane-divider-vertical" />
              )}
              <span className="flex items-center gap-2.5">
                <Icon size={17} className={active ? "text-amber-400" : ""} strokeWidth={2} />
                <span className="font-medium">{label}</span>
              </span>
              {badge && newCount > 0 && (
                <span className="text-[10px] font-semibold bg-amber-400/15 text-amber-400 px-1.5 py-0.5 rounded-full">
                  {newCount}
                </span>
              )}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => onSearchOpenChange?.(true)}
          className="hidden lg:flex items-center gap-2 mx-2 mt-4 mb-2 px-2.5 py-2 rounded-lg text-xs text-fog-400 border border-asphalt-800 hover:border-asphalt-700 hover:text-fog-200 hover:bg-asphalt-900 transition-colors w-[calc(100%-1rem)]"
        >
          <IconSearch size={14} />
          <span className="flex-1 text-left">Search reports…</span>
        </button>
      </nav>

      <div className="px-3 pb-4 pt-3 border-t border-asphalt-800 shrink-0">
        <NotificationToggle />
        <ThemeToggle />
        <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1 mt-1">
          <div className="w-7 h-7 rounded-full bg-asphalt-700 flex items-center justify-center text-[11px] font-medium text-fog-100">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium leading-none text-fog-100 truncate">{displayName}</p>
            <p className="text-[10.5px] text-fog-400 mt-1 truncate">{user?.email || "Administrator"}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-xs text-fog-400 hover:text-signal-red-500 hover:bg-signal-red-500/10 transition-colors w-full disabled:opacity-50 min-h-[44px]"
        >
          <IconLogout size={14} />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
