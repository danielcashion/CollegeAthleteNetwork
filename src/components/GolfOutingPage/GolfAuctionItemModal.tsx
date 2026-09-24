"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import toast from "react-hot-toast";
import type { GolfAuctionPublic } from "@/services/getGolfOutingPublic";
import {
  auctionPhotoUrls,
  formatCents,
  formatOutingDateTime,
  formatUsPhone,
  isValidUsPhone,
  nextAuctionBidCents,
  normalizeUsPhone,
  obfuscateBidderName,
} from "./golfOutingDisplay";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-[#1C315F]/15 bg-[#fbfbfa] px-3.5 py-2.5 text-sm text-[#1C315F] outline-none transition placeholder:text-[#1C315F]/35 focus:border-[#1C315F] focus:bg-white focus:ring-2 focus:ring-[#1C315F]/10";

function bidderStorageKey(eventId: string) {
  return `golf-bidder:${eventId}`;
}

function readStoredBidder(eventId: string) {
  if (typeof window === "undefined") return { name: "", phone: "" };
  try {
    const parsed = JSON.parse(sessionStorage.getItem(bidderStorageKey(eventId)) || "{}");
    return {
      name: String(parsed.name || ""),
      phone: formatUsPhone(parsed.phone || ""),
    };
  } catch {
    return { name: "", phone: "" };
  }
}

function auctionTypeOf(item: GolfAuctionPublic): "silent" | "live" {
  return item.auction_type === "live" ? "live" : "silent";
}

export default function GolfAuctionItemModal({
  item,
  eventId,
  eventName,
  timezone,
  onClose,
  onItemUpdate,
}: {
  item: GolfAuctionPublic;
  eventId: string;
  eventName?: string;
  timezone?: string | null;
  onClose: () => void;
  onItemUpdate: (item: GolfAuctionPublic) => void;
}) {
  const photos = auctionPhotoUrls(item.photo_urls);
  const silent = auctionTypeOf(item) === "silent";
  const canBid = silent && item.item_status === "LIVE";
  const currentBid = item.high_bid_cents || item.starting_bid_cents;
  const minimum = nextAuctionBidCents(item);
  const stored = useMemo(() => readStoredBidder(eventId), [eventId]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [name, setName] = useState(stored.name);
  const [phone, setPhone] = useState(stored.phone);
  const [confirmPhone, setConfirmPhone] = useState(stored.phone);
  const [bidDollars, setBidDollars] = useState(String(Math.round(minimum / 100)));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setBidDollars(String(Math.round(minimum / 100)));
  }, [minimum, item.auction_item_id]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function submitBid() {
    const bidAmountCents = Math.round(Number(bidDollars) * 100);
    if (!name.trim()) {
      setError("Enter the name we'll show if you have the high bid.");
      return;
    }
    if (!isValidUsPhone(phone) || normalizeUsPhone(phone) !== normalizeUsPhone(confirmPhone)) {
      setError("Enter and confirm the same 10-digit mobile number.");
      return;
    }
    if (!Number.isFinite(bidAmountCents) || bidAmountCents < minimum) {
      setError(`Bid at least ${formatCents(minimum)}.`);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/golf/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          auction_item_id: item.auction_item_id,
          bidder_name: name.trim(),
          bidder_phone: normalizeUsPhone(phone),
          bid_amount_cents: bidAmountCents,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Could not place bid");
      sessionStorage.setItem(
        bidderStorageKey(eventId),
        JSON.stringify({ name: name.trim(), phone: normalizeUsPhone(phone) })
      );
      if (data.item) onItemUpdate(data.item);
      toast.success("Your bid is in. We'll text this number to confirm in a later step.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place bid");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[#0B1B3A]/55 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auction-modal-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative shrink-0 overflow-hidden bg-[#1C315F] px-6 py-5">
          <span className="absolute inset-y-0 left-0 w-1.5 bg-[#C9A227]" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
                {item.item_status === "ENDED" ? "Auction ended" : silent ? "Silent auction" : "Live auction"}
              </p>
              <h3 id="auction-modal-title" className="mt-1 text-xl font-bold text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-white/70">
                {eventName ? `${eventName} · ` : ""}
                {item.high_bid_cents ? "High bid" : "Starting bid"} {formatCents(currentBid)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          {photos.length > 0 ? (
            <div>
              <div className="relative overflow-hidden rounded-xl bg-[#f4f5f2]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[photoIndex]}
                  alt={item.title}
                  className="max-h-80 w-full object-contain"
                />
                {photos.length > 1 ? (
                  <>
                    <button
                      type="button"
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#1C315F] shadow"
                      onClick={() => setPhotoIndex((index) => (index === 0 ? photos.length - 1 : index - 1))}
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#1C315F] shadow"
                      onClick={() => setPhotoIndex((index) => (index === photos.length - 1 ? 0 : index + 1))}
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                ) : null}
              </div>
              {photos.length > 1 ? (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {photos.map((url, index) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setPhotoIndex(index)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                        index === photoIndex ? "border-[#1C315F]" : "border-transparent"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-3 rounded-xl border border-[#1C315F]/10 bg-[#f9faf8] p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1C315F]/55">
                {item.high_bid_cents ? "Current high bid" : "Starting bid"}
              </p>
              <p className="mt-1 text-2xl font-bold text-[#ED3237]">{formatCents(currentBid)}</p>
              <p className="mt-1 text-sm text-[#1C315F]/70">
                {item.high_bidder_name
                  ? `Leading bidder ${obfuscateBidderName(item.high_bidder_name)}`
                  : item.high_bid_cents
                    ? "Leading bidder on file"
                    : "Be the first bid"}
              </p>
            </div>
            <div className="text-sm text-[#1C315F]/75">
              {item.fmv_cents ? <p>Estimated value {formatCents(item.fmv_cents)}</p> : null}
              {item.min_increment_cents ? <p>Increments of {formatCents(item.min_increment_cents)}</p> : null}
              {item.closes_at ? <p>Closes {formatOutingDateTime(item.closes_at, timezone)}</p> : null}
              <p className="mt-1">
                {Number(item.is_anonymous_YN) === 1 || item.donor_name?.toLowerCase() === "anonymous"
                  ? "Donated by Anonymous"
                  : item.donor_name
                    ? `Donated by ${item.donor_name}`
                    : "Donor to be announced"}
              </p>
            </div>
          </div>

          {item.description_html ? (
            <div
              className="prose max-w-none text-sm text-[#1C315F]/80"
              dangerouslySetInnerHTML={{ __html: item.description_html }}
            />
          ) : null}

          {canBid ? (
            <form
              className="space-y-4 rounded-xl border border-[#1C315F]/10 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void submitBid();
              }}
            >
              <div>
                <p className="text-sm font-semibold text-[#1C315F]">Place a bid</p>
                <p className="mt-1 text-sm text-[#1C315F]/65">
                  Minimum {formatCents(minimum)}. We&apos;ll text this mobile number to confirm the bid
                  in a later step.
                </p>
              </div>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1C315F]/55">
                  Your bid
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-[1.15rem] text-sm font-semibold text-[#1C315F]/45">
                    $
                  </span>
                  <input
                    className={`${fieldClass} pl-7`}
                    inputMode="decimal"
                    value={bidDollars}
                    onChange={(event) => setBidDollars(event.target.value.replace(/[^0-9.]/g, ""))}
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1C315F]/55">
                  Full name
                </span>
                <input
                  className={fieldClass}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name shown on the bid"
                  autoComplete="name"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1C315F]/55">
                    Mobile number
                  </span>
                  <input
                    className={fieldClass}
                    value={phone}
                    onChange={(event) => setPhone(formatUsPhone(event.target.value))}
                    placeholder="(555) 555-5555"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1C315F]/55">
                    Confirm mobile number
                  </span>
                  <input
                    className={fieldClass}
                    value={confirmPhone}
                    onChange={(event) => setConfirmPhone(formatUsPhone(event.target.value))}
                    placeholder="(555) 555-5555"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>
              </div>
              {error ? <p className="text-sm text-[#ED3237]">{error}</p> : null}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#1C315F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ED3237] disabled:opacity-60"
              >
                {submitting ? "Placing bid…" : `Bid ${formatCents(Math.round(Number(bidDollars || 0) * 100) || minimum)}`}
              </button>
            </form>
          ) : (
            <p className="rounded-xl bg-[#1C315F]/5 px-4 py-3 text-sm text-[#1C315F]/75">
              {silent
                ? "Bidding is closed for this item."
                : "This item will be called from the floor on event day. Online bids are not accepted."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
