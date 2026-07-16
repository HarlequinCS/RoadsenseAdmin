import { Timestamp } from "firebase/firestore";
import { AppUser, Hazard } from "./types";
import { getHazardType } from "./hazard-utils";

type FirestoreTimestamp = { toDate: () => Date };

export function toIsoString(
  value: string | Date | FirestoreTimestamp | undefined | null
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  return "";
}

export function normalizeHazard(id: string, data: Record<string, unknown>): Hazard {
  const createdAt = data.createdAt;
  const hazardType = getHazardType({
    hazardType: data.hazardType as Hazard["hazardType"],
    type: data.type as string | undefined,
  });

  return {
    id,
    userId: (data.userId as string) || "",
    reporterName: (data.reporterName as string) || "",
    hazardType,
    description: (data.description as string) || (data.title as string) || "",
    imageUrl: (data.imageUrl as string) || "",
    latitude: (data.latitude as number) ?? 0,
    longitude: (data.longitude as number) ?? 0,
    status: (data.status as Hazard["status"]) || "New",
    riskLevel: (data.riskLevel as Hazard["riskLevel"]) || "Low",
    verificationCount: (data.verificationCount as number) ?? 0,
    verifiedBy: (data.verifiedBy as string[]) || [],
    createdAt:
      createdAt instanceof Timestamp
        ? createdAt.toDate().toISOString()
        : (createdAt as Hazard["createdAt"]) || "",
    statusUpdatedAt: data.statusUpdatedAt as Hazard["statusUpdatedAt"],
    resolvedBy: data.resolvedBy as string | undefined,
    demo: data.demo as boolean | undefined,
    adminNotes: data.adminNotes as string | undefined,
    adminUpdatedAt: data.adminUpdatedAt as Hazard["adminUpdatedAt"],
    adminUpdatedBy: data.adminUpdatedBy as string | undefined,
    type: data.type as string | undefined,
    title: data.title as string | undefined,
  };
}

export function normalizeUser(uid: string, data: Record<string, unknown>): AppUser {
  return {
    uid,
    fullName: (data.fullName as string) || "",
    email: (data.email as string) || "",
    birthday: data.birthday as string | undefined,
    gender: data.gender as AppUser["gender"],
    photoUrl: data.photoUrl as string | undefined,
    totalReports: (data.totalReports as number) ?? 0,
    resolvedReports: (data.resolvedReports as number) ?? 0,
    verifiedReports: (data.verifiedReports as number) ?? 0,
    highRiskReports: (data.highRiskReports as number) ?? 0,
    contributorBadge: data.contributorBadge as AppUser["contributorBadge"],
    fcmToken: data.fcmToken as string | undefined,
    fcmTokenUpdatedAt: data.fcmTokenUpdatedAt as AppUser["fcmTokenUpdatedAt"],
  };
}
