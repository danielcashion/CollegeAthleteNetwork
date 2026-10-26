export const SITE_URL = "https://www.collegeathletenetwork.org";

/** Default social preview image (absolute URL resolved via metadataBase). */
export const DEFAULT_OG_IMAGE_PATH = "/Logos/CANLogo1200X1200Color.png";

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
