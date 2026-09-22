import type { GolfAuctionPublic } from "@/services/getGolfOutingPublic";

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
    <section className="py-12">
      <h2 className="mb-6 text-3xl font-bold text-[#1c315f]">Silent auction</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.auction_item_id} className="rounded-lg border bg-white p-4">
            <h3 className="font-semibold text-[#1c315f]">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.item_status} · closes {String(item.closes_at)}</p>
            <p className="mt-2">
              High bid ${(((item.high_bid_cents || item.starting_bid_cents) || 0) / 100).toFixed(0)}
              {item.fmv_cents ? ` · FMV $${(item.fmv_cents / 100).toFixed(0)}` : ""}
            </p>
            <a
              href={MEMBERS_AUCTION(slug)}
              className="mt-3 inline-block rounded-full bg-[#1c315f] px-4 py-2 text-white"
            >
              Bid on members site
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
