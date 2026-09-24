import { NextRequest, NextResponse } from "next/server";
import {
  isValidUsPhone,
  nextAuctionBidCents,
  normalizeUsPhone,
  obfuscateBidderName,
} from "@/components/GolfOutingPage/golfOutingDisplay";
import { listPublicAuctionItems } from "@/services/getGolfOutingPublic";
import { assertPublishedOuting, callPublicGolfProc, clientKey, rateLimit } from "../_public";

function auctionTypeOf(value?: string | null) {
  return value === "live" ? "live" : "silent";
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const bidderName = String(body.bidder_name || "").trim();
  const bidderPhone = normalizeUsPhone(body.bidder_phone);
  const auctionItemId = Number(body.auction_item_id);
  const bidAmountCents = Math.round(Number(body.bid_amount_cents));

  if (!rateLimit(clientKey(request, bidderPhone), 8)) {
    return NextResponse.json({ error: "Too many bid attempts. Try again later." }, { status: 429 });
  }
  if (!auctionItemId || !bidderName || bidderName.length < 2) {
    return NextResponse.json({ error: "Enter your name to place a bid." }, { status: 400 });
  }
  if (!isValidUsPhone(bidderPhone)) {
    return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
  }
  if (!Number.isFinite(bidAmountCents) || bidAmountCents <= 0) {
    return NextResponse.json({ error: "Enter a valid bid amount." }, { status: 400 });
  }

  const event = await assertPublishedOuting(String(body.event_id || ""));
  if (!event) {
    return NextResponse.json({ error: "Outing is not available" }, { status: 400 });
  }

  const items = await listPublicAuctionItems(event.event_id, { fresh: true });
  const item = items.find((row) => Number(row.auction_item_id) === auctionItemId);
  if (!item) {
    return NextResponse.json({ error: "Auction item was not found" }, { status: 404 });
  }
  if (auctionTypeOf(item.auction_type) !== "silent") {
    return NextResponse.json({ error: "This item will be bid from the floor on event day." }, { status: 400 });
  }
  if (item.item_status !== "LIVE") {
    return NextResponse.json({ error: "Bidding is closed for this item." }, { status: 400 });
  }
  const minimum = nextAuctionBidCents(item);
  if (bidAmountCents < minimum) {
    return NextResponse.json({ error: `Bid at least $${(minimum / 100).toFixed(0)}` }, { status: 400 });
  }

  try {
    const result = await callPublicGolfProc<{
      bid_id: number;
      bid_amount_cents: number;
      bid_status?: string;
    }>("golf_place_bid", "", {
      auction_item_id: auctionItemId,
      bidder_name: bidderName,
      bidder_email: "",
      bidder_phone: bidderPhone,
      bid_amount_cents: bidAmountCents,
    });
    const refreshed = (await listPublicAuctionItems(event.event_id, { fresh: true })).find(
      (row) => Number(row.auction_item_id) === auctionItemId
    );
    return NextResponse.json({
      bid_id: Number(result.bid_id),
      bid_amount_cents: Number(result.bid_amount_cents || bidAmountCents),
      bid_status: result.bid_status || "ACTIVE",
      item: refreshed
        ? { ...refreshed, high_bidder_name: obfuscateBidderName(refreshed.high_bidder_name) }
        : {
            ...item,
            high_bid_cents: bidAmountCents,
            high_bidder_name: obfuscateBidderName(bidderName),
          },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not place bid" },
      { status: 400 }
    );
  }
}
