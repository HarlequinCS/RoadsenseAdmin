export type HazardType =
  | "Pothole"
  | "Road Crack"
  | "Flooding"
  | "Debris"
  | "Street Light Issue"
  | "Other";

export type HazardStatus = "New" | "Under Investigation" | "Resolved";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type RiskSource = "rules" | "ai" | "admin";

export type AiScoringStatus = "pending" | "complete" | "failed";

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
  ruleBasedRiskLevel?: RiskLevel | string;
  aiRiskLevel?: RiskLevel | string;
  aiReason?: string;
  aiConfidence?: number;
  riskSource?: RiskSource | string;
  aiScoringStatus?: AiScoringStatus | string;
  aiScoredAt?: string | Date | { toDate: () => Date };
  verificationCount: number;
  verifiedBy: string[];
  createdAt: string | Date | { toDate: () => Date };
  statusUpdatedAt?: string | Date | { toDate: () => Date };
  resolvedBy?: string;
  demo?: boolean;
  adminNotes?: string;
  adminUpdatedAt?: string | Date | { toDate: () => Date };
  adminUpdatedBy?: string;
  followers?: string[];
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
  fcmTokens?: string[];
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

export type AuditAction =
  | "status_change"
  | "bulk_status_change"
  | "notes_updated"
  | "hazard_deleted"
  | "hazard_updated"
  | "risk_override";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  hazardId: string;
  hazardType?: string;
  reporterName?: string;
  adminUid: string;
  adminEmail?: string;
  previousStatus?: HazardStatus;
  newStatus?: HazardStatus;
  details?: string;
  createdAt: string | Date | { toDate: () => Date };
}

export interface FeedbackEntry {
  id: string;
  userId?: string;
  userName?: string;
  email?: string;
  message: string;
  rating?: number;
  category?: string;
  appVersion?: string;
  createdAt: string | Date | { toDate: () => Date };
}
