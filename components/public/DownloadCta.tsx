import { IconBrandAndroid, IconDownload } from "@tabler/icons-react";
import { APK_DOWNLOAD_URL } from "@/lib/public-site";

interface DownloadCtaProps {
  variant?: "primary" | "secondary";
  className?: string;
}

export default function DownloadCta({ variant = "primary", className = "" }: DownloadCtaProps) {
  const isPrimary = variant === "primary";

  return (
    <a
      href={APK_DOWNLOAD_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-xl transition-colors ${
        isPrimary
          ? "bg-brand-orange text-white hover:opacity-90 shadow-sm"
          : "border border-brand-orange/40 text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20"
      } ${className}`}
    >
      <IconDownload size={18} />
      Download Android App
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/20">
        <IconBrandAndroid size={12} />
        v3.0
      </span>
    </a>
  );
}
