const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { scoreHazardWithGroq } = require("./groq");

initializeApp();

const groqApiKeys = defineSecret("GROQ_API_KEYS");

async function collectTokens(db, userId, followers = []) {
  const tokens = new Set();
  const ids = new Set([userId, ...followers].filter(Boolean));

  for (const uid of ids) {
    const snap = await db.collection("users").doc(uid).get();
    if (!snap.exists) continue;
    const data = snap.data() || {};
    if (Array.isArray(data.fcmTokens)) {
      data.fcmTokens.forEach((t) => {
        if (typeof t === "string" && t.length > 10) tokens.add(t);
      });
    } else if (typeof data.fcmToken === "string" && data.fcmToken.length > 10) {
      tokens.add(data.fcmToken);
    }
  }

  return [...tokens];
}

async function notifyAiComplete(db, hazardId, hazard, riskLevel) {
  const tokens = await collectTokens(db, hazard.userId, hazard.followers || []);
  if (!tokens.length) return;

  const messaging = getMessaging();
  await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: "AI review complete",
      body: `Your ${hazard.hazardType || "hazard"} report is now rated ${riskLevel}.`,
    },
    data: {
      type: "ai_scoring_complete",
      hazardId,
      riskLevel,
    },
    android: { priority: "high" },
  });
}

/**
 * Scores hazard priority when mobile app creates a report.
 * Uses Groq (not Gemini). Keys: firebase functions:secrets:set GROQ_API_KEYS
 */
exports.scoreHazardRisk = onDocumentCreated(
  {
    document: "hazards/{hazardId}",
    region: "asia-southeast1",
    secrets: [groqApiKeys],
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const hazardId = event.params.hazardId;
    const hazard = snap.data();
    const db = getFirestore();
    const ref = db.collection("hazards").doc(hazardId);

    if (hazard.aiScoringStatus && hazard.aiScoringStatus !== "pending") {
      return;
    }

    const fallbackRisk = hazard.ruleBasedRiskLevel || hazard.riskLevel || "Medium";

    try {
      const score = await scoreHazardWithGroq(groqApiKeys.value(), hazard);

      await ref.update({
        riskLevel: score.riskLevel,
        aiRiskLevel: score.riskLevel,
        aiReason: score.reason,
        aiConfidence: score.confidence,
        riskSource: "ai",
        aiScoringStatus: "complete",
        aiScoredAt: FieldValue.serverTimestamp(),
      });

      try {
        await notifyAiComplete(db, hazardId, hazard, score.riskLevel);
      } catch (notifyErr) {
        console.warn(`scoreHazardRisk notify ${hazardId}:`, notifyErr);
      }

      console.log(`scoreHazardRisk OK ${hazardId} → ${score.riskLevel}`);
    } catch (err) {
      console.error(`scoreHazardRisk FAILED ${hazardId}:`, err);

      await ref.update({
        aiScoringStatus: "failed",
        aiReason: err instanceof Error ? err.message.slice(0, 300) : "Groq scoring failed",
        riskLevel: fallbackRisk,
        riskSource: hazard.riskSource || "rules",
      });
    }
  }
);
