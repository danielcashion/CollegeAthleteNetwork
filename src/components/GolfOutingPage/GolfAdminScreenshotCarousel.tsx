import type { ReactNode } from "react";

const SHOTS = [
  {
    workflow: "Setup",
    title: "Create the outing",
    url: "members.collegeathletenetwork.org/admin/golf-outings/new",
    body: (
      <>
        <AdminHeader title="Create golf outing" status="Draft" tabs="setup" />
        <div className="space-y-1.5 p-2">
          <p className="text-[8px] font-semibold uppercase tracking-wide text-[#1C315F]/45">Step 1 of 5 · Details</p>
          <div className="grid grid-cols-5 gap-1">
            {["Details", "Tickets", "Sponsors", "Auction", "Review"].map((step, index) => (
              <div
                key={step}
                className={`rounded px-1 py-1 ${index === 0 ? "bg-[#0B1B3A] text-white" : "bg-white text-[#1C315F]/55"}`}
              >
                <p className="truncate text-[7px] font-semibold">{step}</p>
              </div>
            ))}
          </div>
          <Field label="Outing name" value="2026 Athletic Department Golf Outing" />
          <div className="grid grid-cols-2 gap-1">
            <Field label="Event date" value="October 5, 2026" />
            <Field label="Venue" value="University Club" />
          </div>
        </div>
      </>
    ),
  },
  {
    workflow: "Setup",
    title: "Registration tickets",
    url: "members.collegeathletenetwork.org/admin/golf-outings/…/setup",
    body: (
      <>
        <AdminHeader title="2026 Athletic Department Golf Outing" status="Draft" tabs="setup" />
        <Panel title="Registration">
          <Row name="Individual golfer" meta="Golfer details required" price="$175" />
          <Row name="Foursome" meta="Four golfers · team name" price="$600" />
          <Row name="Dinner only" meta="No tee time" price="$85" />
        </Panel>
      </>
    ),
  },
  {
    workflow: "Setup",
    title: "Sponsorship packages",
    url: "members.collegeathletenetwork.org/admin/golf-outings/…/setup",
    body: (
      <>
        <AdminHeader title="2026 Athletic Department Golf Outing" status="Draft" tabs="setup" />
        <Panel title="Sponsorships">
          <Row name="Gold" meta="Foursome · tee sign · public logo" price="$5,000" accent="#C9A227" />
          <Row name="Silver" meta="Tee-box signage · public logo" price="$2,500" accent="#94A3B8" />
          <Row name="Bronze" meta="Logo on the outing page" price="$1,000" accent="#B45309" />
        </Panel>
      </>
    ),
  },
  {
    workflow: "Setup",
    title: "Silent auction",
    url: "members.collegeathletenetwork.org/admin/golf-outings/…/setup",
    body: (
      <>
        <AdminHeader title="2026 Athletic Department Golf Outing" status="Draft" tabs="setup" />
        <Panel title="Auction items">
          <Row name="Signed football" meta="Silent · 12 bids" price="$240" />
          <Row name="Four club seats" meta="Silent · 6 bids" price="$180" />
          <Row name="Live: weekend stay" meta="Live auction" price="$1,200" />
        </Panel>
      </>
    ),
  },
  {
    workflow: "Setup",
    title: "Review and publish",
    url: "members.collegeathletenetwork.org/admin/golf-outings/…/setup",
    body: (
      <>
        <AdminHeader title="2026 Athletic Department Golf Outing" status="Draft" tabs="setup" />
        <Panel title="Ready to publish">
          <CheckRow label="Outing details and private slug" />
          <CheckRow label="Tickets and registration window" />
          <CheckRow label="Sponsorship packages and inventory" />
          <div className="mt-2 rounded-md bg-[#0B1B3A] px-2 py-1.5 text-center text-[8px] font-semibold text-white">
            Publish guest page
          </div>
        </Panel>
      </>
    ),
  },
  {
    workflow: "Event Day",
    title: "Foursomes & starting holes",
    url: "members.collegeathletenetwork.org/admin/golf-outings/…/event-day",
    body: (
      <>
        <AdminHeader title="2026 Athletic Department Golf Outing" status="Published" tabs="event-day" />
        <Panel title="Foursomes & Starting Holes">
          <HoleRow hole={1} team="The Chen Foursome" />
          <HoleRow hole={2} team="The Patel Foursome" />
          <HoleRow hole={3} team="The Alvarez Foursome" />
        </Panel>
      </>
    ),
  },
  {
    workflow: "Event Day",
    title: "Player assignments",
    url: "members.collegeathletenetwork.org/admin/golf-outings/…/event-day",
    body: (
      <>
        <AdminHeader title="2026 Athletic Department Golf Outing" status="Published" tabs="event-day" />
        <Panel title="Player assignments">
          <PlayerRow name="Maya Chen" hole="1" status="Checked in" />
          <PlayerRow name="Jordan Patel" hole="2" status="Checked in" />
          <PlayerRow name="Sam Alvarez" hole="3" status="Not arrived" muted />
        </Panel>
      </>
    ),
  },
  {
    workflow: "Event Day",
    title: "Sponsor holes",
    url: "members.collegeathletenetwork.org/admin/golf-outings/…/event-day",
    body: (
      <>
        <AdminHeader title="2026 Athletic Department Golf Outing" status="Published" tabs="event-day" />
        <Panel title="Sponsor holes">
          <Row name="Hole 4 · Longest drive" meta="Gold · Northside Bank" price="Assigned" />
          <Row name="Hole 12 · Closest to the pin" meta="Gold · Harbor Law" price="Assigned" />
          <Row name="Hole 7 · Tee sign" meta="Silver · Metro Print" price="Assigned" />
        </Panel>
      </>
    ),
  },
] as const;

