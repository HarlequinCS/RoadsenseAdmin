"use client";

import { useEffect, useRef, useCallback } from "react";
import { collection, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { normalizeHazard } from "@/lib/firestore-helpers";
import { isAiScoringPending } from "@/lib/hazard-utils";
import { Hazard } from "@/lib/types";

/**
 * While an admin has the dashboard open, score pending mobile hazards via Groq
 * and write results to Firestore (mobile + admin listeners update in real time).
 */
export default function PendingHazardScorer() {
  const scoringRef = useRef(new Set<string>());
  const hazardsRef = useRef<Hazard[]>([]);

  const processPending = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    const pending = hazardsRef.current.filter((h) => isAiScoringPending(h));
    for (const hazard of pending.slice(0, 3)) {
      if (scoringRef.current.has(hazard.id)) continue;
      scoringRef.current.add(hazard.id);

      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/ai/score-hazard", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hazardType: hazard.hazardType,
            description: hazard.description,
            riskLevel: hazard.riskLevel,
            ruleBasedRiskLevel: hazard.ruleBasedRiskLevel,
            latitude: hazard.latitude,
            longitude: hazard.longitude,
            imageUrl: hazard.imageUrl,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Score failed (${res.status})`);
        }

        const score = await res.json();
        await updateDoc(doc(db, "hazards", hazard.id), {
          riskLevel: score.riskLevel,
          aiRiskLevel: score.riskLevel,
          aiReason: score.reason,
          aiConfidence: score.confidence,
          riskSource: "ai",
          aiScoringStatus: "complete",
          aiScoredAt: serverTimestamp(),
        });

        fetch("/api/notifications/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            template: "ai_complete",
            hazardId: hazard.id,
            body: `Your ${hazard.hazardType} report is now rated ${score.riskLevel}.`,
          }),
        }).catch(() => {});
      } catch (err) {
        console.error("[PendingHazardScorer]", hazard.id, err);
        const fallback = hazard.ruleBasedRiskLevel || hazard.riskLevel || "Medium";
        await updateDoc(doc(db, "hazards", hazard.id), {
          aiScoringStatus: "failed",
          aiReason: err instanceof Error ? err.message.slice(0, 300) : "Groq scoring failed",
          riskLevel: fallback,
          riskSource: hazard.riskSource || "rules",
        }).catch(() => {});
      } finally {
        scoringRef.current.delete(hazard.id);
      }
    }
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, () => {
      void processPending();
    });
    const unsub = onSnapshot(collection(db, "hazards"), (snap) => {
      hazardsRef.current = snap.docs.map((d) => normalizeHazard(d.id, d.data()));
      void processPending();
    });
    return () => {
      unsubAuth();
      unsub();
    };
  }, [processPending]);

  return null;
}
