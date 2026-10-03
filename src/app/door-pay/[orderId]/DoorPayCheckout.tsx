"use client";

import { useEffect, useState } from "react";

type Props = {
  clientId: string;
  orderId: string;
  amountLabel: string;
  eventName: string;
  guestName: string;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        fundingSource?: string;
        createOrder: () => string;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: () => void;
      }) => { render: (selector: string) => Promise<void>; isEligible: () => boolean };
      FUNDING: { APPLEPAY?: string };
    };
  }
}

export function DoorPayCheckout({ clientId, orderId, amountLabel, eventName, guestName }: Props) {
  const [message, setMessage] = useState("Confirm with Apple Pay. The amount in the Apple Pay sheet is the amount that will be charged.");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await loadScript(
          `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons,applepay&enable-funding=applepay&disable-funding=paylater,credit,card,venmo`
        );
        const paypal = window.paypal;
        const funding = paypal?.FUNDING.APPLEPAY;
        if (!paypal?.Buttons || !funding || cancelled) {
          setMessage("Open this page in Safari on iPhone to pay with Apple Pay.");
          return;
        }
        const buttons = paypal.Buttons({
          fundingSource: funding,
          createOrder: () => orderId,
          onApprove: async () => {
            if (!cancelled) {
              setPaid(true);
              setMessage("Payment approved. You can close this page. The staff phone will confirm it.");
            }
          },
          onError: () => setMessage("Apple Pay was cancelled or could not start."),
        });
        if (!buttons.isEligible()) {
          setMessage("Open this page in Safari on iPhone to pay with Apple Pay.");
          return;
        }
        await buttons.render("#apple-pay");
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Apple Pay could not load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientId, orderId]);

  return (
    <div className="min-h-screen bg-[#F4F6FB] px-5 py-10 text-[#1C315F]">
      <section className="mx-auto w-full max-w-md rounded-3xl bg-white px-6 py-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1C315F]/60">Apple Pay</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">{eventName}</h1>
        {guestName ? <p className="mt-2 text-lg">{guestName}</p> : null}
        <p className="mt-4 text-4xl font-semibold">{amountLabel}</p>
        <p className="mt-4 text-base leading-6">{message}</p>
        {paid ? null : <div id="apple-pay" className="mt-6 min-h-12" />}
      </section>
    </div>
  );
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Apple Pay"));
    document.body.appendChild(script);
  });
}
