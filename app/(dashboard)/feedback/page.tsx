import type { Metadata } from "next";
import FeedbackPageClient from "./FeedbackPageClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Feedback",
  description: "In-app user feedback from the RoadSense mobile app.",
  path: "/feedback",
  index: false,
});

export default function FeedbackPage() {
  return <FeedbackPageClient />;
}
