import { NextRequest, NextResponse } from "next/server";
import { buildPhotoSystemPrompt, buildPhotoUserPrompt } from "@/lib/ai/prompts";
import { runPhotoAnalysis } from "@/lib/ai/groq-client";
import { isAllowedHazardImageUrl } from "@/lib/server/image-url";
import { aiErrorResponse, requireAdminAi } from "@/lib/server/ai-route";
import {
  isNonEmptyString,
  sanitizePhotoInput,
} from "@/lib/server/validate-ai-input";

export const runtime = "nodejs";

function isValidPhotoInput(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const sanitized = sanitizePhotoInput(body as Record<string, unknown>);
  return (
    isNonEmptyString(sanitized.hazardType, 120) &&
    isNonEmptyString(sanitized.riskLevel, 120) &&
    isNonEmptyString(sanitized.status, 120) &&
    typeof sanitized.latitude === "number" &&
    typeof sanitized.longitude === "number" &&
    isNonEmptyString(sanitized.imageUrl, 2048)
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

  if (!isValidPhotoInput(body)) {
    return NextResponse.json({ error: "Invalid photo analysis payload" }, { status: 400 });
  }

  const payload = sanitizePhotoInput(body as Record<string, unknown>);

  if (!isAllowedHazardImageUrl(payload.imageUrl)) {
    return NextResponse.json(
      { error: "Image URL must be a Cloudinary HTTPS URL." },
      { status: 400 }
    );
  }

  try {
    const result = await runPhotoAnalysis(
      buildPhotoSystemPrompt(),
      buildPhotoUserPrompt(payload),
      payload.imageUrl
    );

    return NextResponse.json({
      ...result,
      model: process.env.GROQ_VISION_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct",
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return aiErrorResponse(err, "analyze-photo");
  }
}