function AdminHeader({
  title,
  status,
  tabs,
}: {
  title: string;
  status: "Draft" | "Published";
  tabs: "setup" | "event-day";
}) {
  return (
    <div className="bg-[#0B1B3A] px-2.5 py-2 text-white">
      <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-[#C9A227]">Golf Outings</p>
      <div className="mt-1 flex items-center gap-1">
        <span
          className={`rounded-full px-1.5 py-px text-[7px] font-semibold ${
            status === "Published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {status}
        </span>
        <p className="truncate text-[9px] font-bold">{title}</p>
      </div>
      <div className="mt-1.5 grid grid-cols-3 gap-0.5 rounded bg-white/10 p-0.5">
        {(["Setup", "Financials", "Event Day"] as const).map((label) => {
          const active = (tabs === "setup" && label === "Setup") || (tabs === "event-day" && label === "Event Day");
          return (
            <span
              key={label}
              className={`rounded px-1 py-0.5 text-center text-[7px] font-semibold ${
                active ? "bg-white text-[#0B1B3A]" : "text-white/60"
              }`}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="m-1.5 overflow-hidden rounded-md bg-white shadow-sm">
      <div className="bg-[#0B1B3A] px-2 py-1">
        <p className="text-[8px] font-bold text-white">{title}</p>
      </div>
      <div className="space-y-1 p-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[7px] font-semibold text-[#1C315F]/55">{label}</p>
      <p className="mt-0.5 truncate rounded border border-[#1C315F]/10 bg-[#fbfbfa] px-1.5 py-1 text-[8px] text-[#1C315F]">
        {value}
      </p>
    </div>
  );
}

function Row({
  name,
  meta,
  price,
  accent,
}: {
  name: string;
  meta: string;
  price: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded border border-[#1C315F]/8 bg-[#f8f9fb] px-1.5 py-1">
      <div className="min-w-0">
        <p className="truncate text-[8px] font-bold text-[#1C315F]" style={accent ? { borderLeft: `2px solid ${accent}`, paddingLeft: 4 } : undefined}>
          {name}
        </p>
        <p className="truncate text-[7px] text-[#1C315F]/50">{meta}</p>
      </div>
      <p className="ml-1 shrink-0 text-[8px] font-bold text-[#ED3237]">{price}</p>
    </div>
  );
}

function CheckRow({ label }: { label: string }) {
  return (
    <p className="flex items-center gap-1 text-[8px] font-semibold text-[#1C315F]">
      <span className="inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-100 text-[7px] text-emerald-700">
        ✓
      </span>
      {label}
    </p>
  );
}

function HoleRow({ hole, team }: { hole: number; team: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded border border-[#1C315F]/8 bg-[#f8f9fb] px-1.5 py-1">
      <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0B1B3A] text-[8px] font-bold text-white">
        {hole}
      </span>
      <p className="truncate text-[8px] font-semibold text-[#1C315F]">{team}</p>
    </div>
  );
}

function PlayerRow({ name, hole, status, muted }: { name: string; hole: string; status: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded border border-[#1C315F]/8 bg-[#f8f9fb] px-1.5 py-1">
      <p className="truncate text-[8px] font-semibold text-[#1C315F]">{name}</p>
      <div className="flex items-center gap-1">
        <span className="text-[7px] text-[#1C315F]/50">Hole {hole}</span>
        <span
          className={`rounded-full px-1 py-px text-[7px] font-semibold ${
            muted ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

export default function GolfAdminScreenshotCarousel() {
  const frames = [...SHOTS, ...SHOTS];

  return (
    <section aria-label="Athletic department admin screenshots" className="overflow-hidden">
      <style>{`
        @keyframes golf-admin-shot-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .golf-admin-shot-track { animation: none !important; }
        }
      `}</style>
      <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div
          className="golf-admin-shot-track flex w-max gap-4 py-1 group-hover:[animation-play-state:paused]"
          style={{ animation: "golf-admin-shot-scroll 42s linear infinite" }}
        >
          {frames.map((shot, index) => (
            <figure key={`${shot.title}-${index}`} className="w-[250px] shrink-0 sm:w-[270px]">
              <div className="overflow-hidden rounded-xl border border-[#1C315F]/10 bg-[#eef0f4] shadow-[0_12px_28px_rgba(11,27,58,0.16)]">
                <div className="flex items-center gap-1.5 border-b border-black/5 bg-[#dfe3ea] px-2.5 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ED6A5E]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F4BF4F]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#61C554]" />
                  <p className="ml-1 truncate rounded bg-white/80 px-1.5 py-0.5 text-[8px] text-[#1C315F]/60">
                    {shot.url}
                  </p>
                </div>
                <div className="h-[168px] overflow-hidden bg-[#f4f6f8]">{shot.body}</div>
              </div>
              <figcaption className="mt-2 px-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C9A227]">{shot.workflow}</p>
                <p className="text-sm font-bold text-[#1C315F]">{shot.title}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
