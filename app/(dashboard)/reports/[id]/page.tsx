"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Hazard, HazardStatus, HazardType } from "@/lib/types";
import { formatDate } from "@/lib/style-helpers";
import StatusBadge from "@/components/StatusBadge";
import { IconPrinter, IconDownload, IconArrowLeft } from "@tabler/icons-react";

const STATUS_OPTIONS: HazardStatus[] = ["New", "Under Investigation", "Resolved"];
const HAZARD_TYPE_OPTIONS: HazardType[] = [
  "Pothole", "Flood", "Traffic Accident", "Fallen Tree", "Damaged Road Sign", "Broken Traffic Light",
];

function useReverseGeocode(lat: number | undefined, lng: number | undefined) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof lat !== "number" || typeof lng !== "number") return;
    let cancelled = false;
    setLoading(true);
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setAddress(data?.display_name || null);
      })
      .catch(() => {
        if (!cancelled) setAddress(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [lat, lng]);

  return { address, loading };
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Hazard | null>(null);
  const [status, setStatus] = useState<HazardStatus>("New");
  const [hazardType, setHazardType] = useState<HazardType>("Pothole");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { address, loading: geocoding } = useReverseGeocode(report?.latitude, report?.longitude);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "hazards", id));
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Hazard;
        setReport(data);
        setStatus(data.status);
        setHazardType(data.hazardType);
        setDescription(data.description);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await updateDoc(doc(db, "hazards", id), {
      status,
      hazardType,
      description,
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    if (!report) return;
    setHazardType(report.hazardType);
    setDescription(report.description);
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
      `Description: ${report.description}`,
      `Location: ${address || "—"}`,
      `Coordinates: ${report.latitude}, ${report.longitude}`,
      `Status: ${report.status}`,
      `Date submitted: ${formatDate(report.createdAt)}`,
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

  return (
    <div className="max-w-xl">
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
            #{report.id.slice(0, 6)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={report.status} />
          <div className="no-print flex items-center gap-1.5">
            <button
              onClick={() => window.print()}
              aria-label="Print report"
              className="p-1.5 rounded-md border border-fog-200 dark:border-asphalt-700 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors text-asphalt-700 dark:text-fog-200"
            >
              <IconPrinter size={15} />
            </button>
            <button
              onClick={handleDownload}
              aria-label="Download report"
              className="p-1.5 rounded-md border border-fog-200 dark:border-asphalt-700 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors text-asphalt-700 dark:text-fog-200"
            >
              <IconDownload size={15} />
            </button>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs px-3 py-1.5 rounded-md border border-fog-200 dark:border-asphalt-700 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors text-asphalt-700 dark:text-fog-200"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="lane-divider w-full my-4" />

      <div className="border border-fog-200 dark:border-asphalt-800 bg-white dark:bg-asphalt-900 rounded-xl p-5 space-y-4 text-sm">
        <Field label="Reporter" value={report.reporterName} />

        {editing ? (
          <div>
            <p className="text-fog-600 dark:text-fog-400 mb-1.5">Hazard type</p>
            <select
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value as HazardType)}
              className="w-full text-sm rounded-md border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2"
            >
              {HAZARD_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        ) : (
          <Field label="Hazard type" value={report.hazardType} />
        )}

        {editing ? (
          <div>
            <p className="text-fog-600 dark:text-fog-400 mb-1.5">Description</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full text-sm rounded-md border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2 resize-none"
            />
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
        <Field label="Date submitted" value={formatDate(report.createdAt)} />

        {report.imageUrl && (
          <div>
            <p className="text-fog-600 dark:text-fog-400 mb-1.5">Photo</p>
            <img src={report.imageUrl} alt="Hazard evidence" className="rounded-md border border-fog-200 dark:border-asphalt-700 max-h-64 object-cover" />
          </div>
        )}

        <div className="no-print">
          <p className="text-fog-600 dark:text-fog-400 mb-1.5">Status</p>
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as HazardStatus)}
              className="text-sm rounded-md border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900 px-2.5 py-2"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm px-3 py-2 rounded-md bg-asphalt-950 text-white dark:bg-fog-100 dark:text-asphalt-950 hover:bg-asphalt-800 dark:hover:bg-white transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {editing && (
              <button
                onClick={handleCancel}
                className="text-sm px-3 py-2 rounded-md border border-fog-200 dark:border-asphalt-700 text-asphalt-700 dark:text-fog-200 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
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