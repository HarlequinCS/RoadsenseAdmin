"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { IconBell, IconSend } from "@tabler/icons-react";

type Target = "user" | "hazard" | "broadcast";

interface PushNotificationPanelProps {
  userId?: string;
  hazardId?: string;
  defaultTitle?: string;
  compact?: boolean;
}

export default function PushNotificationPanel({
  userId,
  hazardId,
  defaultTitle = "RoadSense update",
  compact = false,
}: PushNotificationPanelProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<Target>(hazardId ? "hazard" : userId ? "user" : "broadcast");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const user = auth.currentUser;
    if (!user) return;

    setSending(true);
    setError(null);
    setResult(null);

    try {
      const token = await user.getIdToken();
      const payload: Record<string, unknown> = {
        template: target === "broadcast" ? "broadcast" : "custom",
        title,
        body,
      };

      if (target === "user" && userId) payload.userId = userId;
      if (target === "hazard" && hazardId) payload.hazardId = hazardId;
      if (target === "broadcast") payload.confirm = true;

      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");

      setResult(`Sent to ${data.sent} device${data.sent !== 1 ? "s" : ""} (${data.recipients} tokens)`);
      if (data.sent === 0) setError("No registered push tokens for this target.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={`border border-fog-200 dark:border-asphalt-800 bg-white dark:bg-asphalt-900 rounded-xl text-sm ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <IconBell size={16} className="text-brand-cyan" />
        <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase">
          Push notification
        </p>
      </div>

      {!userId && !hazardId && (
        <p className="text-xs text-fog-500 mb-3">
          Sends to all users with registered FCM device tokens.
        </p>
      )}

      {(userId || hazardId) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {userId && (
            <button
              type="button"
              onClick={() => setTarget("user")}
              className={`text-xs px-2.5 py-1 rounded-md border ${
                target === "user"
                  ? "border-brand-cyan text-brand-cyan bg-brand-cyan-50 dark:bg-brand-cyan/10"
                  : "border-fog-200 dark:border-asphalt-700 text-fog-500"
              }`}
            >
              This user
            </button>
          )}
          {hazardId && (
            <button
              type="button"
              onClick={() => setTarget("hazard")}
              className={`text-xs px-2.5 py-1 rounded-md border ${
                target === "hazard"
                  ? "border-brand-cyan text-brand-cyan bg-brand-cyan-50 dark:bg-brand-cyan/10"
                  : "border-fog-200 dark:border-asphalt-700 text-fog-500"
              }`}
            >
              Reporter + followers
            </button>
          )}
        </div>
      )}

      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notification title"
          className="w-full text-sm rounded-md border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={compact ? 2 : 3}
          placeholder="Message body…"
          className="w-full text-sm rounded-md border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2 resize-none"
        />
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={sending || !body.trim() || !title.trim()}
        className="mt-3 inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-asphalt-950 text-white dark:bg-fog-100 dark:text-asphalt-950 hover:bg-asphalt-800 transition-colors disabled:opacity-50"
      >
        <IconSend size={14} />
        {sending ? "Sending…" : "Send push"}
      </button>

      {result && <p className="text-xs text-signal-teal-600 mt-2">{result}</p>}
      {error && <p className="text-xs text-signal-red-600 mt-2">{error}</p>}

      <p className="text-[10px] text-fog-400 mt-2">
        Requires <code className="text-[9px]">FIREBASE_SERVICE_ACCOUNT_JSON</code> on the server.
      </p>
    </div>
  );
}
