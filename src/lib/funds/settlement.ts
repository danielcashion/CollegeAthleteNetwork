import type { SettlementEstimate, TransactionType } from "@/types/fundsTransfer";

const ET = "America/New_York";

/** Last Same-Day ACH window — submissions before this reach the Fed same business day. */
export const SAME_DAY_ACH_CUTOFF_HOUR_ET = 13;
export const SAME_DAY_ACH_CUTOFF_MINUTE_ET = 45;

/** Debits credit the CAN wallet this many business days after Fed settlement. */
export const WALLET_CREDIT_BUSINESS_DAYS_AFTER_SETTLEMENT = 2;
export const WALLET_CREDIT_HOUR_ET = 9;

/** @deprecated Use SAME_DAY_ACH_CUTOFF_* */
export const ACH_DAILY_CUTOFF_HOUR_ET = SAME_DAY_ACH_CUTOFF_HOUR_ET;
export const ACH_DAILY_CUTOFF_MINUTE_ET = SAME_DAY_ACH_CUTOFF_MINUTE_ET;

const FEDERAL_HOLIDAYS_ET = new Set([
  "2025-01-01",
  "2025-01-20",
  "2025-02-17",
  "2025-05-26",
  "2025-06-19",
  "2025-07-04",
  "2025-09-01",
  "2025-10-13",
  "2025-11-11",
  "2025-11-27",
  "2025-12-25",
  "2026-01-01",
  "2026-01-19",
  "2026-02-16",
  "2026-05-25",
  "2026-06-19",
  "2026-07-03",
  "2026-09-07",
  "2026-10-12",
  "2026-11-11",
  "2026-11-26",
  "2026-12-25",
  "2027-01-01",
  "2027-01-18",
  "2027-02-15",
  "2027-05-31",
  "2027-06-18",
  "2027-07-05",
  "2027-09-06",
  "2027-10-11",
  "2027-11-11",
  "2027-11-25",
  "2027-12-24",
]);

export function calendarDateET(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ET }).format(date);
}

export function weekdayET(date: Date): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: ET,
    weekday: "short",
  }).format(date);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[name] ?? 0;
}

export function isWeekendET(date: Date): boolean {
  const day = weekdayET(date);
  return day === 0 || day === 6;
}

export function isFederalHolidayET(date: Date): boolean {
  return FEDERAL_HOLIDAYS_ET.has(calendarDateET(date));
}

export function isBusinessDayET(date: Date): boolean {
  return !isWeekendET(date) && !isFederalHolidayET(date);
}

export function isAfterSameDayAchCutoffET(date: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ET,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  if (hour > SAME_DAY_ACH_CUTOFF_HOUR_ET) return true;
  if (
    hour === SAME_DAY_ACH_CUTOFF_HOUR_ET &&
    minute >= SAME_DAY_ACH_CUTOFF_MINUTE_ET
  ) {
    return true;
  }
  return false;
}

/** @deprecated Use isAfterSameDayAchCutoffET */
export const isAfterDailyCutoffET = isAfterSameDayAchCutoffET;

function addCalendarDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function nextBusinessDayET(from: Date): Date {
  let cursor = addCalendarDays(from, 1);
  while (!isBusinessDayET(cursor)) {
    cursor = addCalendarDays(cursor, 1);
  }
  return cursor;
}

export function addBusinessDaysET(from: Date, count: number): Date {
  let cursor = new Date(from.getTime());
  let added = 0;
  while (added < count) {
    cursor = addCalendarDays(cursor, 1);
    if (isBusinessDayET(cursor)) added += 1;
  }
  return cursor;
}

