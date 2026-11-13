"use client";

import { Check, Circle, ShieldCheck, Wallet } from "lucide-react";
import type { FundsTransfer } from "@/types/fundsTransfer";
import { TRANSACTION_TYPE_LABELS } from "@/types/fundsTransfer";
import { formatCutoffTimeLabel } from "@/lib/funds/settlement";

const STEPS = [
  {
    title: "Initiated",
    description:
      "Your Same-Day ACH deposit request is submitted through The College Athlete Network.",
    icon: Circle,
  },
  {
    title: "Fed settlement & return window",
    description:
      "The debit settles at the Federal Reserve (same business day if before the cutoff). Banks may still return the ACH during the standard return period.",
    icon: ShieldCheck,
  },
  {
    title: "Funds in CAN wallet",
    description:
      "After two business days from Fed settlement, cleared funds credit your wallet (typically 9:00 AM Eastern).",
    icon: Wallet,
  },
] as const;

type FundsTimelineProps = {
  transaction: FundsTransfer;
};

export default function FundsTimeline({ transaction }: FundsTimelineProps) {
  const activeStep = Math.min(Math.max(transaction.currentStep, 0), 2);
  const cutoff = formatCutoffTimeLabel();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#ED3237]">
            Active deposit
          </p>
          <h2 className="mt-1 text-xl font-bold text-[#1C315F] md:text-2xl">
            Same-Day ACH timeline
          </h2>
          <p className="mt-2 text-sm text-[#1C315F]/75">
            {TRANSACTION_TYPE_LABELS[transaction.type]} · Ref{" "}
            {transaction.id}
          </p>
        </div>
        <div className="rounded-xl bg-[#1C315F]/5 px-4 py-3 text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-[#1C315F]/60">
            Amount
          </p>
          <p className="text-2xl font-bold text-[#1C315F]">
            $
            {transaction.amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {transaction.isWeekendOrHolidayDelay && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          This estimate includes a weekend, holiday, or post-{cutoff} submission.
          Fed settlement is on the next business day, then wallet timing follows.
        </div>
      )}

      <div className="relative">
        <div
          className="absolute left-[1.125rem] top-4 hidden h-[calc(100%-2rem)] w-0.5 bg-gray-200 md:block"
          aria-hidden
        />
        <ol className="space-y-8">
          {STEPS.map((step, index) => {
            const complete = index < activeStep;
            const current = index === activeStep;
            const StepIcon = step.icon;

            return (
              <li key={step.title} className="relative flex gap-4 md:gap-6">
                <div
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    complete
                      ? "border-[#1C315F] bg-[#1C315F] text-white"
                      : current
                        ? "border-[#ED3237] bg-white text-[#ED3237] ring-4 ring-[#ED3237]/15"
                        : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {complete ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      current ? "text-[#ED3237]" : "text-[#1C315F]/50"
                    }`}
                  >
                    Step {index + 1}
                    {current && " · In progress"}
                    {complete && " · Complete"}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[#1C315F]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#1C315F]/80">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-8 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="font-medium text-[#1C315F]/60">Submitted</p>
          <p className="font-semibold text-[#1C315F]">
            {new Date(transaction.initiatedAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div>
          <p className="font-medium text-[#1C315F]/60">Est. wallet credit</p>
          <p className="font-semibold text-[#1C315F]">
            {new Date(transaction.estimatedSettlement).toLocaleDateString(
              "en-US",
              {
                timeZone: "America/New_York",
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )}{" "}
            · ~9:00 AM ET
          </p>
        </div>
      </div>
    </div>
  );
}
