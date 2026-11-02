import FundsAvailabilityPage from "@/components/FundsAvailability/FundsAvailabilityPage";
import { marketingMetadata } from "@/lib/seo/metadata";

export const metadata = marketingMetadata({
  title: "Funds & Payout Availability",
  description:
    "Same-Day ACH deposits and withdrawals: 1:45 PM Eastern Fed cutoff, two business days to wallet credit, and bank delivery timelines for college athletes and coaches.",
  path: "/funds-availability",
  keywords:
    "same day ACH, payout timeline, college athlete payments, wallet deposit, bank withdrawal, ACH return, NIL payout schedule",
});

export default function Page() {
  return <FundsAvailabilityPage />;
}