/** User date/time from inputs (local timezone instant). Cutoffs evaluated in Eastern. */
export function parseRequestDateTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00`);
}

export function formatLongDateET(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ET,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatShortDateET(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ET,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function firstBusinessDayOnOrAfter(date: Date): Date {
  let cursor = new Date(date.getTime());
  while (!isBusinessDayET(cursor)) {
    cursor = addCalendarDays(cursor, 1);
  }
  return cursor;
}

function resolveProcessingStart(initiatedAt: Date): {
  processingStart: Date;
  rolledWeekendOrHoliday: boolean;
} {
  if (isBusinessDayET(initiatedAt)) {
    return { processingStart: new Date(initiatedAt.getTime()), rolledWeekendOrHoliday: false };
  }
  return {
    processingStart: firstBusinessDayOnOrAfter(initiatedAt),
    rolledWeekendOrHoliday: true,
  };
}

function resolveFedSettlementDate(
  initiatedAt: Date,
  processingStart: Date
): { fedSettlementDate: Date; rolledCutoff: boolean } {
  if (!isBusinessDayET(initiatedAt)) {
    return { fedSettlementDate: processingStart, rolledCutoff: false };
  }
  if (isAfterSameDayAchCutoffET(initiatedAt)) {
    return {
      fedSettlementDate: nextBusinessDayET(initiatedAt),
      rolledCutoff: true,
    };
  }
  return {
    fedSettlementDate: new Date(processingStart.getTime()),
    rolledCutoff: false,
  };
}

function estimateSameDayDebit(initiatedAt: Date): SettlementEstimate {
  const { processingStart, rolledWeekendOrHoliday } =
    resolveProcessingStart(initiatedAt);
  const { fedSettlementDate, rolledCutoff } = resolveFedSettlementDate(
    initiatedAt,
    processingStart
  );

  const walletAvailable = addBusinessDaysET(
    fedSettlementDate,
    WALLET_CREDIT_BUSINESS_DAYS_AFTER_SETTLEMENT
  );

  const settlementDetail =
    "We only use Same-Day ACH for deposits. If your request is submitted before 1:45 PM Eastern on a business day, the ACH settles at the Federal Reserve that same day; otherwise settlement is the next business day. After settlement, banks may still return the ACH for up to two business days—funds typically credit your CAN wallet two business days after Fed settlement at 9:00 AM Eastern.";

  return {
    processingStart,
    fedSettlementDate,
    estimatedSettlement: walletAvailable,
    businessDaysMin: WALLET_CREDIT_BUSINESS_DAYS_AFTER_SETTLEMENT,
    businessDaysMax: WALLET_CREDIT_BUSINESS_DAYS_AFTER_SETTLEMENT,
    rolledWeekendOrHoliday,
    rolledCutoff,
    processingStartLabel: formatLongDateET(processingStart),
    fedSettlementLabel: formatLongDateET(fedSettlementDate),
    settlementLabel: `${formatLongDateET(walletAvailable)} · ~${WALLET_CREDIT_HOUR_ET}:00 AM ET`,
    settlementDetail,
  };
}

function estimateSameDayCredit(initiatedAt: Date): SettlementEstimate {
  const { processingStart, rolledWeekendOrHoliday } =
    resolveProcessingStart(initiatedAt);
  const { fedSettlementDate, rolledCutoff } = resolveFedSettlementDate(
    initiatedAt,
    processingStart
  );

  let bankAvailable: Date;
  let settlementDetail: string;

  if (!isBusinessDayET(initiatedAt)) {
    bankAvailable = processingStart;
    settlementDetail =
      "Withdrawals submitted on a weekend or holiday are sent on the next business day and should arrive in your bank account by the end of that business day.";
  } else if (rolledCutoff) {
    bankAvailable = fedSettlementDate;
    settlementDetail =
      "Same-Day ACH withdrawals submitted after 1:45 PM Eastern settle at the Fed the next business day and should appear in your linked bank account by the end of that day.";
  } else {
    bankAvailable = fedSettlementDate;
    settlementDetail =
      "Same-Day ACH withdrawals submitted before 1:45 PM Eastern on a business day should appear in your linked bank account by the end of the current business day.";
  }

  return {
    processingStart,
    fedSettlementDate,
    estimatedSettlement: bankAvailable,
    businessDaysMin: 0,
    businessDaysMax: 0,
    rolledWeekendOrHoliday,
    rolledCutoff,
    processingStartLabel: formatLongDateET(processingStart),
    fedSettlementLabel: formatLongDateET(fedSettlementDate),
    settlementLabel: `${formatLongDateET(bankAvailable)} · by end of day ET`,
    settlementDetail,
  };
}

export function estimateSettlement(
  type: TransactionType,
  initiatedAt: Date
): SettlementEstimate {
  switch (type) {
    case "DEPOSIT_SAMEDAY_ACH":
      return estimateSameDayDebit(initiatedAt);
    case "WITHDRAW_TO_BANK":
      return estimateSameDayCredit(initiatedAt);
    default:
      return estimateSameDayDebit(initiatedAt);
  }
}

export function deriveTimelineStep(
  initiatedAt: Date,
  estimatedSettlement: Date,
  now: Date = new Date()
): number {
  if (now.getTime() < initiatedAt.getTime()) return 0;
  if (now.getTime() >= estimatedSettlement.getTime()) return 2;
  return 1;
}

export function formatCutoffTimeLabel(): string {
  const h = SAME_DAY_ACH_CUTOFF_HOUR_ET;
  const m = String(SAME_DAY_ACH_CUTOFF_MINUTE_ET).padStart(2, "0");
  const hour12 = h > 12 ? h - 12 : h;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hour12}:${m} ${ampm} Eastern`;
}
