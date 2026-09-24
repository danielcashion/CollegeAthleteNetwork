"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";
import { getPayPalConfig, getPayPalEnv } from "../libs/paypal";

export default function PayPalProvider({ children }: { children: ReactNode }) {
  const config = getPayPalConfig();
  const clientId = config["client-id"];

  if (!clientId) {
    return (
      <div className="py-4 text-center text-red-500">
        PayPal is not configured. Please contact support.
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
        components: "buttons,funding-eligibility",
        "enable-funding": "venmo,card",
        "disable-funding": "paylater,credit",
        ...(getPayPalEnv() === "sandbox" ? { buyerCountry: "US" } : {}),
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}
