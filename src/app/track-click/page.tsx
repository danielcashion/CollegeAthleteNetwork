import TrackClickClient, { type TrackClickQuery } from "./TrackClickClient";

function queryValue(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | null {
  const raw = sp[key];
  if (raw === undefined) return null;
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === undefined || v === "") return null;
  return v;
}

function toTrackClickQuery(
  sp: Record<string, string | string[] | undefined>
): TrackClickQuery {
  return {
    university_name: queryValue(sp, "university_name"),
    destination: queryValue(sp, "destination"),
    file_name: queryValue(sp, "file_name"),
    video_id: queryValue(sp, "video_id"),
    row_id: queryValue(sp, "row_id"),
    campaign_id: queryValue(sp, "campaign_id"),
    survey_id: queryValue(sp, "survey_id"),
    email_address: queryValue(sp, "email_address"),
  };
}

export default async function TrackClickPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  return <TrackClickClient {...toTrackClickQuery(sp)} />;
}
