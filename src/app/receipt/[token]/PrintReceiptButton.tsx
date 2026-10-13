"use client";

export function PrintReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden fixed inset-x-4 bottom-6 z-10 mx-auto max-w-md rounded-full bg-[#1C315F] px-6 py-4 text-base font-semibold text-white shadow-lg"
    >
      Print receipt
    </button>
  );
}
