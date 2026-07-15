"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import {
  IconLayoutDashboard,
  IconAlertTriangle,
  IconUsers,
  IconChartBar,
  IconMapPin,
  IconLogout,
} from "@tabler/icons-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/reports", label: "Reports", icon: IconAlertTriangle, badge: true },
  { href: "/users", label: "Users", icon: IconUsers },
  { href: "/analytics", label: "Analytics", icon: IconChartBar },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [newCount, setNewCount] = useState(0);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "hazards"), (snap) => {
      setNewCount(snap.docs.filter((d) => d.data().status === "New").length);
    });
    return () => unsub();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <aside className="no-print w-[220px] shrink-0 bg-asphalt-950 text-fog-100 flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/15 flex items-center justify-center shrink-0">
            <IconMapPin size={18} className="text-amber-400" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-[15px] leading-none text-white tracking-tight">
              RoadSense
            </p>
            <p className="text-[10.5px] text-fog-400 mt-1 tracking-wide">ADMIN DASHBOARD</p>
          </div>
        </div>
      </div>

      <div className="mx-5 lane-divider" />

      {/* Nav */}
      <nav className="px-3 pt-5 flex flex-col gap-1">
        <p className="text-[10px] font-medium text-fog-400/80 uppercase tracking-wider px-2.5 mb-1.5">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center justify-between pl-3.5 pr-2.5 py-2.5 rounded-lg text-sm transition-colors ${
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
      </nav>

      {/* Bottom */}
      <div className="mt-auto px-3 pb-4 pt-3 border-t border-asphalt-800">
        <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-asphalt-700 flex items-center justify-center text-[11px] font-medium text-fog-100">
            AD
          </div>
          <div>
            <p className="text-xs font-medium leading-none text-fog-100">Admin</p>
            <p className="text-[10.5px] text-fog-400 mt-1">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-fog-400 hover:text-signal-red-500 hover:bg-signal-red-500/10 transition-colors w-full disabled:opacity-50"
        >
          <IconLogout size={14} />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}