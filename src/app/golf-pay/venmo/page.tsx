import VenmoPayLanding from "./VenmoPayLanding";

export default async function GolfVenmoPayPage({
  searchParams,
}: {
  searchParams: Promise<{
    order_id?: string;
    paypal?: string;
    token?: string;
    email?: string;
    amount?: string;
    name?: string;
    event?: string;
    slug?: string;
  }>;
}) {
  const query = await searchParams;
  return <VenmoPayLanding query={query} />;
}
