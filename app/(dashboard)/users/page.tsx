import { Suspense } from "react";
import UsersContent from "./UsersContent";

export default function UsersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-fog-600">Loading users…</p>}>
      <UsersContent />
    </Suspense>
  );
}
