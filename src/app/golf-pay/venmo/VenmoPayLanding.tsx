"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import GolfPaymentReceipt from "@/components/checkout/GolfPaymentReceipt";
import { formatCents } from "@/components/GolfOutingPage/golfOutingDisplay";

type OrderInfo = {
  order_id: number;
  order_status: string;
  total_cents: number;
  purchaser_email: string;
  purchaser_name?: string | null;
};

export default function VenmoPayLanding({
  query,
}: {
  query: {
    order_id?: string;
    paypal?: string;
    token?: string;
    email?: string;
    amount?: string;
    name?: string;
    event?: string;
    university?: string;
    slug?: string;
  };
}) {
  const orderId = Number(query.order_id);
  const paypalId = query.token || query.paypal || "";
  const outingHref = query.slug ? `/golf-outing/${query.slug}` : "/golf-outings";
  const captured = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "paying" | "paid" | "error">("loading");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (orderId) {
        try {
          const response = await fetch(`/api/golf/paypal/status?order_id=${orderId}`, { cache: "no-store" });
          const data = await response.json();
          if (!cancelled && response.ok && !data.error) {
            setOrder(data);
            if (data.order_status === "PAID") {
              setStatus("paid");
              return;
            }
          }
        } catch {
          // fall through to capture or ready
        }
      }
      if (cancelled) return;
      if (query.token && orderId) {
        if (captured.current) return;
        captured.current = true;
        setStatus("paying");
        try {
          const response = await fetch("/api/golf/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderID: query.token,
              golfData: {
                order_id: orderId,
                amount: Number(query.amount) || undefined,
                purchaser_email: query.email,
                purchaser_name: query.name,
                payment_method: "venmo",
                category: "GOLF",
              },
            }),
          });
          const data = await response.json();
          if (!response.ok || data.error) throw new Error(data.error || "Capture failed");
          if (!cancelled) setStatus("paid");
        } catch (err) {
          if (!cancelled) {
            setStatus("error");
            setError(err instanceof Error ? err.message : "Payment failed");
          }
        }
        return;
      }
      if (!cancelled) setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, query.amount, query.email, query.name, query.token]);

  const amount = order?.total_cents || Number(query.amount) || 0;
  const email = order?.purchaser_email || query.email || "";
  const eventName = query.event || "Golf outing";

  return (
    <div className="min-h-screen bg-[#f9faf8]">
      <section className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-12 pt-28 text-white">
        <div className="container mx-auto px-4">
          <Link href={outingHref} className="mb-4 inline-block text-sm font-semibold text-white/80 hover:text-white">
            ← Back to outing
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Secure payment</p>
          <h1 className="mb-2 mt-2 text-4xl font-bold">{status === "paid" ? "Payment confirmed" : "Complete payment"}</h1>
          <p className="text-lg">{eventName}</p>
        </div>
      </section>
      <div className="container mx-auto max-w-lg px-4 py-10">
        {status === "paid" ? (
          <GolfPaymentReceipt
            title="Payment confirmed"
            eventName={eventName}
            universityName={query.university}
            orderId={orderId || order?.order_id}
            amountCents={amount}
            email={email}
            outingHref={outingHref}
          />
        ) : (
          <div className="rounded-2xl border border-[#1C315F]/10 bg-white p-6 text-[#1C315F] shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1C315F]/60">Order {orderId || "—"}</p>
            <p className="mt-2 text-2xl font-bold">{eventName}</p>
            {amount ? <p className="mt-1 text-3xl font-bold text-[#ED3237]">{formatCents(amount)}</p> : null}
            {email ? <p className="mt-2 text-sm text-[#1C315F]/70">{email}</p> : null}
            {status === "loading" || status === "paying" ? (
              <p className="mt-6 rounded-xl bg-[#f9faf8] px-4 py-3 text-sm font-semibold">Confirming your payment…</p>
            ) : null}
            {error ? <p className="mt-4 rounded-xl bg-[#ED3237]/8 px-4 py-3 text-sm text-[#ED3237]">{error}</p> : null}
            {status === "ready" || status === "error" ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (!paypalId) {
                      setError("This payment link is missing a PayPal token.");
                      return;
                    }
                    setStatus("paying");
                    const sandbox = process.env.NODE_ENV !== "production";
                    const host = sandbox ? "https://www.sandbox.paypal.com" : "https://www.paypal.com";
                    window.location.href = `${host}/checkoutnow?token=${encodeURIComponent(paypalId)}`;
                  }}
                  disabled={!paypalId}
                  className="mt-6 w-full rounded-full bg-[#008CFF] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  Continue with Venmo
                </button>
                <p className="mt-3 text-center text-xs text-[#1C315F]/60">
                  This page is tied to your reserved order so the payment is matched to {email || "you"}.
                </p>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
