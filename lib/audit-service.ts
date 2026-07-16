import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { AuditAction, HazardStatus } from "./types";

export interface AuditContext {
  adminUid: string;
  adminEmail?: string;
  hazardId: string;
  hazardType?: string;
  reporterName?: string;
  previousStatus?: HazardStatus;
  newStatus?: HazardStatus;
  details?: string;
}

export async function logAuditEntry(
  action: AuditAction,
  context: AuditContext
): Promise<void> {
  try {
    await addDoc(collection(db, "audit_log"), {
      action,
      hazardId: context.hazardId,
      hazardType: context.hazardType ?? null,
      reporterName: context.reporterName ?? null,
      adminUid: context.adminUid,
      adminEmail: context.adminEmail ?? null,
      previousStatus: context.previousStatus ?? null,
      newStatus: context.newStatus ?? null,
      details: context.details ?? null,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Failed to write audit log:", err);
  }
}

export function describeAuditAction(entry: {
  action: AuditAction;
  hazardType?: string;
  reporterName?: string;
  previousStatus?: HazardStatus;
  newStatus?: HazardStatus;
  details?: string;
}): string {
  switch (entry.action) {
    case "status_change":
      return `Changed status from ${entry.previousStatus ?? "—"} to ${entry.newStatus ?? "—"}`;
    case "bulk_status_change":
      return entry.details ?? "Bulk status update";
    case "notes_updated":
      return "Updated admin notes";
    case "hazard_deleted":
      return "Deleted hazard report";
    case "hazard_updated":
      return entry.details ?? "Updated hazard details";
    case "risk_override":
      return entry.details ?? "Overrode hazard priority";
    default:
      return entry.details ?? "Admin action";
  }
}
