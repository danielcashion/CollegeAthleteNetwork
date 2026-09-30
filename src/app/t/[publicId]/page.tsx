import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { rateLimit } from "@/app/api/golf/_public";
import { TicketActions, TicketQr } from "@/components/tickets/TicketChrome";
import { callTicketProc } from "@/lib/tickets/gateway";
import { passFields } from "@/lib/tickets/fields";
import { ULID_PATTERN, ticketUrl } from "@/lib/tickets/token";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Event ticket",
  robots: { index: false, follow: false },
};

function unavailable(message: string) {
  return (
    <main className="min-h-screen bg-[#F6F1E7] px-6 py-16 text-[#1C315F]">
      <div className="mx-auto max-w-md rounded-3xl border border-[#1C315F]/10 bg-white px-8 py-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1C315F]/60">The College Athlete Network</p>
        <h1 className="mt-4 text-2xl font-semibold">{message}</h1>
      </div>
    </main>
  );
}

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ wallet?: string }>;
}) {
  const { publicId } = await params;
  const query = await searchParams;
  const id = publicId.trim().toUpperCase();
  if (!ULID_PATTERN.test(id)) notFound();

  const headerList = await headers();
  const agent = headerList.get("user-agent") || "";
  const platform = /iPhone|iPad|iPod/i.test(agent) ? "ios" : /Android/i.test(agent) ? "android" : "other";
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`ticket:${ip}`, 30, 10 * 60 * 1000)) {
    return unavailable("Please wait a moment and open this ticket again.");
  }

  let row;
  try {
    const rows = await callTicketProc("ticket_lookup", { public_id: id }, { secret: false });
    row = rows.find((item) => String(item.public_id || "").toUpperCase() === id) || null;
  } catch {
    row = null;
  }
  if (!row?.public_id || (row.status && row.status !== "ISSUED")) {
    return unavailable("This ticket is not available.");
  }

  const fields = passFields(row);
  const url = ticketUrl(id);
  return (
    <main className="min-h-screen bg-[#F6F1E7] px-4 py-10 text-[#1C315F]">
      <article className="mx-auto max-w-md overflow-hidden rounded-3xl border border-[#1C315F]/10 bg-white shadow-sm">
        <header className="bg-[#1C315F] px-8 py-7 text-[#F6F1E7]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A15B]">
            {fields.universityName}
          </p>
          <h1 className="mt-3 text-2xl font-semibold leading-tight">{fields.eventName}</h1>
        </header>
        <div className="px-8 py-8">
          <p className="text-sm uppercase tracking-[0.16em] text-[#1C315F]/50">Guest</p>
          <p className="mt-1 text-xl font-semibold">{fields.holderName}</p>
          <p className="mt-6 text-3xl font-semibold tracking-tight">{fields.assignment}</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="uppercase tracking-[0.14em] text-[#1C315F]/50">When</dt>
              <dd className="mt-1">{fields.whenLabel}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em] text-[#1C315F]/50">Where</dt>
              <dd className="mt-1">{fields.venue}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em] text-[#1C315F]/50">Payment</dt>
              <dd className="mt-1">{fields.paidLabel}</dd>
            </div>
          </dl>
          <div className="mt-8 flex justify-center">
            <TicketQr value={url} />
          </div>
          <p className="mt-3 text-center font-mono text-xs tracking-[0.2em] text-[#1C315F]/70">{fields.confirmationCode}</p>
          {query.wallet === "google-unavailable" ? (
            <p className="mt-4 text-center text-sm text-[#1C315F]/70">Google Wallet is not connected for this site yet.</p>
          ) : null}
          {query.wallet === "apple-unavailable" ? (
            <p className="mt-4 text-center text-sm text-[#1C315F]/70">Apple Wallet is not connected for this site yet.</p>
          ) : null}
          <TicketActions publicId={id} platform={platform} />
          <p className="mt-8 text-center text-xs text-[#1C315F]/50">Powered by The College Athlete Network</p>
        </div>
      </article>
    </main>
  );
}
