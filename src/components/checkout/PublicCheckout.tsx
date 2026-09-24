"use client";

import { useState } from "react";
import GolfPayPalButton from "@/components/GolfOutingPage/GolfPayPalButton";
import { formatCents } from "@/components/GolfOutingPage/golfOutingDisplay";
import PayPalProvider from "@/providers/PaypalProvider";
import GolfPaymentReceipt from "./GolfPaymentReceipt";

export default function PublicCheckout({
  amount,
  purchaserEmail,
  purchaserName,
  golfData,
  createPath = "/api/golf/paypal/create-order",
  capturePath = "/api/golf/paypal/capture-order",
  successTitle = "Payment complete",
  successNote,
  onSuccess,
}: {
  amount: number;
  purchaserEmail: string;
  purchaserName?: string;
  golfData: Record<string, unknown>;
  createPath?: string;
  capturePath?: string;
  successTitle?: string;
  successNote?: string;
  onSuccess?: () => Promise<void> | void;
}) {
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");

  const checkoutData = {
    ...golfData,
    amount,
    purchaser_email: purchaserEmail,
    purchaser_name: purchaserName,
  };
  const outingHref = typeof golfData.outing_slug === "string" ? `/golf-outing/${golfData.outing_slug}` : undefined;

  async function handleSuccess() {
    setPaid(true);
    await onSuccess?.();
  }

  if (paid) {
    return (
      <GolfPaymentReceipt
        title={successTitle}
        eventName={typeof golfData.event_name === "string" ? golfData.event_name : undefined}
        universityName={typeof golfData.university_name === "string" ? golfData.university_name : undefined}
        orderId={golfData.order_id as string | number | undefined}
        amountCents={amount}
        email={purchaserEmail}
        note={successNote}
        outingHref={outingHref}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#1C315F]/60">Secure checkout</p>
        <p className="mt-1 text-lg font-bold text-[#1C315F]">Pay {formatCents(amount)}</p>
        <p className="mt-1 text-sm text-[#1C315F]/70">
          Pay with PayPal, Venmo, or a card. On a computer, Venmo opens a QR code to scan with the Venmo app.
        </p>
      </div>
      {error ? <p className="rounded-xl bg-[#ED3237]/8 px-3 py-2 text-sm text-[#ED3237]">{error}</p> : null}
      <PayPalProvider>
        <GolfPayPalButton
          amount={amount}
          createPath={createPath}
          capturePath={capturePath}
          golfData={checkoutData}
          onSuccess={handleSuccess}
          onError={(err) => setError(err instanceof Error ? err.message : "Payment failed")}
        />
      </PayPalProvider>
    </div>
  );
}
