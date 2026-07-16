import { AnalyticsSummaryInput, PhotoAnalysisInput, TriageInput } from "./types";

export function buildTriageSystemPrompt(): string {
  return `You are an expert road safety administrator assistant for RoadSense Malaysia.
Analyze hazard reports and help admins triage them quickly.
Respond ONLY with valid JSON matching this schema:
{
  "summary": "2-3 sentence plain-language summary",
  "suggestedPriority": "Critical" | "High" | "Medium" | "Low",
  "suggestedAction": "one clear next step for the admin",
  "draftNote": "professional admin note draft (2-4 sentences)",
  "reasoning": "brief explanation of priority and action"
}
Prioritize public safety: flooding and critical road damage need urgent attention.
Consider verification count, duplicates nearby, and reporter history when relevant.
Be concise and actionable.`;
}

export function buildTriageUserPrompt(input: TriageInput): string {
  return JSON.stringify({
    reportId: input.id,
    hazardType: input.hazardType,
    description: input.description || "(no description)",
    riskLevel: input.riskLevel,
    status: input.status,
    reporterName: input.reporterName,
    location: input.address || `${input.latitude}, ${input.longitude}`,
    coordinates: { lat: input.latitude, lng: input.longitude },
    communityVerifications: input.verificationCount,
    nearbyDuplicates: input.duplicateCount ?? 0,
    reporterHistory: {
      totalReports: input.reporterTotalReports ?? 0,
      badge: input.reporterBadge ?? "unknown",
    },
    hasPhoto: Boolean(input.imageUrl),
  });
}

export function buildAnalyticsSystemPrompt(): string {
  return `You are a road safety data analyst writing executive summaries for RoadSense Malaysia stakeholders.
Given aggregated hazard report statistics, write a clear, professional narrative.
Respond ONLY with valid JSON:
{
  "narrative": "3-5 sentence executive summary paragraph",
  "highlights": ["2-4 positive or notable bullet points"],
  "concerns": ["1-3 areas needing attention, or empty array if none"],
  "recommendation": "one actionable recommendation for the admin team"
}
Use plain language suitable for municipal stakeholders. Reference specific numbers from the data.`;
}

export function buildAnalyticsUserPrompt(input: AnalyticsSummaryInput): string {
  return JSON.stringify(input);
}

export function buildPhotoSystemPrompt(): string {
  return `You are a road safety inspector analyzing hazard photos submitted by citizens.
Examine the image and compare with the reported hazard metadata.
Respond ONLY with valid JSON:
{
  "visibleDamage": "what damage or hazard is visible in the photo",
  "severityAssessment": "Low" | "Medium" | "High" | "Critical",
  "matchesReportedType": true | false,
  "matchesReportedRisk": true | false,
  "additionalObservations": "anything notable not in the text report",
  "confidenceNote": "brief note on image clarity and assessment confidence"
}
Be objective. If the image is unclear, say so in confidenceNote.`;
}

export function buildPhotoUserPrompt(input: PhotoAnalysisInput): string {
  return `Analyze this road hazard photo. Reported metadata: ${JSON.stringify({
    hazardType: input.hazardType,
    description: input.description || "(none)",
    reportedRisk: input.riskLevel,
    status: input.status,
    location: input.address || `${input.latitude}, ${input.longitude}`,
  })}`;
}
