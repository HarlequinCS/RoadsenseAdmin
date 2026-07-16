"use client";

import { useEffect, useState } from "react";
import { IconBell, IconBellOff } from "@tabler/icons-react";
import {
  areCriticalAlertsEnabled,
  canUseNotifications,
  requestNotificationPermission,
  setCriticalAlertsEnabled,
} from "@/lib/notifications";

export default function NotificationToggle() {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(canUseNotifications());
    setEnabled(areCriticalAlertsEnabled());
    if (canUseNotifications()) {
      setPermission(Notification.permission);
    }
  }, []);

  async function handleToggle() {
    if (!supported) return;

    if (!enabled) {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result !== "granted") return;
      setCriticalAlertsEnabled(true);
      setEnabled(true);
      return;
    }

    setCriticalAlertsEnabled(false);
    setEnabled(false);
  }

  if (!supported) return null;

  const label = enabled
    ? "Critical alerts on"
    : permission === "denied"
      ? "Notifications blocked"
      : "Critical alerts off";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={permission === "denied" && !enabled}
      className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-fog-400 hover:text-fog-100 hover:bg-asphalt-900 transition-colors w-full disabled:opacity-50"
      title={
        permission === "denied"
          ? "Enable notifications in your browser settings"
          : "Alert when new critical or high-risk reports arrive"
      }
    >
      {enabled ? <IconBell size={14} className="text-amber-400" /> : <IconBellOff size={14} />}
      {label}
    </button>
  );
}
