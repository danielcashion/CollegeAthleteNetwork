import Link from "next/link";
import { listPublicGolfOutings } from "@/services/getGolfOutingPublic";
import {
  formatOutingDate,
  outingStatusLabel,
  venueLine,
} from "@/components/GolfOutingPage/golfOutingDisplay";

export const metadata = {
  title: "Golf Outings",
  description: "Find published college athletic department golf outings and register or sponsor.",
};

export default async function GolfOutingsDirectory({
  searchParams,
}: {
  searchParams: Promise<{ university?: string; q?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const outings = await listPublicGolfOutings({
    university_name: params.university,
    q: params.q,
    date_from: params.from,
    date_to: params.to,
  });
  const hasFilters = Boolean(params.university || params.q || params.from || params.to);

  return (
    <div className="min-h-screen bg-[#f9faf8]">
      <section className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-20 pt-28 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            Athletic department events
          </p>
          <h1 className="mx-auto mb-4 max-w-[860px] text-4xl font-bold md:text-5xl">Golf Outings</h1>
          <p className="mx-auto max-w-3xl text-lg md:text-xl">
            Search published outings from college athletic departments. View details, sponsorship
            packages, and auction items — then register or bid through the members network.
          </p>
        </div>
      </section>

      <section className="container mx-auto -mt-10 px-4 pb-20">
        <form
          method="get"
          className="mb-10 rounded-2xl bg-white p-6 shadow-xl md:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <label className="block text-left text-sm font-semibold text-[#1c315f]">
              University
              <input
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-base font-normal text-[#1c315f] outline-none ring-[#1C315F] placeholder:text-gray-400 focus:border-[#1C315F] focus:ring-2"
                name="university"
                placeholder="Yale"
                defaultValue={params.university || ""}
              />
            </label>
            <label className="block text-left text-sm font-semibold text-[#1c315f]">
              Outing or venue
              <input
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-base font-normal text-[#1c315f] outline-none ring-[#1C315F] placeholder:text-gray-400 focus:border-[#1C315F] focus:ring-2"
                name="q"
                placeholder="Siwanoy, scramble…"
                defaultValue={params.q || ""}
              />
            </label>
            <label className="block text-left text-sm font-semibold text-[#1c315f]">
              From
              <input
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-base font-normal text-[#1c315f] outline-none ring-[#1C315F] focus:border-[#1C315F] focus:ring-2"
                type="date"
                name="from"
                defaultValue={params.from || ""}
              />
            </label>
            <label className="block text-left text-sm font-semibold text-[#1c315f]">
              To
              <input
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-base font-normal text-[#1c315f] outline-none ring-[#1C315F] focus:border-[#1C315F] focus:ring-2"
                type="date"
                name="to"
                defaultValue={params.to || ""}
              />
            </label>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {hasFilters && (
              <Link
                href="/golf-outings"
                className="rounded-full border border-[#1C315F] px-6 py-3 text-center font-semibold text-[#1C315F] transition duration-200 hover:bg-[#1C315F] hover:text-white"
              >
                Clear filters
              </Link>
            )}
            <button
              type="submit"
              className="rounded-full bg-[#1C315F] px-8 py-3 font-semibold text-white transition duration-200 hover:bg-[#ED3237]"
            >
              Search outings
            </button>
          </div>
        </form>

        {outings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1C315F]/20 bg-white px-8 py-16 text-center shadow-sm">
            <h2 className="mb-3 text-2xl font-bold text-[#1c315f]">No matching outings</h2>
            <p className="mx-auto max-w-xl text-[#1c315f]/80">
              No published golf outings match that search. Try another university, clear the dates,
              or browse all published events.
            </p>
            {hasFilters && (
              <Link
                href="/golf-outings"
                className="mt-6 inline-block rounded-full bg-[#1C315F] px-6 py-3 font-semibold text-white transition duration-200 hover:bg-[#ED3237]"
              >
                View all outings
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-2xl font-bold text-[#1c315f]" role="heading" aria-level={2}>
                {outings.length} published outing{outings.length === 1 ? "" : "s"}
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {outings.map((outing) => (
                <Link
                  key={outing.event_id}
                  href={`/golf-outing/${outing.public_url_slug}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-44 bg-gradient-to-br from-[#1C315F] to-[#ED3237]">
                    {outing.hero_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={outing.hero_image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-end p-6">
                        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
                          {outing.university_name}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-6 text-[#1c315f]">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#1C315F]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                        {outing.university_name}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          outing.event_status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {outingStatusLabel(outing.event_status)}
                      </span>
                    </div>
                    <h3 className="mb-2 text-2xl font-bold group-hover:text-[#ED3237]">
                      {outing.event_name}
                    </h3>
                    <p className="text-[#1c315f]/80">
                      {formatOutingDate(outing.event_date, outing.tz)}
                    </p>
                    <p className="mt-1 text-sm text-[#1c315f]/70">{venueLine(outing)}</p>
                    <div className="mt-5 flex items-center justify-between">
                      {outing.remaining_spots != null ? (
                        <p className="text-sm font-medium">
                          {outing.remaining_spots} spots remaining
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="text-sm font-semibold text-[#ED3237]">
                        View outing →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
