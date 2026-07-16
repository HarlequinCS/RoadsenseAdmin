import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { computeUserStats } from "./hazard-utils";
import { normalizeHazard } from "./firestore-helpers";
import { Hazard, HazardStatus } from "./types";

async function fetchHazardsForUser(userId: string): Promise<Hazard[]> {
  const snap = await getDocs(
    query(collection(db, "hazards"), where("userId", "==", userId))
  );
  return snap.docs.map((d) => normalizeHazard(d.id, d.data()));
}

export async function syncUserStats(userId: string): Promise<void> {
  const hazards = await fetchHazardsForUser(userId);
  const stats = computeUserStats(hazards, userId);
  await updateDoc(doc(db, "users", userId), {
    totalReports: stats.totalReports,
    resolvedReports: stats.resolvedReports,
    highRiskReports: stats.highRiskReports,
    contributorBadge: stats.contributorBadge,
  });
}

export async function updateHazardStatus(
  hazardId: string,
  status: HazardStatus,
  adminUid: string
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    statusUpdatedAt: serverTimestamp(),
  };

  if (status === "Resolved") {
    updates.resolvedBy = adminUid;
  }

  await updateDoc(doc(db, "hazards", hazardId), updates);
}

export async function saveAdminNotes(
  hazardId: string,
  adminNotes: string,
  adminUid: string
): Promise<void> {
  await updateDoc(doc(db, "hazards", hazardId), {
    adminNotes,
    adminUpdatedAt: serverTimestamp(),
    adminUpdatedBy: adminUid,
  });
}

export async function deleteHazard(
  hazardId: string,
  reporterUserId: string
): Promise<void> {
  await deleteDoc(doc(db, "hazards", hazardId));
  if (reporterUserId) {
    await syncUserStats(reporterUserId);
  }
}

export async function saveHazardAndSyncStats(
  hazardId: string,
  updates: Record<string, unknown>,
  reporterUserId: string,
  adminUid?: string
): Promise<void> {
  const payload: Record<string, unknown> = { ...updates };

  if (updates.status) {
    payload.statusUpdatedAt = serverTimestamp();
    if (updates.status === "Resolved" && adminUid) {
      payload.resolvedBy = adminUid;
    }
  }

  if (updates.adminNotes !== undefined && adminUid) {
    payload.adminUpdatedAt = serverTimestamp();
    payload.adminUpdatedBy = adminUid;
  }

  await updateDoc(doc(db, "hazards", hazardId), payload);

  if (reporterUserId && updates.status) {
    await syncUserStats(reporterUserId);
  }
}
