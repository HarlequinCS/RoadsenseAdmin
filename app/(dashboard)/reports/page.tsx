import { Suspense } from "react";
import ReportTable from "@/components/ReportTable";

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-1.5">
          Administration
        </p>
        <h1 className="font-display font-semibold text-[26px] text-asphalt-950 dark:text-fog-50 tracking-tight">
          Hazard reports
        </h1>
        <p className="text-sm text-fog-600 dark:text-fog-400 mt-1">
          Search, filter, and manage all submitted reports
        </p>
      </div>
      <div className="lane-divider w-full mb-6" />
      <Suspense fallback={<div className="h-40 rounded-xl bg-fog-100 dark:bg-asphalt-800 animate-pulse" />}>
        <ReportTable />
      </Suspense>
    </div>
  );
}