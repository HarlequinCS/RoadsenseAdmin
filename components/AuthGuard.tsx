"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdminUser } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setChecking(false);
        setDenied(false);
        router.replace("/login");
        return;
      }

      const admin = await isAdminUser(u);
      if (!admin) {
        setDenied(true);
        setUser(null);
        setChecking(false);
        router.replace("/login?error=unauthorized");
        return;
      }

      setUser(u);
      setDenied(false);
      setChecking(false);
    });
    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fog-50 dark:bg-asphalt-950">
        <p className="text-sm text-fog-600 dark:text-fog-400">Checking session…</p>
      </div>
    );
  }

  if (!user || denied) return null;

  return <>{children}</>;
}
