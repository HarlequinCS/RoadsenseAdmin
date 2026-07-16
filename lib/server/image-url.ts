const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^\[::1\]$/,
  /^metadata\.google\.internal$/i,
  /^169\.254\.\d+\.\d+$/,
];

export function isAllowedHazardImageUrl(imageUrl: string): boolean {
  if (!imageUrl || imageUrl.length > 2048) return false;

  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") return false;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return false;

  const allowedHosts = new Set([
    "res.cloudinary.com",
    `${cloudName}.cloudinary.com`,
  ]);

  if (!allowedHosts.has(parsed.hostname)) return false;
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(parsed.hostname))) return false;

  return parsed.pathname.includes(`/image/upload/`) || parsed.pathname.includes(`/upload/`);
}
