import Image from "next/image";

interface TeamCardProps {
  photo: string;
  name: string;
  role: string;
  bio: string;
}

export default function TeamCard({ photo, name, role, bio }: TeamCardProps) {
  return (
    <article className="bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-800 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-center justify-center bg-fog-100 dark:bg-asphalt-800 min-h-[280px] max-h-[420px]">
        <Image
          src={photo}
          alt={name}
          width={800}
          height={1200}
          className="w-full h-auto max-h-[420px] object-contain"
          sizes="(max-width: 640px) 100vw, 50vw"
          quality={85}
        />
      </div>
      <div className="p-5">
        <p className="font-display font-semibold text-base text-asphalt-950 dark:text-fog-50 leading-snug">
          {name}
        </p>
        <p className="text-xs font-medium text-brand-cyan mt-1">{role}</p>
        <p className="text-sm text-fog-600 dark:text-fog-400 mt-2 leading-relaxed">{bio}</p>
      </div>
    </article>
  );
}
