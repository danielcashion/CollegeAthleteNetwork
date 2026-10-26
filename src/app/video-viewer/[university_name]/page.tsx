import type { Metadata } from "next";
import VideoViewerClient from "./VideoViewerClient";
import { noIndexMetadata } from "@/lib/seo/metadata";

const defaultVideoId = "PPH7AQRz_Jc";

function getSafeVideoId(rawValue: string | null) {
  if (!rawValue) return defaultVideoId;
  return /^[\w-]{11}$/.test(rawValue) ? rawValue : defaultVideoId;
}

function pickFirstString(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | null {
  const v = sp[key];
  if (v === undefined) return null;
  const s = Array.isArray(v) ? v[0] : v;
  if (s === undefined || s === "") return null;
  return s;
}

function displayNameFromSlug(slug: string) {
  const decodedName = decodeURIComponent(slug);
  return decodedName.replace(/-/g, " ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ university_name: string }>;
}): Promise<Metadata> {
  const { university_name: slug } = await params;
  const displayedUniversityName = displayNameFromSlug(slug);

  return noIndexMetadata({
    title: `Video Viewer · ${displayedUniversityName}`,
    description: `Video viewer for the ${displayedUniversityName} Athletic Department`,
  });
}

export default async function VideoViewerPage({
  params,
  searchParams,
}: {
  params: Promise<{ university_name: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { university_name: slug } = await params;
  const sp = await searchParams;
  const rawVideoId = pickFirstString(sp, "video_id");
  const videoId = getSafeVideoId(rawVideoId);
  const displayedUniversityName = displayNameFromSlug(slug);

  return (
    <VideoViewerClient
      displayedUniversityName={displayedUniversityName}
      videoId={videoId}
    />
  );
}
