import { NextRequest, NextResponse } from "next/server";
import { runHazardScore } from "@/lib/ai/score-hazard";
import { aiErrorResponse, requireAdminAi } from "@/lib/server/ai-route";
import { isAllowedHazardImageUrl } from "@/lib/server/image-url";

export async function POST(req: NextRequest) {
  const auth = await requireAdminAi(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const hazardType = typeof body.hazardType === "string" ? body.hazardType.slice(0, 120) : "";
    if (!hazardType) {
      return NextResponse.json({ error: "hazardType is required" }, { status: 400 });
    }

    let imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    if (imageUrl && !isAllowedHazardImageUrl(imageUrl)) {
      imageUrl = "";
    }

    const score = await runHazardScore({
      hazardType,
      description:
        typeof body.description === "string" ? body.description.slice(0, 2000) : "",
      riskLevel: typeof body.riskLevel === "string" ? body.riskLevel.slice(0, 40) : undefined,
      ruleBasedRiskLevel:
        typeof body.ruleBasedRiskLevel === "string"
          ? body.ruleBasedRiskLevel.slice(0, 40)
          : undefined,
      latitude: typeof body.latitude === "number" ? body.latitude : undefined,
      longitude: typeof body.longitude === "number" ? body.longitude : undefined,
      imageUrl: imageUrl || undefined,
    });

    return NextResponse.json(score);
  } catch (err) {
    return aiErrorResponse(err, "score-hazard");
  }
}
