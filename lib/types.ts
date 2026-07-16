export type HazardType =
  | "Pothole"
  | "Road Crack"
  | "Flooding"
  | "Debris"
  | "Street Light Issue"
  | "Other";

export type HazardStatus = "New" | "Under Investigation" | "Resolved";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type Gender = "Male" | "Female" | "Other" | "Prefer not to say";

export type ContributorBadge =
  | "New Reporter"
  | "Active Reporter"
  | "Road Guardian"
  | "Safety Hero";

export const HAZARD_TYPES: HazardType[] = [
  "Pothole",
  "Road Crack",
  "Flooding",
  "Debris",
  "Street Light Issue",
  "Other",
];

export const HAZARD_STATUSES: HazardStatus[] = [
  "New",
  "Under Investigation",
  "Resolved",
];

export const RISK_LEVELS: RiskLevel[] = ["Low", "Medium", "High", "Critical"];

export interface Hazard {
  id: string;
  userId: string;
  reporterName: string;
  hazardType: HazardType | string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  status: HazardStatus;
  riskLevel: RiskLevel | string;
  verificationCount: number;
  verifiedBy: string[];
  createdAt: string | Date | { toDate: () => Date };
  statusUpdatedAt?: string | Date | { toDate: () => Date };
  resolvedBy?: string;
  demo?: boolean;
  adminNotes?: string;
  adminUpdatedAt?: string | Date | { toDate: () => Date };
  adminUpdatedBy?: string;
  /** Legacy alias for hazardType */
  type?: string;
  /** Legacy alias for description */
  title?: string;
}

export interface AppUser {
  uid: string;
  fullName: string;
  email: string;
  birthday?: string;
  gender?: Gender | string;
  photoUrl?: string;
  totalReports: number;
  resolvedReports: number;
  verifiedReports?: number;
  highRiskReports?: number;
  contributorBadge?: ContributorBadge | string;
  fcmToken?: string;
  fcmTokenUpdatedAt?: string | Date | { toDate: () => Date };
}

export interface DashboardStats {
  totalUsers: number;
  totalReports: number;
  activeHazards: number;
  newReports: number;
  underInvestigation: number;
  resolvedReports: number;
  highCriticalActive: number;
}

export interface UserStats {
  totalReports: number;
  resolvedReports: number;
  highRiskReports: number;
  contributorBadge: ContributorBadge;
}
