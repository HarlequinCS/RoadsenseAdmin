import { Hazard } from "./types";
import { formatDate } from "./style-helpers";

function escapeCsvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function downloadTextFile(content: string, filename: string, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportHazardsCSV(reports: Hazard[], filenamePrefix = "roadsense-reports") {
  const headers = [
    "Report ID",
    "Reporter",
    "Hazard Type",
    "Risk",
    "Description",
    "Latitude",
    "Longitude",
    "Date",
    "Status",
    "Verifications",
  ];
  const rows = reports.map((r) => [
    r.id,
    r.reporterName || "",
    r.hazardType || "",
    r.riskLevel || "",
    r.description || "",
    String(r.latitude ?? ""),
    String(r.longitude ?? ""),
    formatDate(r.createdAt),
    r.status,
    String(r.verificationCount ?? 0),
  ]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => escapeCsvField(String(field))).join(","))
    .join("\n");
  downloadTextFile(csvContent, `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`);
}

export interface AnalyticsExportData {
  generatedAt: string;
  totalReports: number;
  activeHazards: number;
  resolveRate: number;
  avgResponseTime: string;
  actionedCount: number;
  byType: { name: string; value: number; pct: number }[];
  monthlyTrend: { name: string; value: number }[];
}

export function exportAnalyticsCSV(data: AnalyticsExportData) {
  const lines: string[] = [
    "RoadSense Analytics Summary",
    `Generated,${data.generatedAt}`,
    "",
    "Metric,Value",
    `Total reports,${data.totalReports}`,
    `Active hazards,${data.activeHazards}`,
    `Resolve rate,${data.resolveRate}%`,
    `Avg response time,${data.avgResponseTime}`,
    `Actioned reports,${data.actionedCount}`,
    "",
    "Hazard type,Count,Share %",
    ...data.byType.map((r) => `${escapeCsvField(r.name)},${r.value},${r.pct}`),
    "",
    "Month,Reports",
    ...data.monthlyTrend.map((r) => `${escapeCsvField(r.name)},${r.value}`),
  ];
  downloadTextFile(lines.join("\n"), `roadsense-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportReportText(report: {
  id: string;
  reporterName: string;
  hazardType: string;
  riskLevel: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  verificationCount: number;
  createdAt: string;
  adminNotes?: string;
  address?: string | null;
}) {
  const lines = [
    "RoadSense Hazard Report",
    "========================",
    `Report ID: ${report.id}`,
    `Reporter: ${report.reporterName}`,
    `Hazard Type: ${report.hazardType}`,
    `Risk Level: ${report.riskLevel}`,
    `Description: ${report.description}`,
    `Location: ${report.address || "—"}`,
    `Coordinates: ${report.latitude}, ${report.longitude}`,
    `Status: ${report.status}`,
    `Verifications: ${report.verificationCount}`,
    `Date submitted: ${report.createdAt}`,
    `Admin notes: ${report.adminNotes || "—"}`,
  ];
  downloadTextFile(
    lines.join("\n"),
    `roadsense-report-${report.id.slice(0, 8)}.txt`,
    "text/plain;charset=utf-8;"
  );
}
