import MediaViewerClient from "./MediaViewerClient";
import { noIndexMetadata } from "@/lib/seo/metadata";

function displayNameFromSlug(slug: string) {
  return decodeURIComponent(slug).replace(/-/g, " ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ university_name: string }>;
}) {
  const { university_name } = await params;
  const displayedUniversityName = displayNameFromSlug(university_name);
  return noIndexMetadata({
    title: `Media Viewer · ${displayedUniversityName}`,
    description: `Media viewer for the ${displayedUniversityName} Athletic Department`,
  });
}

export default async function MediaViewerPage({
  params,
  searchParams,
}: {
  params: Promise<{ university_name: string }>;
  searchParams: Promise<{ file?: string }>;
}) {
  const { university_name } = await params;
  const { file } = await searchParams;
  const displayedUniversityName = displayNameFromSlug(university_name);

  return (
    <MediaViewerClient
      displayedUniversityName={displayedUniversityName}
      file={file || null}
    />
  );
}
