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

const imported = ["Name", "Email", "Phone"];

export function DoorPayCheckout({ clientId, orderId, amountLabel, eventName, guestName }: Props) {
  const [message, setMessage] = useState("");
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
        setMessage("");
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
          setMessage("");
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
    <div className="min-h-screen bg-[#F6F1E7] px-5 py-8 text-[#1C315F]">
      <article className="mx-auto w-full max-w-md overflow-hidden rounded-[28px] border border-[#1C315F]/10 bg-white shadow-[0_24px_60px_rgba(28,49,95,0.12)]">
        <header className="bg-[#1C315F] px-7 pb-7 pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C6A15B]">The College Athlete Network</p>
          <h1 className="mt-4 text-[32px] font-semibold leading-[1.15] text-[#F6F1E7]">{eventName}</h1>
          {guestName ? <p className="mt-2 text-base text-[#F6F1E7]/75">{guestName}</p> : null}
        </header>
        <div className="px-7 py-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C315F]/45">Amount due</p>
          <p className="mt-1 text-[44px] font-semibold leading-none tracking-tight">{amountLabel}</p>
          {paid ? (
            <p className="mt-6 text-base leading-6">
              You&apos;re all set. You can close this page. The event has your payment, and your name, email, and phone came through from Apple Pay.
            </p>
          ) : (
            <div className="mt-6 rounded-2xl bg-[#F6F1E7] px-4 py-4">
              <p className="text-[15px] font-semibold">Nothing to type</p>
              <p className="mt-1.5 text-sm leading-5 text-[#1C315F]/80">
                We&apos;ll import your name, email, and phone from Apple Pay. They&apos;re already on this iPhone, so you can pay without filling out a form.
              </p>
              <ul className="mt-4 space-y-2">
                {imported.map((label) => (
                  <li key={label} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="text-[#1C315F]/55">From Apple Pay</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ready && !paid ? (
            <button
              type="button"
              onClick={() => void pay()}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-[19px] font-medium tracking-tight text-white"
            >
              <AppleMark />
              Pay
            </button>
          ) : null}
          {message ? <p className="mt-4 text-center text-sm leading-5 text-[#1C315F]/70">{message}</p> : null}
        </div>
      </article>
    </div>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 14 17" aria-hidden="true" className="h-[18px] w-[15px]">
      <path
        fill="currentColor"
        d="M13.3 5.7c-.1.1-1.6.9-1.6 2.8 0 2.2 1.9 3 2 3-.1.2-.3 1-1 1.9-.6.8-1.3 1.7-2.3 1.7s-1.3-.5-2.4-.5-1.5.5-2.4.5-1.6-.8-2.3-1.7C2.2 12.1 1.4 10 1.4 8c0-2.9 1.9-4.4 3.7-4.4 1 0 1.8.6 2.4.6.6 0 1.6-.7 2.8-.6.5 0 1.8.2 2.6 1.4-.1.1-1.6.9-1.6 2.7zM10.2 2.6c.5-.6.8-1.4.7-2.2-.7 0-1.6.5-2.1 1.1-.5.5-.9 1.4-.8 2.2.8.1 1.6-.4 2.2-1.1z"
      />
    </svg>
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
