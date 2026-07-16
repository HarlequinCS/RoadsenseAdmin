"use client";

import { useEffect, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeHazard } from "@/lib/firestore-helpers";
import {
  areCriticalAlertsEnabled,
  shouldAlertForHazard,
  showCriticalHazardNotification,
} from "@/lib/notifications";

export default function CriticalAlertWatcher() {
  const knownIds = useRef<Set<string>>(new Set());
  const ready = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "hazards"), (snap) => {
      const hazards = snap.docs.map((d) => normalizeHazard(d.id, d.data()));

      if (!ready.current) {
        hazards.forEach((h) => knownIds.current.add(h.id));
        ready.current = true;
        return;
      }

      if (!areCriticalAlertsEnabled()) return;

      for (const hazard of hazards) {
        if (knownIds.current.has(hazard.id)) continue;
        knownIds.current.add(hazard.id);
        if (shouldAlertForHazard(hazard)) {
          showCriticalHazardNotification(hazard);
        }
      }
    });

    return () => unsub();
  }, []);

  return null;
}
