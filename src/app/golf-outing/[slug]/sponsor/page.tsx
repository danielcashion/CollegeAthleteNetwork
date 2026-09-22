import { notFound } from "next/navigation";
import GolfSponsorForm from "@/components/GolfOutingPage/GolfSponsorForm";
import { getPublicGolfOutingBySlug, listPublicPackages } from "@/services/getGolfOutingPublic";

export default async function PublicGolfSponsorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublicGolfOutingBySlug(slug);
  if (!event) notFound();
  const packages = await listPublicPackages(event.event_id);

  return (
    <div className="min-h-screen bg-gray-100 pb-16 pt-28">
      <div className="container mx-auto px-4">
        <h1 className="mb-2 text-center text-3xl font-bold text-[#1c315f]">Sponsor · {event.event_name}</h1>
        <p className="mb-8 text-center text-[#1c315f]">Guest checkout · PayPal or Venmo</p>
        <GolfSponsorForm event={event} packages={packages} />
      </div>
    </div>
  );
}
