import { HazardStatus, HazardType } from "./types";

export const statusStyles: Record<HazardStatus, { bg: string; fg: string; dot: string }> = {
  New: { bg: "#FAEEDA", fg: "#633806", dot: "#EF9F27" },
  "Under Investigation": { bg: "#FCEBEB", fg: "#791F1F", dot: "#E4572E" },
  Resolved: { bg: "#E1F5EE", fg: "#04342C", dot: "#12805C" },
};

export const statusChartColors: Record<HazardStatus, string> = {
  New: "#EF9F27",
  "Under Investigation": "#E4572E",
  Resolved: "#12805C",
};

export const hazardTypeColors: Record<HazardType, string> = {
  Pothole: "#E4572E",
  Flood: "#3D6FB4",
  "Traffic Accident": "#A32D2D",
  "Fallen Tree": "#3B6D11",
  "Damaged Road Sign": "#7F77DD",
  "Broken Traffic Light": "#993556",
};

export function toDate(value: string | Date | { toDate: () => Date }): Date | null {
  if (typeof value === "string") return new Date(value);
  if (value instanceof Date) return value;
  if (value && typeof value.toDate === "function") return value.toDate();
  return null;
}

export function formatDate(value: string | Date | { toDate: () => Date }): string {
  let d: Date;
  if (typeof value === "string") {
    d = new Date(value);
  } else if (value instanceof Date) {
    d = value;
  } else if (value && typeof value.toDate === "function") {
    d = value.toDate();
  } else {
    return "—";
  }
  return d.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" });
}