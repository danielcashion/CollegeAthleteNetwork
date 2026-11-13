export type TransactionType =
  | "DEPOSIT_SAMEDAY_ACH"
  | "WITHDRAW_TO_BANK";

export interface FundsTransfer {
  id: string;
  amount: number;
  type: TransactionType;
  initiatedAt: string;
  estimatedSettlement: string;
  currentStep: number;
  isWeekendOrHolidayDelay: boolean;
}

export interface SettlementEstimate {
  /** First business day we begin transmitting the ACH. */
  processingStart: Date;
  /** When the ACH settles at the Federal Reserve (same or next business day). */
  fedSettlementDate: Date;
  /** When funds credit the wallet (debit) or bank (credit). */
  estimatedSettlement: Date;
  estimatedSettlementEnd?: Date;
  businessDaysMin: number;
  businessDaysMax: number;
  rolledWeekendOrHoliday: boolean;
  rolledCutoff: boolean;
  processingStartLabel: string;
  fedSettlementLabel: string;
  settlementLabel: string;
  settlementDetail: string;
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  DEPOSIT_SAMEDAY_ACH: "Same-Day ACH deposit (bank → wallet)",
  WITHDRAW_TO_BANK: "Same-Day ACH withdrawal (wallet → bank)",
};
