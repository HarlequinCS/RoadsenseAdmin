const MAX_SHORT = 120;
const MAX_MEDIUM = 500;
const MAX_LONG = 2000;

export function clampString(value: unknown, max: number): string | undefined {
  if (value == null) return undefined;
  if (typeof value !== "string") return undefined;
  return value.slice(0, max);
}

export function isNonEmptyString(value: unknown, max = MAX_MEDIUM): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

export function sanitizeTriageInput(body: Record<string, unknown>) {
  return {
    id: clampString(body.id, MAX_SHORT) ?? "",
    hazardType: clampString(body.hazardType, MAX_SHORT) ?? "",
    description: clampString(body.description, MAX_LONG) ?? "",
    riskLevel: clampString(body.riskLevel, MAX_SHORT) ?? "",
    status: clampString(body.status, MAX_SHORT) ?? "",
    reporterName: clampString(body.reporterName, MAX_MEDIUM) ?? "",
    latitude: typeof body.latitude === "number" ? body.latitude : 0,
    longitude: typeof body.longitude === "number" ? body.longitude : 0,
    verificationCount:
      typeof body.verificationCount === "number" ? body.verificationCount : 0,
    address: clampString(body.address, MAX_MEDIUM) ?? null,
    duplicateCount:
      typeof body.duplicateCount === "number" ? body.duplicateCount : undefined,
    reporterTotalReports:
      typeof body.reporterTotalReports === "number"
        ? body.reporterTotalReports
        : undefined,
    reporterBadge: clampString(body.reporterBadge, MAX_SHORT),
    imageUrl: clampString(body.imageUrl, 2048),
  };
}

export function sanitizePhotoInput(body: Record<string, unknown>) {
  return {
    hazardType: clampString(body.hazardType, MAX_SHORT) ?? "",
    description: clampString(body.description, MAX_LONG) ?? "",
    riskLevel: clampString(body.riskLevel, MAX_SHORT) ?? "",
    status: clampString(body.status, MAX_SHORT) ?? "",
    latitude: typeof body.latitude === "number" ? body.latitude : 0,
    longitude: typeof body.longitude === "number" ? body.longitude : 0,
    address: clampString(body.address, MAX_MEDIUM) ?? null,
    imageUrl: clampString(body.imageUrl, 2048) ?? "",
  };
}
