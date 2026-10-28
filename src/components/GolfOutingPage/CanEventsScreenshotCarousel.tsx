"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const SCREENSHOTS = [
  {
    src: "/images/can-events/01-find-your-event.png",
    title: "Find your event",
    caption: "Open the right outing or dinner in seconds.",
  },
  {
    src: "/images/can-events/02-manage-the-event.png",
    title: "Manage the event",
    caption: "Registrations, sponsors, and auction in one place.",
  },
  {
    src: "/images/can-events/03-registrations.png",
    title: "Registrations",
    caption: "See who is coming and what they purchased.",
  },
  {
    src: "/images/can-events/04-payments.png",
    title: "On-the-spot payments",
    caption: "Take payment in-app — no separate card reader.",
  },
  {
    src: "/images/can-events/05-walk-ups.png",
    title: "Walk-ups & check-in",
    caption: "Check in guests and assign starting holes.",
  },
  {
    src: "/images/can-events/06-receipts.png",
    title: "Receipts",
    caption: "Confirmations and audit-friendly records.",
  },
] as const;

type Screenshot = (typeof SCREENSHOTS)[number];

export default function CanEventsScreenshotCarousel() {
  const [expanded, setExpanded] = useState<Screenshot | null>(null);

  useEffect(() => {
    if (!expanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(null);
    };

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  return (
    <>
      <p className="mb-3 text-center text-xs text-[#1C315F]/55 sm:text-left">
        Tap a screenshot to view full size
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {SCREENSHOTS.map((shot) => (
          <li key={shot.src}>
            <button
              type="button"
              onClick={() => setExpanded(shot)}
              className="group flex w-full flex-col items-center rounded-xl border border-[#1C315F]/10 bg-white p-2.5 text-center transition hover:border-[#1C315F]/25 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C315F]"
            >
              <div className="relative w-full max-w-[108px] overflow-hidden rounded-[0.85rem] border-[5px] border-[#0B1B3A] bg-[#0B1B3A] shadow-sm transition group-hover:shadow-md sm:max-w-[118px]">
                <div className="relative aspect-[9/19.5] w-full bg-[#f4f6f8]">
                  <Image
                    src={shot.src}
                    alt=""
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 45vw, 118px"
                  />
                </div>
              </div>
              <span className="mt-2 text-xs font-bold text-[#1C315F]">{shot.title}</span>
              <span className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#1C315F]/65">
                {shot.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {expanded ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${expanded.title} screenshot`}
        >
          <div className="absolute inset-0 bg-[#0B1B3A]/85" aria-hidden />
          <div className="relative z-10 flex max-h-full max-w-full flex-col items-center">
            <button
              type="button"
              onClick={() => setExpanded(null)}
              className="absolute -top-1 right-0 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1C315F] shadow-lg transition hover:bg-[#ED3237] hover:text-white sm:-right-2 sm:-top-2"
              aria-label="Close screenshot"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="max-h-[85vh] overflow-hidden rounded-2xl border-[6px] border-[#0B1B3A] bg-[#0B1B3A] shadow-2xl">
              <Image
                src={expanded.src}
                alt={expanded.title}
                width={390}
                height={844}
                className="h-auto max-h-[85vh] w-auto max-w-[min(100vw-2rem,390px)] object-contain"
                priority
              />
            </div>
            <p className="mt-3 text-center text-sm font-semibold text-white">{expanded.title}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
