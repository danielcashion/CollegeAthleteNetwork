import Link from "next/link";
import { listPublicGolfOutings } from "@/services/getGolfOutingPublic";

export const metadata = {
  title: "Golf Outings",
  description: "Find published college golf outings and register or sponsor as a guest.",
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

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-16 pt-28 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Golf Outings</h1>
          <p className="mx-auto max-w-2xl text-lg">
            Search published athletic department golf outings. Register or sponsor without a members login.
          </p>
        </div>
      </section>
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <form className="mb-8 grid gap-3 rounded-lg bg-white p-4 md:grid-cols-4" method="get">
            <input className="rounded border p-3" name="university" placeholder="University" defaultValue={params.university || ""} />
            <input className="rounded border p-3" name="q" placeholder="Title or venue" defaultValue={params.q || ""} />
            <input className="rounded border p-3" type="date" name="from" defaultValue={params.from || ""} />
            <input className="rounded border p-3" type="date" name="to" defaultValue={params.to || ""} />
            <button className="rounded-full bg-[#1c315f] px-4 py-3 font-semibold text-white md:col-span-4">Search</button>
          </form>
          {outings.length === 0 ? (
            <p className="text-center text-[#1c315f]">No published golf outings match that search.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {outings.map((outing) => (
                <Link
                  key={outing.event_id}
                  href={`/golf-outing/${outing.public_url_slug}`}
                  className="overflow-hidden rounded-lg bg-white shadow"
                >
                  {outing.hero_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={outing.hero_image_url} alt="" className="h-40 w-full object-cover" />
                  )}
                  <div className="p-5 text-[#1c315f]">
                    <h2 className="text-xl font-semibold">{outing.event_name}</h2>
                    <p>{outing.university_name}</p>
                    <p className="text-sm">
                      {String(outing.event_date).slice(0, 10)} · {outing.venue_name}
                      {outing.venue_city ? `, ${outing.venue_city}` : ""}
                    </p>
                    {outing.remaining_spots != null && (
                      <p className="mt-2 text-sm">{outing.remaining_spots} spots remaining</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
