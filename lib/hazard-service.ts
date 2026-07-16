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
import { logAuditEntry, AuditContext } from "./audit-service";
import { computeUserStats } from "./hazard-utils";
import { normalizeHazard } from "./firestore-helpers";
import { Hazard, HazardStatus, RiskLevel } from "./types";

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
  adminUid: string,
  audit?: AuditContext
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    statusUpdatedAt: serverTimestamp(),
    adminUpdatedAt: serverTimestamp(),
    adminUpdatedBy: adminUid,
  };

  if (status === "Resolved") {
    updates.resolvedBy = adminUid;
  }

  await updateDoc(doc(db, "hazards", hazardId), updates);

  if (audit) {
    await logAuditEntry("status_change", {
      ...audit,
      adminUid,
      hazardId,
      newStatus: status,
    });
  }
}

export async function saveAdminNotes(
  hazardId: string,
  adminNotes: string,
  adminUid: string,
  audit?: AuditContext
): Promise<void> {
  await updateDoc(doc(db, "hazards", hazardId), {
    adminNotes,
    adminUpdatedAt: serverTimestamp(),
    adminUpdatedBy: adminUid,
  });

  if (audit) {
    await logAuditEntry("notes_updated", { ...audit, adminUid, hazardId });
  }
}

export async function deleteHazard(
  hazardId: string,
  reporterUserId: string,
  audit?: AuditContext
): Promise<void> {
  if (audit) {
    await logAuditEntry("hazard_deleted", { ...audit, adminUid: audit.adminUid, hazardId });
  }

  await deleteDoc(doc(db, "hazards", hazardId));
  if (reporterUserId) {
    await syncUserStats(reporterUserId);
  }
}

export async function logBulkStatusChange(
  adminUid: string,
  count: number,
  newStatus: HazardStatus,
  audit?: Omit<AuditContext, "adminUid" | "hazardId" | "newStatus">
): Promise<void> {
  await logAuditEntry("bulk_status_change", {
    adminUid,
    hazardId: "bulk",
    newStatus,
    details: `Marked ${count} report(s) as ${newStatus}`,
    ...audit,
  });
}

export async function updateHazardRiskLevel(
  hazardId: string,
  riskLevel: RiskLevel,
  adminUid: string,
  reporterUserId: string,
  audit?: AuditContext
): Promise<void> {
  await updateDoc(doc(db, "hazards", hazardId), {
    riskLevel,
    riskSource: "admin",
    aiScoringStatus: "complete",
    adminUpdatedAt: serverTimestamp(),
    adminUpdatedBy: adminUid,
  });

  if (audit) {
    await logAuditEntry("risk_override", {
      ...audit,
      adminUid,
      hazardId,
      details: `Admin set priority to ${riskLevel}`,
    });
  }

  if (reporterUserId) {
    await syncUserStats(reporterUserId);
  }
}

export async function saveHazardAndSyncStats(
  hazardId: string,
  updates: Record<string, unknown>,
  reporterUserId: string,
  adminUid?: string,
  audit?: AuditContext
): Promise<void> {
  const payload: Record<string, unknown> = { ...updates };

  if (updates.status) {
    payload.statusUpdatedAt = serverTimestamp();
    if (adminUid) {
      payload.adminUpdatedAt = serverTimestamp();
      payload.adminUpdatedBy = adminUid;
    }
    if (updates.status === "Resolved" && adminUid) {
      payload.resolvedBy = adminUid;
    }
  }

  if (updates.adminNotes !== undefined && adminUid) {
    payload.adminUpdatedAt = serverTimestamp();
    payload.adminUpdatedBy = adminUid;
  }

  await updateDoc(doc(db, "hazards", hazardId), payload);

  if (adminUid && audit && updates.status) {
    await logAuditEntry("hazard_updated", {
      ...audit,
      adminUid,
      hazardId,
      newStatus: updates.status as HazardStatus,
      details: `Updated hazard to ${String(updates.status)}`,
    });
  }

  if (reporterUserId && updates.status) {
    await syncUserStats(reporterUserId);
  }
}
