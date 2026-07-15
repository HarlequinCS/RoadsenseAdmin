export type HazardType =
  | "Pothole"
  | "Flood"
  | "Traffic Accident"
  | "Fallen Tree"
  | "Damaged Road Sign"
  | "Broken Traffic Light";

export type HazardStatus = "New" | "Under Investigation" | "Resolved";

export interface Hazard {
  id: string;
  userId: string;
  reporterName: string;
  hazardType: HazardType;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  status: HazardStatus;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppUser {
  uid: string;
  fullName: string;
  email: string;
  role: "admin" | "user";
  totalReports: number;
  resolvedReports: number;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalReports: number;
  newReports: number;
  resolvedReports: number;
}