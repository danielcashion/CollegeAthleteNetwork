"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import GolfPayPalButton from "@/components/GolfOutingPage/GolfPayPalButton";
import { formatCents } from "@/components/GolfOutingPage/golfOutingDisplay";

type VenmoMode = "choose" | "qr" | "login";

export default function VenmoCheckout({
  amount,
  purchaserEmail,
  purchaserName,
  golfData,
  createPath,
  capturePath,
  onSuccess,
  onError,
}: {
  amount: number;
  purchaserEmail: string;
  purchaserName?: string;
  golfData: Record<string, unknown>;
  createPath: string;
  capturePath: string;
  onSuccess: () => Promise<void> | void;
  onError: (error: unknown) => void;
}) {
  const [mode, setMode] = useState<VenmoMode>("choose");
  const [qrUrl, setQrUrl] = useState("");
  const [creating, setCreating] = useState(false);

  const payload = useMemo(
    () => ({
      ...golfData,
      amount,
      purchaser_email: purchaserEmail,
      purchaser_name: purchaserName,
      payment_method: "venmo",
    }),
    [amount, golfData, purchaserEmail, purchaserName]
  );

  useEffect(() => {
    if (mode !== "qr" || !qrUrl) return;
    const timer = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/golf/paypal/status?order_id=${golfData.order_id}`, { cache: "no-store" });
        const data = await res.json();
        if (data.order_status === "PAID") {
          window.clearInterval(timer);
          await onSuccess();
        }
      } catch {
        // keep polling
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [golfData.order_id, mode, onSuccess, qrUrl]);

  async function startQr() {
    setCreating(true);
    try {
      const response = await fetch(createPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "USD",
          fundingSource: "venmo",
          golfData: payload,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Could not start Venmo");
      const url = new URL("/golf-pay/venmo", window.location.origin);
      url.searchParams.set("order_id", String(golfData.order_id));
      url.searchParams.set("paypal", String(data.orderID));
      url.searchParams.set("email", purchaserEmail);
      url.searchParams.set("amount", String(amount));
      if (purchaserName) url.searchParams.set("name", purchaserName);
      if (golfData.event_name) url.searchParams.set("event", String(golfData.event_name));
      setQrUrl(url.toString());
      setMode("qr");
    } catch (err) {
      onError(err);
    } finally {
      setCreating(false);
    }
  }

  if (mode === "login") {
    return (
      <div className="space-y-3">
        <button type="button" className="text-sm font-semibold text-[#1C315F] underline" onClick={() => setMode("choose")}>
          ← Venmo options
        </button>
        <p className="text-sm text-[#1C315F]/70">Log in with Venmo to finish this reservation.</p>
        <GolfPayPalButton
          amount={amount}
          golfData={payload}
          createPath={createPath}
          capturePath={capturePath}
          fundingSource="venmo"
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>
    );
  }

  if (mode === "qr" && qrUrl) {
    return (
      <div className="space-y-4">
        <button type="button" className="text-sm font-semibold text-[#1C315F] underline" onClick={() => setMode("choose")}>
          ← Venmo options
        </button>
        <div className="rounded-2xl border border-[#1C315F]/15 bg-white p-5 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1C315F]/60">Scan with the Venmo app</p>
          <p className="mt-1 text-lg font-bold text-[#1C315F]">
            {formatCents(amount)} · Order {String(golfData.order_id)}
          </p>
          <p className="mt-1 text-sm text-[#1C315F]/70">{purchaserName || purchaserEmail}</p>
          <div className="mx-auto mt-4 inline-flex rounded-xl bg-white p-3 ring-1 ring-[#1C315F]/10">
            <QRCodeSVG value={qrUrl} size={196} includeMargin />
          </div>
          <p className="mt-4 text-sm text-[#1C315F]/70">
            This code already includes your order, email, and amount so the payment is matched to you.
          </p>
          <p className="mt-2 text-xs text-[#1C315F]/50">Waiting for the Venmo app to complete payment…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#1C315F]">How do you want to pay with Venmo?</p>
      <button
        type="button"
        disabled={creating}
        onClick={startQr}
        className="w-full rounded-2xl border border-[#1C315F]/15 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
      >
        <p className="font-bold text-[#1C315F]">{creating ? "Preparing QR code…" : "Scan QR Code"}</p>
        <p className="mt-1 text-sm text-[#1C315F]/70">
          Open Venmo on your phone and scan. The code carries this order so we can match the payment to you.
        </p>
      </button>
      <button
        type="button"
        onClick={() => setMode("login")}
        className="w-full rounded-2xl border border-[#1C315F]/15 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <p className="font-bold text-[#1C315F]">Log in with Venmo</p>
        <p className="mt-1 text-sm text-[#1C315F]/70">Stay on this device and approve the payment in Venmo.</p>
      </button>
    </div>
  );
}
