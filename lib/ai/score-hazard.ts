import { groqChatCompletion } from "./groq-client";
import { HazardScoreInput, HazardScoreResult } from "./types";

const VALID_RISKS = new Set(["Low", "Medium", "High", "Critical"]);

function buildSystemPrompt(): string {
  return `You are a road safety AI for RoadSense Malaysia.
Score citizen hazard reports for response priority.
Respond ONLY with valid JSON:
{
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "reason": "1-2 sentences explaining the priority",
  "confidence": 0.0 to 1.0
}
Prioritize public safety: flooding, large potholes, and obstructive debris are higher risk.
If the photo is unclear, rely on hazard type and description and lower confidence.`;
}

function buildUserText(input: HazardScoreInput): string {
  return JSON.stringify({
    hazardType: input.hazardType,
    description: input.description || "",
    ruleBasedRiskLevel: input.ruleBasedRiskLevel || input.riskLevel || "Medium",
    location: { latitude: input.latitude, longitude: input.longitude },
    hasPhoto: Boolean(input.imageUrl),
  });
}

function parseScoreJson(raw: string): HazardScoreResult {
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;
  const riskLevel = VALID_RISKS.has(String(parsed.riskLevel))
    ? (String(parsed.riskLevel) as HazardScoreResult["riskLevel"])
    : "Medium";
  const reason =
    typeof parsed.reason === "string"
      ? parsed.reason.slice(0, 500)
      : "AI priority assessment";
  let confidence = Number(parsed.confidence);
  if (!Number.isFinite(confidence)) confidence = 0.7;
  if (confidence > 1) confidence = confidence / 100;
  confidence = Math.min(1, Math.max(0, confidence));
  return { riskLevel, reason, confidence };
}

export async function runHazardScore(input: HazardScoreInput): Promise<HazardScoreResult> {
  const imageUrl = input.imageUrl?.trim() ?? "";
  const useVision = imageUrl.length > 0;
  const visionModel =
    process.env.GROQ_VISION_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct";
  const textModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  const userContent = useVision
    ? [
        {
          type: "text" as const,
          text: `Analyze this road hazard photo. Metadata: ${buildUserText(input)}`,
        },
        { type: "image_url" as const, image_url: { url: imageUrl } },
      ]
    : buildUserText(input);

  const raw = await groqChatCompletion(
    [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: userContent },
    ],
    { model: useVision ? visionModel : textModel }
  );

  return parseScoreJson(raw);
}
