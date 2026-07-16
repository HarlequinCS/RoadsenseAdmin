interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";

  return (
    <div className={`max-w-2xl mb-10 ${alignClass}`}>
      <p className="text-[11px] font-semibold tracking-widest text-brand-cyan uppercase mb-2">
        {eyebrow}
      </p>
      <h2 className="font-display font-semibold text-2xl sm:text-3xl text-asphalt-950 dark:text-fog-50 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-fog-600 dark:text-fog-400 mt-3 leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className={`lane-divider w-24 mt-4 ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
}
