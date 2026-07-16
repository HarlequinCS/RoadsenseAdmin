"use client";

import { useState } from "react";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { IconDatabase, IconCheck } from "@tabler/icons-react";

const SAMPLE_USERS = [
  {
    uid: "seed-u1",
    fullName: "Ahmad bin Ali",
    email: "ahmad@example.com",
    birthday: "2000-05-20",
    gender: "Male",
    totalReports: 2,
    resolvedReports: 1,
    verifiedReports: 3,
    highRiskReports: 1,
    contributorBadge: "Active Reporter",
  },
  {
    uid: "seed-u2",
    fullName: "Nurul Jannah",
    email: "nurul@example.com",
    birthday: "2001-03-15",
    gender: "Female",
    totalReports: 1,
    resolvedReports: 0,
    verifiedReports: 1,
    highRiskReports: 0,
    contributorBadge: "Active Reporter",
  },
  {
    uid: "seed-u3",
    fullName: "Aiman Mohd",
    email: "aiman@example.com",
    birthday: "1999-11-08",
    gender: "Male",
    totalReports: 0,
    resolvedReports: 1,
    verifiedReports: 2,
    highRiskReports: 0,
    contributorBadge: "Active Reporter",
  },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return Timestamp.fromDate(d);
}

const SAMPLE_HAZARDS = [
  {
    userId: "seed-u1",
    reporterName: "Ahmad bin Ali",
    hazardType: "Pothole",
    description: "Large pothole near junction, damaged two tyres this week",
    latitude: 3.0738,
    longitude: 101.5183,
    status: "New",
    riskLevel: "Medium",
    verificationCount: 2,
    verifiedBy: ["seed-u2", "seed-u3"],
    createdAt: daysAgo(2),
    imageUrl: "https://res.cloudinary.com/ditifn5y3/image/upload/w_400,h_300,c_fill/sample/pothole.jpg",
  },
  {
    userId: "seed-u2",
    reporterName: "Nurul Jannah",
    hazardType: "Flooding",
    description: "Road flooded ankle-deep after storm",
    latitude: 3.0755,
    longitude: 101.5160,
    status: "Under Investigation",
    riskLevel: "High",
    verificationCount: 1,
    verifiedBy: ["seed-u1"],
    createdAt: daysAgo(5),
    statusUpdatedAt: daysAgo(3),
    imageUrl: "https://res.cloudinary.com/ditifn5y3/image/upload/w_400,h_300,c_fill/sample/flooding.jpg",
  },
  {
    userId: "seed-u1",
    reporterName: "Ahmad bin Ali",
    hazardType: "Debris",
    description: "Fallen branches blocking right lane",
    latitude: 3.0710,
    longitude: 101.5200,
    status: "Resolved",
    riskLevel: "Medium",
    verificationCount: 0,
    verifiedBy: [],
    createdAt: daysAgo(30),
    statusUpdatedAt: daysAgo(20),
    resolvedBy: "seed-u3",
    imageUrl: "",
  },
  {
    userId: "seed-u3",
    reporterName: "Aiman Mohd",
    hazardType: "Road Crack",
    description: "Longitudinal crack across both lanes",
    latitude: 3.0770,
    longitude: 101.5145,
    status: "New",
    riskLevel: "Low",
    verificationCount: 0,
    verifiedBy: [],
    createdAt: daysAgo(1),
    imageUrl: "",
  },
  {
    userId: "seed-u2",
    reporterName: "Nurul Jannah",
    hazardType: "Street Light Issue",
    description: "Street light out for 3 nights, poor visibility",
    latitude: 3.0725,
    longitude: 101.5190,
    status: "New",
    riskLevel: "Low",
    verificationCount: 1,
    verifiedBy: ["seed-u1"],
    createdAt: daysAgo(3),
    imageUrl: "",
  },
  {
    userId: "seed-u1",
    reporterName: "Ahmad bin Ali",
    hazardType: "Pothole",
    description: "Cluster of small potholes after heavy rain",
    latitude: 3.0742,
    longitude: 101.5175,
    status: "Resolved",
    riskLevel: "Medium",
    verificationCount: 3,
    verifiedBy: ["seed-u2", "seed-u3"],
    createdAt: daysAgo(45),
    statusUpdatedAt: daysAgo(35),
    resolvedBy: "seed-u1",
    imageUrl: "",
  },
  {
    userId: "seed-u3",
    reporterName: "Aiman Mohd",
    hazardType: "Other",
    description: "Construction debris not cleared from roadside",
    latitude: 3.0760,
    longitude: 101.5155,
    status: "Under Investigation",
    riskLevel: "Critical",
    verificationCount: 4,
    verifiedBy: ["seed-u1", "seed-u2"],
    createdAt: daysAgo(7),
    statusUpdatedAt: daysAgo(4),
    imageUrl: "",
  },
];

export default function SeedDataButton() {
  const enabled = process.env.NODE_ENV !== "production";

  const [seeding, setSeeding] = useState(false);
  const [done, setDone] = useState(false);

  if (!enabled) return null;

  async function handleSeed() {
    setSeeding(true);
    try {
      for (const user of SAMPLE_USERS) {
        const { uid, ...rest } = user;
        await setDoc(doc(db, "users", uid), rest);
      }
      for (const hazard of SAMPLE_HAZARDS) {
        await setDoc(doc(collection(db, "hazards")), hazard);
      }
      setDone(true);
    } catch (err) {
      console.error("Seed failed:", err);
      alert("Seeding failed — check the browser console for details.");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <button
      onClick={handleSeed}
      disabled={seeding || done}
      className="no-print flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors disabled:opacity-50"
    >
      {done ? <IconCheck size={14} /> : <IconDatabase size={14} />}
      {done ? "Sample data added!" : seeding ? "Seeding…" : "Seed sample data"}
    </button>
  );
}
