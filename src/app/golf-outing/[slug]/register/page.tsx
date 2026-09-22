import { notFound } from "next/navigation";
import GolfRegisterForm from "@/components/GolfOutingPage/GolfRegisterForm";
import { getPublicGolfOutingBySlug, listPublicTickets } from "@/services/getGolfOutingPublic";

export default async function PublicGolfRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublicGolfOutingBySlug(slug);
  if (!event) notFound();
  const tickets = await listPublicTickets(event.event_id);

  return (
    <div className="min-h-screen bg-gray-100 pb-16 pt-28">
      <div className="container mx-auto px-4">
        <h1 className="mb-2 text-center text-3xl font-bold text-[#1c315f]">Register · {event.event_name}</h1>
        <p className="mb-8 text-center text-[#1c315f]">{event.venue_name} · {String(event.event_date).slice(0, 10)}</p>
        <GolfRegisterForm event={event} tickets={tickets} />
      </div>
    </div>
  );
}
