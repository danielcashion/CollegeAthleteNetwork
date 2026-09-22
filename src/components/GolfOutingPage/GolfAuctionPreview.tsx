import type { GolfAuctionPublic } from "@/services/getGolfOutingPublic";
import { formatOutingDateTime } from "./golfOutingDisplay";

const MEMBERS_AUCTION = (slug: string) =>
  `https://members.collegeathletenetwork.org/golf/${slug}/auction`;

export default function GolfAuctionPreview({
  items,
  slug,
}: {
  items: GolfAuctionPublic[];
  slug: string;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-6 text-3xl font-bold text-[#1c315f]">Silent auction</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.auction_item_id} className="rounded-2xl bg-white p-6 shadow-md">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#1c315f]/60">
              {item.item_status === "LIVE" ? "Live bidding" : "Auction ended"}
            </p>
            <h3 className="text-xl font-bold text-[#1c315f]">{item.title}</h3>
            <p className="mt-2 text-sm text-[#1c315f]/70">
              Closes {formatOutingDateTime(item.closes_at)}
            </p>
            <p className="mt-4 text-2xl font-bold text-[#ED3237]">
              ${(((item.high_bid_cents || item.starting_bid_cents) || 0) / 100).toFixed(0)}
              <span className="ml-2 text-sm font-medium text-[#1c315f]/70">
                {item.high_bid_cents ? "high bid" : "starting bid"}
              </span>
            </p>
            {item.fmv_cents ? (
              <p className="text-sm text-[#1c315f]/60">FMV ${(item.fmv_cents / 100).toFixed(0)}</p>
            ) : null}
            <a
              href={MEMBERS_AUCTION(slug)}
              className="mt-5 inline-block rounded-full bg-[#1C315F] px-5 py-2 font-semibold text-white transition duration-200 hover:bg-[#ED3237]"
            >
              Bid on the members site
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
