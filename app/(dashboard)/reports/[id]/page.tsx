"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { Hazard, HazardStatus, HazardType, HAZARD_STATUSES, HAZARD_TYPES, AppUser } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/style-helpers";
import { normalizeHazard, normalizeUser } from "@/lib/firestore-helpers";
import { findPotentialDuplicates } from "@/lib/hazard-utils";
import { saveHazardAndSyncStats, deleteHazard, saveAdminNotes } from "@/lib/hazard-service";
import { getCloudinaryThumbnail } from "@/lib/cloudinary";
import StatusBadge from "@/components/StatusBadge";
import RiskBadge from "@/components/RiskBadge";
import ContributorBadgePill from "@/components/ContributorBadge";
import {
  IconPrinter, IconDownload, IconArrowLeft, IconTrash, IconAlertTriangle,
} from "@tabler/icons-react";

function useReverseGeocode(lat: number | undefined, lng: number | undefined) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof lat !== "number" || typeof lng !== "number") return;
    let cancelled = false;
    setLoading(true);
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setAddress(data?.display_name || null); })
      .catch(() => { if (!cancelled) setAddress(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lat, lng]);

  return { address, loading };
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Hazard | null>(null);
  const [reporter, setReporter] = useState<AppUser | null>(null);
  const [duplicates, setDuplicates] = useState<Hazard[]>([]);
  const [status, setStatus] = useState<HazardStatus>("New");
  const [hazardType, setHazardType] = useState<HazardType>("Pothole");
  const [description, setDescription] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);

  const { address, loading: geocoding } = useReverseGeocode(report?.latitude, report?.longitude);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setAdminUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "hazards", id));
      if (snap.exists()) {
        const data = normalizeHazard(snap.id, snap.data());
        setReport(data);
        setStatus(data.status);
        setHazardType(data.hazardType as HazardType);
        setDescription(data.description);
        setAdminNotes(data.adminNotes || "");

        if (data.userId) {
          const userSnap = await getDoc(doc(db, "users", data.userId));
          if (userSnap.exists()) {
            setReporter(normalizeUser(userSnap.id, userSnap.data()));
          }
        }
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    async function loadDuplicates() {
      if (!report) return;
      const { collection: col, getDocs } = await import("firebase/firestore");
      const snap = await getDocs(col(db, "hazards"));
      const hazards = snap.docs.map((d) => normalizeHazard(d.id, d.data()));
      setDuplicates(findPotentialDuplicates(hazards, report));
    }
    loadDuplicates();
  }, [report]);

  async function handleSave() {
    if (!report || !adminUser) return;
    setSaving(true);
    await saveHazardAndSyncStats(
      id,
      { status, hazardType, description },
      report.userId,
      adminUser.uid
    );
    if (adminNotes !== (report.adminNotes || "")) {
      await saveAdminNotes(id, adminNotes, adminUser.uid);
    }
    setReport({ ...report, status, hazardType, description, adminNotes });
    setSaving(false);
    setEditing(false);
  }

  async function handleDelete() {
    if (!report || !confirm("Delete this hazard report permanently?")) return;
    await deleteHazard(id, report.userId);
    router.push("/reports");
  }

  function handleCancel() {
    if (!report) return;
    setHazardType(report.hazardType as HazardType);
    setDescription(report.description);
    setAdminNotes(report.adminNotes || "");
    setEditing(false);
  }

  function handleDownload() {
    if (!report) return;
    const lines = [
      `RoadSense Hazard Report`,
      `========================`,
      `Report ID: ${report.id}`,
      `Reporter: ${report.reporterName}`,
      `Hazard Type: ${report.hazardType}`,
      `Risk Level: ${report.riskLevel}`,
      `Description: ${report.description}`,
      `Location: ${address || "—"}`,
      `Coordinates: ${report.latitude}, ${report.longitude}`,
      `Status: ${report.status}`,
      `Verifications: ${report.verificationCount}`,
      `Date submitted: ${formatDate(report.createdAt)}`,
      `Admin notes: ${report.adminNotes || "—"}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `roadsense-report-${report.id.slice(0, 8)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!report) return <p className="text-sm text-fog-600 dark:text-fog-400">Loading report…</p>;

  const thumbUrl = report.imageUrl ? getCloudinaryThumbnail(report.imageUrl) : "";

  return (
    <div className="max-w-2xl">
      <Link
        href="/reports"
        className="no-print inline-flex items-center gap-1.5 text-xs text-fog-600 dark:text-fog-400 hover:text-asphalt-950 dark:hover:text-fog-100 transition-colors mb-4"
      >
        <IconArrowLeft size={14} />
        Back to reports
      </Link>

      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-1.5">
            Report detail
          </p>
          <h1 className="font-display font-semibold text-[22px] text-asphalt-950 dark:text-fog-50 tracking-tight">
            #{report.id.slice(0, 8)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={report.status} />
          <RiskBadge risk={report.riskLevel} />
          <div className="no-print flex items-center gap-1.5">
            <button onClick={() => window.print()} aria-label="Print" className="p-1.5 rounded-md border border-fog-200 dark:border-asphalt-700 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors">
              <IconPrinter size={15} />
            </button>
            <button onClick={handleDownload} aria-label="Download" className="p-1.5 rounded-md border border-fog-200 dark:border-asphalt-700 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors">
              <IconDownload size={15} />
            </button>
            <button onClick={handleDelete} aria-label="Delete" className="p-1.5 rounded-md border border-fog-200 dark:border-asphalt-700 hover:bg-signal-red-50 dark:hover:bg-signal-red-600/15 text-signal-red-500 transition-colors">
              <IconTrash size={15} />
            </button>
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-xs px-3 py-1.5 rounded-md border border-fog-200 dark:border-asphalt-700 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors">
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {duplicates.length > 0 && (
        <div className="no-print mb-4 flex items-start gap-2 text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2.5 text-amber-700 dark:text-amber-400">
          <IconAlertTriangle size={14} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Potential duplicates nearby (within 100 m)</p>
            <p className="mt-1 text-[11px]">
              {duplicates.map((d) => (
                <Link key={d.id} href={`/reports/${d.id}`} className="underline mr-2">
                  #{d.id.slice(0, 6)} ({d.status})
                </Link>
              ))}
            </p>
          </div>
        </div>
      )}

      <div className="lane-divider w-full my-4" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-fog-200 dark:border-asphalt-800 bg-white dark:bg-asphalt-900 rounded-xl p-5 space-y-4 text-sm">
          <Field label="Reporter" value={report.reporterName} />

          {editing ? (
            <div>
              <p className="text-fog-600 dark:text-fog-400 mb-1.5">Hazard type</p>
              <select value={hazardType} onChange={(e) => setHazardType(e.target.value as HazardType)} className="w-full text-sm rounded-md border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2">
                {HAZARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          ) : (
            <Field label="Hazard type" value={report.hazardType} />
          )}

          {editing ? (
            <div>
              <p className="text-fog-600 dark:text-fog-400 mb-1.5">Description</p>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full text-sm rounded-md border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2 resize-none" />
            </div>
          ) : (
            <Field label="Description" value={report.description} />
          )}

          <div>
            <p className="text-fog-600 dark:text-fog-400 mb-0.5">Location</p>
            {geocoding ? (
              <div className="h-4 w-3/4 bg-fog-100 dark:bg-asphalt-800 rounded animate-pulse" />
            ) : (
              <p className="text-asphalt-950 dark:text-fog-100">{address || "Unable to resolve location"}</p>
            )}
          </div>

          <Field label="Coordinates" value={`${report.latitude}, ${report.longitude}`} mono />
          <Field label="Risk level" value={report.riskLevel} />
          <Field label="Community verifications" value={`${report.verificationCount} confirmation${report.verificationCount !== 1 ? "s" : ""}`} />
          <Field label="Date submitted" value={formatDateTime(report.createdAt)} />
          {report.statusUpdatedAt && <Field label="Status updated" value={formatDateTime(report.statusUpdatedAt)} />}
          {report.resolvedBy && <Field label="Resolved by" value={report.resolvedBy.slice(0, 12) + "…"} mono />}

          {report.imageUrl && (
            <div>
              <p className="text-fog-600 dark:text-fog-400 mb-1.5">Photo</p>
              <a href={report.imageUrl} target="_blank" rel="noopener noreferrer">
                <img src={thumbUrl || report.imageUrl} alt="Hazard evidence" className="rounded-md border border-fog-200 dark:border-asphalt-700 max-h-64 object-cover" />
              </a>
            </div>
          )}

          <div className="no-print">
            <p className="text-fog-600 dark:text-fog-400 mb-1.5">Admin notes</p>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
              placeholder="Internal notes (not visible in mobile app)…"
              className="w-full text-sm rounded-md border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2 resize-none"
            />
          </div>

          <div className="no-print">
            <p className="text-fog-600 dark:text-fog-400 mb-1.5">Status</p>
            <div className="flex items-center gap-3 flex-wrap">
              <select value={status} onChange={(e) => setStatus(e.target.value as HazardStatus)} className="text-sm rounded-md border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2">
                {HAZARD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleSave} disabled={saving} className="text-sm px-3 py-2 rounded-md bg-asphalt-950 text-white dark:bg-fog-100 dark:text-asphalt-950 hover:bg-asphalt-800 transition-colors disabled:opacity-50">
                {saving ? "Saving…" : "Save changes"}
              </button>
              {editing && (
                <button onClick={handleCancel} className="text-sm px-3 py-2 rounded-md border border-fog-200 dark:border-asphalt-700 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors">
                  Cancel edit
                </button>
              )}
            </div>
            {status === "Under Investigation" && (
              <p className="text-[11px] text-fog-400 mt-2">Only admins can set this status — the mobile app never writes it.</p>
            )}
          </div>
        </div>

        {reporter && (
          <div className="border border-fog-200 dark:border-asphalt-800 bg-white dark:bg-asphalt-900 rounded-xl p-5 text-sm h-fit">
            <p className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mb-3">Reporter profile</p>
            <div className="flex items-center gap-3 mb-4">
              {reporter.photoUrl ? (
                <img src={reporter.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-signal-blue-50 dark:bg-signal-blue-600/25 flex items-center justify-center text-sm font-medium text-signal-blue-600">
                  {reporter.fullName?.charAt(0) || "?"}
                </div>
              )}
              <div>
                <p className="font-medium text-asphalt-950 dark:text-fog-100">{reporter.fullName}</p>
                <p className="text-xs text-fog-400">{reporter.email}</p>
              </div>
            </div>
            {reporter.contributorBadge && (
              <div className="mb-3">
                <ContributorBadgePill badge={reporter.contributorBadge} />
              </div>
            )}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-fog-400">Active reports</span><span>{reporter.totalReports}</span></div>
              <div className="flex justify-between"><span className="text-fog-400">Resolved</span><span>{reporter.resolvedReports}</span></div>
              <div className="flex justify-between"><span className="text-fog-400">Verified others</span><span>{reporter.verifiedReports ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-fog-400">High-risk active</span><span>{reporter.highRiskReports ?? 0}</span></div>
              {reporter.birthday && <div className="flex justify-between"><span className="text-fog-400">Birthday</span><span>{reporter.birthday}</span></div>}
              {reporter.gender && <div className="flex justify-between"><span className="text-fog-400">Gender</span><span>{reporter.gender}</span></div>}
            </div>
            <Link
              href={`/users?uid=${reporter.uid}`}
              className="no-print mt-4 inline-block text-xs text-amber-600 dark:text-amber-400 hover:underline"
            >
              View all reports by this user →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-fog-600 dark:text-fog-400 mb-0.5">{label}</p>
      <p className={`text-asphalt-950 dark:text-fog-100 ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}
