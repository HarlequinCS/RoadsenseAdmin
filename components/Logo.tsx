import Image from "next/image";
import Link from "next/link";

type LogoSize = "sm" | "md" | "lg" | "xl" | "hero";
type LogoVariant = "default" | "onDark";
type LogoLayout = "horizontal" | "stacked";

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  subtitle?: string;
  href?: string;
  className?: string;
  variant?: LogoVariant;
  layout?: LogoLayout;
  align?: "start" | "center";
}

/** SVG viewBox is 418×627 — size by width so the pin reads clearly. */
const imageWidths: Record<LogoSize, number> = {
  sm: 32,
  md: 44,
  lg: 56,
  xl: 72,
  hero: 96,
};

const titleSizes: Record<LogoSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  hero: "text-2xl sm:text-3xl",
};

const subtitleSizes: Record<LogoSize, string> = {
  sm: "text-[10px]",
  md: "text-[10.5px]",
  lg: "text-xs",
  xl: "text-xs",
  hero: "text-sm",
};

export default function Logo({
  size = "md",
  showText = true,
  subtitle,
  href,
  className = "",
  variant = "default",
  layout = "horizontal",
  align = "start",
}: LogoProps) {
  const width = imageWidths[size];
  const height = Math.round(width * (627 / 418));
  const stacked = layout === "stacked";
  const centered = align === "center";

  const titleClass =
    variant === "onDark"
      ? "text-white"
      : "text-asphalt-950 dark:text-fog-50";
  const subtitleClass =
    variant === "onDark"
      ? "text-fog-400"
      : "text-fog-600 dark:text-fog-400";

  const content = (
    <div
      className={`flex ${
        stacked
          ? `flex-col gap-3 ${centered ? "items-center text-center" : "items-start"}`
          : `items-center gap-3 ${centered ? "justify-center" : ""}`
      } ${centered ? "mx-auto" : ""} ${className}`}
    >
      <Image
        src="/roadsense-logo.svg"
        alt="RoadSense"
        width={width}
        height={height}
        className="shrink-0 object-contain"
        priority={size === "xl" || size === "hero"}
      />
      {showText && (
        <div className="min-w-0">
          <p
            className={`font-display font-semibold leading-none tracking-tight ${titleClass} ${titleSizes[size]}`}
          >
            RoadSense
          </p>
          {subtitle && (
            <p className={`${subtitleSizes[size]} mt-1.5 tracking-wide uppercase ${subtitleClass}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
