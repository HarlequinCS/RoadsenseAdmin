import {
  AnalyticsSummaryResult,
  PhotoAnalysisResult,
  TriageResult,
} from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image_url"; image_url: { url: string } };
type GroqMessageContent = string | Array<TextPart | ImagePart>;

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: GroqMessageContent;
};

class GroqKeyPool {
  private keys: string[];
  private cursor = 0;
  private cooldownUntil = new Map<number, number>();

  constructor(keys: string[]) {
    this.keys = keys.filter((k) => k.length > 0);
  }

  get size() {
    return this.keys.length;
  }

  getNextKey(): string | null {
    if (!this.keys.length) return null;

    const now = Date.now();
    for (let attempt = 0; attempt < this.keys.length; attempt++) {
      const idx = (this.cursor + attempt) % this.keys.length;
      const until = this.cooldownUntil.get(idx) ?? 0;
      if (now >= until) {
        this.cursor = (idx + 1) % this.keys.length;
        return this.keys[idx];
      }
    }

    const key = this.keys[this.cursor];
    this.cursor = (this.cursor + 1) % this.keys.length;
    return key;
  }

  markFailure(key: string, status: number) {
    const idx = this.keys.indexOf(key);
    if (idx < 0) return;

    if (status === 429) {
      this.cooldownUntil.set(idx, Date.now() + 60_000);
    } else if (status === 401 || status === 403) {
      this.cooldownUntil.set(idx, Date.now() + 6 * 60 * 60_000);
    } else if (status >= 500) {
      this.cooldownUntil.set(idx, Date.now() + 30_000);
    }
  }
}

let keyPool: GroqKeyPool | null = null;

export function getGroqKeyPool(): GroqKeyPool {
  if (!keyPool) {
    const fromList = process.env.GROQ_API_KEYS?.split(",").map((k) => k.trim()) ?? [];
    const legacy = [
      process.env.GROQ_API_KEY,
      process.env.GROQ_API_KEY_2,
    ].filter((k): k is string => Boolean(k));
    const keys = fromList.length > 0 ? fromList : legacy;
    keyPool = new GroqKeyPool(keys);
  }
  return keyPool;
}

export function isAiEnabled(): boolean {
  if (process.env.AI_ENABLED === "false") return false;
  return getGroqKeyPool().size > 0;
}

function parsePriority(value: unknown): TriageResult["suggestedPriority"] {
  if (value === "Critical" || value === "High" || value === "Medium" || value === "Low") {
    return value;
  }
  return "Medium";
}

function parseTriageJson(content: string): TriageResult {
  const parsed = JSON.parse(content) as Partial<TriageResult>;
  return {
    summary: String(parsed.summary ?? "Unable to generate summary."),
    suggestedPriority: parsePriority(parsed.suggestedPriority),
    suggestedAction: String(parsed.suggestedAction ?? "Review this report manually."),
    draftNote: String(parsed.draftNote ?? ""),
    reasoning: String(parsed.reasoning ?? ""),
  };
}

function parseAnalyticsJson(content: string): AnalyticsSummaryResult {
  const parsed = JSON.parse(content) as Partial<AnalyticsSummaryResult>;
  return {
    narrative: String(parsed.narrative ?? "Unable to generate summary."),
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights.map(String) : [],
    concerns: Array.isArray(parsed.concerns) ? parsed.concerns.map(String) : [],
    recommendation: String(parsed.recommendation ?? "Continue monitoring hazard trends."),
  };
}

function parsePhotoJson(content: string): PhotoAnalysisResult {
  const parsed = JSON.parse(content) as Partial<PhotoAnalysisResult>;
  return {
    visibleDamage: String(parsed.visibleDamage ?? "Could not assess visible damage."),
    severityAssessment: parsePriority(parsed.severityAssessment),
    matchesReportedType: Boolean(parsed.matchesReportedType),
    matchesReportedRisk: Boolean(parsed.matchesReportedRisk),
    additionalObservations: String(parsed.additionalObservations ?? ""),
    confidenceNote: String(parsed.confidenceNote ?? ""),
  };
}

export async function groqChatCompletion(
  messages: GroqMessage[],
  options?: { model?: string; jsonMode?: boolean }
): Promise<string> {
  const pool = getGroqKeyPool();
  if (!pool.size) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  const model = options?.model ?? process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
  const tried = new Set<string>();
  let lastError = "All Groq API keys failed";

  while (tried.size < pool.size) {
    const apiKey = pool.getNextKey();
    if (!apiKey || tried.has(apiKey)) break;
    tried.add(apiKey);

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 1024,
        ...(options?.jsonMode !== false
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from Groq");
      return content;
    }

    pool.markFailure(apiKey, res.status);
    const errBody = await res.text().catch(() => "");
    lastError = `Groq ${res.status}: ${errBody.slice(0, 200)}`;

    if (res.status === 429 || res.status === 401 || res.status === 403 || res.status >= 500) {
      continue;
    }

    throw new Error(lastError);
  }

  throw new Error(lastError);
}

export async function runTriageAnalysis(
  systemPrompt: string,
  userPrompt: string
): Promise<TriageResult> {
  const content = await groqChatCompletion([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);
  return parseTriageJson(content);
}

export async function runAnalyticsSummary(
  systemPrompt: string,
  userPrompt: string
): Promise<AnalyticsSummaryResult> {
  const content = await groqChatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { model: process.env.GROQ_MODEL ?? "llama-3.1-8b-instant" }
  );
  return parseAnalyticsJson(content);
}

export async function runPhotoAnalysis(
  systemPrompt: string,
  userPrompt: string,
  imageUrl: string
): Promise<PhotoAnalysisResult> {
  const visionModel =
    process.env.GROQ_VISION_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct";

  const content = await groqChatCompletion(
    [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    { model: visionModel }
  );
  return parsePhotoJson(content);
}
