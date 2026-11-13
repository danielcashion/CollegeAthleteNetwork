import { ArrowUpFromLine, Building2 } from "lucide-react";
import { formatCutoffTimeLabel } from "@/lib/funds/settlement";

export default function CreditWithdrawSection() {
  const cutoff = formatCutoffTimeLabel();

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-14">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1C315F] text-white">
            <ArrowUpFromLine className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#ED3237]">
              Credits · wallet to bank
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#1C315F] md:text-3xl">
              Withdrawals to your bank (Same-Day ACH)
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#1C315F]/85">
              When you send money from your CAN wallet to a linked bank account,
              we use Same-Day ACH. Timing depends on the same{" "}
              <strong>{cutoff}</strong> Fed cutoff as deposits.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-[#1C315F] bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#1C315F]" />
              <h3 className="font-bold text-[#1C315F]">Before {cutoff}</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#1C315F]/85">
              On a <strong>business day</strong>, withdrawals submitted before
              the cutoff should reach your bank account by the{" "}
              <strong>end of the same business day</strong> (subject to your
              bank&apos;s posting rules).
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-[#1C315F]">After {cutoff}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#1C315F]/85">
              Requests after the cutoff, or on weekends and federal holidays, are
              processed on the <strong>next business day</strong> and should
              arrive by the <strong>end of that day</strong>.
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-[#1C315F]/60">
          Your receiving bank (RDFI) controls when posted funds show as
          available in your app or balance. If a push is delayed after our
          submission, contact your bank with your transfer reference from the
          member portal.
        </p>
      </div>
    </section>
  );
}
