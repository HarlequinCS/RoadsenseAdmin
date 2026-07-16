import {
  collectAllFcmTokens,
  collectUserFcmTokens,
  getAdminFirestore,
  isFirebaseAdminConfigured,
  sendFcmMulticast,
} from "./firebase-admin";

export type NotificationTemplate =
  | "custom"
  | "ai_complete"
  | "status_change"
  | "broadcast";

export interface SendNotificationInput {
  template: NotificationTemplate;
  userId?: string;
  hazardId?: string;
  title?: string;
  body?: string;
  status?: string;
}

export interface SendNotificationResult {
  sent: number;
  failed: number;
  recipients: number;
}

function buildMessage(input: SendNotificationInput): { title: string; body: string; data: Record<string, string> } {
  const data: Record<string, string> = { type: input.template };

  if (input.hazardId) data.hazardId = input.hazardId;

  switch (input.template) {
    case "ai_complete":
      return {
        title: "AI review complete",
        body: input.body || "Your hazard report has been reviewed by AI. Open the app to see the updated priority.",
        data: { ...data, type: "ai_scoring_complete" },
      };
    case "status_change":
      return {
        title: "Hazard status updated",
        body:
          input.body ||
          `A hazard you follow is now: ${input.status || "updated"}. Tap to view details.`,
        data: { ...data, type: "status_change", status: input.status || "" },
      };
    case "broadcast":
      return {
        title: input.title || "RoadSense alert",
        body: input.body || "Important update from RoadSense administrators.",
        data: { ...data, type: "admin_broadcast" },
      };
    default:
      return {
        title: input.title || "RoadSense",
        body: input.body || "",
        data: { ...data, type: "admin_message" },
      };
  }
}

async function tokensForHazard(hazardId: string): Promise<string[]> {
  const db = getAdminFirestore();
  if (!db) return [];

  const hazardSnap = await db.collection("hazards").doc(hazardId).get();
  if (!hazardSnap.exists) return [];

  const hazard = hazardSnap.data() ?? {};
  const userIds = new Set<string>();
  if (typeof hazard.userId === "string") userIds.add(hazard.userId);

  if (Array.isArray(hazard.followers)) {
    for (const uid of hazard.followers as string[]) {
      if (typeof uid === "string") userIds.add(uid);
    }
  }

  const tokens = new Set<string>();
  for (const uid of userIds) {
    for (const t of await collectUserFcmTokens(uid)) tokens.add(t);
  }
  return [...tokens];
}

export async function sendAdminNotification(
  input: SendNotificationInput
): Promise<SendNotificationResult> {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("FCM_NOT_CONFIGURED");
  }

  const { title, body, data } = buildMessage(input);
  let tokens: string[] = [];

  if (input.template === "broadcast") {
    tokens = await collectAllFcmTokens();
  } else if (input.hazardId) {
    tokens = await tokensForHazard(input.hazardId);
  } else if (input.userId) {
    tokens = await collectUserFcmTokens(input.userId);
  }

  if (tokens.length === 0) {
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const { success, failure } = await sendFcmMulticast(tokens, {
    notification: { title, body },
    data,
    android: { priority: "high" },
  });

  return { sent: success, failed: failure, recipients: tokens.length };
}
