import React from "react";
import AboutUsTopSection from "@/components/AboutUsPage/AboutUsTopSection";
import OurStory from "@/components/AboutUsPage/OurStory";
import OurSolution from "@/components/AboutUsPage/OurSolution";
import OurMission from "@/components/AboutUsPage/OurMission";
import OurImpact from "@/components/AboutUsPage/OurImpact";

const AboutUsPage: React.FC = () => {
  return (
    <div style={{ backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      <AboutUsTopSection />
      <OurStory />
      <OurImpact />
      <OurSolution />
      <OurMission />
    </div>
  );
};

export default AboutUsPage;
