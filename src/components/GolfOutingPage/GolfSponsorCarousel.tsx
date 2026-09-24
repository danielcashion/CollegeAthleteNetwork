"use client";

import type { GolfSponsorPublic } from "@/services/getGolfOutingPublic";

export default function GolfSponsorCarousel({ sponsors }: { sponsors: GolfSponsorPublic[] }) {
  const visible = sponsors.filter((sponsor) => sponsor.logo_url || sponsor.sponsor_name);
  if (visible.length === 0) return null;

  const shouldLoop = visible.length > 3;
  const logos = shouldLoop ? [...visible, ...visible] : visible;
  const duration = Math.max(32, visible.length * 7);

  return (
    <section
      aria-label="Event sponsors"
      className="relative overflow-hidden rounded-2xl bg-[#F6F1E4] shadow-[0_20px_44px_rgba(11,27,58,0.22)] ring-1 ring-[#C9A227]/35"
    >
      <style>{`
        @keyframes golf-sponsor-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .golf-sponsor-track { animation: none !important; }
        }
      `}</style>
      <span
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8A7014] via-[#E8D48B] to-[#C9A227]"
        aria-hidden="true"
      />

      <div className="relative flex flex-col lg:flex-row lg:items-stretch">
        <div className="relative shrink-0 overflow-hidden bg-[#0B1B3A] px-5 py-5 text-white lg:w-56 lg:px-6 lg:py-7">
          <span className="absolute inset-y-0 left-0 w-1.5 bg-[#C9A227]" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#C9A227]/15"
            aria-hidden="true"
          />
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#E8D48B]">Presented by</p>
          <p className="mt-2 text-2xl font-bold leading-none tracking-tight">Event</p>
          <p className="text-2xl font-bold leading-tight tracking-tight text-white/90">Sponsors</p>
          <div className="mt-4 h-px w-12 bg-[#C9A227]" />
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            {visible.length} {visible.length === 1 ? "partner" : "partners"}
          </p>
        </div>

        <div className="group min-w-0 flex-1 px-4 py-5 sm:px-6">
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
            <div
              className={`golf-sponsor-track flex items-center gap-5 py-1 group-hover:[animation-play-state:paused] ${
                shouldLoop ? "w-max" : "justify-center"
              }`}
              style={
                shouldLoop
                  ? { animation: `golf-sponsor-scroll ${duration}s linear infinite` }
                  : undefined
              }
            >
              {logos.map((sponsor, index) => (
                <div
                  key={`${sponsor.sponsor_id}-${index}`}
                  title={sponsor.sponsor_name}
                  className="flex h-[96px] w-[176px] shrink-0 items-center justify-center rounded-xl bg-white px-5 shadow-[0_8px_18px_rgba(28,49,95,0.08)] ring-1 ring-[#1C315F]/8 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(28,49,95,0.14)] hover:ring-[#C9A227]/50"
                >
                  {sponsor.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.sponsor_name}
                      className="max-h-14 w-auto max-w-[140px] object-contain"
                    />
                  ) : (
                    <span className="text-center text-sm font-bold leading-snug text-[#1C315F]">
                      {sponsor.sponsor_name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
