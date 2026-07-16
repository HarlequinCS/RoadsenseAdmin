"use client";

import PushNotificationPanel from "@/components/PushNotificationPanel";

export default function NotificationsPageClient() {
  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-1.5">
          Outreach
        </p>
        <h1 className="font-display font-semibold text-[26px] text-asphalt-950 dark:text-fog-50 tracking-tight">
          Push notifications
        </h1>
        <p className="text-xs text-fog-600 dark:text-fog-400 mt-1">
          Send Firebase Cloud Messaging alerts to mobile devices — broadcast or targeted from report/user pages.
        </p>
      </div>

      <div className="lane-divider w-full mb-6" />

      <PushNotificationPanel defaultTitle="RoadSense alert" />

      <div className="mt-6 p-4 rounded-xl border border-fog-200 dark:border-asphalt-800 bg-fog-50 dark:bg-asphalt-900 text-xs text-fog-600 dark:text-fog-400 space-y-2">
        <p className="font-medium text-asphalt-950 dark:text-fog-100">Setup</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Firebase Console → Project Settings → Service accounts</li>
          <li>Generate new private key (JSON)</li>
          <li>Set <code className="text-[10px]">FIREBASE_SERVICE_ACCOUNT_JSON</code> in server <code className="text-[10px]">.env</code> (single line)</li>
          <li>Restart the admin Docker container</li>
        </ol>
        <p>
          AI scoring notifications are also sent automatically when Groq Cloud Function{" "}
          <code className="text-[10px]">scoreHazardRisk</code> completes (after deploy).
        </p>
      </div>
    </div>
  );
}
