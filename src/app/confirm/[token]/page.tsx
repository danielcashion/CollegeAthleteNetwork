import { getAthleteForClaim, getStoredLinkedInProfile } from "@/lib/claim/athlete";
import { resolveClaimToken } from "@/lib/claim/token";
import { InvalidLink, Unavailable } from "../ui";
import { ConfirmFlow } from "./ConfirmFlow";

export const dynamic = "force-dynamic";

export default async function ConfirmTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  try {
    const athleteId = await resolveClaimToken(token);
    if (!athleteId) return <InvalidLink />;

    const [athlete, stored] = await Promise.all([
      getAthleteForClaim(athleteId),
      getStoredLinkedInProfile(athleteId).then(
        (profile) => ({ profile, notice: null as string | null }),
        () => ({
          profile: null,
          notice: "We couldn't load the LinkedIn profile on file. You can still paste your profile URL.",
        }),
      ),
    ]);
    if (!athlete) return <InvalidLink />;

    return (
      <ConfirmFlow
        token={token}
        athlete={athlete.photoUrl || !stored.profile?.photoUrl ? athlete : { ...athlete, photoUrl: stored.profile.photoUrl }}
        storedProfile={stored.profile}
        profileNotice={stored.notice}
      />
    );
  } catch {
    return <Unavailable retryHref={`/confirm/${encodeURIComponent(token)}`} />;
  }
}
