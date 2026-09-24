"use client";

import { useState } from "react";
import GolfPayPalButton from "@/components/GolfOutingPage/GolfPayPalButton";
import { formatCents } from "@/components/GolfOutingPage/golfOutingDisplay";
import PayPalProvider from "@/providers/PaypalProvider";
import VenmoCheckout from "./VenmoCheckout";

type Method = "choose" | "paypal" | "card" | "venmo";

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
  const [method, setMethod] = useState<Method>("choose");

  const checkoutData = {
    ...golfData,
    amount,
    purchaser_email: purchaserEmail,
    purchaser_name: purchaserName,
  };

  async function handleSuccess() {
    setPaid(true);
    await onSuccess?.();
  }

  if (paid) {
    return (
      <div className="rounded-xl border border-[#1C315F]/15 bg-[#f9faf8] p-4 text-[#1C315F]">
        <p className="text-lg font-bold">{successTitle}</p>
        <p className="mt-1 text-sm">
          Order {String(golfData.order_id)} · {formatCents(amount)}
        </p>
        <p className="mt-2 text-sm">A receipt will be sent to {purchaserEmail}.</p>
        {successNote ? <p className="mt-2 text-sm">{successNote}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#1C315F]">Pay {formatCents(amount)}</p>
      {error ? <p className="text-sm text-[#ED3237]">{error}</p> : null}

      {method === "choose" ? (
        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => setMethod("paypal")}
            className="w-full rounded-2xl border border-[#1C315F]/15 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-bold text-[#1C315F]">PayPal</p>
            <p className="mt-1 text-sm text-[#1C315F]/70">Pay with your PayPal balance or linked bank.</p>
          </button>
          <button
            type="button"
            onClick={() => setMethod("card")}
            className="w-full rounded-2xl border border-[#1C315F]/15 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-bold text-[#1C315F]">Debit or credit card</p>
            <p className="mt-1 text-sm text-[#1C315F]/70">Processed securely through PayPal. No Stripe.</p>
          </button>
          <button
            type="button"
            onClick={() => setMethod("venmo")}
            className="w-full rounded-2xl border border-[#1C315F]/15 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-bold text-[#1C315F]">Venmo</p>
            <p className="mt-1 text-sm text-[#1C315F]/70">Scan a QR code or log in with Venmo.</p>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            className="text-sm font-semibold text-[#1C315F] underline"
            onClick={() => {
              setMethod("choose");
              setError("");
            }}
          >
            ← Payment methods
          </button>
          <PayPalProvider>
            {method === "venmo" ? (
              <VenmoCheckout
                amount={amount}
                purchaserEmail={purchaserEmail}
                purchaserName={purchaserName}
                golfData={golfData}
                createPath={createPath}
                capturePath={capturePath}
                onSuccess={handleSuccess}
                onError={(err) => setError(err instanceof Error ? err.message : "Payment failed")}
              />
            ) : (
              <GolfPayPalButton
                amount={amount}
                createPath={createPath}
                capturePath={capturePath}
                fundingSource={method}
                golfData={checkoutData}
                onSuccess={handleSuccess}
                onError={(err) => setError(err instanceof Error ? err.message : "Payment failed")}
              />
            )}
          </PayPalProvider>
        </div>
      )}
    </div>
  );
}
