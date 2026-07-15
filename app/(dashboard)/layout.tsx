import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-fog-50 dark:bg-asphalt-950">
        <Sidebar />
        <main className="flex-1 min-w-0 px-8 py-7 max-w-[1400px]">{children}</main>
      </div>
    </AuthGuard>
  );
}