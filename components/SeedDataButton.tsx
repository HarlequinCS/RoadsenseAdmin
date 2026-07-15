"use client";

import { useState } from "react";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { IconDatabase, IconCheck } from "@tabler/icons-react";

const SAMPLE_USERS = [
  { uid: "seed-u1", fullName: "Aiman Zaki", email: "aiman@student.uitm.edu.my", role: "admin", totalReports: 3, resolvedReports: 1 },
  { uid: "seed-u2", fullName: "Nisa Rahman", email: "nisa@student.uitm.edu.my", role: "user", totalReports: 2, resolvedReports: 2 },
  { uid: "seed-u3", fullName: "Iqbal Hakim", email: "iqbal@student.uitm.edu.my", role: "user", totalReports: 1, resolvedReports: 0 },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return Timestamp.fromDate(d);
}

const SAMPLE_HAZARDS = [
  { userId: "seed-u1", reporterName: "Aiman Zaki", hazardType: "Pothole", description: "Deep pothole near junction, damaging tires", latitude: 2.1896, longitude: 102.2501, status: "New", createdAt: daysAgo(2), imageUrl: "https://placehold.co/600x400/E4572E/white?text=Pothole+Photo" },
  { userId: "seed-u2", reporterName: "Nisa Rahman", hazardType: "Flood", description: "Road flooded ankle-deep after storm", latitude: 2.1935, longitude: 102.2470, status: "Under Investigation", createdAt: daysAgo(15), imageUrl: "https://placehold.co/600x400/3D6FB4/white?text=Flood+Photo" },
  { userId: "seed-u1", reporterName: "Aiman Zaki", hazardType: "Traffic Accident", description: "Minor collision blocking left lane", latitude: 2.1802, longitude: 102.2555, status: "Resolved", createdAt: daysAgo(40), imageUrl: "" },
  { userId: "seed-u3", reporterName: "Iqbal Hakim", hazardType: "Fallen Tree", description: "Branch blocking one lane after wind", latitude: 2.1950, longitude: 102.2490, status: "New", createdAt: daysAgo(5), imageUrl: "https://placehold.co/600x400/3B6D11/white?text=Fallen+Tree+Photo" },
  { userId: "seed-u2", reporterName: "Nisa Rahman", hazardType: "Pothole", description: "Cluster of small potholes after heavy rain", latitude: 2.1870, longitude: 102.2530, status: "Resolved", createdAt: daysAgo(70), imageUrl: "" },
  { userId: "seed-u1", reporterName: "Aiman Zaki", hazardType: "Damaged Road Sign", description: "Stop sign bent and hard to read", latitude: 2.1910, longitude: 102.2515, status: "Under Investigation", createdAt: daysAgo(25), imageUrl: "https://placehold.co/600x400/7F77DD/white?text=Road+Sign+Photo" },
  { userId: "seed-u2", reporterName: "Nisa Rahman", hazardType: "Broken Traffic Light", description: "Signal stuck on red for over an hour", latitude: 2.1885, longitude: 102.2480, status: "New", createdAt: daysAgo(1), imageUrl: "" },
];

export default function SeedDataButton() {
  const [seeding, setSeeding] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSeed() {
    setSeeding(true);
    try {
      for (const user of SAMPLE_USERS) {
        const { uid, ...rest } = user;
        await setDoc(doc(db, "users", uid), { ...rest, createdAt: daysAgo(90) });
      }
      for (const hazard of SAMPLE_HAZARDS) {
        await setDoc(doc(collection(db, "hazards")), {
          ...hazard,
          updatedAt: hazard.createdAt,
        });
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