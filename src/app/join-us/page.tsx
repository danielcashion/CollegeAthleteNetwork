import React from "react";
import JoinUsTopSection from "@/components/JoinUsPage/JoinUsTopSection";
import OurStory from "@/components/JoinUsPage/WhyUs";
import OurMission from "@/components/AboutUsPage/OurMission";
import CurrentOpenings from "@/components/JoinUsPage/CurrentOpenings";

const JoinUsPage: React.FC = () => {
  return (
    <div style={{ backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      <JoinUsTopSection />
      <OurStory />
      <CurrentOpenings />
      <OurMission />
    </div>
  );
};

export default JoinUsPage;
