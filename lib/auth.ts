import { User } from "firebase/auth";

const SKIP_ADMIN_CHECK =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_SKIP_ADMIN_CHECK === "true";

export async function isAdminUser(user: User | null): Promise<boolean> {
  if (!user) return false;
  if (SKIP_ADMIN_CHECK) return true;
  try {
    const token = await user.getIdTokenResult();
    return token.claims.admin === true;
  } catch {
    return false;
  }
}

export async function getAdminDisplayName(user: User): Promise<string> {
  return user.displayName || user.email?.split("@")[0] || "Admin";
}
