import { getCloudinaryThumbnail } from "@/lib/cloudinary";
import { getHazardTypeColor } from "@/lib/style-helpers";
import { IconPhoto } from "@tabler/icons-react";

interface HazardThumbnailProps {
  imageUrl?: string;
  hazardType: string;
  size?: number;
}

export default function HazardThumbnail({
  imageUrl,
  hazardType,
  size = 48,
}: HazardThumbnailProps) {
  const thumb = imageUrl ? getCloudinaryThumbnail(imageUrl, size * 2, size * 2) : null;

  if (thumb) {
    return (
      <img
        src={thumb}
        alt=""
        width={size}
        height={size}
        className="rounded-md object-cover shrink-0 bg-fog-100"
        style={{ width: size, height: size }}
      />
    );
  }

  const color = getHazardTypeColor(hazardType);
  return (
    <div
      className="rounded-md flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}22`,
        color,
      }}
    >
      <IconPhoto size={Math.round(size * 0.35)} strokeWidth={1.75} />
    </div>
  );
}
