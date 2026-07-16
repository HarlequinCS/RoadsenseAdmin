export interface VerifiedAdmin {
  uid: string;
  email?: string;
}

/**
 * Verifies a Firebase ID token and ensures the user has the admin custom claim.
 * Uses Firebase Identity Toolkit REST API (no service account file required).
 */
export async function verifyAdminRequest(
  authorization: string | null
): Promise<VerifiedAdmin | null> {
  if (!authorization?.startsWith("Bearer ")) return null;

  const idToken = authorization.slice(7).trim();
  if (!idToken) return null;

  if (process.env.AI_SKIP_ADMIN_VERIFY === "true") {
    if (process.env.NODE_ENV === "production") {
      console.error("AI_SKIP_ADMIN_VERIFY is ignored in production");
    } else {
      return { uid: "dev-admin", email: "dev@local" };
    }
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  const user = data.users?.[0];
  if (!user?.localId) return null;

  let claims: Record<string, unknown> = {};
  if (user.customAttributes) {
    try {
      claims = JSON.parse(user.customAttributes);
    } catch {
      claims = {};
    }
  }

  if (claims.admin !== true) return null;

  return {
    uid: user.localId,
    email: user.email,
  };
}

// Simple in-memory rate limit: 30 AI calls per admin per hour
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(uid: string, limit = 30): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(uid);

  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(uid, { count: 1, resetAt: now + 60 * 60_000 });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
