import { NextRequest, NextResponse } from "next/server";
import { sendAdminNotification, SendNotificationInput } from "@/lib/server/fcm";
import { verifyAdminRequest } from "@/lib/server/verify-admin";

export async function POST(req: NextRequest) {
  const admin = await verifyAdminRequest(req.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const template = (body.template as SendNotificationInput["template"]) || "custom";

    if (!["custom", "ai_complete", "status_change", "broadcast"].includes(template)) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 });
    }

    if (template === "broadcast" && body.confirm !== true) {
      return NextResponse.json(
        { error: "Broadcast requires confirm: true" },
        { status: 400 }
      );
    }

    const title = typeof body.title === "string" ? body.title.slice(0, 120) : undefined;
    const message = typeof body.body === "string" ? body.body.slice(0, 500) : undefined;

    if (template === "custom" && (!title || !message)) {
      return NextResponse.json({ error: "title and body required for custom messages" }, { status: 400 });
    }

    if ((template === "ai_complete" || template === "status_change") && !body.hazardId) {
      return NextResponse.json({ error: "hazardId required" }, { status: 400 });
    }

    if (template === "custom" && !body.userId && !body.hazardId) {
      return NextResponse.json({ error: "userId or hazardId required" }, { status: 400 });
    }

    const result = await sendAdminNotification({
      template,
      userId: typeof body.userId === "string" ? body.userId : undefined,
      hazardId: typeof body.hazardId === "string" ? body.hazardId : undefined,
      title,
      body: message,
      status: typeof body.status === "string" ? body.status.slice(0, 80) : undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Send failed";
    if (msg === "FCM_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "FCM not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON in server environment (Firebase Console → Service accounts → Generate key).",
        },
        { status: 503 }
      );
    }
    console.error("[notifications/send]", msg);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 502 });
  }
}
