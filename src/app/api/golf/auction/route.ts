import { NextRequest, NextResponse } from "next/server";
import { obfuscateBidderName } from "@/components/GolfOutingPage/golfOutingDisplay";
import { listPublicAuctionItems } from "@/services/getGolfOutingPublic";
import { assertPublishedOuting } from "../_public";

export async function GET(request: NextRequest) {
  const eventId = String(request.nextUrl.searchParams.get("event_id") || "").trim();
  if (!eventId) {
    return NextResponse.json({ error: "event_id is required" }, { status: 400 });
  }
  const event = await assertPublishedOuting(eventId);
  if (!event) {
    return NextResponse.json({ error: "Outing is not available" }, { status: 404 });
  }
  const items = await listPublicAuctionItems(eventId, { fresh: true });
  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      high_bidder_name: obfuscateBidderName(item.high_bidder_name),
    })),
  });
}
