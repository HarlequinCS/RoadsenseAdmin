import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import DownloadCta from "@/components/public/DownloadCta";
import SectionHeading from "@/components/public/SectionHeading";
import JsonLd from "@/components/seo/JsonLd";
import { TAGLINE } from "@/lib/public-site";
import {
  buildPageMetadata,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import {
  IconMapPin,
  IconAlertTriangle,
  IconBell,
  IconShieldCheck,
  IconLogin,
  IconChartBar,
  IconSparkles,
  IconUsers,
  IconArrowRight,
  IconRoute,
  IconCamera,
  IconCheck,
  IconBuildingCommunity,
} from "@tabler/icons-react";

export const metadata: Metadata = buildPageMetadata({
  title: "Community hazard reporting",
  description:
    "RoadSense lets drivers report potholes, debris, and road hazards in under a minute — photo, GPS, and community verification.",
  path: "/",
  openGraphTitle: "RoadSense — Community hazard reporting",
});

const HIGHLIGHTS = [
  {
    icon: IconMapPin,
    title: "Real-time hazard map",
    description: "Clustered markers, heat map overlay, filters, and a map that follows you as you drive.",
    tone: "cyan" as const,
  },
  {
    icon: IconAlertTriangle,
    title: "Rules + AI risk scoring",
    description: "Rule-based priority on submit, then AI review with reason and confidence — push alert when scoring completes.",
    tone: "orange" as const,
  },
  {
    icon: IconBell,
    title: "Proximity alerts",
    description: "FCM push and in-app prompts at 150 m — foreground dialog on Home/Map, notifications in background.",
    tone: "cyan" as const,
  },
  {
    icon: IconUsers,
    title: "Community verification",
    description: "Confirm still there, resolve when fixed, follow hazards for updates, and climb the top-reporters leaderboard.",
    tone: "teal" as const,
  },
  {
    icon: IconLogin,
    title: "Easy sign-in",
    description: "Email or Google Sign-In, legal agreement gate, onboarding tour, and profile stats that sync from Firestore.",
    tone: "cyan" as const,
  },
  {
    icon: IconShieldCheck,
    title: "Offline & inclusive",
    description: "Reports queue offline and upload when back online. Bahasa Malaysia strings and dark mode included.",
    tone: "teal" as const,
  },
];

const STEPS = [
  {
    step: "01",
    title: "Report",
    description: "A guided 5-step wizard — type, description, photo, GPS, review. Duplicate check, offline queue, Cloudinary upload.",
    icon: IconCamera,
  },
  {
    step: "02",
    title: "Alert",
    description: "Nearby drivers see hazards on the home dashboard and full-screen map — paginated list within 5 km, pull-to-refresh.",
    icon: IconBell,
  },
  {
    step: "03",
    title: "Verify",
    description: "Confirm still there, resolve when fixed, or get asked at 150 m — drivers maintain the map without forms.",
    icon: IconCheck,
  },
  {
    step: "04",
    title: "Act",
    description: "Authorities set Under Investigation, override AI priority, and resolve — updates flow to every device in real time.",
    icon: IconBuildingCommunity,
  },
];

const toneStyles = {
  cyan: "bg-brand-cyan-50 dark:bg-brand-cyan/15 text-brand-cyan",
  orange: "bg-brand-orange-50 dark:bg-brand-orange/15 text-brand-orange",
  teal: "bg-signal-teal-50 dark:bg-signal-teal-600/20 text-signal-teal-600 dark:text-signal-teal-100",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-fog-50 dark:bg-asphalt-950 flex flex-col">
      <JsonLd data={[websiteJsonLd(), softwareApplicationJsonLd()]} />
      <PublicNav />

      {/* Hero */}
      <section className="hero-gradient border-b border-fog-200/60 dark:border-asphalt-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Logo
                size="hero"
                layout="stacked"
                align="start"
                subtitle="Crowdsourced Road Safety"
                className="mb-8"
              />
              <h1 className="font-display font-semibold text-4xl sm:text-[44px] leading-[1.1] text-asphalt-950 dark:text-fog-50 tracking-tight mb-5">
                What if every driver could warn the next one?
              </h1>
              <p className="text-base sm:text-lg text-fog-600 dark:text-fog-400 leading-relaxed mb-3 max-w-lg">
                Road hazards are everywhere — potholes, floods, debris — but official reporting
                is slow. RoadSense lets anyone report a hazard in seconds with a photo, GPS
                location, and a single tap.
              </p>
              <p className="text-sm text-fog-500 dark:text-fog-400 mb-8 max-w-lg">
                Nearby drivers see it immediately. The community keeps reports accurate.
                Authorities act through a dedicated admin platform.
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <DownloadCta />
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-xl border border-fog-200 dark:border-asphalt-700 hover:bg-white dark:hover:bg-asphalt-800 transition-colors text-asphalt-700 dark:text-fog-200"
                >
                  Admin Sign in
                  <IconArrowRight size={16} />
                </Link>
              </div>
              <p className="text-[11px] text-fog-400 uppercase tracking-wide">
                Android only · RoadSense v3.0
              </p>
            </div>

            {/* Decorative visual */}
            <div className="relative hidden lg:block">
              <div className="relative bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-2xl p-8 shadow-sm">
                <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-brand-orange/20 blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-brand-cyan/20 blur-xl" />
                <div className="space-y-4 relative">
                  <StatPill label="Active hazards nearby" value="3" tone="orange" />
                  <StatPill label="Within 3 km" value="Pothole · High risk" tone="cyan" />
                  <StatPill label="Community verifications" value="12 confirmations" tone="teal" />
                  <div className="flex items-center gap-2 pt-2">
                    <IconRoute size={20} className="text-brand-cyan" />
                    <span className="text-xs text-fog-500">Live map · Real-time sync</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-2xl p-6 sm:p-8">
            <p className="text-[11px] font-semibold tracking-widest text-signal-red-500 uppercase mb-3">
              The problem
            </p>
            <p className="text-sm sm:text-base text-fog-600 dark:text-fog-400 leading-relaxed">
              By the time councils learn about a dangerous stretch of road, dozens of drivers
              have already paid the price — damaged tyres, near-misses, or worse. Reporting
              channels are slow, buried in bureaucracy, or simply unknown.
            </p>
          </div>
          <div className="bg-brand-cyan-50 dark:bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl p-6 sm:p-8">
            <p className="text-[11px] font-semibold tracking-widest text-brand-cyan uppercase mb-3">
              The RoadSense way
            </p>
            <p className="text-sm sm:text-base text-fog-600 dark:text-fog-400 leading-relaxed">
              Report in under a minute. Every nearby driver is alerted. The community verifies
              what is still there. Administrators investigate and resolve — turning scattered
              complaints into an organised, trackable system for safer roads.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white dark:bg-asphalt-900/50 border-y border-fog-200 dark:border-asphalt-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <SectionHeading
            eyebrow="How it works"
            title="From report to resolution"
            subtitle="Four steps connect drivers on the road with authorities who can act."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map(({ step, title, description, icon: Icon }) => (
              <div
                key={step}
                className="relative bg-fog-50 dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-xl p-5"
              >
                <span className="text-[10px] font-mono font-bold text-brand-orange">{step}</span>
                <div className="w-10 h-10 rounded-lg bg-brand-cyan-50 dark:bg-brand-cyan/15 text-brand-cyan flex items-center justify-center mt-3 mb-3">
                  <Icon size={20} />
                </div>
                <p className="font-display font-semibold text-sm text-asphalt-950 dark:text-fog-50 mb-1.5">
                  {title}
                </p>
                <p className="text-xs text-fog-600 dark:text-fog-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App highlights */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <SectionHeading
          eyebrow="Mobile app"
          title="Built for drivers on the move"
          subtitle="Waze-inspired design — fast, familiar, and focused on real-time road awareness."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIGHLIGHTS.map(({ icon: Icon, title, description, tone }) => (
            <div
              key={title}
              className="flex items-start gap-3.5 bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-xl p-5"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${toneStyles[tone]}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="font-display font-medium text-sm text-asphalt-950 dark:text-fog-50 mb-1">
                  {title}
                </p>
                <p className="text-xs text-fog-600 dark:text-fog-400 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Admin teaser */}
      <section className="bg-asphalt-950 text-fog-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-brand-cyan uppercase mb-3">
                For authorities
              </p>
              <h2 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight mb-4">
                The admin platform behind the community
              </h2>
              <p className="text-sm text-fog-400 leading-relaxed mb-6">
                The authority-facing half of RoadSense. Review the hazard queue, set{" "}
                <strong className="text-fog-200">Under Investigation</strong>, investigate on the map,
                track analytics, view AI assessments, and use Groq-assisted triage — all synced live
                with the Android app via Firestore listeners.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-xl bg-fog-100 text-asphalt-950 hover:bg-white transition-colors"
              >
                Admin Sign in
                <IconArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AdminFeature icon={IconAlertTriangle} label="Reports queue" />
              <AdminFeature icon={IconMapPin} label="Map command center" />
              <AdminFeature icon={IconChartBar} label="Analytics" />
              <AdminFeature icon={IconSparkles} label="AI assist" />
            </div>
          </div>
        </div>
      </section>

      {/* Impact quote */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <blockquote className="max-w-3xl">
          <p className="font-display text-xl sm:text-2xl text-asphalt-950 dark:text-fog-50 leading-relaxed italic">
            &ldquo;A driver who knows about a hazard can protect a driver who does not.&rdquo;
          </p>
          <footer className="mt-4 text-sm text-fog-500">— The RoadSense mission</footer>
        </blockquote>
      </section>

      {/* Final CTA */}
      <section className="border-t border-fog-200 dark:border-asphalt-800 bg-white dark:bg-asphalt-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <Logo size="xl" layout="stacked" align="start" className="mb-4" />
          <p className="text-sm text-fog-600 dark:text-fog-400 mb-6">{TAGLINE}</p>
          <div className="flex flex-wrap items-center gap-3">
            <DownloadCta />
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-xl border border-fog-200 dark:border-asphalt-700 hover:bg-fog-50 dark:hover:bg-asphalt-800 transition-colors text-asphalt-700 dark:text-fog-200"
            >
              Meet the team
              <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "orange" | "teal";
}) {
  const dot =
    tone === "orange" ? "bg-brand-orange" : tone === "cyan" ? "bg-brand-cyan" : "bg-signal-teal-500";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-fog-50 dark:bg-asphalt-800">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
      <div>
        <p className="text-[10px] text-fog-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-asphalt-950 dark:text-fog-50">{value}</p>
      </div>
    </div>
  );
}

function AdminFeature({ icon: Icon, label }: { icon: typeof IconMapPin; label: string }) {
  return (
    <div className="flex items-center gap-2.5 p-4 rounded-xl bg-asphalt-900 border border-asphalt-800">
      <Icon size={18} className="text-brand-cyan shrink-0" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
