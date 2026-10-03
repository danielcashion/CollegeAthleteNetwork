"use client";

import { useEffect, useState } from "react";

type Props = {
  clientId: string;
  orderId: string;
  amountLabel: string;
  eventName: string;
  guestName: string;
};

type ApplePayContact = {
  givenName?: string;
  familyName?: string;
  emailAddress?: string;
  phoneNumber?: string;
};

type ApplePaySessionInstance = {
  begin: () => void;
  abort: () => void;
  completeMerchantValidation: (session: unknown) => void;
  completePayment: (result: { status: number }) => void;
  completePaymentMethodSelection: (update: { newTotal: { label: string; amount: string; type: string } }) => void;
  onvalidatemerchant: ((event: { validationURL: string }) => void) | null;
  onpaymentauthorized: ((event: { payment: { token: unknown; billingContact?: ApplePayContact } }) => void) | null;
  onpaymentmethodselected: (() => void) | null;
  oncancel: (() => void) | null;
};

type ApplePaySessionType = {
  new (version: number, request: unknown): ApplePaySessionInstance;
  canMakePayments: () => boolean;
  STATUS_SUCCESS: number;
  STATUS_FAILURE: number;
};

declare global {
  interface Window {
    ApplePaySession?: ApplePaySessionType;
    paypal?: {
      Applepay?: () => {
        config: () => Promise<{
          isEligible: boolean;
          countryCode: string;
          merchantCapabilities: string[];
          supportedNetworks: string[];
        }>;
        validateMerchant: (input: { validationUrl: string; displayName: string }) => Promise<{ merchantSession?: unknown }>;
        confirmOrder: (input: { orderId: string; token: unknown; billingContact?: ApplePayContact }) => Promise<unknown>;
      };
    };
  }
}

export function DoorPayCheckout({ clientId, orderId, amountLabel, eventName, guestName }: Props) {
  const [message, setMessage] = useState("Checking Apple Pay on this phone.");
  const [ready, setReady] = useState(false);
  const [paid, setPaid] = useState(false);
  const amount = amountLabel.replace(/[$,]/g, "");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await loadScript(
          `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=applepay`
        );
        const applePay = window.paypal?.Applepay;
        if (!applePay || !window.ApplePaySession || cancelled) {
          setMessage("Open this page in Safari on iPhone to pay with Apple Pay.");
          return;
        }
        const config = await applePay().config();
        if (cancelled) return;
        if (!config.isEligible || !window.ApplePaySession.canMakePayments()) {
          setMessage("Open this page in Safari on iPhone to pay with Apple Pay.");
          return;
        }
        setReady(true);
        setMessage("Apple Pay will ask for your name, email, and phone, then charge this amount.");
      } catch {
        if (!cancelled) setMessage("Open this page in Safari on iPhone to pay with Apple Pay.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  async function pay() {
    const ApplePaySession = window.ApplePaySession;
    const applePay = window.paypal?.Applepay?.();
    if (!ApplePaySession || !applePay) return;
    const config = await applePay.config();
    const total = { label: eventName, amount, type: "final" };
    const session = new ApplePaySession(4, {
      countryCode: config.countryCode,
      currencyCode: "USD",
      merchantCapabilities: config.merchantCapabilities,
      supportedNetworks: config.supportedNetworks,
      requiredBillingContactFields: ["name", "email", "phone"],
      total,
    });
    session.onpaymentmethodselected = () => {
      session.completePaymentMethodSelection({ newTotal: total });
    };
    session.onvalidatemerchant = (event) => {
      void applePay
        .validateMerchant({ validationUrl: event.validationURL, displayName: "The College Athlete Network" })
        .then((payload) => session.completeMerchantValidation(payload.merchantSession || payload))
        .catch(() => session.abort());
    };
    session.onpaymentauthorized = (event) => {
      void applePay
        .confirmOrder({
          orderId,
          token: event.payment.token,
          billingContact: event.payment.billingContact,
        })
        .then(() => {
          session.completePayment({ status: ApplePaySession.STATUS_SUCCESS });
          setPaid(true);
          setMessage("Payment approved. You can close this page.");
        })
        .catch(() => {
          session.completePayment({ status: ApplePaySession.STATUS_FAILURE });
          setMessage("Apple Pay could not be completed. Ask the staff member to show the code again.");
        });
    };
    session.oncancel = () => setMessage("Apple Pay was cancelled. You can try again.");
    session.begin();
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] px-5 py-10 text-[#1C315F]">
      <section className="mx-auto w-full max-w-md rounded-3xl bg-white px-6 py-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1C315F]/60">Apple Pay</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">{eventName}</h1>
        {guestName ? <p className="mt-2 text-lg">{guestName}</p> : null}
        <p className="mt-4 text-4xl font-semibold">{amountLabel}</p>
        <p className="mt-4 text-base leading-6">{message}</p>
        {paid || !ready ? null : (
          <button
            type="button"
            onClick={() => void pay()}
            className="mt-6 w-full rounded-xl bg-black px-4 py-3.5 text-[17px] font-semibold text-white"
          >
            Pay with Apple Pay
          </button>
        )}
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
