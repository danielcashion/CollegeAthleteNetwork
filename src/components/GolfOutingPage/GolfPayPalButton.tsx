"use client";

import { useRef, useState } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

export function paypalFundingMethod(source?: unknown): "paypal" | "venmo" | "card" {
  const key = (typeof source === "string" ? source : "").toLowerCase();
  if (key === "venmo") return "venmo";
  if (key === "card" || key === "credit" || key === "debit") return "card";
  return "paypal";
}

export default function GolfPayPalButton({
  amount,
  golfData,
  createPath = "/api/golf/paypal/create-order",
  capturePath = "/api/golf/paypal/capture-order",
  fundingSource: forcedFunding,
  onSuccess,
  onError,
}: {
  amount: number;
  golfData: Record<string, unknown>;
  createPath?: string;
  capturePath?: string;
  fundingSource?: "paypal" | "venmo" | "card";
  onSuccess: () => Promise<void> | void;
  onError: (error: unknown) => void;
}) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const fundingSource = useRef<"paypal" | "venmo" | "card">(forcedFunding || "paypal");
  const [processing, setProcessing] = useState(false);

  if (isPending) {
    return <div className="py-6 text-center text-sm font-semibold text-[#1C315F]/70">Loading payment methods…</div>;
  }
  if (isRejected) {
    return (
      <div className="rounded-xl bg-[#ED3237]/8 px-4 py-4 text-center text-sm text-[#ED3237]">
        PayPal could not load. Refresh the page and try again.
      </div>
    );
  }

  return (
    <div className="relative">
      {processing ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/85">
          <p className="text-sm font-semibold text-[#1C315F]">Confirming payment…</p>
        </div>
      ) : null}
      <PayPalButtons
        style={{
          layout: "vertical",
          color: forcedFunding === "venmo" ? "blue" : "gold",
          shape: "rect",
          label: forcedFunding === "venmo" ? "pay" : "paypal",
          height: 45,
          tagline: false,
        }}
        fundingSource={forcedFunding}
        createOrder={async () => {
          const response = await fetch(createPath, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount,
              currency: "USD",
              golfData,
              fundingSource: forcedFunding,
            }),
          });
          const data = await response.json();
          if (!response.ok || data.error) throw new Error(data.error || "Could not create order");
          return data.orderID;
        }}
        onClick={(data) => {
          fundingSource.current = forcedFunding || paypalFundingMethod(data.fundingSource);
        }}
        onApprove={async (data) => {
          setProcessing(true);
          try {
            const response = await fetch(capturePath, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderID: data.orderID,
                golfData: { ...golfData, payment_method: fundingSource.current },
              }),
            });
            const capture = await response.json();
            if (!response.ok || capture.error) throw new Error(capture.error || "Capture failed");
            await onSuccess();
          } finally {
            setProcessing(false);
          }
        }}
        onError={onError}
      />
    </div>
  );
}
