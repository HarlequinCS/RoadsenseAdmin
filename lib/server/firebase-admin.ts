import { App, cert, getApps, initializeApp, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging, MulticastMessage } from "firebase-admin/messaging";

let adminApp: App | undefined;

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim());
}

export function getFirebaseAdminApp(): App | null {
  if (!isFirebaseAdminConfigured()) return null;

  const existing = getApps()[0];
  if (existing) return existing;

  if (adminApp) return adminApp;

  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON!.trim();
    const serviceAccount = JSON.parse(raw) as ServiceAccount;

    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
    return adminApp;
  } catch (err) {
    console.error("[firebase-admin] init failed:", err);
    return null;
  }
}

export function getAdminFirestore() {
  const app = getFirebaseAdminApp();
  return app ? getFirestore(app) : null;
}

export function getAdminMessaging() {
  const app = getFirebaseAdminApp();
  return app ? getMessaging(app) : null;
}

export async function collectUserFcmTokens(userId: string): Promise<string[]> {
  const db = getAdminFirestore();
  if (!db) return [];

  const snap = await db.collection("users").doc(userId).get();
  if (!snap.exists) return [];

  const data = snap.data() ?? {};
  const tokens = Array.isArray(data.fcmTokens)
    ? (data.fcmTokens as string[])
    : data.fcmToken
      ? [data.fcmToken as string]
      : [];

  return [...new Set(tokens.filter((t) => typeof t === "string" && t.length > 10))];
}

export async function collectAllFcmTokens(): Promise<string[]> {
  const db = getAdminFirestore();
  if (!db) return [];

  const snap = await db.collection("users").get();
  const tokens = new Set<string>();

  for (const doc of snap.docs) {
    const data = doc.data();
    if (Array.isArray(data.fcmTokens)) {
      for (const t of data.fcmTokens as string[]) {
        if (typeof t === "string" && t.length > 10) tokens.add(t);
      }
    } else if (typeof data.fcmToken === "string" && data.fcmToken.length > 10) {
      tokens.add(data.fcmToken);
    }
  }

  return [...tokens];
}

export async function sendFcmMulticast(
  tokens: string[],
  message: Omit<MulticastMessage, "tokens">
): Promise<{ success: number; failure: number }> {
  const messaging = getAdminMessaging();
  if (!messaging || tokens.length === 0) {
    return { success: 0, failure: tokens.length };
  }

  let success = 0;
  let failure = 0;

  // FCM multicast limit is 500 tokens per request
  for (let i = 0; i < tokens.length; i += 500) {
    const chunk = tokens.slice(i, i + 500);
    const res = await messaging.sendEachForMulticast({
      ...message,
      tokens: chunk,
    });
    success += res.successCount;
    failure += res.failureCount;
  }

  return { success, failure };
}
