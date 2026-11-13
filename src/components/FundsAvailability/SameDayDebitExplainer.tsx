import { ArrowDownToLine, Clock } from "lucide-react";
import { formatCutoffTimeLabel } from "@/lib/funds/settlement";

const EXAMPLE_STEPS = [
  {
    title: "Monday · 10:30 AM Eastern",
    subtitle: "You start a deposit (ACH debit)",
    detail:
      "Your request is before the 1:45 PM Eastern Same-Day cutoff, so it can reach the Federal Reserve today.",
  },
  {
    title: "Monday · Fed settlement",
    subtitle: "Same business day at the ACH network",
    detail:
      "The debit settles at the Fed on Monday. Your bank may still contest the payment during the return window.",
  },
  {
    title: "Wednesday · 9:00 AM Eastern",
    subtitle: "Funds in your CAN wallet",
    detail:
      "Two business days after Fed settlement, cleared funds credit your wallet (Monday → Wednesday).",
  },
] as const;

const LATE_EXAMPLE = {
  title: "What if you miss the cutoff?",
  body: "A deposit started Monday at 2:00 PM Eastern misses the 1:45 PM window. Fed settlement moves to Tuesday, and wallet funds typically arrive Thursday at 9:00 AM Eastern—still two business days after settlement.",
};

export default function SameDayDebitExplainer() {
  const cutoff = formatCutoffTimeLabel();

  return (
    <section className="border-b border-gray-200 bg-white py-14">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ED3237]/10 text-[#ED3237]">
            <ArrowDownToLine className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#ED3237]">
              Debits · bank to wallet
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#1C315F] md:text-3xl">
              We only use Same-Day ACH for deposits
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#1C315F]/85">
              Every deposit is sent as <strong>Same-Day ACH</strong>. The
              Federal Reserve only accepts these files on business days and on a
              fixed schedule—so <strong>when you submit matters</strong>.
              Submit before <strong>{cutoff}</strong> and your ACH settles at
              the Fed <strong>that same business day</strong>. Submit after the
              cutoff (or on a weekend/holiday) and settlement rolls to the{" "}
              <strong>next business day</strong>. Wallet funds are then
              available <strong>two business days after Fed settlement</strong>,
              typically at <strong>9:00 AM Eastern</strong>.
            </p>
          </div>
        </div>

        <div className="mb-8 flex items-center gap-2 rounded-xl border border-[#1C315F]/15 bg-[#1C315F]/5 px-4 py-3 text-sm text-[#1C315F]">
          <Clock className="h-5 w-5 shrink-0 text-[#1C315F]" />
          <span>
            Same-Day ACH windows at the Fed include 8:15 AM, 11:45 AM, and{" "}
            <strong>1:45 PM Eastern</strong>. We treat <strong>1:45 PM</strong>{" "}
            as the last cutoff for same-day settlement in our calculator.
          </span>
        </div>

        <h3 className="mb-4 text-lg font-bold text-[#1C315F]">
          Walkthrough: deposit before the cutoff
        </h3>
        <ol className="space-y-4">
          {EXAMPLE_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-xl border border-gray-200 bg-gray-50/80 p-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1C315F] text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-[#1C315F]">{step.title}</p>
                <p className="text-sm font-medium text-[#ED3237]">
                  {step.subtitle}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#1C315F]/80">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-[#1C315F]">{LATE_EXAMPLE.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#1C315F]/85">
            {LATE_EXAMPLE.body}
          </p>
        </div>
      </div>
    </section>
  );
}
