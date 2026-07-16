"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdminUser } from "@/lib/auth";
import { IconMapPin, IconAlertCircle } from "@tabler/icons-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("error") === "unauthorized"
      ? "This account does not have admin access."
      : ""
  );
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
      router.push("/dashboard");
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-fog-50 dark:bg-asphalt-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-amber-400/15 flex items-center justify-center">
            <IconMapPin size={20} className="text-amber-500" strokeWidth={2.25} />
          </div>
          <div>
            <p className="font-display font-semibold text-base leading-none text-asphalt-950 dark:text-fog-50">
              RoadSense
            </p>
            <p className="text-[10.5px] text-fog-600 dark:text-fog-400 mt-1 tracking-wide">
              ADMIN DASHBOARD
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-xl p-6"
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
            placeholder="admin@roadsense.app"
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
            className="w-full text-sm font-medium px-3 py-2.5 rounded-lg bg-asphalt-950 text-white dark:bg-fog-100 dark:text-asphalt-950 hover:bg-asphalt-800 dark:hover:bg-white transition-colors disabled:opacity-50"
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
  );
}
