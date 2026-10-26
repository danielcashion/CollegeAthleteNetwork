import { marketingMetadata } from "@/lib/seo/metadata";
import CommunicationsTopSection from "@/components/CommunicationsPage/CommunicationsTopSection";

export const metadata = marketingMetadata({
  title: "Communications",
  description:
    "How The College Athlete Network helps athletic departments communicate with athletes, alumni, and supporters.",
  path: "/communications",
});
import EmailSteps from "@/components/CommunicationsPage/EmailSteps";

const CommunicationsPage = () => {
  return (
    <div className="bg-[#f9faf8] min-h-[90vh]">
      <CommunicationsTopSection />
      <EmailSteps />
    </div>
  );
};

export default CommunicationsPage;
