import type { Metadata } from "next";
import DashboardShell from "@/components/DashboardShell";
import AuthGuard from "@/components/AuthGuard";
import { buildPageMetadata } from "@/lib/seo";

import CriticalAlertWatcher from "@/components/CriticalAlertWatcher";
import PendingHazardScorer from "@/components/PendingHazardScorer";

export const metadata: Metadata = buildPageMetadata({
  title: "Admin",
  description: "RoadSense administrative dashboard.",
  path: "/dashboard",
  index: false,
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <CriticalAlertWatcher />
      <PendingHazardScorer />
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}