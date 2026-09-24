"use client";

import { formatCents } from "@/components/GolfOutingPage/golfOutingDisplay";

export default function GolfPaymentReceipt({
  title,
  eventName,
  universityName,
  orderId,
  amountCents,
  email,
  note,
  outingHref,
}: {
  title: string;
  eventName?: string;
  universityName?: string;
  orderId?: string | number;
  amountCents?: number;
  email?: string;
  note?: string;
  outingHref?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1C315F]/10 bg-white text-[#1C315F] shadow-xl">
      <div className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] px-6 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
          {universityName || "The College Athlete Network"}
        </p>
        <p className="mt-1 text-xl font-bold">{title}</p>
      </div>
      <div className="px-6 py-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1C315F]/8 text-2xl text-[#1C315F]">
          ✓
        </div>
        <p className="mt-4 text-center text-2xl font-bold">Thank you</p>
        <p className="mt-1 text-center text-sm text-[#1C315F]/70">
          Your payment was received and this reservation is confirmed.
        </p>
        {amountCents ? (
          <p className="mt-4 text-center text-3xl font-bold text-[#ED3237]">{formatCents(amountCents)}</p>
        ) : null}
        <dl className="mt-6 divide-y divide-[#1C315F]/10 rounded-xl border border-[#1C315F]/10 bg-[#f9faf8]">
          {eventName ? (
            <div className="flex items-start justify-between gap-4 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#1C315F]/55">Event</dt>
              <dd className="text-right text-sm font-semibold">{eventName}</dd>
            </div>
          ) : null}
          {orderId ? (
            <div className="flex items-start justify-between gap-4 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#1C315F]/55">Order</dt>
              <dd className="text-right text-sm font-semibold">#{String(orderId)}</dd>
            </div>
          ) : null}
          {email ? (
            <div className="flex items-start justify-between gap-4 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#1C315F]/55">Receipt</dt>
              <dd className="break-all text-right text-sm font-semibold">{email}</dd>
            </div>
          ) : null}
        </dl>
        <p className="mt-4 text-center text-sm text-[#1C315F]/70">
          A receipt will be sent to {email || "the email on this order"}.
        </p>
        {note ? <p className="mt-2 text-center text-sm text-[#1C315F]/70">{note}</p> : null}
        {outingHref ? (
          <button
            type="button"
            onClick={() => {
              window.location.assign(outingHref);
            }}
            className="mt-6 block w-full rounded-full bg-[#1C315F] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#ED3237]"
          >
            Back to the outing
          </button>
        ) : null}
      </div>
    </div>
  );
}
