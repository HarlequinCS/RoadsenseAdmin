import Link from "next/link";
import {
  IconMapPin, IconArrowLeft, IconBrandGithub,
  IconDeviceMobile, IconCloud, IconMapPins,
} from "@tabler/icons-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-fog-50 dark:bg-asphalt-950">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <IconMapPin size={18} className="text-amber-600 dark:text-amber-400" strokeWidth={2.25} />
          </div>
          <span className="font-display font-semibold text-base text-asphalt-950 dark:text-fog-50 tracking-tight">
            RoadSense
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium px-4 py-2 rounded-lg border border-fog-200 dark:border-asphalt-700 hover:bg-white dark:hover:bg-asphalt-800 transition-colors text-asphalt-700 dark:text-fog-200"
        >
          Sign in
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-fog-600 dark:text-fog-400 hover:text-asphalt-950 dark:hover:text-fog-100 transition-colors mb-6"
        >
          <IconArrowLeft size={14} />
          Back to home
        </Link>

        <p className="text-[11px] font-semibold tracking-widest text-amber-600 dark:text-amber-400 uppercase mb-2">
          About the project
        </p>
        <h1 className="font-display font-semibold text-3xl text-asphalt-950 dark:text-fog-50 tracking-tight mb-4">
          What is RoadSense?
        </h1>
        <div className="lane-divider w-40 mb-6" />

        <p className="text-base text-fog-600 dark:text-fog-400 leading-relaxed mb-10">
          RoadSense is a crowdsourced road hazard reporting and monitoring platform.
          It lets everyday road users report hazards — potholes, floods, fallen trees,
          damaged signs, and more — in real time using their phone&rsquo;s GPS location and a
          photo. Administrators then use this dashboard to review, investigate, and
          resolve each report, turning scattered community reports into an organized,
          trackable system for improving public road safety.
        </p>

        <h2 className="font-display font-semibold text-lg text-asphalt-950 dark:text-fog-50 mb-4">
          How it works
        </h2>
        <div className="space-y-3 mb-10">
          <HowStep
            icon={<IconDeviceMobile size={18} />}
            title="Report from the mobile app"
            description="Users select a hazard type, add a description and photo, and submit — their GPS location is captured automatically."
          />
          <HowStep
            icon={<IconCloud size={18} />}
            title="Synced through Firebase"
            description="Reports and photos are stored in a shared Firebase backend, connecting the mobile app and this admin dashboard in real time."
          />
          <HowStep
            icon={<IconMapPins size={18} />}
            title="Managed from this dashboard"
            description="Admins view every report on an interactive map, update its status, and track trends over time."
          />
        </div>

        <h2 className="font-display font-semibold text-lg text-asphalt-950 dark:text-fog-50 mb-4">
          Project information
        </h2>
        <div className="border border-fog-200 dark:border-asphalt-800 bg-white dark:bg-asphalt-900 rounded-xl p-5 mb-10 text-sm">
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-fog-600 dark:text-fog-400">Course</dt>
              <dd className="text-asphalt-950 dark:text-fog-100 font-medium">ICT602 Mobile Technology</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fog-600 dark:text-fog-400">Project type</dt>
              <dd className="text-asphalt-950 dark:text-fog-100 font-medium">Group Project</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-fog-600 dark:text-fog-400">Repository</dt>
              <dd>
                  <a href="https://github.com/HarlequinCS/RoadSense"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:underline font-medium"
                >
                  <IconBrandGithub size={15} />
                  HarlequinCS/RoadSense
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <p className="text-xs text-fog-400 text-center pb-4">
          © 2026 RoadSense — Built for ICT602 Mobile Technology Group Project
        </p>
      </main>
    </div>
  );
}

function HowStep({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-display font-medium text-sm text-asphalt-950 dark:text-fog-50 mb-0.5">
          {title}
        </p>
        <p className="text-sm text-fog-600 dark:text-fog-400">{description}</p>
      </div>
    </div>
  );
}