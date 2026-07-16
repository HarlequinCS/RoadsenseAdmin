import { Suspense } from "react";
import LoginForm from "./LoginForm";

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
