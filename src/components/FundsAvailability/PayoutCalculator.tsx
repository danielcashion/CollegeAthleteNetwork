"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Sparkles, Zap } from "lucide-react";
import type { FundsTransfer } from "@/types/fundsTransfer";
import { TRANSACTION_TYPE_LABELS } from "@/types/fundsTransfer";
import {
  calendarDateET,
  deriveTimelineStep,
  estimateSettlement,
  formatCutoffTimeLabel,
  isBusinessDayET,
  isFederalHolidayET,
  isWeekendET,
  parseRequestDateTime,
  WALLET_CREDIT_HOUR_ET,
} from "@/lib/funds/settlement";

const SAME_DAY_TYPE = "DEPOSIT_SAMEDAY_ACH" as const;

type PayoutCalculatorProps = {
  onEstimateChange?: (transaction: FundsTransfer) => void;
};

function todayDateInputValue(): string {
  return calendarDateET(new Date());
}

function browserLocalTimeInputValue(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function PayoutCalculator({
  onEstimateChange,
}: PayoutCalculatorProps) {
  const [date, setDate] = useState(todayDateInputValue);
  const [time, setTime] = useState(browserLocalTimeInputValue);
  const cutoffLabel = formatCutoffTimeLabel();

  const initiatedAt = useMemo(
    () => parseRequestDateTime(date, time),
    [date, time]
  );

  const estimate = useMemo(
    () => estimateSettlement(SAME_DAY_TYPE, initiatedAt),
    [initiatedAt]
  );

  const rolloverNote = useMemo(() => {
    const parts: string[] = [];
    if (isWeekendET(initiatedAt)) {
      parts.push("weekend");
    }
    if (isFederalHolidayET(initiatedAt)) {
      parts.push("federal bank holiday");
    }
    if (!isBusinessDayET(initiatedAt)) {
      return `Your selected date is a ${parts.join(" and ")}. Fed settlement moves to the next business day, and wallet timing follows from there.`;
    }
    return null;
  }, [initiatedAt]);

  const previewTransaction = useMemo((): FundsTransfer => {
    const tx: FundsTransfer = {
      id: "PREVIEW",
      amount: 250,
      type: SAME_DAY_TYPE,
      initiatedAt: initiatedAt.toISOString(),
      estimatedSettlement: estimate.estimatedSettlement.toISOString(),
      currentStep: deriveTimelineStep(
        initiatedAt,
        estimate.estimatedSettlement
      ),
      isWeekendOrHolidayDelay: estimate.rolledWeekendOrHoliday,
    };
    return tx;
  }, [initiatedAt, estimate]);

  useEffect(() => {
    onEstimateChange?.(previewTransaction);
  }, [previewTransaction, onEstimateChange]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1C315F] text-white">
          <CalendarClock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1C315F] md:text-2xl">
            Estimated delivery calculator
          </h2>
          <p className="mt-1 text-sm text-[#1C315F]/75">
            Same-Day ACH deposits only. Fed cutoff: {cutoffLabel}.
          </p>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#1C315F]/15 bg-[#1C315F]/5 px-4 py-3">
        <Zap className="h-5 w-5 shrink-0 text-[#ED3237]" />
        <p className="text-sm font-semibold text-[#1C315F]">
          {TRANSACTION_TYPE_LABELS[SAME_DAY_TYPE]}
        </p>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="request-date"
              className="mb-2 block text-sm font-semibold text-[#1C315F]"
            >
              Request date
            </label>
            <input
              id="request-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[#1C315F] shadow-sm focus:border-[#1C315F] focus:outline-none focus:ring-2 focus:ring-[#1C315F]/20"
            />
          </div>
          <div>
            <label
              htmlFor="request-time"
              className="mb-2 block text-sm font-semibold text-[#1C315F]"
            >
              Request time
            </label>
            <input
              id="request-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[#1C315F] shadow-sm focus:border-[#1C315F] focus:outline-none focus:ring-2 focus:ring-[#1C315F]/20"
            />
            <p className="mt-1 text-xs text-[#1C315F]/55">
              Cutoff is evaluated in Eastern Time ({cutoffLabel}).
            </p>
          </div>
        </div>

        {rolloverNote && (
          <p className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
            {rolloverNote}
          </p>
        )}

        {estimate.rolledCutoff && isBusinessDayET(initiatedAt) && (
          <p className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
            After {cutoffLabel}, Fed settlement is the{" "}
            <strong>next business day</strong> (not today).
          </p>
        )}

        <div className="rounded-2xl bg-gradient-to-br from-[#1C315F] to-[#2a4478] p-6 text-white">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#ffb4b6]" />
            <div className="w-full space-y-4">
              <div>
                <p className="text-sm font-medium text-white/80">
                  Federal Reserve settlement
                </p>
                <p className="mt-1 text-xl font-bold md:text-2xl">
                  {estimate.fedSettlementLabel}
                </p>
              </div>
              <div className="border-t border-white/20 pt-4">
                <p className="text-sm font-medium text-white/80">
                  CAN wallet available (est.)
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                  {estimate.settlementLabel}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-white/90">
                {estimate.settlementDetail}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[#1C315F]/55">
          Deposits use Same-Day ACH only. Wallet credit is typically{" "}
          {WALLET_CREDIT_HOUR_ET}:00 AM Eastern, two business days after Fed
          settlement. Weekends and federal bank holidays are not business days.
        </p>
      </div>
    </div>
  );
}
