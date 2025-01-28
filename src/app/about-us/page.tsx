import React from "react";
import { AboutUsSection, MissionSection } from "./about-us-components";

const AboutUsPage: React.FC = () => {
  return (
    <div style={{ backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      <AboutUsSection />
      <MissionSection />
    </div>
  );
};

export default AboutUsPage;
