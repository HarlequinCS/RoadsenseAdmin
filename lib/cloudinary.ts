export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

/** Build a Cloudinary thumbnail URL from a full image URL or public path. */
export function getCloudinaryThumbnail(
  imageUrl: string,
  width = 400,
  height = 300
): string {
  if (!imageUrl) return imageUrl;

  const uploadMarker = `/upload/`;
  const idx = imageUrl.indexOf(uploadMarker);
  if (idx === -1) return imageUrl;

  const transform = `w_${width},h_${height},c_fill`;
  const prefix = imageUrl.slice(0, idx + uploadMarker.length);
  const suffix = imageUrl.slice(idx + uploadMarker.length);
  return `${prefix}${transform}/${suffix}`;
}
