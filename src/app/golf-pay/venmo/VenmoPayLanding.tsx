"use client";

import { useEffect, useState } from "react";
import { formatCents } from "@/components/GolfOutingPage/golfOutingDisplay";

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
  };
}) {
  const orderId = Number(query.order_id);
  const paypalId = query.token || query.paypal || "";
  const [status, setStatus] = useState<"ready" | "paying" | "paid" | "error">(query.token ? "paying" : "ready");
  const [error, setError] = useState("");
  const [amount] = useState(Number(query.amount) || 0);

  useEffect(() => {
    if (!query.token || !orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/golf/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderID: query.token,
            golfData: {
              order_id: orderId,
              amount,
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
    })();
    return () => {
      cancelled = true;
    };
  }, [amount, orderId, query.email, query.name, query.token]);

  async function openVenmo() {
    if (!paypalId) {
      setError("This Venmo link is missing the payment token.");
      return;
    }
    setStatus("paying");
    const sandbox = process.env.NODE_ENV !== "production";
    const host = sandbox ? "https://www.sandbox.paypal.com" : "https://www.paypal.com";
    window.location.href = `${host}/checkoutnow?token=${encodeURIComponent(paypalId)}`;
  }

  return (
    <div className="min-h-screen bg-[#f9faf8] px-4 pb-16 pt-28 text-[#1C315F]">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#1C315F]/60">Venmo checkout</p>
        <h1 className="mt-2 text-2xl font-bold">{query.event || "Golf outing"}</h1>
        <p className="mt-2 text-lg font-bold text-[#ED3237]">{amount ? formatCents(amount) : "Complete payment"}</p>
        <p className="mt-1 text-sm text-[#1C315F]/70">
          Order {orderId || "—"}
          {query.name || query.email ? ` · ${query.name || query.email}` : ""}
        </p>
        {status === "paid" ? (
          <p className="mt-6 rounded-xl bg-[#f9faf8] p-4 font-semibold">Payment received. You can close this page.</p>
        ) : (
          <>
            {error ? <p className="mt-4 text-sm text-[#ED3237]">{error}</p> : null}
            <button
              type="button"
              onClick={openVenmo}
              disabled={!paypalId || status === "paying"}
              className="mt-6 w-full rounded-full bg-[#008CFF] px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              {status === "paying" ? "Opening Venmo…" : "Open Venmo"}
            </button>
            <p className="mt-3 text-center text-xs text-[#1C315F]/60">
              This link is tied to your reserved order so the payment is matched to {query.email || "you"}.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
