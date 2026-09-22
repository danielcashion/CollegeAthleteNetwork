import { NextRequest, NextResponse } from "next/server";
import { assertPublishedOuting, clientKey, rateLimit } from "../_public";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!rateLimit(clientKey(request, body.purchaser_email))) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }
  const event = await assertPublishedOuting(body.event_id);
  if (!event || event.event_status !== "PUBLISHED") {
    return NextResponse.json({ error: "Registration is not open" }, { status: 400 });
  }
  return NextResponse.json(
    {
      error: "Sign in on the members site to register. Golf stored procedures require a logged-in member_id.",
      login: event.public_url_slug
        ? `https://members.collegeathletenetwork.org/golf/${event.public_url_slug}/register`
        : "https://members.collegeathletenetwork.org",
    },
    { status: 401 }
  );
}
