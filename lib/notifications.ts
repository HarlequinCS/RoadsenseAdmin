const STORAGE_KEY = "roadsense-critical-alerts";

export function areCriticalAlertsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setCriticalAlertsEnabled(enabled: boolean) {
  localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function canUseNotifications(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function showCriticalHazardNotification(hazard: {
  id: string;
  hazardType: string;
  riskLevel: string;
  reporterName: string;
}) {
  if (!canUseNotifications() || Notification.permission !== "granted") return;

  const title =
    hazard.riskLevel === "Critical"
      ? `Critical hazard: ${hazard.hazardType}`
      : `High-risk report: ${hazard.hazardType}`;

  const notification = new Notification(title, {
    body: `${hazard.reporterName} reported a ${hazard.riskLevel.toLowerCase()}-risk ${hazard.hazardType}. Tap to review.`,
    icon: "/roadsense-logo.svg",
    tag: `hazard-${hazard.id}`,
    requireInteraction: hazard.riskLevel === "Critical",
  });

  notification.onclick = () => {
    window.focus();
    window.location.href = `/reports/${hazard.id}`;
    notification.close();
  };
}

export function shouldAlertForHazard(hazard: {
  riskLevel: string;
  status: string;
}): boolean {
  if (hazard.riskLevel === "Critical" && hazard.status !== "Resolved") return true;
  if (hazard.riskLevel === "High" && hazard.status === "New") return true;
  return false;
}
