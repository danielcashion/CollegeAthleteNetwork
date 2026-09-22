"use client";

import type { GolfSponsorPublic } from "@/services/getGolfOutingPublic";

export default function GolfSponsorCarousel({ sponsors }: { sponsors: GolfSponsorPublic[] }) {
  const visible = sponsors.filter((sponsor) => sponsor.logo_url || sponsor.sponsor_name);
  if (visible.length === 0) return null;
  const shouldLoop = visible.length > 2;
  const logos = shouldLoop ? [...visible, ...visible] : visible;

  return (
    <div className="min-w-0 flex-1" aria-label="Current sponsors">
      <style>{`
        @keyframes golf-sponsor-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div
          className={`flex items-center gap-8 py-1 ${shouldLoop ? "" : "justify-end pr-3"}`}
          style={shouldLoop ? { width: "max-content", animation: "golf-sponsor-scroll 32s linear infinite" } : undefined}
        >
          {logos.map((sponsor, index) => (
            <div key={`${sponsor.sponsor_id}-${index}`} className="flex h-12 shrink-0 items-center">
              {sponsor.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sponsor.logo_url}
                  alt={sponsor.sponsor_name}
                  className="h-10 w-auto max-w-[140px] object-contain"
                />
              ) : (
                <span className="whitespace-nowrap text-sm font-semibold text-[#1C315F]">{sponsor.sponsor_name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
