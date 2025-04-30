import CommunicationsTopSection from "@/components/CommunicationsPage/CommunicationsTopSection";
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
