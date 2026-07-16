import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Admin sign in",
  description: "Sign in to the RoadSense admin dashboard to review and investigate hazard reports.",
  path: "/login",
  index: false,
});

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-fog-50 dark:bg-asphalt-950">
          <p className="text-sm text-fog-600 dark:text-fog-400">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
