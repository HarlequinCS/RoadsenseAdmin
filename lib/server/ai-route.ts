import { NextRequest, NextResponse } from "next/server";
import { isAiEnabled } from "@/lib/ai/groq-client";
import { checkRateLimit, verifyAdminRequest } from "@/lib/server/verify-admin";

type AiRouteResult =
  | { ok: true; admin: { uid: string; email?: string } }
  | { ok: false; response: NextResponse };

export async function requireAdminAi(req: NextRequest): Promise<AiRouteResult> {
  const admin = await verifyAdminRequest(req.headers.get("authorization"));
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!checkRateLimit(admin.uid)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      ),
    };
  }

  if (!isAiEnabled()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "AI not configured. Set GROQ_API_KEYS in server environment." },
        { status: 503 }
      ),
    };
  }

  return { ok: true, admin };
}

export function aiErrorResponse(err: unknown, label: string): NextResponse {
  const message = err instanceof Error ? err.message : "AI request failed";
  const status = message === "AI_NOT_CONFIGURED" ? 503 : 502;
  console.error(`[ai/${label}]`, message);

  const publicMessage =
    status === 503
      ? "AI service is not configured."
      : "AI request failed. Please try again later.";

  return NextResponse.json({ error: publicMessage }, { status });
}
