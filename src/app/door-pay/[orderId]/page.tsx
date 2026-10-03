import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DoorPayCheckout } from "./DoorPayCheckout";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Apple Pay",
  robots: { index: false, follow: false },
};

const ORDER_ID = /^[A-Za-z0-9]{10,22}$/;
const CLIENT_ID = /^[A-Za-z0-9_-]{20,200}$/;

export default async function DoorPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ client?: string; amount?: string; event?: string; guest?: string }>;
}) {
  const { orderId } = await params;
  const query = await searchParams;
  const clientId = String(query.client || "");
  const amount = String(query.amount || "");
  if (!ORDER_ID.test(orderId) || !CLIENT_ID.test(clientId) || !/^\d+\.\d{2}$/.test(amount)) notFound();
  return (
    <DoorPayCheckout
      clientId={clientId}
      orderId={orderId}
      amountLabel={`$${amount}`}
      eventName={String(query.event || "College Athlete Network").slice(0, 120)}
      guestName={String(query.guest || "").slice(0, 120)}
    />
  );
}
