import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readReceiptToken } from "@/lib/receipts/token";
import { getPublicGolfOrder, getPublicGolfOrderItems, getGolfOutingById } from "@/services/getGolfOutingPublic";
import { PrintReceiptButton } from "./PrintReceiptButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Receipt",
  robots: { index: false, follow: false },
};

function money(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function methodLabel(method?: string | null) {
  switch (String(method || "").toLowerCase()) {
    case "venmo":
      return "Venmo";
    case "card":
      return "Card";
    case "applepay":
      return "Apple Pay";
    case "cash":
      return "Cash";
    case "check":
      return "Check";
    case "paypal":
      return "PayPal";
    default:
      return method?.trim() || "Payment";
  }
}

function paidOn(value?: string | null) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date());
  }
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

export default async function ReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const claim = await readReceiptToken(token);
  if (!claim) notFound();
  const order = await getPublicGolfOrder(claim.orderId);
  if (!order) notFound();
  const [items, outing] = await Promise.all([
    getPublicGolfOrderItems(order.order_id),
    getGolfOutingById(order.event_id),
  ]);
  const lines =
    items.length > 0
      ? items.map((item) => ({
          description: item.description || item.item_type || "Payment",
          amount: Number(item.line_total_cents ?? item.unit_price_cents ?? 0),
        }))
      : [{ description: outing?.event_name || "Door payment", amount: Number(order.total_cents || 0) }];
  const when = paidOn((order as { created_at?: string | null }).created_at);
  const venue = [outing?.venue_name, outing?.venue_city, outing?.venue_state].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-[#F4F6FB] px-5 py-8 pb-28 text-[#1C315F] print:bg-white print:px-0 print:py-0 print:pb-0">
      <article className="mx-auto w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_rgba(28,49,95,0.12)] print:max-w-none print:rounded-none print:shadow-none">
        <header className="bg-[#1C315F] px-7 pb-8 pt-8 text-[#F6F1E7]">
          <img
            src="https://www.collegeathletenetwork.org/Logos/CANLogo1200x1200White.png"
            alt="The College Athlete Network"
            className="mb-5 h-16 w-16"
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C6A15B]">Official receipt</p>
          <h1 className="mt-3 text-[32px] font-semibold leading-none tracking-tight">Thank you</h1>
          <p className="mt-3 text-base leading-6 text-[#F6F1E7]/80">{order.purchaser_name}</p>
        </header>
        <div className="px-7 py-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C315F]/45">Amount paid</p>
          <p className="mt-1 text-[44px] font-semibold leading-none tracking-tight">{money(Number(order.total_cents || 0))}</p>
          <p className="mt-4 text-lg font-semibold leading-6">{outing?.event_name || "Golf outing"}</p>
          {outing?.university_name ? <p className="mt-1 text-sm text-[#1C315F]/70">{outing.university_name}</p> : null}
          {venue ? <p className="mt-1 text-sm leading-5 text-[#1C315F]/70">{venue}</p> : null}

          <dl className="mt-6 divide-y divide-[#1C315F]/10 border-y border-[#1C315F]/10">
            <Row label="Date" value={when} />
            <Row label="Method" value={methodLabel(claim.method)} />
            <Row label="Order" value={String(order.order_id)} />
            {order.paypal_order_id ? <Row label="Reference" value={order.paypal_order_id} /> : null}
          </dl>

          <h2 className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C315F]/45">Details</h2>
          <ul className="mt-3 space-y-3">
            {lines.map((line) => (
              <li key={`${line.description}-${line.amount}`} className="flex items-start justify-between gap-4 text-sm">
                <span className="leading-5">{line.description}</span>
                <span className="font-semibold tabular-nums">{money(line.amount)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-[#1C315F]/15 pt-4">
            <span className="text-sm font-semibold uppercase tracking-[0.14em]">Total</span>
            <span className="text-xl font-semibold tabular-nums">{money(Number(order.total_cents || 0))}</span>
          </div>

          <p className="mt-8 text-xs leading-5 text-[#1C315F]/60">
            The College Athlete Network
            <br />
            One World Trade Center, Suite 8500, New York, NY 10007
            <br />
            admin@collegeathletenetwork.org
          </p>
        </div>
      </article>
      <PrintReceiptButton />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-sm text-[#1C315F]/60">{label}</dt>
      <dd className="text-right text-sm font-semibold">{value}</dd>
    </div>
  );
}
