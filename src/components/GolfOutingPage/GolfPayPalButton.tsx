"use client";

import { useRef } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

export function paypalFundingMethod(source?: string | null): "paypal" | "venmo" | "card" {
  const key = (source || "").toLowerCase();
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

  if (isPending) return <div className="py-4 text-center">Loading PayPal...</div>;
  if (isRejected) return <div className="py-4 text-center text-red-600">PayPal failed to load.</div>;

  return (
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
            fundingSource: forcedFunding || fundingSource.current,
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
      }}
      onError={onError}
    />
  );
}
