import {
  ContributorBadge,
  Hazard,
  HazardStatus,
  HazardType,
  RiskLevel,
  UserStats,
} from "./types";
import { toDate } from "./style-helpers";

const EARTH_RADIUS_KM = 6371;

export function isActiveHazard(hazard: Pick<Hazard, "status">): boolean {
  return hazard.status !== "Resolved";
}

export function getHazardType(hazard: Pick<Hazard, "hazardType" | "type">): string {
  return hazard.hazardType || hazard.type || "Other";
}

export function getContributorBadge(totalReports: number): ContributorBadge {
  if (totalReports >= 15) return "Safety Hero";
  if (totalReports >= 5) return "Road Guardian";
  if (totalReports >= 1) return "Active Reporter";
  return "New Reporter";
}

export function computeUserStats(
  hazards: Hazard[],
  userId: string
): UserStats {
  let totalReports = 0;
  let resolvedReports = 0;
  let highRiskReports = 0;

  for (const hazard of hazards) {
    if (hazard.userId !== userId) continue;
    if (hazard.status === "Resolved") {
      resolvedReports++;
    } else {
      totalReports++;
      const risk = hazard.riskLevel;
      if (risk === "High" || risk === "Critical") highRiskReports++;
    }
  }

  return {
    totalReports,
    resolvedReports,
    highRiskReports,
    contributorBadge: getContributorBadge(totalReports + resolvedReports),
  };
}

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findPotentialDuplicates(
  hazards: Hazard[],
  target: Pick<Hazard, "id" | "hazardType" | "type" | "latitude" | "longitude">,
  radiusMeters = 100
): Hazard[] {
  const type = getHazardType(target);
  const radiusKm = radiusMeters / 1000;

  return hazards.filter((h) => {
    if (h.id === target.id || !isActiveHazard(h)) return false;
    if (getHazardType(h) !== type) return false;
    return (
      haversineDistanceKm(
        target.latitude,
        target.longitude,
        h.latitude,
        h.longitude
      ) <= radiusKm
    );
  });
}

/** Mirrors mobile HazardUtils.computeRiskLevel base tiers (display only). */
export function getBaseRiskTier(hazardType: HazardType | string): number {
  switch (hazardType) {
    case "Flooding":
      return 2;
    case "Pothole":
    case "Debris":
      return 1;
    default:
      return 0;
  }
}

export function tierToRiskLevel(tier: number): RiskLevel {
  if (tier >= 3) return "Critical";
  if (tier === 2) return "High";
  if (tier === 1) return "Medium";
  return "Low";
}

export function countHazardsByStatus(
  hazards: Hazard[],
  status: HazardStatus
): number {
  return hazards.filter((h) => h.status === status).length;
}

export function countActiveHighCritical(hazards: Hazard[]): number {
  return hazards.filter(
    (h) =>
      isActiveHazard(h) &&
      (h.riskLevel === "High" || h.riskLevel === "Critical")
  ).length;
}

export function countNewReportsToday(hazards: Hazard[]): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return hazards.filter((h) => {
    if (h.status !== "New") return false;
    const d = toDate(h.createdAt);
    return d !== null && d >= start;
  }).length;
}

export function findLatestHazard(hazards: Hazard[]): Hazard | null {
  if (!hazards.length) return null;
  return hazards.reduce((latest, h) => {
    const d = toDate(h.createdAt);
    const ld = toDate(latest.createdAt);
    if (!d) return latest;
    if (!ld || d > ld) return h;
    return latest;
  });
}

export function formatTimeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

/** Hours from report submission to first admin action (status or notes update). */
export function computeAvgResponseTimeHours(hazards: Hazard[]): number | null {
  const durations: number[] = [];

  for (const hazard of hazards) {
    const created = toDate(hazard.createdAt);
    const responded = toDate(hazard.statusUpdatedAt) ?? toDate(hazard.adminUpdatedAt);
    if (!created || !responded) continue;
    if (hazard.status === "New" && !hazard.adminUpdatedAt && !hazard.statusUpdatedAt) continue;

    const diffMs = responded.getTime() - created.getTime();
    if (diffMs > 0) durations.push(diffMs);
  }

  if (!durations.length) return null;
  const avgMs = durations.reduce((sum, ms) => sum + ms, 0) / durations.length;
  return avgMs / (1000 * 60 * 60);
}

export function countActionedHazards(hazards: Hazard[]): number {
  return hazards.filter(
    (h) => toDate(h.statusUpdatedAt) !== null || toDate(h.adminUpdatedAt) !== null
  ).length;
}

export function formatDurationHours(hours: number | null): string {
  if (hours === null) return "—";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 48) return `${hours.toFixed(1)} hrs`;
  const days = Math.floor(hours / 24);
  const remHrs = Math.round(hours % 24);
  return remHrs > 0 ? `${days}d ${remHrs}h` : `${days}d`;
}
