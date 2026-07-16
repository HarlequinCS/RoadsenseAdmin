import { ContributorBadge, HazardStatus, HazardType, RiskLevel } from "./types";

export const statusStyles: Record<HazardStatus, { bg: string; fg: string; dot: string }> = {
  New: { bg: "#FAEEDA", fg: "#633806", dot: "#EF9F27" },
  "Under Investigation": { bg: "#FCEBEB", fg: "#791F1F", dot: "#E4572E" },
  Resolved: { bg: "#E1F5EE", fg: "#04342C", dot: "#12805C" },
};

export const statusChartColors: Record<HazardStatus, string> = {
  New: "#EF9F27",
  "Under Investigation": "#E4572E",
  Resolved: "#12805C",
};

export const hazardTypeColors: Record<HazardType, string> = {
  Pothole: "#E4572E",
  "Road Crack": "#7F77DD",
  Flooding: "#3D6FB4",
  Debris: "#3B6D11",
  "Street Light Issue": "#993556",
  Other: "#5C5A56",
};

export const riskLevelStyles: Record<RiskLevel, { bg: string; fg: string }> = {
  Low: { bg: "#E6F1FB", fg: "#0C447C" },
  Medium: { bg: "#FAEEDA", fg: "#633806" },
  High: { bg: "#FCEBEB", fg: "#791F1F" },
  Critical: { bg: "#791F1F", fg: "#FFFFFF" },
};

export const riskChartColors: Record<RiskLevel, string> = {
  Low: "#3D6FB4",
  Medium: "#EF9F27",
  High: "#E4572E",
  Critical: "#791F1F",
};

export const contributorBadgeStyles: Record<ContributorBadge, { bg: string; fg: string }> = {
  "New Reporter": { bg: "#EFEEE8", fg: "#5C5A56" },
  "Active Reporter": { bg: "#E6F1FB", fg: "#0C447C" },
  "Road Guardian": { bg: "#E1F5EE", fg: "#085041" },
  "Safety Hero": { bg: "#FAEEDA", fg: "#633806" },
};

/** Brand colours from mobile app */
export const brandColors = {
  primaryCyan: "#009EE3",
  accentOrange: "#FF6B35",
  primaryDark: "#007BB5",
};

export function toDate(value: string | Date | { toDate: () => Date } | undefined | null): Date | null {
  if (!value) return null;
  if (typeof value === "string") return new Date(value);
  if (value instanceof Date) return value;
  if (value && typeof value.toDate === "function") return value.toDate();
  return null;
}

export function formatDate(value: string | Date | { toDate: () => Date } | undefined | null): string {
  const d = toDate(value);
  if (!d || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value: string | Date | { toDate: () => Date } | undefined | null): string {
  const d = toDate(value);
  if (!d || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getHazardTypeColor(type: string): string {
  return hazardTypeColors[type as HazardType] || "#888";
}

export function getRiskStyle(risk: string): { bg: string; fg: string } {
  return riskLevelStyles[risk as RiskLevel] || { bg: "#EFEEE8", fg: "#5C5A56" };
}

export function getContributorStyle(badge: string): { bg: string; fg: string } {
  return contributorBadgeStyles[badge as ContributorBadge] || { bg: "#EFEEE8", fg: "#5C5A56" };
}
