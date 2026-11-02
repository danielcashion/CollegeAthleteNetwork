"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight, Banknote } from "lucide-react";
import type { FundsTransfer } from "@/types/fundsTransfer";
import AchReturnsSection from "./AchReturnsSection";
import CreditWithdrawSection from "./CreditWithdrawSection";
import FundsTimeline from "./FundsTimeline";
import PayoutCalculator from "./PayoutCalculator";
import PayoutFAQ from "./PayoutFAQ";
import SameDayDebitExplainer from "./SameDayDebitExplainer";

const DEFAULT_TRANSACTION: FundsTransfer = {
  id: "CAN-DEMO-001",
  amount: 250,
  type: "DEPOSIT_SAMEDAY_ACH",
  initiatedAt: new Date().toISOString(),
  estimatedSettlement: new Date().toISOString(),
  currentStep: 1,
  isWeekendOrHolidayDelay: false,
};

export default function FundsAvailabilityPage() {
  const [activeTransaction, setActiveTransaction] =
    useState<FundsTransfer>(DEFAULT_TRANSACTION);

  const handleEstimateChange = useCallback((tx: FundsTransfer) => {
    setActiveTransaction({ ...tx, id: "CAN-PREVIEW" });
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-grow">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1C315F] via-[#1C315F] to-[#ED3237] pb-16 pt-28 text-white">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="container relative z-10 mx-auto px-4 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
              Payouts &amp; wallet
            </p>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Banknote className="h-7 w-7" />
            </div>
            <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Funds &amp; Payout Availability
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/95 md:text-xl">
              Same-Day ACH for every deposit and withdrawal—see Fed cutoffs,
              wallet timing, and bank delivery in plain language.
            </p>
          </div>
        </section>

        <SameDayDebitExplainer />

        <section className="bg-gradient-to-b from-gray-50 to-white py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-start">
              <PayoutCalculator onEstimateChange={handleEstimateChange} />
              <FundsTimeline transaction={activeTransaction} />
            </div>
          </div>
        </section>

        <CreditWithdrawSection />

        <AchReturnsSection />

        <PayoutFAQ />

        <section className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] py-14 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Still waiting on a specific transfer?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/90">
              Our team can look up your transfer in the member portal or help
              you confirm bank linking.
            </p>
            <Link
              href="/support?topic=funds-availability"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-lg font-semibold text-[#1C315F] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Contact support
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
