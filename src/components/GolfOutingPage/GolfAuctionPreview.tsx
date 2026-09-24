"use client";

import { useEffect, useState } from "react";
import type { GolfAuctionPublic } from "@/services/getGolfOutingPublic";
import GolfAuctionItemModal from "./GolfAuctionItemModal";
import { auctionPhotoUrls, formatCents, obfuscateBidderName } from "./golfOutingDisplay";

function auctionTypeOf(item: GolfAuctionPublic): "silent" | "live" {
  return item.auction_type === "live" ? "live" : "silent";
}

export default function GolfAuctionPreview({
  items,
  eventId,
  eventName,
  timezone,
}: {
  items: GolfAuctionPublic[];
  eventId: string;
  eventName?: string;
  timezone?: string | null;
}) {
  const [local, setLocal] = useState(items);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    setLocal(items);
  }, [items]);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const response = await fetch(`/api/golf/auction?event_id=${encodeURIComponent(eventId)}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data.items)) setLocal(data.items);
      } catch {
        // keep last snapshot
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [eventId]);

  if (local.length === 0) {
    return <p className="text-[#1c315f]/70">Auction items will appear here when they are published.</p>;
  }

  const silent = local.filter((item) => auctionTypeOf(item) === "silent");
  const live = local.filter((item) => auctionTypeOf(item) === "live");
  const selected = local.find((item) => item.auction_item_id === selectedId) || null;

  return (
    <div className="space-y-12">
      <AuctionGroup
        title="Silent auction"
        description="Bid here on the public outing page. The current high bid updates as new bids come in."
        empty="No silent auction items have been published yet."
        items={silent}
        onOpen={setSelectedId}
      />
      <AuctionGroup
        title="Live auction"
        description="Items called from the floor on event day."
        empty="No live auction items have been published yet."
        items={live}
        onOpen={setSelectedId}
      />
      {selected ? (
        <GolfAuctionItemModal
          item={selected}
          eventId={eventId}
          eventName={eventName}
          timezone={timezone}
          onClose={() => setSelectedId(null)}
          onItemUpdate={(updated) =>
            setLocal((current) =>
              current.map((item) => (item.auction_item_id === updated.auction_item_id ? updated : item))
            )
          }
        />
      ) : null}
    </div>
  );
}

function AuctionGroup({
  title,
  description,
  empty,
  items,
  onOpen,
}: {
  title: string;
  description: string;
  empty: string;
  items: GolfAuctionPublic[];
  onOpen: (id: number) => void;
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
            <AuctionItemCard key={item.auction_item_id} item={item} onOpen={() => onOpen(item.auction_item_id)} />
          ))}
        </div>
      )}
    </section>
  );
}

function AuctionItemCard({ item, onOpen }: { item: GolfAuctionPublic; onOpen: () => void }) {
  const photos = auctionPhotoUrls(item.photo_urls);
  const currentBid = item.high_bid_cents || item.starting_bid_cents;
  const silent = auctionTypeOf(item) === "silent";
  const canBid = silent && item.item_status === "LIVE";

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-md">
      {photos[0] ? (
        <button type="button" onClick={onOpen} className="grid w-full grid-cols-3 gap-1 bg-gray-100">
          {photos.slice(0, 3).map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt=""
              className={`h-40 w-full object-cover ${photos.length === 1 ? "col-span-3" : photos.length === 2 ? "col-span-1 first:col-span-2" : ""}`}
            />
          ))}
        </button>
      ) : null}
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1c315f]/60">
          {item.item_status === "ENDED" ? "Auction ended" : silent ? "Silent auction" : "Live auction"}
        </p>
        <h3 className="mt-1 text-xl font-bold text-[#1c315f]">{item.title}</h3>
        <p className="mt-1 text-sm text-[#1c315f]/70">
          {Number(item.is_anonymous_YN) === 1 || item.donor_name?.toLowerCase() === "anonymous"
            ? "Donated by Anonymous"
            : item.donor_name
              ? `Donated by ${item.donor_name}`
              : "Donor to be announced"}
        </p>
        {item.description_html ? (
          <div
            className="prose mt-4 line-clamp-3 max-w-none text-sm text-[#1c315f]/80"
            dangerouslySetInnerHTML={{ __html: item.description_html }}
          />
        ) : null}
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-bold text-[#ED3237]">{formatCents(currentBid)}</p>
            <p className="text-sm text-[#1c315f]/60">
              {item.high_bid_cents ? "Current high bid" : "Starting bid"}
              {item.high_bidder_name ? ` · ${obfuscateBidderName(item.high_bidder_name)}` : ""}
              {item.min_increment_cents ? ` · ${formatCents(item.min_increment_cents)} increments` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="rounded-full bg-[#1C315F] px-5 py-2 font-semibold text-white transition duration-200 hover:bg-[#ED3237]"
          >
            {canBid ? "Bid Now" : "View item"}
          </button>
        </div>
      </div>
    </article>
  );
}
