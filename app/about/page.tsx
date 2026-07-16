import type { Metadata } from "next";
import Link from "next/link";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import DownloadCta from "@/components/public/DownloadCta";
import SectionHeading from "@/components/public/SectionHeading";
import TeamCard from "@/components/public/TeamCard";
import { TEAM } from "@/lib/public-site";
import {
  IconArrowLeft,
  IconDeviceMobile,
  IconCloud,
  IconMapPins,
  IconBell,
  IconShield,
  IconPhoto,
  IconRoute,
  IconCheck,
  IconPalette,
} from "@tabler/icons-react";
import { buildPageMetadata, aboutPageJsonLd, organizationJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = buildPageMetadata({
  title: "About the team",
  description:
    "Meet the UiTM ICT602 team behind RoadSense — crowdsourced road hazard reporting for Malaysian drivers.",
  path: "/about",
  openGraphTitle: "About RoadSense",
});

const TECH_STACK = [
  { icon: IconDeviceMobile, label: "Android (Java + XML)", detail: "Native mobile app with Material Design" },
  { icon: IconCloud, label: "Firebase", detail: "Auth, Firestore, Cloud Messaging" },
  { icon: IconMapPins, label: "Google Maps", detail: "Maps SDK, location, marker clustering" },
  { icon: IconPhoto, label: "Cloudinary", detail: "Hazard photo uploads and delivery" },
  { icon: IconBell, label: "FCM Push", detail: "Proximity alerts and notifications" },
];

const INNOVATIONS = [
  {
    icon: IconRoute,
    title: "150 m arrival validation",
    description:
      "When you pass within 150 metres of a hazard, the app asks: still there? Drivers become verifiers without filling forms.",
  },
  {
    icon: IconShield,
    title: "Automatic risk scoring",
    description:
      "Hazard type, nearby density, and duplicates combine into Low, Medium, High, or Critical — instantly on submit.",
  },
  {
    icon: IconPalette,
    title: "Waze-inspired design",
    description:
      "Cyan for trust, orange for urgency — an interface drivers already associate with real-time road awareness.",
  },
  {
    icon: IconCheck,
    title: "Two halves, one system",
    description:
      "Citizens report on Android. Authorities investigate on this web platform. One Firebase backend connects both.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-fog-50 dark:bg-asphalt-950 flex flex-col">
      <JsonLd data={[aboutPageJsonLd(), organizationJsonLd()]} />
      <PublicNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="hero-gradient border-b border-fog-200/60 dark:border-asphalt-800/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-fog-600 dark:text-fog-400 hover:text-asphalt-950 dark:hover:text-fog-100 transition-colors mb-8"
            >
              <IconArrowLeft size={14} />
              Back to home
            </Link>
            <p className="text-[11px] font-semibold tracking-widest text-brand-cyan uppercase mb-3">
              Our story
            </p>
            <h1 className="font-display font-semibold text-3xl sm:text-4xl text-asphalt-950 dark:text-fog-50 tracking-tight mb-5">
              The RoadSense Story
            </h1>
            <div className="lane-divider w-32 mb-6" />
            <p className="text-base sm:text-lg text-fog-600 dark:text-fog-400 leading-relaxed mb-4">
              RoadSense began as a group project for <strong className="text-asphalt-950 dark:text-fog-100 font-medium">ICT602 Mobile Programming</strong> at{" "}
              <strong className="text-asphalt-950 dark:text-fog-100 font-medium">Universiti Teknologi MARA (UiTM)</strong>.
              Four students set out to build more than a mock-up — a working Android application
              backed by a live cloud database, designed for real road safety in Malaysia.
            </p>
            <p className="text-sm text-fog-500 dark:text-fog-400 leading-relaxed">
              They named it <em>RoadSense</em>: sense on the road. Awareness. Community. Action.
            </p>
          </div>
        </section>

        {/* Origin */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <SectionHeading
            eyebrow="Why we built it"
            title="A problem on every road"
          />
          <div className="space-y-4 text-sm sm:text-base text-fog-600 dark:text-fog-400 leading-relaxed">
            <p>
              Every driver knows the jolt of a pothole you did not see in time. Rain turns a
              familiar stretch into a shallow river. Debris sits in your lane with no warning.
              Official channels are slow — by the time authorities learn, many have already
              been affected.
            </p>
            <p>
              The team asked a simple question:{" "}
              <em className="text-asphalt-950 dark:text-fog-100 not-italic font-medium">
                What if every driver could report a hazard in seconds — with a photo, a location,
                and a tap — and every other driver nearby could see it immediately?
              </em>
            </p>
            <p>
              That question became RoadSense: a crowdsourced reporting platform with community
              verification, automatic risk scoring, push alerts, and this admin dashboard for
              authorities to investigate and resolve hazards systematically.
            </p>
          </div>
        </section>

        {/* Tech stack */}
        <section className="bg-white dark:bg-asphalt-900/50 border-y border-fog-200 dark:border-asphalt-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
            <SectionHeading
              eyebrow="Under the hood"
              title="Technology stack"
              subtitle="Deliberate choices for a semester project that had to work on real devices."
            />
            <div className="grid sm:grid-cols-2 gap-4">
              {TECH_STACK.map(({ icon: Icon, label, detail }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-4 rounded-xl border border-fog-200 dark:border-asphalt-800 bg-fog-50 dark:bg-asphalt-900"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-cyan-50 dark:bg-brand-cyan/15 text-brand-cyan flex items-center justify-center shrink-0">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="font-display font-medium text-sm text-asphalt-950 dark:text-fog-50">
                      {label}
                    </p>
                    <p className="text-xs text-fog-500 mt-0.5">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Innovations */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <SectionHeading
            eyebrow="What makes it different"
            title="Innovation highlights"
          />
          <div className="grid sm:grid-cols-2 gap-5">
            {INNOVATIONS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="p-5 rounded-xl bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-orange-50 dark:bg-brand-orange/15 text-brand-orange flex items-center justify-center mb-3">
                  <Icon size={20} />
                </div>
                <p className="font-display font-semibold text-sm text-asphalt-950 dark:text-fog-50 mb-2">
                  {title}
                </p>
                <p className="text-xs text-fog-600 dark:text-fog-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="bg-white dark:bg-asphalt-900/50 border-y border-fog-200 dark:border-asphalt-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
            <SectionHeading
              eyebrow="The people behind it"
              title="Meet the team"
              subtitle="Four UiTM students who chose a problem that mattered — and built software they would use themselves."
              align="center"
            />
            <div className="grid sm:grid-cols-2 gap-6">
              {TEAM.map((member) => (
                <TeamCard key={member.name} {...member} />
              ))}
            </div>
            <p className="text-center text-xs text-fog-400 mt-8">
              RoadSense Team · UiTM · ICT602 Mobile Programming · © 2026
            </p>
          </div>
        </section>

        {/* Project facts */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <SectionHeading eyebrow="Project details" title="At a glance" />
          <div className="border border-fog-200 dark:border-asphalt-800 bg-white dark:bg-asphalt-900 rounded-2xl overflow-hidden">
            <dl className="divide-y divide-fog-100 dark:divide-asphalt-800 text-sm">
              <FactRow label="Institution" value="Universiti Teknologi MARA (UiTM)" />
              <FactRow label="Course" value="ICT602 Mobile Programming" />
              <FactRow label="Project type" value="Group Project" />
              <FactRow label="Status" value="Feature-complete (July 2026)" />
              <FactRow label="Platforms" value="Android mobile app + Web admin dashboard" />
              <FactRow label="Backend" value="Firebase (Auth, Firestore, FCM)" />
            </dl>
          </div>
        </section>

        {/* Download */}
        <section className="bg-asphalt-950 text-fog-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16 text-center">
            <h2 className="font-display font-semibold text-2xl mb-3">Get the Android app</h2>
            <p className="text-sm text-fog-400 mb-6 max-w-md mx-auto">
              Download RoadSense v3.0 from Google Drive. Android only — enable
              &ldquo;Install from unknown sources&rdquo; if prompted during installation.
            </p>
            <DownloadCta className="mx-auto" />
          </div>
        </section>

        {/* Epilogue */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <blockquote className="text-center">
            <p className="font-display text-lg sm:text-xl text-asphalt-950 dark:text-fog-50 leading-relaxed italic max-w-2xl mx-auto">
              Four students at UiTM looked at a problem every driver knows and asked:
              Can we build something that helps? They did.
            </p>
          </blockquote>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 px-5 py-4">
      <dt className="text-fog-500 dark:text-fog-400">{label}</dt>
      <dd className="font-medium text-asphalt-950 dark:text-fog-100 text-right">{value}</dd>
    </div>
  );
}
