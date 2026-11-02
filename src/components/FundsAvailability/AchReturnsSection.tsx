import { AlertTriangle } from "lucide-react";

const COMMON_RETURNS = [
  {
    code: "R01",
    name: "Insufficient funds",
    note: "The linked account did not have enough balance to cover the debit.",
  },
  {
    code: "R02",
    name: "Account closed",
    note: "The bank reported that the account is no longer open.",
  },
  {
    code: "R03",
    name: "Account not found",
    note: "The account number could not be located at the receiving bank.",
  },
  {
    code: "R04",
    name: "Invalid account number",
    note: "The account number format is invalid.",
  },
  {
    code: "R05 / R07 / R10",
    name: "Unauthorized debit",
    note: "The account holder or bank indicates the payment was not authorized.",
  },
  {
    code: "R09",
    name: "Uncollected funds",
    note: "Funds exist but are not yet available to settle the debit.",
  },
] as const;

export default function AchReturnsSection() {
  return (
    <section className="border-t border-gray-200 bg-[#1C315F]/[0.04] py-14">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1C315F] md:text-3xl">
              What is an ACH return?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#1C315F]/85">
              An <strong>ACH return</strong> is a message from your bank (the
              receiving institution) saying an ACH payment that was started{" "}
              cannot be completed. Returns are normal parts of ACH risk
              controls—especially on debits pulled from your bank into your
              wallet. There are dozens of standardized return reason codes
              (R01–R85); the bank picks the code that best describes the problem.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-[#1C315F]/85">
          <p>
            While a return is pending, funds will not stay in your wallet. That
            is why deposits credit <strong>two business days after Fed
            settlement</strong>—the network allows time for returns such as
            insufficient funds or unauthorized debits to arrive.
          </p>
          <p>
            Networks and processors track return rates (administrative,
            unauthorized, and overall). High return rates can limit an app&apos;s
            ability to send ACH. Help keep returns low by linking an active
            checking account, confirming balances before debits, and updating
            bank details if you change accounts.
          </p>
        </div>

        <h3 className="mb-4 mt-10 text-lg font-bold text-[#1C315F]">
          Common return reasons
        </h3>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[#1C315F]">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                  What it means
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {COMMON_RETURNS.map((row) => (
                <tr key={row.code}>
                  <td className="px-4 py-3 font-mono text-xs text-[#ED3237]">
                    {row.code}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1C315F]">
                    {row.name}
                  </td>
                  <td className="hidden px-4 py-3 text-[#1C315F]/75 sm:table-cell">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-[#1C315F]/55">
          If a deposit fails, check your member portal for the transfer status
          and message. Update your linked account or contact support if you see
          a return you do not recognize.
        </p>
      </div>
    </section>
  );
}
