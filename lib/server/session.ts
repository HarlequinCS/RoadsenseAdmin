import { cookies } from "next/headers";
import { verifyAdminRequest } from "@/lib/server/verify-admin";

export const SESSION_COOKIE = "roadsense_admin_session";
const SESSION_MAX_AGE = 60 * 60; // 1 hour — matches Firebase ID token lifetime

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function getSessionAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminRequest(`Bearer ${token}`);
}
