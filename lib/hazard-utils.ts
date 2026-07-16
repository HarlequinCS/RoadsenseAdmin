import {
  ContributorBadge,
  Hazard,
  HazardStatus,
  HazardType,
  RiskLevel,
  UserStats,
} from "./types";

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
