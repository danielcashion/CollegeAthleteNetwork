import type React from "react";
import JoinUsTopSection from "@/components/JoinUsPage/JoinUsTopSection";
import OurStory from "@/components/JoinUsPage/WhyUs";
import CurrentOpenings from "@/components/JoinUsPage/CurrentOpenings";
import CantFindJob from "@/components/JoinUsPage/CantFindJob";
import Testimonials from "@/components/JoinUsPage/Testimonials";
import FAQ from "@/components/JoinUsPage/Faq";

const JoinUsPage: React.FC = () => {
  return (
    <div style={{ backgroundColor: "#F9FAFB" }}>
      <JoinUsTopSection />
      <OurStory />
      <CurrentOpenings />
      <Testimonials />
      <FAQ />
      <CantFindJob />
    </div>
  );
};

export default JoinUsPage;
