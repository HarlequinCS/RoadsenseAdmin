import type { Metadata } from "next";
import NotificationsPageClient from "./NotificationsPageClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Notifications",
  description: "Send FCM push notifications to RoadSense mobile app users.",
  path: "/notifications",
  index: false,
});

export default function NotificationsPage() {
  return <NotificationsPageClient />;
}
