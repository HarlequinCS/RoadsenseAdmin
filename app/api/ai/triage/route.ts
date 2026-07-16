import { NextRequest, NextResponse } from "next/server";
import { buildTriageSystemPrompt, buildTriageUserPrompt } from "@/lib/ai/prompts";
import { runTriageAnalysis } from "@/lib/ai/groq-client";
import { aiErrorResponse, requireAdminAi } from "@/lib/server/ai-route";
import {
  isNonEmptyString,
  sanitizeTriageInput,
} from "@/lib/server/validate-ai-input";

export const runtime = "nodejs";

function isValidTriageInput(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const sanitized = sanitizeTriageInput(body as Record<string, unknown>);
  return (
    isNonEmptyString(sanitized.id, 120) &&
    isNonEmptyString(sanitized.hazardType, 120) &&
    isNonEmptyString(sanitized.riskLevel, 120) &&
    isNonEmptyString(sanitized.status, 120) &&
    isNonEmptyString(sanitized.reporterName, 500) &&
    typeof sanitized.latitude === "number" &&
    typeof sanitized.longitude === "number"
  );
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAi(req);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidTriageInput(body)) {
    return NextResponse.json({ error: "Invalid hazard payload" }, { status: 400 });
  }

  const payload = sanitizeTriageInput(body as Record<string, unknown>);

  try {
    const result = await runTriageAnalysis(
      buildTriageSystemPrompt(),
      buildTriageUserPrompt(payload)
    );

    return NextResponse.json({
      ...result,
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return aiErrorResponse(err, "triage");
  }
}
