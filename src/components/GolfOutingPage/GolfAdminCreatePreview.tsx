const STEPS = [
  { n: 1, label: "Details", state: "active" as const },
  { n: 2, label: "Registration", state: "locked" as const },
  { n: 3, label: "Sponsorships", state: "locked" as const },
  { n: 4, label: "Auction", state: "locked" as const },
  { n: 5, label: "Payments", state: "locked" as const },
  { n: 6, label: "Event day", state: "locked" as const },
  { n: 7, label: "Review", state: "locked" as const },
];

export default function GolfAdminCreatePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1C315F]/10 bg-[#eef0f4] shadow-[0_22px_50px_rgba(11,27,58,0.22)]">
      <div className="flex items-center gap-2 border-b border-black/5 bg-[#dfe3ea] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ED6A5E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#F4BF4F]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#61C554]" />
        <p className="ml-3 truncate rounded-md bg-white/80 px-3 py-1 text-[11px] font-medium text-[#1C315F]/70">
          members.collegeathletenetwork.org/admin/golf-outings/new
        </p>
      </div>

      <div className="space-y-4 bg-[#f4f6f8] p-4 sm:p-5">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1C315F]/50">
            Athletic department admin
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">
              Draft
            </span>
            <span className="text-[11px] font-medium text-[#1C315F]/55">Shotgun · scramble</span>
          </div>
          <p className="mt-2 text-xl font-bold text-[#1C315F]">Create golf outing</p>
          <p className="mt-1 text-sm text-[#1C315F]/65">
            Start with the outing details. Later steps unlock after you save.
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1C315F]/45">Step 1 of 7</p>
          <p className="mt-1 font-bold text-[#1C315F]">Details</p>
          <p className="text-xs text-[#1C315F]/55">Name, date, and venue</p>
          <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-7">
            {STEPS.map((step) => (
              <div
                key={step.label}
                className={`rounded-lg border px-1.5 py-2 ${
                  step.state === "active"
                    ? "border-[#1C315F] bg-[#1C315F]/5"
                    : "border-dashed border-[#1C315F]/15 bg-[#f8f9fb] opacity-70"
                }`}
              >
                <span
                  className={`mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    step.state === "active" ? "bg-[#1C315F] text-white" : "bg-[#1C315F]/10 text-[#1C315F]/60"
                  }`}
                >
                  {step.n}
                </span>
                <p className="truncate text-[10px] font-semibold text-[#1C315F]">{step.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="font-bold text-[#1C315F]">Outing Identity Information</p>
          <p className="mt-1 text-xs text-[#1C315F]/55">
            This is what alumni and guests will see on the public registration page.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-[#1C315F]/70">
              Outing name
              <span className="mt-1.5 block rounded-lg border border-[#1C315F]/15 bg-[#fbfbfa] px-3 py-2 text-sm font-normal text-[#1C315F]">
                2026 Athletic Department Golf Outing
              </span>
            </label>
            <label className="block text-xs font-semibold text-[#1C315F]/70">
              Public page slug
              <span className="mt-1.5 block rounded-lg border border-[#1C315F]/15 bg-[#fbfbfa] px-3 py-2 text-sm font-normal text-[#1C315F]">
                your-university-golf-outing
              </span>
            </label>
            <label className="block text-xs font-semibold text-[#1C315F]/70">
              Event date
              <span className="mt-1.5 block rounded-lg border border-[#1C315F]/15 bg-[#fbfbfa] px-3 py-2 text-sm font-normal text-[#1C315F]">
                October 4, 2026
              </span>
            </label>
            <label className="block text-xs font-semibold text-[#1C315F]/70">
              Venue
              <span className="mt-1.5 block rounded-lg border border-[#1C315F]/15 bg-[#fbfbfa] px-3 py-2 text-sm font-normal text-[#1C315F]">
                University Club
              </span>
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <span className="rounded-full bg-[#1C315F] px-4 py-2 text-xs font-semibold text-white">
              Save and continue
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
