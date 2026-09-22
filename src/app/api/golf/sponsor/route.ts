import { NextRequest, NextResponse } from "next/server";
import { assertPublishedOuting, clientKey, rateLimit } from "../_public";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!rateLimit(clientKey(request, body.contact_email))) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }
  const event = await assertPublishedOuting(body.event_id);
  if (!event || !["PUBLISHED", "SOLD_OUT", "REGISTRATION_CLOSED"].includes(event.event_status)) {
    return NextResponse.json({ error: "Sponsorships are not available" }, { status: 400 });
  }
  return NextResponse.json(
    {
      error: "Sign in on the members site to sponsor. Golf stored procedures require a logged-in member_id.",
      login: event.public_url_slug
        ? `https://members.collegeathletenetwork.org/golf/${event.public_url_slug}/sponsor`
        : "https://members.collegeathletenetwork.org",
    },
    { status: 401 }
  );
}
