export interface TriageInput {
  id: string;
  hazardType: string;
  description: string;
  riskLevel: string;
  status: string;
  reporterName: string;
  latitude: number;
  longitude: number;
  verificationCount: number;
  address?: string | null;
  duplicateCount?: number;
  reporterTotalReports?: number;
  reporterBadge?: string;
  imageUrl?: string;
}

export interface TriageResult {
  summary: string;
  suggestedPriority: "Critical" | "High" | "Medium" | "Low";
  suggestedAction: string;
  draftNote: string;
  reasoning: string;
}

export interface AnalyticsSummaryInput {
  totalReports: number;
  activeHazards: number;
  highCriticalActive: number;
  resolveRate: number;
  avgResponseTime: string;
  actionedCount: number;
  reportsThisMonth: number;
  mostCommonHazard: string;
  newReports: number;
  underInvestigation: number;
  byType: { name: string; value: number; pct: number }[];
  byStatus: { name: string; value: number }[];
  monthlyTrend: { name: string; value: number }[];
}

export interface AnalyticsSummaryResult {
  narrative: string;
  highlights: string[];
  concerns: string[];
  recommendation: string;
}

export interface PhotoAnalysisInput {
  hazardType: string;
  description: string;
  riskLevel: string;
  status: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  imageUrl: string;
}

export interface PhotoAnalysisResult {
  visibleDamage: string;
  severityAssessment: "Critical" | "High" | "Medium" | "Low";
  matchesReportedType: boolean;
  matchesReportedRisk: boolean;
  additionalObservations: string;
  confidenceNote: string;
}
