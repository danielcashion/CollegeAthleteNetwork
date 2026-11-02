"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "How do weekends and federal bank holidays affect my transfer?",
    answer:
      "ACH only moves on business days. Requests on Saturday, Sunday, or a federal bank holiday begin on the next business day. That shifts Fed settlement and— for deposits—wallet credit by at least one business day.",
  },
  {
    question:
      "What is the difference between my CAN wallet balance and my bank account?",
    answer:
      "Your CAN wallet holds funds inside The College Athlete Network for payouts and transfers. A deposit (debit) pulls from your linked bank into the wallet using Same-Day ACH. A withdrawal (credit) pushes wallet balance to your bank, usually by end of day when submitted before the 1:45 PM Eastern cutoff.",
  },
  {
    question: "Why are wallet deposits two business days after Fed settlement?",
    answer:
      "Same-Day ACH can settle at the Fed quickly, but banks may still return a debit (for example insufficient funds) for a short period afterward. We credit your wallet two business days after Fed settlement—typically at 9:00 AM Eastern—so returned payments do not leave spendable balance in your wallet.",
  },
  {
    question: "What happens if I miss the 1:45 PM Eastern cutoff?",
    answer:
      "For deposits, Fed settlement becomes the next business day instead of today, and wallet funds arrive two business days after that settlement. For withdrawals, the bank delivery shifts to the end of the next business day instead of today.",
  },
  {
    question: "I'm a coach or staff member—does this apply to team payouts?",
    answer:
      "Yes. Athlete disbursements, reimbursements, and wallet activity follow the same Same-Day ACH calendar and cutoffs. Share this page when athletes ask when money will land.",
  },
] as const;

export default function PayoutFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ED3237]/10 text-[#ED3237]">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1C315F] md:text-3xl">
              Payout &amp; ACH FAQ
            </h2>
            <p className="text-[#1C315F]/75">
              Plain-language answers for athletes and coaches.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const open = openIndex === index;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white"
                  aria-expanded={open}
                >
                  <span className="font-semibold text-[#1C315F]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`mt-1 h-5 w-5 shrink-0 text-[#ED3237] transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open && (
                  <div className="border-t border-gray-200 bg-white px-5 py-4 text-sm leading-relaxed text-[#1C315F]/85">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
