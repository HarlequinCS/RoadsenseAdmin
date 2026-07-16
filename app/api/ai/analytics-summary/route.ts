import { NextRequest, NextResponse } from "next/server";
import {
  buildAnalyticsSystemPrompt,
  buildAnalyticsUserPrompt,
} from "@/lib/ai/prompts";
import { runAnalyticsSummary } from "@/lib/ai/groq-client";
import { AnalyticsSummaryInput } from "@/lib/ai/types";
import { aiErrorResponse, requireAdminAi } from "@/lib/server/ai-route";

export const runtime = "nodejs";

function isValidAnalyticsInput(body: unknown): body is AnalyticsSummaryInput {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.totalReports === "number" &&
    typeof b.activeHazards === "number" &&
    Array.isArray(b.byType) &&
    b.byType.length <= 50 &&
    Array.isArray(b.monthlyTrend) &&
    b.monthlyTrend.length <= 24
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

  if (!isValidAnalyticsInput(body)) {
    return NextResponse.json({ error: "Invalid analytics payload" }, { status: 400 });
  }

  try {
    const result = await runAnalyticsSummary(
      buildAnalyticsSystemPrompt(),
      buildAnalyticsUserPrompt(body)
    );

    return NextResponse.json({
      ...result,
      model: process.env.GROQ_MODEL ?? "llama-3.1-8b-instant",
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return aiErrorResponse(err, "analytics-summary");
  }
}
