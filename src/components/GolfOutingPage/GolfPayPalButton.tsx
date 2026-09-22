"use client";

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

export default function GolfPayPalButton({
  amount,
  golfData,
  createPath = "/api/golf/paypal/create-order",
  capturePath = "/api/golf/paypal/capture-order",
  onSuccess,
  onError,
}: {
  amount: number;
  golfData: Record<string, unknown>;
  createPath?: string;
  capturePath?: string;
  onSuccess: () => Promise<void> | void;
  onError: (error: unknown) => void;
}) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isPending) return <div className="py-4 text-center">Loading PayPal...</div>;
  if (isRejected) return <div className="py-4 text-center text-red-600">PayPal failed to load.</div>;

  return (
    <PayPalButtons
      style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 45, tagline: false }}
      createOrder={async () => {
        const response = await fetch(createPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, currency: "USD", golfData }),
        });
        const data = await response.json();
        if (!response.ok || data.error) throw new Error(data.error || "Could not create order");
        return data.orderID;
      }}
      onApprove={async (data) => {
        const response = await fetch(capturePath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderID: data.orderID, golfData }),
        });
        const capture = await response.json();
        if (!response.ok || capture.error) throw new Error(capture.error || "Capture failed");
        await onSuccess();
      }}
      onError={onError}
    />
  );
}
