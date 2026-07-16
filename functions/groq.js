const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_TEXT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const VALID_RISKS = new Set(["Low", "Medium", "High", "Critical"]);

function parseKeys(secretValue) {
  if (!secretValue || !secretValue.trim()) return [];
  return secretValue
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

async function groqChat(apiKeys, messages, model) {
  let lastError = "All Groq API keys failed";

  for (const apiKey of apiKeys) {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 512,
        response_format: { type: "json_object" },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty Groq response");
      return content;
    }

    lastError = `Groq ${res.status}: ${(await res.text()).slice(0, 200)}`;
    if (res.status === 401 || res.status === 403) continue;
    if (res.status === 429) continue;
  }

  throw new Error(lastError);
}

function buildSystemPrompt() {
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

function buildUserText(hazard) {
  return JSON.stringify({
    hazardType: hazard.hazardType || hazard.type || "Other",
    description: hazard.description || hazard.title || "",
    ruleBasedRiskLevel: hazard.ruleBasedRiskLevel || hazard.riskLevel || "Medium",
    location: { latitude: hazard.latitude, longitude: hazard.longitude },
    hasPhoto: Boolean(hazard.imageUrl),
  });
}

function parseScoreJson(raw) {
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  const riskLevel = VALID_RISKS.has(parsed.riskLevel) ? parsed.riskLevel : "Medium";
  const reason = typeof parsed.reason === "string" ? parsed.reason.slice(0, 500) : "AI priority assessment";
  let confidence = Number(parsed.confidence);
  if (!Number.isFinite(confidence)) confidence = 0.7;
  if (confidence > 1) confidence = confidence / 100;
  confidence = Math.min(1, Math.max(0, confidence));
  return { riskLevel, reason, confidence };
}

/**
 * Score a hazard using Groq (text + optional vision).
 * @param {string} groqKeysSecret Comma-separated Groq API keys
 * @param {Record<string, unknown>} hazard Firestore hazard document
 */
async function scoreHazardWithGroq(groqKeysSecret, hazard) {
  const apiKeys = parseKeys(groqKeysSecret);
  if (!apiKeys.length) {
    throw new Error("GROQ_API_KEYS secret is empty");
  }

  const imageUrl = typeof hazard.imageUrl === "string" ? hazard.imageUrl : "";
  const useVision = imageUrl.length > 0;
  const model = useVision ? DEFAULT_VISION_MODEL : DEFAULT_TEXT_MODEL;

  const userContent = useVision
    ? [
        { type: "text", text: `Analyze this road hazard photo. Metadata: ${buildUserText(hazard)}` },
        { type: "image_url", image_url: { url: imageUrl } },
      ]
    : buildUserText(hazard);

  const raw = await groqChat(
    apiKeys,
    [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: userContent },
    ],
    model
  );

  return parseScoreJson(raw);
}

module.exports = { scoreHazardWithGroq, parseKeys };
