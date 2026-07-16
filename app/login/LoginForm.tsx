"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdminUser } from "@/lib/auth";
import Logo from "@/components/Logo";
import PublicNav from "@/components/public/PublicNav";
import { TAGLINE } from "@/lib/public-site";
import { IconAlertCircle } from "@tabler/icons-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => {
    const code = searchParams.get("error");
    if (code === "unauthorized") {
      return "This account does not have admin access.";
    }
    if (code === "session_expired") {
      return "Your session expired. Please sign in again.";
    }
    return "";
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const admin = await isAdminUser(credential.user);
      if (!admin) {
        await signOut(auth);
        setError("This account does not have admin access. Contact the team to set the admin custom claim.");
        return;
      }
      const token = await credential.user.getIdToken();
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!sessionRes.ok) {
        await signOut(auth);
        setError("Could not start admin session. Please try again.");
        return;
      }

      const next = searchParams.get("next") || "/dashboard";
      router.push(next);
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col hero-gradient bg-fog-50 dark:bg-asphalt-950">
      <PublicNav />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8 text-center">
            <Logo
              size="xl"
              layout="stacked"
              align="center"
              subtitle="Admin Dashboard"
            />
            <p className="mt-3 text-xs text-fog-600 dark:text-fog-400 max-w-xs">{TAGLINE}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white/90 dark:bg-asphalt-900/90 backdrop-blur-sm border border-fog-200 dark:border-asphalt-800 rounded-2xl p-6 shadow-sm"
          >
            <h1 className="font-display font-semibold text-lg text-asphalt-950 dark:text-fog-50 mb-1">
              Sign in
            </h1>
            <p className="text-xs text-fog-600 dark:text-fog-400 mb-5">
              Use your administrator account with the <code className="text-[10px]">admin</code> custom claim.
            </p>

            {error && (
              <div className="flex items-center gap-2 text-xs text-signal-red-600 dark:text-signal-red-100 bg-signal-red-50 dark:bg-signal-red-600/15 rounded-lg px-3 py-2 mb-4">
                <IconAlertCircle size={14} />
                {error}
              </div>
            )}

            <label className="block text-xs font-medium text-fog-600 dark:text-fog-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm rounded-lg border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-800 px-3 py-2 mb-4"
              placeholder="admin@roadsense.com"
            />

            <label className="block text-xs font-medium text-fog-600 dark:text-fog-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm rounded-lg border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-800 px-3 py-2 mb-5"
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full text-sm font-medium px-3 py-2.5 rounded-lg bg-brand-orange text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-fog-500">
            <Link href="/" className="hover:text-asphalt-950 dark:hover:text-fog-100 transition-colors">
              ← Back to home
            </Link>
            <span>·</span>
            <Link href="/about" className="hover:text-asphalt-950 dark:hover:text-fog-100 transition-colors">
              About
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
