import type { GolfAuctionPublic } from "@/services/getGolfOutingPublic";
import { auctionPhotoUrls, formatCents } from "./golfOutingDisplay";

const MEMBERS_AUCTION = (slug: string) =>
  `https://members.collegeathletenetwork.org/golf/${slug}/auction`;

function auctionTypeOf(item: GolfAuctionPublic): "silent" | "live" {
  return item.auction_type === "live" ? "live" : "silent";
}

export default function GolfAuctionPreview({
  items,
  slug,
}: {
  items: GolfAuctionPublic[];
  slug: string;
}) {
  if (items.length === 0) {
    return <p className="text-[#1c315f]/70">Auction items will appear here when they are published.</p>;
  }

  const silent = items.filter((item) => auctionTypeOf(item) === "silent");
  const live = items.filter((item) => auctionTypeOf(item) === "live");

  return (
    <div className="space-y-12">
      <AuctionGroup
        title="Silent auction"
        description="Bid online before the outing. High bids update on the members site."
        empty="No silent auction items have been published yet."
        items={silent}
        slug={slug}
      />
      <AuctionGroup
        title="Live auction"
        description="Items called from the floor on event day."
        empty="No live auction items have been published yet."
        items={live}
        slug={slug}
      />
    </div>
  );
}

function AuctionGroup({
  title,
  description,
  empty,
  items,
  slug,
}: {
  title: string;
  description: string;
  empty: string;
  items: GolfAuctionPublic[];
  slug: string;
}) {
  return (
    <section>
      <h2 className="text-3xl font-bold text-[#1c315f]">{title}</h2>
      <p className="mt-2 text-[#1c315f]/70">{description}</p>
      {items.length === 0 ? (
        <p className="mt-6 text-sm text-[#1c315f]/60">{empty}</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {items.map((item) => (
            <AuctionItemCard key={item.auction_item_id} item={item} slug={slug} />
          ))}
        </div>
      )}
    </section>
  );
}

function AuctionItemCard({ item, slug }: { item: GolfAuctionPublic; slug: string }) {
  const photos = auctionPhotoUrls(item.photo_urls);
  const currentBid = item.high_bid_cents || item.starting_bid_cents;

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-md">
      {photos[0] ? (
        <div className="grid grid-cols-3 gap-1 bg-gray-100">
          {photos.slice(0, 3).map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt=""
              className={`h-40 w-full object-cover ${photos.length === 1 ? "col-span-3" : photos.length === 2 ? "col-span-1 first:col-span-2" : ""}`}
            />
          ))}
        </div>
      ) : null}
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1c315f]/60">
          {item.item_status === "ENDED" ? "Auction ended" : auctionTypeOf(item) === "live" ? "Live auction" : "Silent auction"}
        </p>
        <h3 className="mt-1 text-xl font-bold text-[#1c315f]">{item.title}</h3>
        <p className="mt-1 text-sm text-[#1c315f]/70">
          {item.donor_name ? `Donated by ${item.donor_name}` : "Donor to be announced"}
        </p>
        {item.description_html ? (
          <div
            className="prose mt-4 max-w-none text-sm text-[#1c315f]/80"
            dangerouslySetInnerHTML={{ __html: item.description_html }}
          />
        ) : null}
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-bold text-[#ED3237]">{formatCents(currentBid)}</p>
            <p className="text-sm text-[#1c315f]/60">
              {item.high_bid_cents ? "Current high bid" : "Starting bid"}
              {item.min_increment_cents
                ? ` · ${formatCents(item.min_increment_cents)} increments`
                : ""}
            </p>
          </div>
          {item.item_status !== "ENDED" && (
            <a
              href={MEMBERS_AUCTION(slug)}
              className="rounded-full bg-[#1C315F] px-5 py-2 font-semibold text-white transition duration-200 hover:bg-[#ED3237]"
            >
              Bid on the members site
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
